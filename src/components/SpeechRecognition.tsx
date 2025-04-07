import React, { useEffect, useState, useRef } from 'react';

interface SpeechRecognitionProps {
  onResult: (transcript: string) => void;
  isListening: boolean;
  setIsListening: (isListening: boolean) => void;
}

const SpeechRecognition: React.FC<SpeechRecognitionProps> = ({ 
  onResult, 
  isListening,
  setIsListening
}) => {
  const [error, setError] = useState<string>('');
  const [isMicrophoneAvailable, setIsMicrophoneAvailable] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const [retryCount, setRetryCount] = useState(0);

  // 检查是否使用HTTPS
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      setError('语音识别功能需要HTTPS连接才能工作。请使用HTTPS访问本站。');
    }
  }, []);

  // 检查麦克风权限
  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setIsMicrophoneAvailable(true);
      setError('');
      return true;
    } catch (err) {
      setIsMicrophoneAvailable(false);
      setError('请允许访问麦克风以使用语音识别功能');
      return false;
    }
  };

  // 检查设备和浏览器兼容性
  const checkCompatibility = () => {
    // 检查是否是移动设备
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // iOS Safari 特别检查
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    
    // 检查浏览器是否支持语音识别
    const hasWebkitSpeech = 'webkitSpeechRecognition' in window;
    const hasSpeechRecognition = 'SpeechRecognition' in window;
    
    if (!hasWebkitSpeech && !hasSpeechRecognition) {
      if (isMobile) {
        if (isIOS && isSafari) {
          setError('iOS Safari 浏览器对语音识别支持有限。请尝试点击多次或使用Chrome浏览器。');
        } else {
          setError('移动设备请使用Chrome浏览器以支持语音识别');
        }
      } else {
        setError('您的浏览器不支持语音识别功能。请使用Chrome或Edge浏览器。');
      }
      return false;
    }
    return true;
  };

  useEffect(() => {
    const isCompatible = checkCompatibility();
    if (isCompatible) {
      checkMicrophonePermission();
    }
    
    // 初始化语音识别对象
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'zh-CN';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;
    }
    
    // 组件卸载时清理
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // 忽略错误
        }
      }
    };
  }, []);

  useEffect(() => {
    // 在每次监听状态变化时重新创建识别对象，以避免状态不一致
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'zh-CN';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;
    }
    
    if (!isMicrophoneAvailable || !recognitionRef.current) return;

    const recognition = recognitionRef.current;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsListening(false);
      setRetryCount(0); // 成功后重置重试计数
    };

    recognition.onerror = (event: any) => {
      console.error('语音识别错误:', event.error);
      switch (event.error) {
        case 'not-allowed':
          setError('请允许访问麦克风以使用语音识别功能');
          break;
        case 'network':
          setError('网络连接错误，请检查网络后重试');
          break;
        case 'no-speech':
          setError('未检测到语音，请重试');
          break;
        case 'aborted':
          // 对于 aborted 错误，我们可以尝试自动重试几次
          if (retryCount < 3 && isListening) {
            setRetryCount(prev => prev + 1);
            setError('语音识别被中断，正在重试...');
            setTimeout(() => {
              try {
                recognition.start();
              } catch (e) {
                setError('语音识别重试失败，请手动重试');
                setIsListening(false);
              }
            }, 500);
          } else {
            setError('语音识别被中断，请重新点击按钮尝试');
            setIsListening(false);
          }
          break;
        case 'audio-capture':
          setError('未检测到麦克风设备，请确保麦克风已连接并正常工作');
          break;
        case 'service-not-allowed':
          setError('此浏览器不允许使用语音识别服务，请尝试使用Chrome浏览器');
          break;
        default:
          setError(`语音识别错误: ${event.error}`);
      }

      if (event.error !== 'aborted' || retryCount >= 3) {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      // 只有在非用户主动停止的情况下才需要处理
      if (isListening && retryCount >= 3) {
        setIsListening(false);
        setRetryCount(0);
      }
    };

    if (isListening) {
      try {
        // 确保我们可以访问麦克风
        checkMicrophonePermission().then(hasPermission => {
          if (!hasPermission) {
            setIsListening(false);
            return;
          }
          
          // 尝试先停止现有实例，防止多个实例同时运行
          try {
            recognition.stop();
          } catch (e) {
            // 忽略未启动时停止的错误
            console.log('停止现有实例时出错（可忽略）:', e);
          }
          
          // 短暂延迟后启动
          setTimeout(() => {
            console.log('尝试启动语音识别...');
            try {
              recognition.start();
              console.log('语音识别已启动');
            } catch (e) {
              console.error('启动语音识别失败:', e);
              setError(`启动语音识别失败: ${e instanceof Error ? e.message : '未知错误'}，请刷新页面重试`);
              setIsListening(false);
            }
          }, 300);
        });
      } catch (e) {
        console.error('启动语音识别失败:', e);
        setError(`启动语音识别失败: ${e instanceof Error ? e.message : '未知错误'}，请刷新页面重试`);
        setIsListening(false);
      }
    } else {
      try {
        recognition.stop();
        setRetryCount(0); // 用户手动停止时重置重试计数
      } catch (e) {
        // 忽略未启动时停止的错误
      }
    }
  }, [isListening, onResult, setIsListening, isMicrophoneAvailable, retryCount]);

  const handleStartListening = async () => {
    // 重置错误和重试计数
    setError('');
    setRetryCount(0);
    
    console.log('处理开始监听请求...');
    
    // 检查兼容性
    if (!checkCompatibility()) {
      console.error('浏览器兼容性检查失败');
      return;
    }
    
    // 如果麦克风不可用，先检查权限
    if (!isMicrophoneAvailable) {
      console.log('麦克风权限未授予，尝试请求权限...');
      const permissionGranted = await checkMicrophonePermission();
      if (!permissionGranted) {
        console.error('麦克风权限请求被拒绝');
        return;
      }
      console.log('麦克风权限已授予');
    }

    // 切换听状态
    console.log(`切换监听状态: ${!isListening ? '开始监听' : '停止监听'}`);
    setIsListening(!isListening);
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <button
          onClick={handleStartListening}
          className={`px-6 py-3 rounded-full text-white font-medium ${
            isListening ? 'bg-red-600 animate-pulse' : 'bg-green-600'
          } ${!isMicrophoneAvailable ? 'opacity-50' : ''}`}
          disabled={!isMicrophoneAvailable && !!error}
        >
          {isListening ? `正在听${retryCount > 0 ? ' (重试中)' : ''}...` : '开始语音输入'}
        </button>
        <div className="text-xs text-gray-400">
          {isListening ? '请说话' : '点击按钮开始'}
        </div>
      </div>
      {error && (
        <div className="text-red-500 mt-2 text-sm bg-red-100/10 p-2 rounded">
          <p>{error}</p>
          {error.includes('浏览器不支持') && (
            <p className="mt-1 text-xs">
              推荐使用最新版本的 Chrome、Edge 或 Safari 浏览器
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SpeechRecognition;

// 为TypeScript定义全局类型
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}