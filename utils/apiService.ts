// API Service for fetching market data via serverless proxy
// 모든 외부 API 호출은 /api/market 서버리스 함수를 통해 수행 (CORS 우회 + API 키 보안)

const FALLBACK_DATA = {
    interestRate: { value: '2.75%', change: '-0.25%p', type: 'up' },
    exchangeRate: { value: '1,380.5원', change: '-5.2원', type: 'down' },
    usFedRate: { value: '4.50%', change: '+0.00%p', type: 'up' },
    kospi: { value: '2,580.45', change: '+15.32', type: 'up' },
    kosdaq: { value: '745.28', change: '-3.15', type: 'down' },
    sp500: { value: '5,123.50', change: '+22.10', type: 'up' },
};

// 모든 시장 데이터 한번에 가져오기
export async function fetchAllMarketData() {
    try {
        const response = await fetch('/api/market');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();

        // 서버에서 받은 데이터를 검증하여 빈 값이 있으면 폴백 사용
        return {
            interestRate: data.interestRate || FALLBACK_DATA.interestRate,
            exchangeRate: data.exchangeRate || FALLBACK_DATA.exchangeRate,
            usFedRate: data.usFedRate || FALLBACK_DATA.usFedRate,
            kospi: data.kospi || FALLBACK_DATA.kospi,
            kosdaq: data.kosdaq || FALLBACK_DATA.kosdaq,
            sp500: data.sp500 || FALLBACK_DATA.sp500,
        };
    } catch (error) {
        console.error('Market data fetch error:', error);
        return FALLBACK_DATA;
    }
}
