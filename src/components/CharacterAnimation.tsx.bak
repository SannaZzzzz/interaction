import React, { useEffect, useRef, useState } from 'react';

interface CharacterAnimationProps {
  character: string;
  isAnimating: boolean;
  response: string;
}

const CharacterAnimation: React.FC<CharacterAnimationProps> = ({
  character,
  isAnimating,
  response
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    // 创建一个虚拟视频元素
    const video = document.createElement('video');
    videoRef.current = video;
    video.muted = true;
    video.playsInline = true;
    video.loop = true; // 启用循环播放
    
    // 根据选择的角色设置不同的视频源
    let videoSrc = '';
    switch (character) {
      case 'anime':
        videoSrc = '/animations/anime-character.mp4';
        break;
      case 'custom':
        videoSrc = '/animations/custom-character.mp4';
        break;
      default:
        videoSrc = '/animations/default-character.mp4';
        break;
    }
    
    // 提示用户需要准备相应的视频文件
    console.log(`需要准备视频文件: ${videoSrc}`);
    
    // 设置视频加载事件
    video.onloadeddata = () => {
      setVideoLoaded(true);
    };
    
    // 设置视频源
    video.src = videoSrc;
    
    return () => {
      // 清理
      if (video) {
        video.pause();
        video.src = '';
        video.load();
      }
      // 清理动画帧
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [character]);

  useEffect(() => {
    if (!videoLoaded || !videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const video = videoRef.current;
    
    // 调整画布大小以匹配视频尺寸
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 360;
    
    // 当需要动画时播放视频
    if (isAnimating) {
      // 确保视频从头开始播放
      video.currentTime = 0;
      
      // 播放视频并处理错误
      const playVideo = async () => {
        try {
          await video.play();
        } catch (err) {
          console.error('视频播放失败:', err);
        }
      };
      
      playVideo();
      
      // 渲染动画帧
      const renderFrame = () => {
        if (!isAnimating) {
          return;
        }
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        animationFrameRef.current = requestAnimationFrame(renderFrame);
      };
      
      renderFrame();
      
    } else {
      // 如果没有动画，暂停视频并显示静态图像
      video.pause();
      if (video.readyState >= 2) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      // 清理动画帧
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
    
    // 清理函数
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isAnimating, videoLoaded]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {!videoLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-xl text-gray-400">加载角色动画中...</div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full object-contain"
      />
      {isAnimating && (
        <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 p-2 rounded">
          <p className="text-sm">{response}</p>
        </div>
      )}
    </div>
  );
};

export default CharacterAnimation;