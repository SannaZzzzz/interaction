import React, { useEffect, useState } from 'react';

interface SpeechRecognitionProps {
  onResult: (transcript: string) => void;
  isListening: boolean;
  setIsListening: (isListening: boolean) => void;
}

const SimpleSpeechRecognition: React.FC<SpeechRecognitionProps> = ({ 
  onResult, 
  isListening,
  setIsListening
}) => {
  const [error, setError] = useState<string>('');
  const [isMicrophoneAvailable, setIsMicrophoneAvailable] = useState<boolean>(false);

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
    if (typeof window === 'undefined') return false;
    
    // 检查是否是移动设备
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // 检查浏览器是否支持语音识别
    const hasWebkitSpeech = 'webkitSpeechRecognition' in window;
    const hasSpeechRecognition = 'SpeechRecognition' in window;
    
    if (!hasWebkitSpeech && !hasSpeechRecognition) {
      if (isMobile) {
        setError('移动设备请使用Chrome浏览器以支持语音识别');
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
    
    const isCompatible = checkCompatibility();
    if (isCompatible) {
      checkMicrophonePermission();
    }
  }, []);

  useEffect(() => {
    if (!isMicrophoneAvailable || typeof window === 'undefined') return;
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'zh-CN';
    recognition.continuous = false;  // 一次识别一段话
    recognition.interimResults = false;  // 不需要中间结果

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsListening(false);
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
          setError('语音识别被中断，请重试');
          break;
        case 'audio-capture':
          setError('没有检测到麦克风设备，请检查设备连接');
          break;
        default:
          setError(`语音识别错误: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    if (isListening) {
      try {
        // 确保清除错误提示
        setError('');
        
        // 开始识别
        recognition.start();
        console.log('语音识别已启动');
      } catch (e) {
        console.error('启动语音识别失败:', e);
        setError('启动语音识别失败，请刷新页面重试');
        setIsListening(false);
      }
    } else {
      try {
        recognition.stop();
      } catch (e) {
        // 忽略未启动时停止的错误
      }
    }

    return () => {
      try {
        recognition.stop();
      } catch (e) {
        // 忽略未启动时停止的错误
      }
    };
  }, [isListening, onResult, setIsListening, isMicrophoneAvailable]);

  const handleStartListening = async () => {
    setError('');
    
    // 检查兼容性
    if (!checkCompatibility()) return;
    
    if (!isMicrophoneAvailable) {
      const hasPermission = await checkMicrophonePermission();
      if (!hasPermission) return;
    }
    
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
          {isListening ? '正在听...' : '开始语音输入'}
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

export default SimpleSpeechRecognition;

// 为TypeScript定义全局类型
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}