

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

  // This spacer div's height will control the video scroll duration
  const videoScrollDuration = 3000; // in pixels

  return (
    <>
      <div className="w-full">
        <LandingPage scrollDuration={videoScrollDuration} />
        {/* This spacer div creates the scrollable area for the video */}
        <div style={{ height: `${videoScrollDuration}px` }} />
        <HomePage />
      </div>
      {showAdmin && <AdminPanel onClose={() => { setShowAdmin(false); window.location.hash = ''; }} />}
      {showPopup && <PopupModal onClose={() => setShowPopup(false)} />}
    </>
  );
}
