

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

  // 모바일에서는 스크롤 스크럽 비활성화 + 스크롤 거리 대폭 축소 (1스크롤 이내)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const videoScrollDuration = isMobile ? 400 : 3000; // 모바일은 짧게, 데스크톱은 스크럽 유지

  return (
    <>
      <div className="w-full">
        <LandingPage scrollDuration={videoScrollDuration} isMobile={isMobile} />
        {/* This spacer div creates the scrollable area for the video */}
        <div style={{ height: `${videoScrollDuration}px` }} />
        <HomePage />
      </div>
      {showAdmin && <AdminPanel onClose={() => { setShowAdmin(false); window.location.hash = ''; }} />}
      {showPopup && <PopupModal onClose={() => setShowPopup(false)} />}
    </>
  );
}
