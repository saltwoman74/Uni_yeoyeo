
import React, { useEffect, useRef, useState } from 'react';

interface LandingPageProps {
  scrollRef?: React.RefObject<HTMLDivElement>;
  scrollDuration: number;
}

export default function LandingPage({ scrollRef, scrollDuration }: LandingPageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetTimeRef = useRef(0);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const scrollElement = scrollRef?.current || window;
    const container = scrollRef?.current || document.documentElement;

    const handleLoadedMetadata = () => {
      setVideoLoaded(true);
      setVideoError(false);
    };

    const handleError = () => {
      setVideoError(true);
      setVideoLoaded(false);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('error', handleError);

    const handleScroll = () => {
      if (!video || !videoLoaded) return;

      const scrollTop = scrollRef?.current ? container.scrollTop : window.scrollY;

      // Calculate scroll progress based on the dedicated scroll area height
      const progress = Math.min(Math.max(scrollTop / scrollDuration, 0), 1);

      setScrollProgress(progress);
      targetTimeRef.current = progress * video.duration;
    };

    const updateVideoTime = () => {
      if (video && videoLoaded) {
        const targetTime = targetTimeRef.current;
        const currentTime = video.currentTime;
        const timeDiff = Math.abs(targetTime - currentTime);

        if (!video.seeking && timeDiff > 0.01) {
          video.currentTime = targetTime;
        }
      }
      animationFrameRef.current = requestAnimationFrame(updateVideoTime);
    };

    animationFrameRef.current = requestAnimationFrame(updateVideoTime);
    scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call to set position

    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('error', handleError);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [videoLoaded, scrollRef, scrollDuration]);

  return (
    <div className="sticky top-0 h-screen w-full overflow-hidden z-10 bg-white">
      {!videoLoaded && !videoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-20">
          <div className="text-center">
            <div className="spinner mb-4"></div>
            <p className="text-zinc-500">비디오 로딩 중...</p>
          </div>
        </div>
      )}

      {videoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 z-20">
          <div className="text-center px-4">
            <h1 className="text-6xl sm:text-8xl font-black text-[#0F172A] tracking-tight mb-3" style={{ fontFamily: 'Arial, sans-serif', letterSpacing: '0.05em' }}>UNI_CITY</h1>
            <p className="text-3xl sm:text-4xl text-zinc-700 font-normal" style={{ fontFamily: 'Pretendard, sans-serif' }}>여여부동산</p>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        src="/3456.webm"
        className={`h-full w-full object-contain bg-white scale-125 ${!videoLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
        preload="auto"
        muted
        playsInline
      />

      {/* Scroll Overlay Content (Title) */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 transition-opacity duration-1000 pointer-events-none"
        style={{ opacity: 1 - scrollProgress * 2 }}
      >
        <h1 className="text-6xl sm:text-8xl font-black text-white tracking-tight mb-3" style={{ fontFamily: 'Arial, sans-serif', letterSpacing: '0.05em' }}>UNI_CITY</h1>
        <p className="text-3xl sm:text-4xl text-white/95 font-normal" style={{ fontFamily: 'Pretendard, sans-serif' }}>여여부동산</p>
      </div>

      {/* Scroll Indicator - Bouncing Arrow (Persists until header appears) */}
      <div
        className="absolute bottom-20 left-0 right-0 flex flex-col items-center animate-bounce pointer-events-none transition-opacity duration-500"
        style={{ opacity: scrollProgress > 0.9 ? 0 : 0.8 }}
      >
        <span className="text-white text-lg font-bold mb-2 tracking-widest drop-shadow-md">위로 스크롤 10회</span>
        {/* Arrow pointing UP */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white drop-shadow-md rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-zinc-200/20 z-30">
        <div
          className="h-full bg-[#D4AF37] transition-all duration-100 ease-out shadow-[0_0_10px_rgba(212,175,55,0.5)]"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>
    </div>
  );
}
