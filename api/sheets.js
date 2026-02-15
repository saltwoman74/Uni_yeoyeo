// Vercel Serverless Function - Google Sheets Data Proxy (v2 - Hardened)
// 3중 방어: API v4 → CSV 내보내기 (재시도+검증) → 정적 백업 JSON
// googleapis는 API v4 사용 시에만 동적 로드됩니다.

// ─── 설정 ──────────────────────────────────────────
const SHEET_ID = '1Ajn0VVRqQfpjEimzmW7yorf7ecL9RKpXWpsCNj2QhsE';
const SHEET_RANGE = 'A1:L500'; // 충분한 범위 확보
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;
const MAX_RETRIES = 3;

// ─── 인메모리 캐시 (Vercel 콜드스타트 사이에 유지) ──────
let cachedData = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30분

export default async function handler(req, res) {
    // CORS 헤더
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 인메모리 캐시 확인
    const now = Date.now();
    if (cachedData && (now - cacheTimestamp) < CACHE_DURATION_MS) {
        res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('X-Data-Source', 'memory-cache');
        return res.status(200).send(cachedData);
    }

    let csvText = null;
    let dataSource = 'unknown';

    // ─── 전략 A: Google Sheets API v4 (최우선) ──────
    try {
        csvText = await fetchViaApiV4();
        if (csvText) {
            dataSource = 'google-sheets-api-v4';
        }
    } catch (err) {
        console.warn('API v4 unavailable (expected if not configured):', err.message);
    }

    // ─── 전략 B: CSV 내보내기 (재시도 + 검증) ──────
    if (!csvText) {
        try {
            csvText = await fetchCsvWithRetry();
            if (csvText) {
                dataSource = 'csv-export-with-retry';
            }
        } catch (err) {
            console.error('CSV export failed after retries:', err.message);
        }
    }

    // ─── 전략 C: 정적 백업 JSON → CSV 변환 ──────
    if (!csvText) {
        try {
            const backupResponse = await fetch(
                `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/listings-backup.json`
            );
            if (backupResponse.ok) {
                const listings = await backupResponse.json();
                csvText = jsonToCSV(listings);
                dataSource = 'static-backup-json';
            }
        } catch (err) {
            console.error('Static backup also failed:', err.message);
        }
    }

    // ─── 최후 수단: 하드코딩된 기본 데이터 ──────
    if (!csvText) {
        csvText = getHardcodedFallback();
        dataSource = 'hardcoded-fallback';
    }

    // 캐시 저장
    cachedData = csvText;
    cacheTimestamp = now;

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('X-Data-Source', dataSource);
    res.status(200).send(csvText);
}

// ─── Google Sheets API v4 fetcher ──────────────────
async function fetchViaApiV4() {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = process.env.GOOGLE_PRIVATE_KEY;

    if (!email || !key) {
        throw new Error('Service account credentials not configured');
    }

    // 동적 import — googleapis가 설치되지 않아도 에러 없이 폴백
    const { google } = await import('googleapis');

    const auth = new google.auth.JWT(
        email,
        null,
        key.replace(/\\n/g, '\n'), // Vercel 환경변수의 \n 처리
        ['https://www.googleapis.com/auth/spreadsheets.readonly']
    );

    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: SHEET_RANGE,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
        throw new Error('No data returned from API v4');
    }

    // 2D array → CSV 변환 (모든 행을 헤더 길이에 맞춤)
    const headerLen = rows[0].length;
    return rows.map(row => {
        // API v4는 뒤쪽 빈 셀을 생략하므로, 헤더 길이에 맞게 패딩
        const paddedRow = [...row];
        while (paddedRow.length < headerLen) {
            paddedRow.push('');
        }
        return paddedRow.map(cell => {
            const str = String(cell || '');
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        }).join(',');
    }).join('\n');
}

// ─── CSV 내보내기 (재시도 + 검증) ──────────────────
async function fetchCsvWithRetry() {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const response = await fetch(CSV_URL, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; YeoyeoBot/2.0)',
                },
                redirect: 'follow',
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const text = await response.text();

            // ★ 핵심: 응답이 실제 CSV인지 검증
            if (isValidCSV(text)) {
                return text;
            }

            console.warn(`Attempt ${attempt + 1}: Response was not valid CSV (likely HTML/captcha)`);
        } catch (err) {
            console.warn(`Attempt ${attempt + 1} failed:`, err.message);
        }

        // 지수 백오프: 1초, 2초, 4초
        if (attempt < MAX_RETRIES - 1) {
            await sleep(1000 * Math.pow(2, attempt));
        }
    }

    return null;
}

// ─── CSV 유효성 검증 ──────────────────────────────
function isValidCSV(text) {
    if (!text || text.length < 10) return false;

    // HTML 응답 감지 (로그인 페이지, CAPTCHA 등)
    const htmlIndicators = ['<!DOCTYPE', '<html', '<HTML', '<head>', '<body>', 'accounts.google.com'];
    for (const indicator of htmlIndicators) {
        if (text.includes(indicator)) return false;
    }

    // CSV 구조 확인: 최소 2줄, 쉼표 포함
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return false;
    if (!lines[0].includes(',')) return false;

    return true;
}

// ─── JSON → CSV 변환 (백업용) ──────────────────────
function jsonToCSV(listings) {
    const header = ',단지명,동,거래종류,가격,공급,타입,평타입,층,방향,매물특징,,여여체크';
    const rows = listings.map(item =>
        `,${item.complex},${item.unit},${item.type},${item.price},,,,,,${item.features},,FALSE`
    );
    return [header, ...rows].join('\n');
}

// ─── 하드코딩 기본 데이터 ──────────────────────────
function getHardcodedFallback() {
    return `,단지명,동,거래종류,가격,공급,타입,평타입,층,방향,매물특징,,여여체크
,창원중동유니시티1단지,104동,매매,"8억 5,000",30평,,30평,고/32층,남향,남향 공원뷰 풀옵션,,FALSE
,창원중동유니시티3단지,301동,매매,"10억 2,000",41평,,41평,중/30층,남향,코너 조망 우수 올수리,,FALSE
,창원중동유니시티1단지,110동,매매,"7억 8,000",30평,,30평,중/32층,남향,역세권 채광 좋음,,FALSE
,창원중동유니시티4단지,405동,전세,"5억 5,000",35평,A,35평A타입,고/35층,남향,남향 시스템에어컨,,FALSE
,창원중동유니시티2단지,203동,월세,2억/150,35평,B,35평B타입,중/42층,남서향,에어컨 전체 중문,,FALSE`;
}

// ─── 유틸리티 ──────────────────────────────────────
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
