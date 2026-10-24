import { useState, useEffect, useCallback } from 'react';

interface PopupModalProps {
    onClose: () => void;
}

export default function PopupModal({ onClose }: PopupModalProps) {
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = useCallback((skipToday: boolean) => {
        if (skipToday) {
            const today = new Date().toISOString().split('T')[0];
            localStorage.setItem('yeoyeo_popup_dismissed', today);
        }
        setIsClosing(true);
        setTimeout(() => onClose(), 280);
    }, [onClose]);

    // ESC key + 배경 스크롤 잠금
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose(false);
        };
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [handleClose]);

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-start p-4 pl-6 popup-overlay ${isClosing ? 'popup-closing' : 'popup-entering'}`}
            onClick={(e) => { if (e.target === e.currentTarget) handleClose(false); }}
        >
            {/* Popup Card — 주간 정보지 이미지 */}
            <div
                className={`popup-card relative w-full max-w-[420px] max-h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden ${isClosing ? 'popup-card-closing' : 'popup-card-entering'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button (이미지 위에 떠 있음) */}
                <button
                    onClick={() => handleClose(false)}
                    className="absolute top-2.5 right-2.5 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/45 hover:bg-black/60 transition-colors"
                    style={{ minHeight: 'auto', minWidth: 'auto', backdropFilter: 'blur(4px)' }}
                    aria-label="닫기"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* 이미지 (길면 스크롤). 클릭 시 원본 크게 보기 */}
                <div className="flex-1 overflow-y-auto popup-scrollbar">
                    <a href="/popup.png" target="_blank" rel="noopener noreferrer" title="크게 보기">
                        <img src="/popup.png" alt="여여부동산 주간 정보지" className="w-full h-auto block" />
                    </a>
                </div>

                {/* Footer */}
                <div className="shrink-0 px-5 py-3 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                    <button
                        onClick={() => handleClose(true)}
                        className="text-[11px] text-zinc-400 hover:text-zinc-600 transition-colors flex items-center gap-1"
                        style={{ minHeight: 'auto', minWidth: 'auto' }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        오늘 하루 보지 않기
                    </button>
                    <button
                        onClick={() => handleClose(false)}
                        className="px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', minHeight: 'auto', minWidth: 'auto' }}
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
}
