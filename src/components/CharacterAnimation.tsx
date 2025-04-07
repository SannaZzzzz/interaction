import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Head from "next/head";

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
  const [isPreloading, setIsPreloading] = useState(true);
  const [preloadProgress, setPreloadProgress] = useState(0);

  // 使用useMemo缓存视频源，避免重复计算
  const videoSrc = useMemo(() => {
    const basePath = process.env.NODE_ENV === "production" && 
                    typeof window !== "undefined" && 
                    window.location.hostname.includes("github.io") 
                    ? "/interaction" : "";

    switch (character) {
      case "anime":
        return `${basePath}/animations/anime-character.mp4`;
      case "custom":
        return `${basePath}/animations/custom-character.mp4`;
      default:
        return `${basePath}/animations/default-character.mp4`;
    }
  }, [character]);

  // 预加载视频并缓存
  useEffect(() => {
    // 如果不在浏览器环境中，不执行预加载
    if (typeof window === "undefined") return;
    
    // 检查缓存
    const videoCache = localStorage.getItem(`video-cache-${videoSrc}`);
    if (videoCache) {
      try {
        console.log("Using cached video");
        setIsPreloading(false);
        if (videoRef.current) {
          videoRef.current.src = videoCache;
          videoRef.current.load();
        }
        return;
      } catch (err) {
        console.error("Failed to use cached video:", err);
        // 缓存失效，继续预加载
        localStorage.removeItem(`video-cache-${videoSrc}`);
      }
    }
    
    console.log("Preloading video:", videoSrc);
    setIsPreloading(true);
    setPreloadProgress(0);
    
    // 使用新的fetch API和Streams API更高效地加载
    const abortController = new AbortController();
    let totalBytes = 0;
    let loadedBytes = 0;
    
    fetch(videoSrc, { signal: abortController.signal })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        totalBytes = parseInt(response.headers.get('Content-Length') || '0', 10);
        
        // 创建一个读取流
        const reader = response.body?.getReader();
        if (!reader) throw new Error('ReadableStream not supported');
        
        return new ReadableStream({
          start(controller) {
            function push() {
              reader.read().then(({ done, value }) => {
                if (done) {
                  controller.close();
                  return;
                }
                
                if (value) {
                  loadedBytes += value.length;
                  if (totalBytes > 0) {
                    const progress = Math.round((loadedBytes / totalBytes) * 100);
                    setPreloadProgress(progress);
                  }
                  controller.enqueue(value);
                }
                push();
              }).catch(error => {
                console.error('Stream reading error:', error);
                controller.error(error);
              });
            }
            push();
          }
        });
      })
      .then(stream => new Response(stream))
      .then(response => response.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        
        // 保存到缓存
        try {
          localStorage.setItem(`video-cache-${videoSrc}`, url);
        } catch (err) {
          console.warn("Could not cache video:", err);
          // 可能是因为LocalStorage空间有限，我们仍然可以继续使用视频
        }
        
        // 设置视频源
        if (videoRef.current) {
          videoRef.current.src = url;
          videoRef.current.load();
        }
        
        setIsPreloading(false);
        console.log("Video preloaded successfully");
      })
      .catch(err => {
        console.error("Failed to preload video:", err);
        setVideoError(!!err);
        setIsPreloading(false);
        
        // 失败后尝试正常加载
        if (videoRef.current) {
          videoRef.current.src = videoSrc;
          videoRef.current.load();
        }
      });
    
    return () => {
      // 取消预加载请求
      abortController.abort();
      // 释放旧的URL对象
      if (videoRef.current && videoRef.current.src.startsWith('blob:')) {
        URL.revokeObjectURL(videoRef.current.src);
      }
    };
  }, [videoSrc]);

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
      <Head>
        <link rel="preload" href={videoSrc} as="video" type="video/mp4" />
      </Head>
      {isPreloading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-xl text-gray-400 mb-2">加载角色动画中... {preloadProgress}%</div>
          <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300 ease-out" 
              style={{ width: `${preloadProgress}%` }}
            />
          </div>
        </div>
      )}
      
      {!isPreloading && !videoLoaded && !videoError && (
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