import React, { useState, useRef, useEffect } from 'react';
import { xfyunSpeechRecognition } from '../utils/xfyunSpeechRecognition';

interface AudioRecorderProps {
  onResult: (transcript: string) => void;
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onResult,
  isRecording,
  setIsRecording
}) => {
  const [error, setError] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState<boolean>(false);
  
  // 引用用于录音的对象
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  
  // 检查麦克风权限
  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      setError('');
      return stream;
    } catch (err) {
      console.error('麦克风权限错误:', err);
      setHasPermission(false);
      setError('请允许访问麦克风以使用语音输入功能');
      return null;
    }
  };
  
  // 检查浏览器兼容性
  const checkCompatibility = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      // 检查是否是移动设备
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      // iOS Safari 特别检查
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
      
      if (isMobile) {
        if (isIOS && isSafari) {
          setError('iOS Safari 浏览器对音频录制支持有限。请尝试使用Chrome浏览器。');
        } else {
          setError('移动设备请使用Chrome浏览器以支持音频录制');
        }
      } else {
        setError('您的浏览器不支持音频录制功能。请使用Chrome或Edge浏览器。');
      }
      return false;
    }
    return true;
  };
  
  // 初始化组件
  useEffect(() => {
    // 仅在浏览器环境中运行
    if (typeof window === 'undefined') return;
    
    console.log('初始化音频录制组件...');
    const isCompatible = checkCompatibility();
    if (isCompatible) {
      checkMicrophonePermission().then(stream => {
        if (stream) {
          // 获取权限后立即停止流，以免占用麦克风
          stream.getTracks().forEach(track => track.stop());
        }
      });
    }
    
    // 检查是否使用了HTTPS
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      setError('音频录制功能需要HTTPS连接才能工作。请使用HTTPS访问本站。');
    }
    
    // 组件卸载时清理
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // 使用讯飞语音识别API
  const sendAudioForRecognition = async (audioBlob: Blob) => {
    try {
      setIsProcessingAudio(true);
      setStatus('正在处理音频...');
      
      // 转换音频格式为 WAV
      const wavBlob = await convertToMonoWav(audioBlob);
      console.log('发送音频进行识别，大小:', wavBlob.size, 'bytes');
      
      // 注册实时结果回调
      xfyunSpeechRecognition.onResult((partialResult) => {
        setStatus(`正在识别: ${partialResult}`);
      });
      
      // 注册错误回调
      xfyunSpeechRecognition.onError((errorMsg) => {
        setError(`语音识别错误: ${errorMsg}`);
      });
      
      // 发送音频到讯飞API进行识别
      const result = await xfyunSpeechRecognition.recognize(wavBlob);
      
      setStatus('识别完成');
      setIsProcessingAudio(false);
      
      // 将结果传递给父组件
      onResult(result);
    } catch (error) {
      console.error('语音识别处理错误:', error);
      setError(`语音识别处理失败: ${error instanceof Error ? error.message : '未知错误'}`);
      setIsProcessingAudio(false);
    }
  };
  
  // 将音频转换为单声道WAV格式
  const convertToMonoWav = async (blob: Blob): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      try {
        const fileReader = new FileReader();
        
        fileReader.onload = async () => {
          const arrayBuffer = fileReader.result as ArrayBuffer;
          
          // 创建临时的 AudioContext
const audioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
          
          // 解码音频
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          // 采样率
          const sampleRate = 16000;
          
          // 创建猴声道缓冲区
          const monoBuffer = audioContext.createBuffer(1, audioBuffer.length, sampleRate);
          
          // 如果原音频是立体声，取平均值转换为单声道
          if (audioBuffer.numberOfChannels > 1) {
            const left = audioBuffer.getChannelData(0);
            const right = audioBuffer.getChannelData(1);
            const monoData = monoBuffer.getChannelData(0);
            
            for (let i = 0; i < audioBuffer.length; i++) {
              monoData[i] = (left[i] + right[i]) / 2;
            }
          } else {
            // 如果已经是单声道，直接复制
            monoBuffer.copyToChannel(audioBuffer.getChannelData(0), 0);
          }
          
          // 创建 WAV 文件
          const wavData = createWavFile(monoBuffer, sampleRate);
          const wavBlob = new Blob([wavData], { type: 'audio/wav' });
          
          resolve(wavBlob);
        };
        
        fileReader.onerror = (error) => {
          reject(error);
        };
        
        fileReader.readAsArrayBuffer(blob);
      } catch (error) {
        reject(error);
      }
    });
  };
  
  // 创建 WAV 文件头部和数据
  const createWavFile = (audioBuffer: AudioBuffer, sampleRate: number): ArrayBuffer => {
    const numChannels = 1; // 单声道
    const bitsPerSample = 16; // 16 位
    const bytesPerSample = bitsPerSample / 8;
    const numSamples = audioBuffer.length;
    
    // WAV 文件大小
    const dataSize = numSamples * numChannels * bytesPerSample;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);
    
    // RIFF 块
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');
    
    // fmt 块
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // fmt 块大小
    view.setUint16(20, 1, true); // 线性PCM
    view.setUint16(22, numChannels, true); // 声道数
    view.setUint32(24, sampleRate, true); // 采样率
    view.setUint32(28, sampleRate * numChannels * bytesPerSample, true); // 每秒字节数
    view.setUint16(32, numChannels * bytesPerSample, true); // 每采样字节数
    view.setUint16(34, bitsPerSample, true); // 位深度
    
    // data 块
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);
    
    // 写入音频数据
    const samples = audioBuffer.getChannelData(0);
    let offset = 44;
    
    for (let i = 0; i < numSamples; i++) {
      // 将浮点数转换为 Int16
      const sample = Math.max(-1, Math.min(1, samples[i]));
      const value = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, value, true);
      offset += 2;
    }
    
    return buffer;
  };
  
  // 辅助函数：将字符串写入DataView
  const writeString = (view: DataView, offset: number, string: string): void => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  // 管理录音状态变化
  useEffect(() => {
    const startRecording = async () => {
      setError('');
      setStatus('');
      
      try {
        const stream = await checkMicrophonePermission();
        if (!stream) return;
        
        streamRef.current = stream;
        audioChunksRef.current = [];
        
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        
        mediaRecorder.onstop = () => {
          console.log('录音已停止，处理数据...');
          // 合并音频数据
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          
          // 如果录音时间太短，则提示用户
          if (audioBlob.size < 1000) {
            setError('录音时间太短，请重试');
            return;
          }
          
          // 发送音频进行识别
          sendAudioForRecognition(audioBlob);
        };
        
        // 开始录音
        mediaRecorder.start();
        setStatus('正在录音...');
        console.log('录音已开始');
        
      } catch (error) {
        console.error('启动录音错误:', error);
        setError(`启动录音失败: ${error instanceof Error ? error.message : '未知错误'}`);
        setIsRecording(false);
      }
    };
    
    const stopRecording = () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        setStatus('录音已结束，正在处理...');
      }
      
      // 停止所有轨道
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
    
    if (isRecording) {
      startRecording();
    } else if (mediaRecorderRef.current) {
      stopRecording();
    }
    
    // 清理函数
    return () => {
      if (isRecording && mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording, setIsRecording, onResult]);
  
  // 录音时间计时器
  const [recordingTime, setRecordingTime] = useState(0);
  
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRecording) {
      setRecordingTime(0);
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);
  
  // 格式化录音时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // 处理点击录音按钮事件
  const handleToggleRecording = async () => {
    if (isProcessingAudio) return; // 避免在处理音频时点击
    
    if (!checkCompatibility()) return;
    
    if (!hasPermission) {
      const stream = await checkMicrophonePermission();
      if (!stream) return;
      
      // 获取权限后立即停止流，避免在未真正开始录音前占用麦克风
      stream.getTracks().forEach(track => track.stop());
    }
    
    setIsRecording(!isRecording);
  };
  
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <button
          onClick={handleToggleRecording}
          className={`px-6 py-3 rounded-full text-white font-medium ${
            isRecording ? 'bg-red-600 animate-pulse' : 
            isProcessingAudio ? 'bg-yellow-500' : 'bg-green-600'
          } ${!hasPermission ? 'opacity-50' : ''}`}
          disabled={!hasPermission && !!error || isProcessingAudio}
        >
          {isRecording 
            ? `正在录音... ${formatTime(recordingTime)}` 
            : isProcessingAudio 
              ? '处理中...' 
              : '点击开始录音'}
        </button>
        <div className="text-xs text-gray-400">
          {isRecording ? '点击停止录音' : '点击按钮开始'}
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

export default AudioRecorder;