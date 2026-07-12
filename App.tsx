

import { useState, useEffect } from 'react';
import HomePage from './HomePage';
import LandingPage from './LandingPage';
import AdminPanel from './components/AdminPanel';
import PopupModal from './components/PopupModal';



export default function App() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // 팝업 표시 여부 확인
  useEffect(() => {
    const dismissed = localStorage.getItem('yeoyeo_popup_dismissed');
    const today = new Date().toISOString().split('T')[0];
    if (dismissed !== today) {
      // 페이지 로드 후 잠시 대기 후 팝업 표시
      const timer = setTimeout(() => setShowPopup(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  // 관리자 패널 해시 감지
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#admin') {
        setShowAdmin(true);
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);

    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // 랜딩 이미지 변형(웹/모바일) 선택용 디바이스 판별
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    // 터치 디바이스거나 너비 1024px 이하면 모바일로 간주 (태블릿 포함)
    const mq = window.matchMedia('(max-width: 1024px)');
    const isTouch = 'ontouchstart' in window || (navigator.maxTouchPoints ?? 0) > 0;
    const update = () => setIsMobile(mq.matches || isTouch);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return (
    <>
      <div className="w-full">
        {/* 표준 히어로: 스크롤하면 랜딩이 위로 밀려 올라가고 본문이 자연스럽게 이어짐 */}
        <LandingPage isMobile={isMobile} />
        <HomePage />
      </div>
      {showAdmin && <AdminPanel onClose={() => { setShowAdmin(false); window.location.hash = ''; }} />}
      {showPopup && <PopupModal onClose={() => setShowPopup(false)} />}
    </>
  );
}
