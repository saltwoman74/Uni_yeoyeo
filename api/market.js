// Vercel Serverless Function - Market Data Proxy
// 한국수출입은행, 한국은행, FRED, Alpha Vantage API의 CORS 우회 및 API 키 보안
// 개별 API 실패 시 해당 항목만 폴백값 사용 (Promise.allSettled 패턴)

// ─── 인메모리 캐시 ──────────────────────────────────
let cachedData = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30분

// ─── 폴백 기본값 ──────────────────────────────────
const FALLBACK = {
    interestRate: { value: '2.75%', change: '-0.25%p', type: 'down' },
    exchangeRate: { value: '1,380.5원', change: '-5.2원', type: 'down' },
    usFedRate: { value: '4.50%', change: '+0.00%p', type: 'up' },
    kospi: { value: '2,580.45', change: '+15.32', type: 'up' },
    kosdaq: { value: '745.28', change: '-3.15', type: 'down' },
    sp500: { value: '5,123.50', change: '+22.10', type: 'up' },
};

export default async function handler(req, res) {
    // CORS 헤더
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 인메모리 캐시 확인
    const now = Date.now();
    if (cachedData && (now - cacheTimestamp) < CACHE_DURATION_MS) {
        res.setHeader('X-Data-Source', 'memory-cache');
        return res.status(200).json(cachedData);
    }

    // 모든 API를 병렬 호출, 개별 실패 허용
    const [exchangeResult, koreanRateResult, usFedRateResult, stockResult] = await Promise.allSettled([
        fetchExchangeRate(),
        fetchKoreanInterestRate(),
        fetchUSFedRate(),
        fetchStockData(),
    ]);

    const data = {
        exchangeRate: exchangeResult.status === 'fulfilled' ? exchangeResult.value : FALLBACK.exchangeRate,
        interestRate: koreanRateResult.status === 'fulfilled' ? koreanRateResult.value : FALLBACK.interestRate,
        usFedRate: usFedRateResult.status === 'fulfilled' ? usFedRateResult.value : FALLBACK.usFedRate,
        ...(stockResult.status === 'fulfilled' ? stockResult.value : {
            kospi: FALLBACK.kospi,
            kosdaq: FALLBACK.kosdaq,
            sp500: FALLBACK.sp500,
        }),
    };

    // 소스 추적
    const sources = {
        exchange: exchangeResult.status,
        koreanRate: koreanRateResult.status,
        usFedRate: usFedRateResult.status,
        stock: stockResult.status,
    };

    // 캐시 저장
    cachedData = data;
    cacheTimestamp = now;

    res.setHeader('X-Data-Source', JSON.stringify(sources));
    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    return res.status(200).json(data);
}

// ─── 환율 (한국수출입은행) ──────────────────────────
async function fetchExchangeRate() {
    const key = process.env.KOREAEXIM_KEY;
    if (!key) throw new Error('KOREAEXIM_KEY not configured');

    // 오늘 날짜 (영업일이 아니면 데이터가 없을 수 있으므로 최근 7일 시도)
    const dates = getRecentDates(7);

    for (const dateStr of dates) {
        const url = `https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=${key}&searchdate=${dateStr}&data=AP01`;
        const response = await fetch(url);
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
            const usdData = data.find(item => item.cur_unit === 'USD');
            if (usdData) {
                const rate = parseFloat(usdData.deal_bas_r.replace(/,/g, '')).toLocaleString('ko-KR', {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                });
                const changeNum = parseFloat(usdData.bkpr || '0') - parseFloat(usdData.deal_bas_r.replace(/,/g, '') || '0');
                const change = Math.abs(changeNum).toFixed(1);
                return {
                    value: `${rate}원`,
                    change: `${changeNum >= 0 ? '+' : '-'}${change}원`,
                    type: changeNum >= 0 ? 'up' : 'down',
                };
            }
        }
    }

    throw new Error('No exchange rate data found');
}

// ─── 한국 기준금리 (한국은행 ECOS) ──────────────────
async function fetchKoreanInterestRate() {
    const key = process.env.BOK_KEY;
    if (!key) throw new Error('BOK_KEY not configured');

    // 최근 30일 범위로 조회 (기준금리는 자주 변경되지 않으므로)
    const endDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10).replace(/-/g, '');

    const url = `https://ecos.bok.or.kr/api/StatisticSearch/${key}/json/kr/1/5/722Y001/D/${startDate}/${endDate}/0101000`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.StatisticSearch?.row?.length > 0) {
        const rows = data.StatisticSearch.row;
        const latest = rows[rows.length - 1];
        const rate = latest.DATA_VALUE;
        return {
            value: `${rate}%`,
            change: '+0.00%p',
            type: 'up',
        };
    }

    throw new Error('No BOK data found');
}

// ─── 미국 기준금리 (FRED) ──────────────────────────
async function fetchUSFedRate() {
    const key = process.env.FRED_KEY;
    if (!key) throw new Error('FRED_KEY not configured');

    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=FEDFUNDS&api_key=${key}&file_type=json&limit=2&sort_order=desc`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.observations?.length > 0) {
        const latest = data.observations[0];
        const rate = parseFloat(latest.value).toFixed(2);
        let change = '+0.00';
        let type = 'up';

        if (data.observations.length > 1) {
            const prev = parseFloat(data.observations[1].value);
            const diff = parseFloat(latest.value) - prev;
            change = `${diff >= 0 ? '+' : ''}${diff.toFixed(2)}`;
            type = diff >= 0 ? 'up' : 'down';
        }

        return {
            value: `${rate}%`,
            change: `${change}%p`,
            type,
        };
    }

    throw new Error('No FRED data found');
}

// ─── 주가 데이터 (Alpha Vantage) ──────────────────
async function fetchStockData() {
    const key = process.env.ALPHA_VANTAGE_KEY;
    if (!key) throw new Error('ALPHA_VANTAGE_KEY not configured');

    const symbols = [
        { key: 'kospi', symbol: 'KS11.KRX' },
        { key: 'kosdaq', symbol: 'KQ11.KRX' },
        { key: 'sp500', symbol: 'SPY' },
    ];

    const results = {};

    // 순차 호출 (Alpha Vantage는 rate limit이 5/min으로 엄격)
    for (const { key: name, symbol } of symbols) {
        try {
            const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${key}`;
            const response = await fetch(url);
            const data = await response.json();
            const quote = data['Global Quote'];

            if (quote && quote['05. price']) {
                const price = parseFloat(quote['05. price']).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                });
                const changeVal = parseFloat(quote['09. change'] || '0');
                results[name] = {
                    value: price,
                    change: `${changeVal >= 0 ? '+' : ''}${changeVal.toFixed(2)}`,
                    type: changeVal >= 0 ? 'up' : 'down',
                };
            } else {
                results[name] = FALLBACK[name];
            }
        } catch {
            results[name] = FALLBACK[name];
        }
    }

    return results;
}

// ─── 유틸리티 ──────────────────────────────────────
function getRecentDates(days) {
    const dates = [];
    for (let i = 0; i < days; i++) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        dates.push(d.toISOString().slice(0, 10).replace(/-/g, ''));
    }
    return dates;
}
