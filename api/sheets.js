// Vercel Serverless Function - Google Sheets CSV Proxy
// 브라우저에서 직접 Google Sheets를 호출하면 CORS 에러가 발생하므로
// 서버 측에서 대신 fetch하여 클라이언트에 전달합니다.

export default async function handler(req, res) {
    // CORS 헤더 (모든 origin 허용 - 챗봇 등 외부 도메인에서도 접근 가능)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // OPTIONS preflight 요청 처리
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const SHEET_ID = '1Ajn0VVRqQfpjEimzmW7yorf7ecL9RKpXWpsCNj2QhsE';
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; YeoyeoBot/1.0)',
            },
            redirect: 'follow',
        });

        if (!response.ok) {
            throw new Error(`Google Sheets responded with status: ${response.status}`);
        }

        const csvText = await response.text();

        // 캐싱 (5분)
        res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.status(200).send(csvText);
    } catch (error) {
        console.error('Google Sheets proxy error:', error);
        res.status(500).json({
            error: 'Google Sheets 데이터를 가져오지 못했습니다.',
            message: error.message,
        });
    }
}
