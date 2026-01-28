import React, { useState } from 'react';

interface AdminPanelProps {
    onClose: () => void;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'listings' | 'market' | 'news'>('listings');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === '1234') {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('비밀번호가 올바르지 않습니다.');
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setPassword('');
    };

    if (!isAuthenticated) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-zinc-900">관리자 로그인</h2>
                        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-2">
                                비밀번호
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                                placeholder="비밀번호를 입력하세요"
                            />
                            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#0F172A] text-white py-3 rounded-lg font-semibold hover:bg-black transition-colors"
                        >
                            로그인
                        </button>
                    </form>

                    <div className="mt-6 p-4 bg-zinc-50 rounded-lg">
                        <p className="text-xs text-zinc-600">
                            <strong>초기 비밀번호:</strong> 1234<br />
                            보안을 위해 비밀번호를 변경하시기 바랍니다.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full my-8">
                {/* 헤더 */}
                <div className="bg-[#0F172A] text-white px-8 py-6 rounded-t-2xl">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold">관리자 패널</h2>
                            <p className="text-sm text-zinc-400 mt-1">데이터 관리 및 업데이트</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm transition-colors"
                            >
                                로그아웃
                            </button>
                            <button onClick={onClose} className="text-zinc-400 hover:text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 탭 네비게이션 */}
                <div className="border-b border-zinc-200">
                    <div className="flex px-8">
                        <button
                            onClick={() => setActiveTab('listings')}
                            className={`px-6 py-4 font-semibold transition-colors ${activeTab === 'listings'
                                    ? 'text-[#0F172A] border-b-2 border-[#D4AF37]'
                                    : 'text-zinc-500 hover:text-zinc-700'
                                }`}
                        >
                            매물 관리
                        </button>
                        <button
                            onClick={() => setActiveTab('market')}
                            className={`px-6 py-4 font-semibold transition-colors ${activeTab === 'market'
                                    ? 'text-[#0F172A] border-b-2 border-[#D4AF37]'
                                    : 'text-zinc-500 hover:text-zinc-700'
                                }`}
                        >
                            시장 데이터
                        </button>
                        <button
                            onClick={() => setActiveTab('news')}
                            className={`px-6 py-4 font-semibold transition-colors ${activeTab === 'news'
                                    ? 'text-[#0F172A] border-b-2 border-[#D4AF37]'
                                    : 'text-zinc-500 hover:text-zinc-700'
                                }`}
                        >
                            뉴스 관리
                        </button>
                    </div>
                </div>

                {/* 컨텐츠 영역 */}
                <div className="p-8 max-h-[600px] overflow-y-auto">
                    {activeTab === 'listings' && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                <h3 className="font-bold text-lg text-blue-900 mb-3">📋 매물 데이터 관리</h3>
                                <p className="text-sm text-blue-800 mb-4">
                                    현재 매물 데이터는 <code className="bg-blue-100 px-2 py-1 rounded">HomePage.tsx</code> 파일의 <code className="bg-blue-100 px-2 py-1 rounded">listingsData</code> 배열에 하드코딩되어 있습니다.
                                </p>
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-blue-900">업데이트 방법:</h4>
                                    <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                                        <li><strong>직접 수정:</strong> <code>HomePage.tsx</code> 파일을 열어 <code>listingsData</code> 배열을 수정</li>
                                        <li><strong>JSON 파일 사용:</strong> <code>public/data/listings.json</code> 파일을 생성하고 fetch로 불러오기</li>
                                        <li><strong>API 연동:</strong> 백엔드 API를 구축하여 실시간 데이터 관리</li>
                                        <li><strong>CMS 연동:</strong> Contentful, Strapi 등의 CMS와 연동</li>
                                    </ol>
                                </div>
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                <h3 className="font-bold text-lg text-green-900 mb-3">💡 권장 구조</h3>
                                <pre className="bg-green-100 p-4 rounded-lg text-xs overflow-x-auto">
                                    {`{
  "type": "아파트",
  "complex": "유니시티 3단지",
  "size": "34평",
  "unit": "A동 15층",
  "price": "5억 2,000",
  "features": "남향, 역세권",
  "category": "unicity"
}`}
                                </pre>
                            </div>
                        </div>
                    )}

                    {activeTab === 'market' && (
                        <div className="space-y-6">
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                                <h3 className="font-bold text-lg text-purple-900 mb-3">📊 시장 데이터 관리</h3>
                                <p className="text-sm text-purple-800 mb-4">
                                    시장 데이터는 <code className="bg-purple-100 px-2 py-1 rounded">HomePage.tsx</code> 파일의 <code className="bg-purple-100 px-2 py-1 rounded">marketData</code> 객체에 저장되어 있습니다.
                                </p>
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-purple-900">업데이트 항목:</h4>
                                    <ul className="list-disc list-inside space-y-2 text-sm text-purple-800">
                                        <li><strong>기준금리:</strong> 한국은행 기준금리 데이터</li>
                                        <li><strong>환율:</strong> 원/달러 환율</li>
                                        <li><strong>물가지수:</strong> 소비자물가지수 (YoY)</li>
                                        <li><strong>인구:</strong> 창원시 인구 통계</li>
                                        <li><strong>Market Signal:</strong> 매수/매도 우위 판단 및 포지션 가이드</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                                <h3 className="font-bold text-lg text-yellow-900 mb-3">⚡ Market Signal 업데이트</h3>
                                <p className="text-sm text-yellow-800 mb-3">
                                    <strong>여여부동산 행동강령</strong>의 핵심 요소입니다. 시장 상황에 따라 정기적으로 업데이트하세요.
                                </p>
                                <div className="space-y-2 text-sm text-yellow-800">
                                    <p><strong>status:</strong> "매수우위" | "관망" | "매도우위"</p>
                                    <p><strong>buyer:</strong> 매수자를 위한 구체적인 행동 가이드</p>
                                    <p><strong>seller:</strong> 매도자를 위한 구체적인 행동 가이드</p>
                                    <p><strong>updated:</strong> 마지막 업데이트 날짜</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'news' && (
                        <div className="space-y-6">
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                                <h3 className="font-bold text-lg text-orange-900 mb-3">📰 뉴스 데이터 관리</h3>
                                <p className="text-sm text-orange-800 mb-4">
                                    뉴스 데이터는 <code className="bg-orange-100 px-2 py-1 rounded">HomePage.tsx</code> 파일의 <code className="bg-orange-100 px-2 py-1 rounded">newsData</code> 배열에 저장되어 있습니다.
                                </p>
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-orange-900">자동화 옵션:</h4>
                                    <ul className="list-disc list-inside space-y-2 text-sm text-orange-800">
                                        <li><strong>RSS 피드:</strong> 네이버 뉴스 RSS를 활용한 자동 업데이트</li>
                                        <li><strong>뉴스 API:</strong> NewsAPI 등의 서비스 활용</li>
                                        <li><strong>웹 스크래핑:</strong> 정기적인 크롤링으로 최신 뉴스 수집</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                                <h3 className="font-bold text-lg text-red-900 mb-3">⚠️ 주의사항</h3>
                                <ul className="list-disc list-inside space-y-2 text-sm text-red-800">
                                    <li>데이터 수정 후 반드시 로컬에서 테스트하세요</li>
                                    <li>프로덕션 배포 전 백업을 생성하세요</li>
                                    <li>JSON 형식이 올바른지 확인하세요</li>
                                    <li>이미지 URL은 HTTPS를 사용하세요</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                {/* 푸터 */}
                <div className="bg-zinc-50 px-8 py-4 rounded-b-2xl border-t border-zinc-200">
                    <p className="text-xs text-zinc-600 text-center">
                        데이터 업데이트 후 <code className="bg-zinc-200 px-2 py-1 rounded">npm run dev</code>로 로컬 테스트를 진행하세요.
                    </p>
                </div>
            </div>
        </div>
    );
}
