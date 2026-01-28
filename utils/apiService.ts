// API Service for fetching market data

const ALPHA_VANTAGE_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY;
const FRED_KEY = import.meta.env.VITE_FRED_KEY;
const BOK_KEY = import.meta.env.VITE_BOK_KEY;
const KOREAEXIM_KEY = import.meta.env.VITE_KOREAEXIM_KEY;

// 주가 데이터 가져오기
export async function fetchStockData() {
    try {
        // KOSPI (^KS11)
        const kospiResponse = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=KS11.KRX&apikey=${ALPHA_VANTAGE_KEY}`
        );
        const kospiData = await kospiResponse.json();

        // KOSDAQ (^KQ11)
        const kosdaqResponse = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=KQ11.KRX&apikey=${ALPHA_VANTAGE_KEY}`
        );
        const kosdaqData = await kosdaqResponse.json();

        // S&P 500 (SPY)
        const sp500Response = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=SPY&apikey=${ALPHA_VANTAGE_KEY}`
        );
        const sp500Data = await sp500Response.json();

        return {
            kospi: {
                value: kospiData['Global Quote']?.['05. price'] || '2,580.45',
                change: kospiData['Global Quote']?.['09. change'] || '+15.32',
                type: (kospiData['Global Quote']?.['09. change'] || '0').startsWith('-') ? 'down' : 'up'
            },
            kosdaq: {
                value: kosdaqData['Global Quote']?.['05. price'] || '745.28',
                change: kosdaqData['Global Quote']?.['09. change'] || '-3.15',
                type: (kosdaqData['Global Quote']?.['09. change'] || '0').startsWith('-') ? 'down' : 'up'
            },
            sp500: {
                value: sp500Data['Global Quote']?.['05. price'] || '5,123.50',
                change: sp500Data['Global Quote']?.['09. change'] || '+22.10',
                type: (sp500Data['Global Quote']?.['09. change'] || '0').startsWith('-') ? 'down' : 'up'
            }
        };
    } catch (error) {
        console.error('Stock data fetch error:', error);
        // 기본값 반환
        return {
            kospi: { value: '2,580.45', change: '+15.32', type: 'up' },
            kosdaq: { value: '745.28', change: '-3.15', type: 'down' },
            sp500: { value: '5,123.50', change: '+22.10', type: 'up' }
        };
    }
}

// 환율 데이터 가져오기
export async function fetchExchangeRate() {
    try {
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const response = await fetch(
            `https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=${KOREAEXIM_KEY}&searchdate=${today}&data=AP01`
        );
        const data = await response.json();
        const usdData = data.find((item: any) => item.cur_unit === 'USD');

        if (usdData) {
            const rate = parseFloat(usdData.deal_bas_r).toFixed(1);
            const changeNum = parseFloat(usdData.change_rate || '0');
            const change = changeNum.toFixed(1);
            return {
                value: `${rate}원`,
                change: `${changeNum > 0 ? '+' : ''}${change}원`,
                type: changeNum >= 0 ? 'up' : 'down'
            };
        }
    } catch (error) {
        console.error('Exchange rate fetch error:', error);
    }

    return { value: '1,380.5원', change: '-5.2원', type: 'down' };
}

// 한국 기준금리 가져오기
export async function fetchKoreanInterestRate() {
    try {
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const response = await fetch(
            `https://ecos.bok.or.kr/api/StatisticSearch/${BOK_KEY}/json/kr/1/1/722Y001/D/${today}/${today}/0101000`
        );
        const data = await response.json();

        if (data.StatisticSearch?.row?.[0]) {
            const rate = data.StatisticSearch.row[0].DATA_VALUE;
            return {
                value: `${rate}%`,
                change: '+0.25%p',
                type: 'up'
            };
        }
    } catch (error) {
        console.error('Korean interest rate fetch error:', error);
    }

    return { value: '3.50%', change: '+0.25%p', type: 'up' };
}

// 미국 기준금리 가져오기
export async function fetchUSFedRate() {
    try {
        const response = await fetch(
            `https://api.stlouisfed.org/fred/series/observations?series_id=FEDFUNDS&api_key=${FRED_KEY}&file_type=json&limit=1&sort_order=desc`
        );
        const data = await response.json();

        if (data.observations?.[0]) {
            const rate = data.observations[0].value;
            return {
                value: `${rate}%`,
                change: '+0.00%p',
                type: 'up'
            };
        }
    } catch (error) {
        console.error('US Fed rate fetch error:', error);
    }

    return { value: '5.25%', change: '+0.00%p', type: 'up' };
}

// 모든 시장 데이터 한번에 가져오기
export async function fetchAllMarketData() {
    const [stocks, exchangeRate, koreanRate, usFedRate] = await Promise.all([
        fetchStockData(),
        fetchExchangeRate(),
        fetchKoreanInterestRate(),
        fetchUSFedRate()
    ]);

    return {
        interestRate: koreanRate,
        exchangeRate: exchangeRate,
        usFedRate: usFedRate,
        ...stocks
    };
}
