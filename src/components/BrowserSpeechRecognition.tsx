import React, { useState, useRef, useEffect } from 'react';

interface SpeechRecognitionProps {
  onResult: (transcript: string) => void;
  isListening: boolean;
  setIsListening: (isListening: boolean) => void;
}

// 为TypeScript定义全局类型
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const BrowserSpeechRecognition: React.FC<SpeechRecognitionProps> = ({
  onResult,
  isListening,
  setIsListening
}) => {
  const [error, setError] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [isMicrophoneAvailable, setIsMicrophoneAvailable] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const resultRef = useRef<string>('');
  
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
  
  // 检查浏览器兼容性
  const checkCompatibility = () => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      // 检查是否是移动设备
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      // iOS Safari 特别检查
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
      
      if (isMobile) {
        if (isIOS && isSafari) {
          setError('iOS Safari 浏览器对语音识别支持有限。请尝试使用Chrome浏览器。');
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
  
  // 初始化语音识别
  useEffect(() => {
    // 仅在浏览器环境中运行
    if (typeof window === 'undefined') return;
    
    console.log('初始化语音识别组件...');
    const isCompatible = checkCompatibility();
    if (isCompatible) {
      checkMicrophonePermission();
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
  
  // 管理语音识别的生命周期
  useEffect(() => {
    if (!isMicrophoneAvailable || !('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      return;
    }
    
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (isListening) {
      // 每次开始监听时创建新的识别实例
      const recognition = new SpeechRecognitionAPI();
      recognitionRef.current = recognition;
      
      // 配置识别器
      recognition.lang = 'zh-CN';
      recognition.continuous = true;  // 持续识别模式
      recognition.interimResults = true;  // 允许中间结果
      recognition.maxAlternatives = 1;
      
      // 设置更长的SpeechRecognitionEvent超时时间
      try {
        // @ts-ignore - 某些浏览器支持此属性
        recognition.speechRecognitionListTimeout = 10000; // 10秒
      } catch (e) {
        // 忽略不支持的浏览器
        console.log('浏览器不支持设置speechRecognitionListTimeout');
      }
      
      // 初始化结果
      resultRef.current = '';
      
      // 初始化结果变量
      let accumulatedText = resultRef.current;
      
      // 处理结果
      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        
        // 处理所有结果
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        
        // 更新最终结果
        if (final) {
          // 累积文本，而不是替换
          accumulatedText += final;
          resultRef.current = accumulatedText;
          console.log('累积识别结果:', accumulatedText);
          // 不要在这里停止识别，等待用户主动停止
        }
        
        // 显示中间结果
        if (interim) {
          setStatus(`正在识别: ${accumulatedText}${interim}`);
        } else {
          setStatus(`已识别: ${accumulatedText}`);
        }
      };
      
      // 处理错误
      recognition.onerror = (event: any) => {
        console.error('语音识别错误:', event.error);
        
        if (event.error === 'no-speech') {
          setError('未检测到语音，请重试');
        } else if (event.error === 'audio-capture') {
          setError('麦克风可能未正确连接，请检查');
        } else if (event.error === 'not-allowed') {
          setError('请允许浏览器访问麦克风');
        } else if (event.error === 'network') {
          setError('网络错误，请检查网络连接');
        } else if (event.error === 'aborted') {
          // 对于aborted错误，自动重新启动识别
          if (isListening) {
            console.log('识别被中断，尝试自动重启...');
            
            // 尝试自动重启识别而不中断用户的输入
            setTimeout(() => {
              try {
                if (isListening) { // 再次检查是否仍然在监听状态
                  // 创建新的识别器并保持之前结果
                  const newRecognition = new SpeechRecognitionAPI();
                  recognitionRef.current = newRecognition;
                  
                  // 配置识别器
                  newRecognition.lang = 'zh-CN';
                  newRecognition.continuous = true;  // 持续识别模式
                  newRecognition.interimResults = true;  // 允许中间结果
                  newRecognition.maxAlternatives = 1;
                  
                  // 复制相同的事件处理程序
                  newRecognition.onresult = recognition.onresult;
                  newRecognition.onerror = recognition.onerror;
                  newRecognition.onend = recognition.onend;
                  
                  // 启动新的识别器
                  newRecognition.start();
                  setStatus(`识别自动重启 - 已识别: ${resultRef.current}`);
                }
              } catch (e) {
                console.error('重启识别时出错:', e);
                // 如果重启失败，保留已有结果
                if (resultRef.current) {
                  console.log('重启失败，但已有结果:', resultRef.current);
                } else {
                  setError('识别重启失败，请手动点击按钮重试');
                  setIsListening(false);
                }
              }
            }, 300);
          } else {
            // 如果不再监听状态，就不自动重启
            if (resultRef.current) {
              console.log('识别被中断，但已有部分结果:', resultRef.current);
            } else {
              setError('识别被中断，请重新点击按钮开始');
            }
          }
        } else {
          setError(`语音识别错误: ${event.error}`);
        }
      };
      
      // 识别结束处理
      recognition.onend = () => {
        console.log('语音识别结束');
        
        // 如果用户导致的结束（点击按钮停止）
        if (!isListening) {
          // 如果有结果，传递给父组件
          if (resultRef.current) {
            onResult(resultRef.current);
          }
          setStatus('');
        } else {
          // 如果是自动结束（可能是因为超时或其他原因）
          // 这里我们不设置状态，因为我们在onerror的aborted处理中
          // 可能会尝试重启识别
          console.log('识别强制结束，保留当前结果:', resultRef.current);
        }
      };
      
      // 开始识别
      try {
        recognition.start();
        setStatus('正在倾听...');
        console.log('语音识别已启动');
      } catch (error) {
        console.error('启动语音识别失败:', error);
        setError('启动语音识别失败，请刷新页面重试');
        setIsListening(false);
      }
    } else {
      // 停止识别
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          console.log('语音识别已停止');
        } catch (error) {
          // 忽略未启动时停止的错误
        }
      }
    }
  }, [isListening, isMicrophoneAvailable, onResult, setIsListening]);
  
  // 处理开始/停止监听
  const handleToggleListening = async () => {
    setError('');
    
    // 检查兼容性
    if (!checkCompatibility()) return;
    
    // 如果麦克风不可用，先请求权限
    if (!isMicrophoneAvailable) {
      const hasPermission = await checkMicrophonePermission();
      if (!hasPermission) return;
    }
    
    if (isListening) {
      // 停止监听，直接设置状态
      setIsListening(false);
      setStatus('已停止识别');
      
      // 在下一个渲染周期后清除状态，避免卡顿
      setTimeout(() => {
        if (!isListening) {
          setStatus('');
        }
      }, 100);
    } else {
      // 开始监听
      // 如果有之前的结果，尝试保留结果
      if (!resultRef.current) {
        // 如果没有之前的结果，清空状态
        resultRef.current = '';
        setStatus('');
      } else {
        // 如果有之前的结果，我们显示继续状态
        setStatus(`继续识别 - 已识别: ${resultRef.current}`);
      }
      
      setIsListening(true);
    }
  };
  
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <button
          onClick={handleToggleListening}
          className={`px-6 py-3 rounded-full text-white font-medium ${
            isListening ? 'bg-red-600 animate-pulse' : 'bg-green-600'
          } ${!isMicrophoneAvailable ? 'opacity-50' : ''}`}
          disabled={!isMicrophoneAvailable && !!error}
        >
          {isListening 
            ? '点击停止识别' 
            : resultRef.current 
              ? '继续输入' 
              : '开始语音输入'}
        </button>
        <div className="text-xs text-gray-400">
          {isListening ? '请说话...' : '点击按钮开始'}
        </div>
      </div>
      
      {status && !error && (
        <div className="text-blue-500 mt-2 text-sm bg-blue-100/10 p-2 rounded">
          <p>{status}</p>
        </div>
      )}
      
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

export default BrowserSpeechRecognition;