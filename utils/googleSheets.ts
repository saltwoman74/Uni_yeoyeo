// Google Sheets Integration for Listings Data

const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID;

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
        // Google Sheets를 CSV로 export하는 공개 URL
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;

        const response = await fetch(url);
        const csvText = await response.text();

        // CSV 파싱
        const lines = csvText.split('\n');
        const listings: Listing[] = [];

        // 첫 번째 줄은 헤더이므로 건너뛰기
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // CSV 파싱 (쉼표로 구분, 따옴표 처리)
            const values = parseCSVLine(line);

            if (values.length >= 11) {
                listings.push({
                    complex: values[0] || '',      // 단지명
                    unit: values[1] || '',          // 동
                    type: values[2] || '',          // 종류
                    price: values[3] || '',         // 가격
                    size: values[4] || '',          // 평형
                    features: values[9] || '',      // 매물특징
                    category: 'unicity'             // 모두 유니시티
                });
            }
        }

        return listings;
    } catch (error) {
        console.error('Google Sheets fetch error:', error);
        // 에러 시 기본 데이터 반환
        return getDefaultListings();
    }
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

// 기본 매물 데이터
function getDefaultListings(): Listing[] {
    return [
        { type: '아파트', complex: '유니시티 4단지', size: '35평', unit: '405동 고층', price: '8억 5,000', features: '남향, 공원뷰, 풀옵션', category: 'unicity' },
        { type: '아파트', complex: '유니시티 3단지', size: '41평', unit: '301동 중층', price: '10억 2,000', features: '코너, 조망 우수, 올수리', category: 'unicity' },
        { type: '아파트', complex: '유니시티 1단지', size: '30평', unit: '110동 로얄층', price: '7억 8,000', features: '역세권, 채광 좋음', category: 'unicity' },
        { type: '상가', complex: '유니시티 어반브릭스', size: '15평', unit: '1층 코너', price: '5,000/250', features: '유동인구 많음', category: 'all' },
        { type: '오피스텔', complex: '힐스테이트 에비뉴', size: '25평', unit: 'A동 15층', price: '3억 2,000', features: '풀퍼니시드, 업무 최적', category: 'all' },
    ];
}
