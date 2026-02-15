// Google Sheets Integration for Listings Data (v2 - with backup fallback)
// 서버: api/sheets.js (3중 방어)
// 클라이언트: 추가 백업 폴백

export interface Listing {
    type: string;
    complex: string;
    size: string;
    unit: string;
    price: string;
    features: string;
    category: string;
}

export async function fetchListingsFromGoogleSheet(): Promise<Listing[]> {
    try {
        // 1차: Vercel Serverless Proxy (이미 내부에서 3중 방어 적용)
        const response = await fetch('/api/sheets');

        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        const csvText = await response.text();

        // 응답이 CSV인지 검증 (HTML이면 백업으로 폴백)
        if (csvText.includes('<!DOCTYPE') || csvText.includes('<html')) {
            console.warn('API returned HTML instead of CSV, falling back to backup');
            return await fetchFromBackup();
        }

        const listings = parseCSV(csvText);

        if (listings.length > 0) {
            return listings;
        }

        // 파싱 결과가 0건이면 백업 시도
        console.warn('CSV parsing returned 0 listings, falling back to backup');
        return await fetchFromBackup();

    } catch (error) {
        console.error('Google Sheets fetch error:', error);
        // 2차: 정적 백업 JSON
        return await fetchFromBackup();
    }
}

// CSV 텍스트 → Listing[] 변환
function parseCSV(csvText: string): Listing[] {
    const lines = csvText.split('\n');
    const listings: Listing[] = [];

    // 첫 번째 줄은 헤더이므로 건너뛰기
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = parseCSVLine(line);

        if (values.length >= 11) {
            // 평타입(index 7) 우선, 없으면 공급(index 5) 사용
            // index가 1부터 시작 (첫 번째 열이 빈 열)
            const rawSize = (values[7] || values[5] || '').replace('평', '');
            const complex = values[1] || '';
            const type = values[3] || '';

            // 빈 데이터 필터링
            if (!complex || !type) continue;

            listings.push({
                complex,
                unit: values[2] || '',
                type,
                price: values[4] || '',
                size: rawSize,
                features: values[10] || '',
                category: 'unicity'
            });
        }
    }

    return listings;
}

// 정적 백업 JSON에서 로드
async function fetchFromBackup(): Promise<Listing[]> {
    try {
        const response = await fetch('/listings-backup.json');
        if (response.ok) {
            const listings: Listing[] = await response.json();
            console.info(`Loaded ${listings.length} listings from backup JSON`);
            return listings;
        }
    } catch (err) {
        console.error('Backup JSON fetch failed:', err);
    }

    // 최후: 하드코딩 기본 데이터
    return getDefaultListings();
}

// CSV 라인 파싱 (따옴표 처리)
function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
}

// 기본 매물 데이터 (하드코딩 최후수단)
function getDefaultListings(): Listing[] {
    return [
        { type: '매매', complex: '창원중동유니시티1단지', size: '30', unit: '104동 고/32층', price: '8억 5,000', features: '남향 공원뷰 풀옵션', category: 'unicity' },
        { type: '매매', complex: '창원중동유니시티3단지', size: '41', unit: '301동 중/30층', price: '10억 2,000', features: '코너 조망 우수 올수리', category: 'unicity' },
        { type: '매매', complex: '창원중동유니시티1단지', size: '30', unit: '110동 중/32층', price: '7억 8,000', features: '역세권 채광 좋음', category: 'unicity' },
        { type: '전세', complex: '창원중동유니시티4단지', size: '35A타입', unit: '405동 고/35층', price: '5억 5,000', features: '남향 시스템에어컨', category: 'unicity' },
        { type: '월세', complex: '창원중동유니시티2단지', size: '35B타입', unit: '203동 중/42층', price: '2억/150', features: '에어컨 전체 중문', category: 'unicity' },
    ];
}
