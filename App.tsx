

import { useState, useEffect } from 'react';
import HomePage from './HomePage';
import LandingPage from './LandingPage';
import AdminPanel from './components/AdminPanel';




export default function App() {
  const [showAdmin, setShowAdmin] = useState(false);

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
    </>
  );
}
