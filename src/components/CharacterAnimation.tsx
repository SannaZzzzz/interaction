import React, { useEffect, useRef, useState } from "react";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const basePath = process.env.NODE_ENV === "production" && 
                    typeof window !== "undefined" && 
                    window.location.hostname.includes("github.io") 
                    ? "/interaction" : "";

    let videoSrc = "";
    switch (character) {
      case "anime":
        videoSrc = `${basePath}/animations/anime-character.mp4`;
        break;
      case "custom":
        videoSrc = `${basePath}/animations/custom-character.mp4`;
        break;
      default:
        videoSrc = `${basePath}/animations/default-character.mp4`;
        break;
    }

    console.log("Video source path:", videoSrc);

    if (videoRef.current) {
      videoRef.current.src = videoSrc;
      
      // 预加载视频
      videoRef.current.load();
      
      // 使用较低分辨率和帧率提高性能
      if (typeof videoRef.current.playbackRate === 'number') {
        videoRef.current.playbackRate = 1.0; // 正常速度
      }
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = "";
        videoRef.current.load();
      }
    };
  }, [character]);

  useEffect(() => {
    if (!videoRef.current) return;

    if (isAnimating) {
      // 重置视频到开始位置
      videoRef.current.currentTime = 0;
      
      const playVideo = async () => {
        try {
          // 使用低延迟模式
          if (videoRef.current) {
            videoRef.current.muted = false;
            await videoRef.current.play();
            console.log("Video playing");
          }
        } catch (err) {
          console.error("Video play failed:", err);
          setVideoError(true);
        }
      };

      playVideo();
    } else {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }
  }, [isAnimating]);

  const handleVideoLoaded = () => {
    setVideoLoaded(true);
    setVideoError(false);
    console.log("Video loaded successfully");
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error("Video load error:", e);
    setVideoError(true);
    
    // 尝试使用绝对路径作为回退
    if (videoRef.current && typeof window !== "undefined" && window.location.hostname.includes("github.io")) {
      const fallbackPath = "/interaction/animations/default-character.mp4";
      console.log("Trying fallback path:", fallbackPath);
      videoRef.current.src = fallbackPath;
      videoRef.current.load();
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {!videoLoaded && !videoError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-xl text-gray-400">加载角色动画中...</div>
        </div>
      )}
      
      {videoError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-xl text-red-400">动画加载失败，请刷新页面重试</div>
        </div>
      )}
      
      <video
        ref={videoRef}
        className="max-w-full max-h-full object-contain"
        playsInline
        muted={!isAnimating}
        loop={isAnimating}
        onLoadedData={handleVideoLoaded}
        onError={handleVideoError}
        style={{ display: videoLoaded ? 'block' : 'none' }}
      />
      
      {isAnimating && videoLoaded && (
        <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 p-2 rounded">
          <p className="text-sm">{response}</p>
        </div>
      )}
    </div>
  );
};

export default CharacterAnimation;