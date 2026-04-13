// Vercel Serverless Function - Market Data Proxy
// Debugging version v6

let cachedData = null;
let cacheValidUntil = 0;

// Vercel 환경변수에 개행/공백이 섞여 있어도 안전하게 읽기
// 개행(\r, \n), 공백, 리터럴 '\n' 문자열까지 방어적으로 제거
const envClean = (name) => (process.env[name] || '').replace(/\\n/g, '').replace(/[\r\n\s]+$/g, '').trim();

// 다음 KST 09:00 타임스탬프(ms) 반환
function nextKst9amMs() {
    const KST_OFFSET = 9 * 60 * 60 * 1000;
    const nowKst = new Date(Date.now() + KST_OFFSET);
    const target = new Date(nowKst);
    target.setUTCHours(9, 0, 0, 0);
    if (nowKst.getUTCHours() >= 9) {
        target.setUTCDate(target.getUTCDate() + 1);
    }
    return target.getTime() - KST_OFFSET;
}

export default async function handler(req, res) {
    try {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('X-Debug-Point', 'start');

        if (req.method === 'OPTIONS') return res.status(200).end();

        const now = Date.now();
        if (cachedData && now < cacheValidUntil) {
            res.setHeader('X-Data-Source', 'memory-cache-daily');
            res.setHeader('X-Cache-Valid-Until', new Date(cacheValidUntil).toISOString());
            return res.status(200).json(cachedData);
        }

        console.log("Fetching fresh data...");
        res.setHeader('X-Debug-Point', 'fetching');

        const [exchangeResult, koreanRateResult, usFedRateResult, stockResult] = await Promise.allSettled([
            fetchExchangeRate(),
            fetchKoreanInterestRate(),
            fetchUSFedRate(),
            fetchStockData(),
        ]);

        console.log("Results collected.");
        res.setHeader('X-Debug-Point', 'results-collected');

        const FALLBACK = {
            interestRate: { value: '3.50%', change: '+0.00%p', type: 'up' },
            exchangeRate: { value: '1,507.0원', change: '+1.5원', type: 'up' },
            usFedRate: { value: '4.75%', change: '+0.00%p', type: 'up' },
            kospi: { value: '2,580.45', change: '+15.32', type: 'up' },
            kosdaq: { value: '745.28', change: '-3.15', type: 'down' },
            sp500: { value: '5,123.50', change: '+22.10', type: 'up' },
        };

        const stockData = (stockResult.status === 'fulfilled' && stockResult.value) ? stockResult.value : null;
        const data = {
            exchangeRate: exchangeResult.status === 'fulfilled' ? exchangeResult.value : FALLBACK.exchangeRate,
            interestRate: koreanRateResult.status === 'fulfilled' ? koreanRateResult.value : FALLBACK.interestRate,
            usFedRate: usFedRateResult.status === 'fulfilled' ? usFedRateResult.value : FALLBACK.usFedRate,
            kospi: stockData?.kospi || FALLBACK.kospi,
            kosdaq: stockData?.kosdaq || FALLBACK.kosdaq,
            sp500: stockData?.sp500 || FALLBACK.sp500,
        };

        cachedData = data;
        cacheValidUntil = nextKst9amMs();

        res.setHeader('X-Data-Source', 'api-fresh-v6');
        return res.status(200).json(data);

    } catch (e) {
        console.error("GLOBAL CRASH:", e);
        return res.status(200).json({ error: e.message, debug: "Global Crash Catch" });
    }
}

// Yahoo Finance 공개 차트 API (키 불필요)
async function fetchYahooQuote(symbol) {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; yeoyeo-market/1.0)',
            'Accept': 'application/json',
        },
    });
    if (!response.ok) throw new Error(`Yahoo HTTP ${response.status}`);
    const data = await response.json();
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta) throw new Error('Yahoo no meta');
    const price = Number(meta.regularMarketPrice);
    const prev = Number(meta.chartPreviousClose ?? meta.previousClose);
    if (!isFinite(price)) throw new Error('Yahoo invalid price');
    const diff = isFinite(prev) ? price - prev : 0;
    return { price, prev, diff };
}

async function fetchExchangeRate() {
    // Yahoo Finance USD/KRW (키 불필요, 24시간 최신값)
    const { price, diff } = await fetchYahooQuote('KRW=X');
    const rate = price.toLocaleString('ko-KR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    const change = `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}원`;
    return { value: `${rate}원`, change, type: diff >= 0 ? 'up' : 'down' };
}

async function fetchKoreanInterestRate() {
    const key = envClean('BOK_KEY');
    if (!key) throw new Error('No BOK_KEY');
    const endDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10).replace(/-/g, '');
    const url = `https://ecos.bok.or.kr/api/StatisticSearch/${key}/json/kr/1/5/722Y001/D/${startDate}/${endDate}/0101000`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`BOK HTTP ${response.status}`);
    const data = await response.json();
    if (data.StatisticSearch?.row?.length > 0) {
        const rate = data.StatisticSearch.row.pop().DATA_VALUE;
        return { value: `${rate}%`, change: '최신', type: 'up' };
    }
    throw new Error('BOK no data');
}

async function fetchUSFedRate() {
    const key = envClean('FRED_KEY');
    if (!key) throw new Error('No FRED_KEY');
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=FEDFUNDS&api_key=${key}&file_type=json&limit=1&sort_order=desc`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`FRED HTTP ${response.status}`);
    const data = await response.json();
    if (data.observations?.length > 0) {
        return { value: `${data.observations[0].value}%`, change: '최신', type: 'up' };
    }
    throw new Error('FRED fail');
}

async function fetchStockData() {
    // Yahoo Finance 공개 API - KOSPI/KOSDAQ/S&P500 (키 불필요)
    const symbols = { kospi: '^KS11', kosdaq: '^KQ11', sp500: '^GSPC' };
    const results = {};
    await Promise.allSettled(
        Object.entries(symbols).map(async ([name, symbol]) => {
            try {
                const { price, diff } = await fetchYahooQuote(symbol);
                const value = price.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                const change = `${diff >= 0 ? '+' : ''}${diff.toFixed(2)}`;
                results[name] = { value, change, type: diff >= 0 ? 'up' : 'down' };
            } catch (e) { console.warn(`Yahoo ${name} fail:`, e.message); }
        })
    );
    return Object.keys(results).length > 0 ? results : null;
}

function getRecentDates(days) {
    const dates = [];
    for (let i = 0; i < days; i++) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        dates.push(d.toISOString().slice(0, 10).replace(/-/g, ''));
    }
    return dates;
}
