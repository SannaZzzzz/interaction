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
    // 仅在浏览器环境中运行
    if (typeof window === 'undefined') return;
    
    console.log('初始化语音识别组件...');
    const isCompatible = checkCompatibility();
    if (isCompatible) {
      checkMicrophonePermission();
    }
    
    // 检查是否使用了不支持语音识别的浏览器
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      console.error('当前浏览器不支持语音识别API');
      return;
    }
    
    // 初始化语音识别对象
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'zh-CN';
      // 使用连续模式，可以在说话过程中持续识别
      recognitionRef.current.continuous = true;
      // 允许返回中间结果，这样我们可以在说话过程中看到文字
      recognitionRef.current.interimResults = true;
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
      // 使用连续模式和中间结果
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.maxAlternatives = 1;
    }
    
    if (!isMicrophoneAvailable || !recognitionRef.current) return;

    const recognition = recognitionRef.current;

    // 在useEffect中不可以直接使用useState，所以使用ref来跟踪临时识别结果
    const tempTranscriptRef = useRef<string>('');
    
    recognition.onresult = (event: any) => {
      console.log('收到语音识别结果:', event);
      
      let finalTranscript = '';
      let interimTranscript = '';
      
      // 编历所有结果
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          console.log('最终识别结果:', finalTranscript);
        } else {
          interimTranscript += transcript;
          console.log('中间识别结果:', interimTranscript);
        }
      }
      
      // 如果有最终结果，则使用它
      if (finalTranscript !== '') {
        // 清空临时结果
        tempTranscriptRef.current = '';
        onResult(finalTranscript);
        setIsListening(false);
        setRetryCount(0); // 成功后重置重试计数
        setError(''); // 清空错误提示
      } else if (interimTranscript !== '') {
        // 更新临时结果引用
        tempTranscriptRef.current = interimTranscript;
        // 如果只有中间结果，展示在错误框中
        setError(`正在识别: ${interimTranscript}...`);
      }
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
          console.warn('语音识别被中断，详细信息:', event);
          // 尝试分析中断原因
          if (tempTranscriptRef.current && tempTranscriptRef.current.length > 0) {
            // 如果有临时识别内容，可能是用户说话结束引起的正常中断
            onResult(tempTranscriptRef.current); // 使用最后的临时结果
            tempTranscriptRef.current = '';
            setIsListening(false);
            setRetryCount(0);
            setError('');
            return;
          }

          // 如果没有临时结果，考虑重试
          if (retryCount < 3 && isListening) {
            setRetryCount(prev => prev + 1);
            setError(`语音识别被中断，正在重试 (${retryCount + 1}/3)...`);
            setTimeout(() => {
              try {
                console.log('尝试重新启动语音识别...');
                recognition.start();
              } catch (e) {
                console.error('重试失败:', e);
                setError('语音识别重试失败，请手动重试');
                setIsListening(false);
              }
            }, 800); // 增加延迟时间
          } else {
            console.log('语音识别已达到最大重试次数');
            setError('浏览器可能限制了语音识别功能，请刷新页面或更换浏览器尝试');
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

    recognition.onend = (event: Event) => {
      console.log('语音识别结束:', event);
      
      // 如果有临时结果且没有错误，可能是正常结束
      if (tempTranscriptRef.current && tempTranscriptRef.current.length > 0 && !error) {
        console.log('使用最后的临时结果:', tempTranscriptRef.current);
        onResult(tempTranscriptRef.current);
        tempTranscriptRef.current = '';
        setIsListening(false);
        setRetryCount(0);
        return;
      }
      
      // 如果还在监听状态但语音识别结束，尝试重新启动
      if (isListening && retryCount < 3 && (!error || !error.includes('重试失败'))) {
        setRetryCount(prev => prev + 1);
        setError(`语音识别意外结束，正在重新启动 (${retryCount + 1}/3)...`);
        
        setTimeout(() => {
          try {
            recognition.start();
            console.log('重新启动语音识别成功');
          } catch (e) {
            console.error('重新启动语音识别失败:', e);
            setError('语音识别重新启动失败，请手动重试');
            setIsListening(false);
          }
        }, 500);
      } else if (isListening && retryCount >= 3) {
        // 重试次数过多，停止尝试
        setIsListening(false);
        setRetryCount(0);
        if (!error) {
          setError('语音识别多次自动重试失败，请刷新页面或更换浏览器');
        }
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