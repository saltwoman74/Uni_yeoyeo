
import { useEffect, useState } from 'react';

interface LandingPageProps {
  isMobile?: boolean;
}

export default function LandingPage({ isMobile = false }: LandingPageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [scrolled, setScrolled] = useState(0);

  // 스크롤 위치 추적 — 스크롤 유도 큐 페이드아웃용
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 조금만 스크롤해도 큐가 서서히 사라짐 (0~160px)
  const cueOpacity = Math.max(0, 1 - scrolled / 160);

  return (
    <section className="relative h-screen w-full overflow-hidden" style={{ backgroundColor: 'rgb(178,178,178)' }}>
      {/* 표준 히어로 랜딩 이미지 (UNI_CITY / 여여부동산) — 웹: 풀블리드 cover, 모바일: 세로형 크롭 contain */}
      <img
        src={isMobile ? '/landing-mobile.png' : '/landing.png'}
        alt="UNI_CITY 여여부동산"
        onLoad={() => setImageLoaded(true)}
        className={`h-full w-full ${isMobile ? 'object-contain' : 'object-cover'} object-center ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
        style={{ backgroundColor: 'rgb(178,178,178)' }}
      />

      {/* 스크롤 유도 큐 — 확 튀는 네이비 배지 + 골드 위 화살표 (모바일 하단바 위로 배치) */}
      <div
        className="absolute bottom-28 md:bottom-10 left-0 right-0 flex justify-center pointer-events-none z-30"
        style={{ opacity: cueOpacity, transition: 'opacity 400ms ease' }}
      >
        <div className="flex flex-col items-center animate-bounce">
          {/* 위로 향하는 화살표 (골드) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 sm:h-8 sm:w-8 text-[#D4AF37] mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
          </svg>
          {/* 안내 배지 — 브랜드 A2Z 폰트, 네이비 배경 + 골드 링 글로우 */}
          <div className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-full bg-[#0F172A] ring-1 ring-[#D4AF37]/60 shadow-[0_6px_24px_rgba(15,23,42,0.4)]">
            <span
              className="text-white text-sm sm:text-base font-bold tracking-wide whitespace-nowrap"
              style={{ fontFamily: "'A2Z', Pretendard, sans-serif" }}
            >
              화면을 위로 올려보세요
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
