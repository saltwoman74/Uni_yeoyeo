
import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import ListingModal from './components/ListingModal';
import MarketSignalCard from './components/MarketSignalCard';
import AdminPage from './AdminPage';
import { searchListings, sortListings, type Listing, type SortOption } from './utils/searchUtils';
import { fetchAllMarketData } from './utils/apiService';
import { fetchListingsFromGoogleSheet } from './utils/googleSheets';

// --- SVG Icons ---
const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.518.76a11.034 11.034 0 006.364 6.364l.76-1.518a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
  </svg>
);
const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
  </svg>
);

// --- Mock Data ---
const marketData = {
  interestRate: { value: '3.50%', change: '+0.25%p', type: 'up' },
  exchangeRate: { value: '1,380.5원', change: '-5.2원', type: 'down' },
  inflation: { value: '2.7%', change: '-0.2%p', type: 'down' },
  population: { value: '1,021,550명', change: '-850명', type: 'down' },
  supplyDemand: { value: '1,200세대', subtitle: '입주 물량 (적정: 1,500)' },
  usFedRate: { value: '5.25%', change: '+0.00%p', type: 'up' },
  kospi: { value: '2,580.45', change: '+15.32', type: 'up' },
  kosdaq: { value: '745.28', change: '-3.15', type: 'down' },
  sp500: { value: '5,123.50', change: '+22.10', type: 'up' },
  marketSignal: {
    status: '약상승',
    buyer: '급매물 중심의 선별적 접근 유효',
    seller: '호가 조정 통한 거래 성사 필요',
    updated: '2026.01.28'
  }
};

const listingsData = [
  { type: '아파트', complex: '유니시티 4단지', size: '35평', unit: '405동 고층', price: '8억 5,000', features: '남향, 공원뷰, 풀옵션', category: 'unicity' },
  { type: '아파트', complex: '유니시티 3단지', size: '41평', unit: '301동 중층', price: '10억 2,000', features: '코너, 조망 우수, 올수리', category: 'unicity' },
  { type: '아파트', complex: '유니시티 1단지', size: '30평', unit: '110동 로얄층', price: '7억 8,000', features: '역세권, 채광 좋음', category: 'unicity' },
  { type: '상가', complex: '유니시티 어반브릭스', size: '15평', unit: '1층 코너', price: '5,000/250', features: '유동인구 많음', category: 'all' },
  { type: '오피스텔', complex: '힐스테이트 에비뉴', size: '25평', unit: 'A동 15층', price: '3억 2,000', features: '풀퍼니시드, 업무 최적', category: 'all' },
];

const knowledgeLinks = [
  { title: '박혜경의 부동산 인사이트', description: '네이버 블로그', link: 'https://blog.naver.com/qnehdtksznls2016', icon: 'https://ssl.pstatic.net/static/blog/image/blog_favicon.ico' },
  { title: '여여부동산 네이버카페', description: '네이버 카페', link: 'https://cafe.naver.com/saltwoman74', icon: 'https://ssl.pstatic.net/static/cafe/cafe_pc/default/cafe_favicon.png' },
  { title: '24시간 상담 챗봇', description: 'AI 스마트 기능', link: 'https://lambent-sopapillas-6102aa.netlify.app/', icon: '🤖' },
  { title: '유니시티 이미지 비교', description: '갤러리 앱', link: 'https://yeoyeo-gallery-v2.vercel.app/', icon: '🖼️' },
];

const newsData = [
  { title: "창원 부동산 시장, 하반기 전망은?", source: "부동산 인사이트", date: "2024.07.21", link: "#" },
  { title: "유니시티, 학군 및 인프라 개선으로 가치 상승", source: "창원일보", date: "2024.07.18", link: "#" },
  { title: "정부, 신규 부동산 정책 발표… 시장 영향은?", source: "경제 뉴스", date: "2024.07.15", link: "#" },
]

