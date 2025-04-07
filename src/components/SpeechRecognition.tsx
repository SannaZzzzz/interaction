import React, { useEffect, useState } from 'react';

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

  useEffect(() => {
    // 检查浏览器是否支持语音识别
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('您的浏览器不支持语音识别功能。请使用Chrome或Edge浏览器。');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'zh-CN'; // 设置语言为中文
    recognition.continuous = false; // 设置为非连续模式
    recognition.interimResults = false; // 不返回临时结果

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('语音识别错误:', event.error);
      setError(`语音识别错误: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    // 根据isListening状态开始或停止语音识别
    if (isListening) {
      try {
        recognition.start();
      } catch (e) {
        console.error('启动语音识别失败:', e);
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
  }, [isListening, onResult, setIsListening]);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsListening(!isListening)}
          className={`px-6 py-3 rounded-full text-white font-medium ${
            isListening ? 'bg-red-600 animate-pulse' : 'bg-green-600'
          }`}
        >
          {isListening ? '正在听...' : '开始语音输入'}
        </button>
        <div className="text-xs text-gray-400">
          {isListening ? '请说话' : '点击按钮开始'}
        </div>
      </div>
      {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
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