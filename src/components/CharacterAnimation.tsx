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
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });

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
      videoRef.current.load();
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
      videoRef.current.currentTime = 0;
      
      const playVideo = async () => {
        try {
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
    
    // 获取视频的实际尺寸
    if (videoRef.current) {
      setVideoDimensions({
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight
      });
    }
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error("Video load error:", e);
    setVideoError(true);
    
    if (videoRef.current && typeof window !== "undefined" && window.location.hostname.includes("github.io")) {
      const fallbackPath = "/interaction/animations/default-character.mp4";
      console.log("Trying fallback path:", fallbackPath);
      videoRef.current.src = fallbackPath;
      videoRef.current.load();
    }
  };

  // 计算视频的宽高比，但放大比例
  const aspectRatio = videoDimensions.height > 0 ? videoDimensions.width / videoDimensions.height : 9 / 16;
  // 确保宽度在合理范围内，但允许更大的尺寸
  const calculatedWidth = Math.max(aspectRatio * 120, 120); // 放大了20%

  return (
    <div className="relative h-full flex items-center justify-center">
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
      
      <div 
        style={{ 
          height: '100%',
          width: `${calculatedWidth}%`,
          minWidth: '350px',
          maxWidth: '110%', // 允许稍微超出容器以适应更大尺寸
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden'
        }}
      >
        <video
          ref={videoRef}
          className="h-full"
          playsInline
          muted={!isAnimating}
          loop={isAnimating}
          onLoadedData={handleVideoLoaded}
          onError={handleVideoError}
          style={{ 
            display: videoLoaded ? 'block' : 'none',
            objectFit: 'contain',
            width: 'auto',
            height: '110%', // 稍微放大
            maxWidth: 'none' // 允许视频超出容器宽度以保持原始比例
          }}
        />
      </div>
      
      {isAnimating && videoLoaded && (
        <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 p-2 rounded">
          <p className="text-sm">{response}</p>
        </div>
      )}
    </div>
  );
};

export default CharacterAnimation;