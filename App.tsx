

import { useState, useRef, useEffect } from 'react';
import HomePage from './HomePage';
import LandingPage from './LandingPage';
import AdminPanel from './components/AdminPanel';

const PreviewToggle = ({ mode, setMode }: { mode: string; setMode: (mode: string) => void; }) => (
  <div className="fixed bottom-5 right-5 z-50 flex items-center gap-1 rounded-full bg-white p-2 shadow-lg ring-1 ring-zinc-200">
    <button
      onClick={() => setMode('desktop')}
      className={`rounded-full p-2 transition-colors ${mode === 'desktop' ? 'bg-blue-500 text-white' : 'text-zinc-500 hover:bg-zinc-100'}`}
      aria-label="Desktop preview"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    </button>
    <button
      onClick={() => setMode('mobile')}
      className={`rounded-full p-2 transition-colors ${mode === 'mobile' ? 'bg-blue-500 text-white' : 'text-zinc-500 hover:bg-zinc-100'}`}
      aria-label="Mobile preview"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="http://www.w3.org/2000/svg" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    </button>
  </div>
);


export default function App() {
  const [previewMode, setPreviewMode] = useState('desktop');
  const [showAdmin, setShowAdmin] = useState(false);
  const mobileScrollRef = useRef(null);

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
      <div className={`transition-all duration-500 ease-in-out ${previewMode === 'mobile' ? 'mx-auto max-w-[375px] my-8 border-[12px] border-zinc-800 rounded-[40px] shadow-2xl overflow-hidden' : 'w-full'}`}>
        <div
          ref={mobileScrollRef}
          className={previewMode === 'mobile' ? 'h-[667px] overflow-y-scroll bg-white' : ''}
        >
          <LandingPage scrollRef={previewMode === 'mobile' ? mobileScrollRef : undefined} scrollDuration={videoScrollDuration} />
          {/* This spacer div creates the scrollable area for the video */}
          <div style={{ height: `${videoScrollDuration}px` }} />
          <HomePage />
        </div>
      </div>
      <PreviewToggle mode={previewMode} setMode={setPreviewMode} />
      {showAdmin && <AdminPanel onClose={() => { setShowAdmin(false); window.location.hash = ''; }} />}
    </>
  );
}
