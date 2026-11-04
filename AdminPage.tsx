import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AdminConfig {
    googleSheetId: string;
    blogLink: string;
    cafeLink: string;
    chatbotLink: string;
    imageCompareLink: string;
    newsLinks: { title: string; link: string; source: string; date: string }[];
    alphaVantageKey: string;
    fredKey: string;
    bokKey: string;
    koreaEximKey: string;
    dataGoKrKey: string;
}

export default function AdminPage({ onClose }: { onClose: () => void }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [config, setConfig] = useState<AdminConfig>({
        googleSheetId: import.meta.env.VITE_GOOGLE_SHEET_ID || '',
        blogLink: 'https://blog.naver.com/yeoyeobudongsan',
        cafeLink: 'https://cafe.naver.com/yeoyeobudongsan',
        chatbotLink: 'https://yeoyeo-chatbot.vercel.app',
        imageCompareLink: 'https://yeoyeo-gallery-v2.vercel.app',
        newsLinks: [],
        alphaVantageKey: '',
        fredKey: '',
        bokKey: '',
        koreaEximKey: '',
        dataGoKrKey: ''
    });

    useEffect(() => {
        // 로컬스토리지에서 설정 불러오기
        const savedConfig = localStorage.getItem('adminConfig');
        if (savedConfig) {
            setConfig(JSON.parse(savedConfig));
        }
    }, []);

    // 관리자 PIN 확인은 서버에서만 수행 (ADMIN_PIN 환경변수)
    const handleLogin = async () => {
        try {
            const res = await fetch('/api/admin-check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin: password }),
            });
            if (res.ok) {
                setIsAuthenticated(true);
                return;
            }
        } catch {
            // 아래 공통 안내로 처리
        }
        alert('비밀번호가 올바르지 않습니다.');
    };

    const handleSave = () => {
        localStorage.setItem('adminConfig', JSON.stringify(config));
        alert('설정이 저장되었습니다. 페이지를 새로고침하면 적용됩니다.');
    };

    if (!isAuthenticated) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">관리자 로그인</h2>
                        <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-lg">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">비밀번호</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                                placeholder="비밀번호를 입력하세요"
                            />
                        </div>
                        <button
                            onClick={handleLogin}
                            className="w-full bg-[#D4AF37] text-white py-2 rounded-lg font-semibold hover:bg-[#C4A037] transition-colors"
                        >
                            로그인
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-xl p-8 max-w-4xl w-full mx-4 my-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">관리자 페이지</h2>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* 링크 관리 */}
                    <div className="border-b pb-6">
                        <h3 className="text-lg font-bold mb-4">🔗 링크 관리</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">구글 시트 ID</label>
                                <input
                                    type="text"
                                    value={config.googleSheetId}
                                    onChange={(e) => setConfig({ ...config, googleSheetId: e.target.value })}
                                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm"
                                    placeholder="1Ajn0VVRqQfpjEimzmW7yorf7ecL9RKpXWpsCNj2QhsE"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">블로그 링크</label>
                                <input
                                    type="text"
                                    value={config.blogLink}
                                    onChange={(e) => setConfig({ ...config, blogLink: e.target.value })}
                                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">카페 링크</label>
                                <input
                                    type="text"
                                    value={config.cafeLink}
                                    onChange={(e) => setConfig({ ...config, cafeLink: e.target.value })}
                                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">챗봇 링크</label>
                                <input
                                    type="text"
                                    value={config.chatbotLink}
                                    onChange={(e) => setConfig({ ...config, chatbotLink: e.target.value })}
                                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">이미지 비교 링크</label>
                                <input
                                    type="text"
                                    value={config.imageCompareLink}
                                    onChange={(e) => setConfig({ ...config, imageCompareLink: e.target.value })}
                                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* API 키 관리 */}
                    <div className="border-b pb-6">
                        <h3 className="text-lg font-bold mb-4">🔑 API 키 관리</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">Alpha Vantage Key</label>
                                <input
                                    type="text"
                                    value={config.alphaVantageKey}
                                    onChange={(e) => setConfig({ ...config, alphaVantageKey: e.target.value })}
                                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">FRED Key</label>
                                <input
                                    type="text"
                                    value={config.fredKey}
                                    onChange={(e) => setConfig({ ...config, fredKey: e.target.value })}
                                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">한국은행 Key</label>
                                <input
                                    type="text"
                                    value={config.bokKey}
                                    onChange={(e) => setConfig({ ...config, bokKey: e.target.value })}
                                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">한국수출입은행 Key</label>
                                <input
                                    type="text"
                                    value={config.koreaEximKey}
                                    onChange={(e) => setConfig({ ...config, koreaEximKey: e.target.value })}
                                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-1">공공데이터 Key</label>
                                <input
                                    type="text"
                                    value={config.dataGoKrKey}
                                    onChange={(e) => setConfig({ ...config, dataGoKrKey: e.target.value })}
                                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm font-mono"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={handleSave}
                        className="flex-1 bg-[#D4AF37] text-white py-3 rounded-lg font-semibold hover:bg-[#C4A037] transition-colors"
                    >
                        저장
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 bg-zinc-200 text-zinc-700 py-3 rounded-lg font-semibold hover:bg-zinc-300 transition-colors"
                    >
                        닫기
                    </button>
                </div>

                <p className="mt-4 text-xs text-zinc-500">
                    ⚠️ API 키 변경 후에는 .env 파일도 수동으로 업데이트해야 합니다.
                </p>
            </div>
        </div>
    );
}