const trustLinks = [
  { name: '청약홈', logo: 'https://www.applyhome.co.kr/images/logo_new.png', link: 'https://www.applyhome.co.kr/' },
  { name: '네이버부동산', logo: 'https://s.pstatic.net/static/www/mobile/edit/20240105_1000/upload_1704439169722KaoIr.png', link: 'https://land.naver.com/' },
  { name: '홈택스', logo: 'https://www.hometax.go.kr/img/new/logo_220922.png', link: 'https://www.hometax.go.kr/' },
  { name: '위택스', logo: 'https://www.wetax.go.kr/images/header_logo.png', link: 'https://www.wetax.go.kr/' },
  { name: '실거래가 공개시스템', logo: 'https://rt.molit.go.kr/img/logo_rt.png', link: 'https://rt.molit.go.kr/' },
  { name: '금융위원회', logo: 'https://www.fsc.go.kr/images/common/logo_fsc.png', link: 'https://www.fsc.go.kr/' },
  { name: '기금e든든', logo: 'https://enhuf.molit.go.kr/images/common/logo.png', link: 'https://enhuf.molit.go.kr/' },
];

const navLinks = [
  { href: "#listings", text: "매물보기" },
  { href: "#market-analysis", text: "시장분석" },
  { href: "#community", text: "커뮤니티" },
  { href: "https://lambent-sopapillas-6102aa.netlify.app/", text: "챗봇상담", external: true },
  { href: "https://yeoyeo-gallery-v2.vercel.app/", text: "이미지비교", external: true },
];

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [propertyType, setPropertyType] = useState('매매');
  const [complex, setComplex] = useState('1단지');
  const [size, setSize] = useState('25');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);

  // 단지별 평형 옵션
  const getSizeOptions = () => {
    const sizeMap: Record<string, string[]> = {
      '1단지': ['25', '30', '35', '41', '47(48)', '56'],
      '2단지': ['25', '30', '35', '41'],
      '3단지': ['25', '30', '35', '41'],
      '4단지': ['25', '30', '35', '41', '48(47)', '56']
    };
    return sizeMap[complex] || [];
  };

  // 단지 변경 시 평형 초기화
  const handleComplexChange = (newComplex: string) => {
    setComplex(newComplex);
    const availableSizes = getSizeOptions();
    if (availableSizes.length > 0) {
      setSize(availableSizes[0]);
    }
  };

  // 동적 데이터 상태
  const [marketData, setMarketData] = useState({
    interestRate: { value: '3.50%', change: '+0.25%p', type: 'up' },
    exchangeRate: { value: '1,380.5원', change: '-5.2원', type: 'down' },
    inflation: { value: '2.7%', change: '-0.2%p', type: 'down' },
    population: { value: '1,021,550명', change: '-850명', type: 'down' },
    supplyDemand: { value: '1,200세대', subtitle: '입주 물량 (적정: 1,500)' },
    usFedRate: { value: '5.25%', change: '+0.00%p', type: 'up' },
    kospi: { value: '2,580.45', change: '+15.32', type: 'up' },
    kosdaq: { value: '745.28', change: '-3.15', type: 'down' },
    sp500: { value: '5,123.50', change: '+22.10', type: 'up' },
    marketSignal: {
      status: '약상승',
      buyer: '급매물 중심의 선별적 접근 유효',
      seller: '호가 조정 통한 거래 성사 필요',
      updated: '2026.01.28'
    }
  });

  const [listingsData, setListingsData] = useState<Listing[]>([
    { type: '아파트', complex: '유니시티 4단지', size: '35평', unit: '405동 고층', price: '8억 5,000', features: '남향, 공원뷰, 풀옵션', category: 'unicity' },
    { type: '아파트', complex: '유니시티 3단지', size: '41평', unit: '301동 중층', price: '10억 2,000', features: '코너, 조망 우수, 올수리', category: 'unicity' },
    { type: '아파트', complex: '유니시티 1단지', size: '30평', unit: '110동 로얄층', price: '7억 8,000', features: '역세권, 채광 좋음', category: 'unicity' },
    { type: '상가', complex: '유니시티 어반브릭스', size: '15평', unit: '1층 코너', price: '5,000/250', features: '유동인구 많음', category: 'all' },
    { type: '오피스텔', complex: '힐스테이트 에비뉴', size: '25평', unit: 'A동 15층', price: '3억 2,000', features: '풀퍼니시드, 업무 최적', category: 'all' },
  ]);

  // API에서 데이터 가져오기
  useEffect(() => {
    // 초기 로드
    loadMarketData();
    loadListingsData();

    // 1시간마다 자동 업데이트
    const interval = setInterval(() => {
      loadMarketData();
      loadListingsData();
    }, 60 * 60 * 1000); // 1시간

    return () => clearInterval(interval);
  }, []);

  const loadMarketData = async () => {
    try {
      const data = await fetchAllMarketData();
      setMarketData(prev => ({
        ...prev,
        interestRate: data.interestRate,
        exchangeRate: data.exchangeRate,
        usFedRate: data.usFedRate,
        kospi: data.kospi,
        kosdaq: data.kosdaq,
        sp500: data.sp500
      }));
    } catch (error) {
      console.error('Market data load error:', error);
    }
  };

  const loadListingsData = async () => {
    try {
      const listings = await fetchListingsFromGoogleSheet();
      if (listings.length > 0) {
        setListingsData(listings);
      }
    } catch (error) {
      console.error('Listings data load error:', error);
    }
  };

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  // Filter and search listings
  const typeFiltered = listingsData.filter(item => item.type === propertyType);
  const complexFiltered = typeFiltered.filter(item => item.complex.includes(complex));
  const sizeFiltered = complexFiltered.filter(item => {
    // 35평과 56평은 A/B 구분
    if (size === '35') {
      return item.size === '35' || item.size.startsWith('35');
    }
    if (size === '56') {
      return item.size === '56' || item.size.startsWith('56');
    }
    // 47평과 48평은 같은 것으로 처리
    if (size === '47(48)' || size === '48(47)') {
      return item.size === '47(48)' || item.size === '48(47)' || item.size === '47' || item.size === '48';
    }
    return item.size === size;
  });
  const searchFiltered = searchListings(sizeFiltered, searchQuery);
  const filteredListings = sortListings(searchFiltered, sortBy);

  const StatusPill = ({ status }: { status: string }) => {
    const color = status === '관망' ? 'bg-yellow-500' : 'bg-zinc-500';
    return <span className={`px-4 py-1 text-sm font-semibold text-white rounded-full ${color}`}>{status}</span>;
  };

  const DataCard = ({ title, value, change, type, subtitle }: { title: string; value: string; change?: string; type?: 'up' | 'down'; subtitle?: string; }) => (
    <div className="bg-[#0F172A]/5 border border-zinc-200/50 rounded-xl p-4 sm:p-6 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
      <h3 className="text-xs sm:text-sm font-semibold text-zinc-500">{title}</h3>
      <p className="text-2xl sm:text-3xl font-bold text-[#0F172A] mt-2">{value}</p>
      {change && (
        <p className={`text-xs sm:text-sm font-semibold mt-1 ${type === 'up' ? 'text-red-500' : 'text-blue-500'}`}>
          {type === 'up' ? '▲' : '▼'} {change}
        </p>
      )}
      {subtitle && <p className="text-xs text-zinc-400 mt-1">{subtitle}</p>}
    </div>
  );

  return (
    <div className="bg-white text-zinc-800 relative z-20 font-['Pretendard']">
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-sm border-b border-zinc-200">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-lg text-[#0F172A]">여여부동산</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-zinc-600">
            {navLinks.map(link =>
              link.external ? (
                <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">{link.text}</a>
              ) : (
                <a key={link.href} href={link.href} className="hover:text-black transition-colors">{link.text}</a>
              )
            )}
          </nav>
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Open menu" className="text-zinc-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white md:hidden">
          <nav className="flex flex-col items-center justify-center h-full space-y-8">
            {navLinks.map(link =>
              link.external ? (
                <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" onClick={() => setIsMenuOpen(false)} className="text-2xl font-semibold text-zinc-800 hover:text-black transition-colors">{link.text}</a>
              ) : (
                <a key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className="text-2xl font-semibold text-zinc-800 hover:text-black transition-colors">{link.text}</a>
              )
            )}
          </nav>
        </div>
      )}

      <main className="overflow-hidden">
        <section className="py-24 sm:py-32 text-center bg-zinc-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-black sm:text-5xl">데이터가 말해주는 창원유니시티 가치, <br className="sm:hidden" />여여부동산이 함께합니다.</h1>
            <div className="mt-10 max-w-xl mx-auto">
              <SearchBar
                onSearch={setSearchQuery}
                listings={listingsData}
                placeholder="매물종류(매매,전세,월세).단지.평형(타입)"
              />
            </div>
          </div>
        </section>

        <section id="listings" className="py-20 sm:py-24 bg-zinc-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center tracking-tight text-black sm:text-4xl">매물목록</h2>

            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-zinc-600 font-medium">매물종류:</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                  >
                    <option value="매매">매매</option>
                    <option value="전세">전세</option>
                    <option value="월세">월세</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-zinc-600 font-medium">단지:</label>
                  <select
                    value={complex}
                    onChange={(e) => handleComplexChange(e.target.value)}
                    className="px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                  >
                    <option value="1단지">1단지</option>
                    <option value="2단지">2단지</option>
                    <option value="3단지">3단지</option>
                    <option value="4단지">4단지</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-zinc-600 font-medium">평형:</label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                  >
                    {getSizeOptions().map(sizeOption => (
                      <option key={sizeOption} value={sizeOption}>{sizeOption}평</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="text-sm text-zinc-600">정렬:</label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                >
                  <option value="recent">최신순</option>
                  <option value="price-asc">가격 낮은순</option>
                  <option value="price-desc">가격 높은순</option>
                  <option value="size-asc">평형 작은순</option>
                  <option value="size-desc">평형 큰순</option>
                </select>
              </div>
            </div>
            {/* Premium Listings 섹션 수정 부분 */}
            <div className="mt-8">
              {/* 1단(기본), 2단(md:768px), 3단(lg:1024px) 반응형 그리드 */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {filteredListings.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-zinc-200 rounded-lg p-3 hover:shadow-lg cursor-pointer transition-all hover:-translate-y-1 group text-sm"
                    onClick={() => setSelectedListing(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedListing(item);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-sm text-zinc-900">{item.complex}</h3>
                        <p className="text-xs text-zinc-600 mt-0.5">{item.unit}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-[#D4AF37] text-white text-xs font-semibold rounded-full">{item.type}</span>
                    </div>

                    <div className="space-y-1 mb-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-zinc-600">평형</span>
                        <span className="font-semibold text-xs text-zinc-900">{item.size}평</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-zinc-600">가격</span>
                        <span className="font-bold text-sm text-zinc-900 group-hover:text-blue-600 transition-colors">{item.price}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-200">
                      <p className="text-xs text-zinc-700 line-clamp-2">{item.features}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="market-analysis" className="py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center tracking-tight text-black sm:text-4xl">Market Intelligence</h2>
            <p className="text-center mt-4 text-zinc-600">데이터로 시장의 흐름을 정확하게 읽어냅니다.</p>

            {/* 6개 데이터 카드 - 2행 3열 */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <DataCard title="기준금리" value={marketData.interestRate.value} change={marketData.interestRate.change} type={marketData.interestRate.type as 'up' | 'down'} />
              <DataCard title="원/달러 환율" value={marketData.exchangeRate.value} change={marketData.exchangeRate.change} type={marketData.exchangeRate.type as 'up' | 'down'} />
              <DataCard title="소비자물가지수(YoY)" value={marketData.inflation.value} change={marketData.inflation.change} type={marketData.inflation.type as 'up' | 'down'} />
              <DataCard title="창원시 인구" value={marketData.population.value} change={marketData.population.change} type={marketData.population.type as 'up' | 'down'} />
              <DataCard title="수요와 공급" value={marketData.supplyDemand.value} subtitle={marketData.supplyDemand.subtitle} />
              <DataCard title="미국 기준금리" value={marketData.usFedRate.value} change={marketData.usFedRate.change} type={marketData.usFedRate.type as 'up' | 'down'} />
            </div>

            {/* 주가지수 추가 행 */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <DataCard title="KOSDAQ" value={marketData.kosdaq.value} change={marketData.kosdaq.change} type={marketData.kosdaq.type as 'up' | 'down'} />
              <DataCard title="S&P 500" value={marketData.sp500.value} change={marketData.sp500.change} type={marketData.sp500.type as 'up' | 'down'} />
              <DataCard title="KOSPI" value={marketData.kospi.value} change={marketData.kospi.change} type={marketData.kospi.type as 'up' | 'down'} />
            </div>

            {/* 행동강령 - 맨 아래 배치 */}
            <div className="mt-12">
              <MarketSignalCard
                status={marketData.marketSignal.status}
                buyer={marketData.marketSignal.buyer}
                seller={marketData.marketSignal.seller}
                updated={marketData.marketSignal.updated}
              />
            </div>
          </div>
        </section>

        <section id="news" className="py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center tracking-tight text-black sm:text-4xl">관련 소식</h2>
            <div className="mt-12 space-y-4 max-w-3xl mx-auto">
              {newsData.map((item, idx) => (
                <a key={idx} href={item.link} className="block p-5 bg-white border border-zinc-200/80 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  <h3 className="font-semibold text-zinc-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-zinc-500">{item.source} | {item.date}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="community" className="py-20 sm:py-24 bg-zinc-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center tracking-tight text-black sm:text-4xl">Knowledge Hub</h2>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {knowledgeLinks.map((item) => (
                <a key={item.title} href={item.link} target="_blank" rel="noopener noreferrer" className="block bg-white border border-zinc-200/80 rounded-xl p-6 text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                  {item.icon === 'https://ssl.pstatic.net/static/blog/image/blog_favicon.ico' ? (
                    <div className="w-16 h-16 mx-auto bg-green-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">BLOG</span>
                    </div>
                  ) : item.icon === 'https://ssl.pstatic.net/static/cafe/cafe_pc/default/cafe_favicon.png' ? (
                    <div className="w-16 h-16 mx-auto bg-green-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">CAFE</span>
                    </div>
                  ) : item.icon.startsWith('http') ? (
                    <img src={item.icon} alt={item.title} className="w-12 h-12 mx-auto object-contain" />
                  ) : (
                    <div className="text-4xl">{item.icon}</div>
                  )}
                  <h3 className="mt-4 font-bold text-lg text-zinc-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-zinc-500">{item.description}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="trust-links" className="py-20 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-2xl sm:text-3xl font-bold text-zinc-800">신뢰할 수 있는 사이트</h2>
            <div className="mt-8 flex flex-wrap justify-center items-center gap-x-8 gap-y-6 sm:gap-x-12">
              {trustLinks.map(link => (
                <a key={link.name} href={link.link} target="_blank" rel="noopener noreferrer" title={link.name} className="group">
                  <img src={link.logo} alt={link.name} className="h-16 sm:h-18 object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all group-hover:scale-110" />
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="bg-[#0F172A] text-zinc-300">
        <div className="mx-auto max-w-7xl py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="font-extrabold text-xl text-white">여여부동산중개사무소</h3>
            <p className="mt-2 text-base text-[#D4AF37]">창원 중동 유니시티 아파트 전문</p>
            <p className="mt-4 text-sm leading-6">
              대표: 박혜경 | TEL: 010-5016-3331<br />
              등록번호: 48121-2018-00008<br />
              주소: 창원시 의창구 중동으로 59, 유니시티 3단지 상가 110호
            </p>
          </div>
          <div className="mt-12 pt-8 border-t border-zinc-700 text-center text-xs">
            <p>&copy; {new Date().getFullYear()} YEOYEO REALTY. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Footer */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-zinc-200 flex z-50">
        <a href="tel:010-5016-3331" className="flex-1 flex items-center justify-center p-4 text-sm font-semibold text-zinc-800 border-r border-zinc-200 hover:bg-zinc-100 transition-colors">
          <PhoneIcon /> 전화 상담하기
        </a>
        <a href="https://lambent-sopapillas-6102aa.netlify.app/" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center p-4 text-sm font-semibold text-zinc-800 hover:bg-zinc-100 transition-colors">
          <ChatIcon /> 챗봇 상담
        </a>
      </div>

      {/* Listing Detail Modal */}
      <ListingModal listing={selectedListing} onClose={() => setSelectedListing(null)} />

      {/* Admin Page */}
      {showAdmin && <AdminPage onClose={() => setShowAdmin(false)} />}

      {/* Admin Button */}
      <button
        onClick={() => setShowAdmin(true)}
        className="fixed bottom-20 right-4 bg-zinc-800 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-zinc-700 transition-colors text-sm font-semibold z-40"
      >
        관리자
      </button>
    </div>
  );
}
