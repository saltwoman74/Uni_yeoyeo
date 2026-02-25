/**
 * 검색 및 필터링 유틸리티 함수들
 */

// 한글 초성 추출 함수
const CHOSUNG_LIST = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

/**
 * 한글 문자열에서 초성을 추출합니다
 */
export function getChosung(str: string): string {
    let result = '';
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i) - 44032;
        if (code > -1 && code < 11172) {
            result += CHOSUNG_LIST[Math.floor(code / 588)];
        } else {
            result += str.charAt(i);
        }
    }
    return result;
}

/**
 * 검색어가 대상 문자열에 포함되는지 확인 (초성 검색 지원)
 */
export function matchesSearch(target: string, query: string): boolean {
    if (!query) return true;

    const normalizedTarget = target.toLowerCase();
    const normalizedQuery = query.toLowerCase();

    // 일반 검색
    if (normalizedTarget.includes(normalizedQuery)) {
        return true;
    }

    // 초성 검색
    const targetChosung = getChosung(target);
    const queryChosung = getChosung(query);
    if (targetChosung.includes(queryChosung)) {
        return true;
    }

    return false;
}

/**
 * 매물 데이터 타입
 */
export interface Listing {
    type: string;
    complex: string;
    size: string;
    unit: string;
    price: string;
    features: string;
    category: string;
}

/**
 * 매물 검색 함수
 */
export function searchListings(listings: Listing[], query: string): Listing[] {
    if (!query.trim()) return listings;

    let isMinQuery = false;
    let isMaxQuery = false;
    let processedQuery = query.trim();

    // 1. 특수 토큰 먼저 분리 및 마킹
    const minKeywords = ['최저가', '가장싼', '가장저렴한'];
    minKeywords.forEach(kw => {
        if (processedQuery.includes(kw)) {
            isMinQuery = true;
            processedQuery = processedQuery.replace(new RegExp(kw, 'g'), ' ');
        }
    });

    const maxKeywords = ['최고가', '가장비싼'];
    maxKeywords.forEach(kw => {
        if (processedQuery.includes(kw)) {
            isMaxQuery = true;
            processedQuery = processedQuery.replace(new RegExp(kw, 'g'), ' ');
        }
    });

    // 2. 스마트 토큰화: 띄어쓰기가 있으면 그대로 분리, 없으면 한글↔숫자 경계에서 분리
    const trimmed = processedQuery.trim();
    let searchTerms: string[] = [];
    if (trimmed) {
        if (trimmed.includes(' ')) {
            searchTerms = trimmed.split(/\s+/).filter(t => t.length > 0);
        } else {
            // "매매1단지41평" → ["매매", "1단지", "41평"]
            const spaced = trimmed.replace(/([가-힣])(\d)/g, '$1 $2')
                .replace(/(\d)([가-힣])/g, '$1 $2')
                .replace(/([a-zA-Z])([가-힣])/g, '$1 $2')
                .replace(/([가-힣])([a-zA-Z])/g, '$1 $2');
            searchTerms = spaced.split(/\s+/).filter(t => t.length > 0);
        }
    }

    const filtered = listings.filter(listing => {
        const allFields = [listing.complex, listing.type, listing.size, listing.features, listing.unit, listing.price];

        // 검색어가 없으면 (최저가만 검색한 경우 등) 통과
        if (searchTerms.length === 0) return true;

        // 모든 검색어가 필드 중 하나에라도 매칭되어야 함
        return searchTerms.every(term => {
            // 원래 검색어로 매칭 시도
            if (allFields.some(field => matchesSearch(field, term))) return true;
            // 평/동/층/억 등 접미사 제거 후 재시도 (예: "41평" → "41")
            const stripped = term.replace(/[평동층억]$/g, '');
            if (stripped && stripped !== term) {
                return allFields.some(field => matchesSearch(field, stripped));
            }
            return false;
        });
    });

    if (filtered.length <= 1) return filtered;

    // 최저가/최고가 처리
    if (isMinQuery) {
        let minPrice = Infinity;
        filtered.forEach(l => {
            const p = parsePriceToNumber(l.price);
            if (p < minPrice) minPrice = p;
        });
        return filtered.filter(l => parsePriceToNumber(l.price) === minPrice);
    }

    if (isMaxQuery) {
        let maxPrice = -1;
        filtered.forEach(l => {
            const p = parsePriceToNumber(l.price);
            if (p > maxPrice) maxPrice = p;
        });
        return filtered.filter(l => parsePriceToNumber(l.price) === maxPrice);
    }

    return filtered;
}

/**
 * 가격 문자열을 숫자로 변환 (억 단위)
 */
export function parsePriceToNumber(priceStr: string): number {
    // "8억 5,000" -> 8.5
    // "5,000/250" -> 5000 (월세는 보증금만)

    const parts = priceStr.split('/');
    const mainPrice = parts[0];

    if (mainPrice.includes('억')) {
        const [eok, man] = mainPrice.split('억').map(s => s.trim().replace(/,/g, ''));
        const eokNum = parseFloat(eok) || 0;
        const manNum = parseFloat(man) || 0;
        return eokNum + (manNum / 10000);
    }

    return parseFloat(mainPrice.replace(/,/g, '')) / 10000;
}

/**
 * 평형 문자열을 숫자로 변환
 */
export function parseSizeToNumber(sizeStr: string): number {
    // "35평" -> 35
    return parseFloat(sizeStr.replace(/[^0-9.]/g, '')) || 0;
}

/**
 * 가격 범위로 필터링
 */
export function filterByPriceRange(
    listings: Listing[],
    minPrice?: number,
    maxPrice?: number
): Listing[] {
    return listings.filter(listing => {
        const price = parsePriceToNumber(listing.price);
        if (minPrice !== undefined && price < minPrice) return false;
        if (maxPrice !== undefined && price > maxPrice) return false;
        return true;
    });
}

/**
 * 평형 범위로 필터링
 */
export function filterBySizeRange(
    listings: Listing[],
    minSize?: number,
    maxSize?: number
): Listing[] {
    return listings.filter(listing => {
        const size = parseSizeToNumber(listing.size);
        if (minSize !== undefined && size < minSize) return false;
        if (maxSize !== undefined && size > maxSize) return false;
        return true;
    });
}

/**
 * 매물 타입으로 필터링
 */
export function filterByType(listings: Listing[], type: string): Listing[] {
    if (!type || type === '전체') return listings;
    return listings.filter(listing => listing.type === type);
}

/**
 * 정렬 옵션
 */
export type SortOption = 'price-asc' | 'price-desc' | 'size-asc' | 'size-desc' | 'recent';

/**
 * 매물 정렬
 */
export function sortListings(listings: Listing[], sortBy: SortOption): Listing[] {
    const sorted = [...listings];

    switch (sortBy) {
        case 'price-asc':
            return sorted.sort((a, b) => parsePriceToNumber(a.price) - parsePriceToNumber(b.price));
        case 'price-desc':
            return sorted.sort((a, b) => parsePriceToNumber(b.price) - parsePriceToNumber(a.price));
        case 'size-asc':
            return sorted.sort((a, b) => parseSizeToNumber(a.size) - parseSizeToNumber(b.size));
        case 'size-desc':
            return sorted.sort((a, b) => parseSizeToNumber(b.size) - parseSizeToNumber(a.size));
        case 'recent':
        default:
            return sorted;
    }
}

/**
 * 검색 제안 생성
 */
export function generateSearchSuggestions(
    listings: Listing[],
    query: string,
    limit: number = 5
): string[] {
    if (!query.trim()) return [];

    const suggestions = new Set<string>();

    listings.forEach(listing => {
        if (matchesSearch(listing.complex, query)) {
            suggestions.add(listing.complex);
        }
        if (matchesSearch(listing.type, query)) {
            suggestions.add(listing.type);
        }
    });

    return Array.from(suggestions).slice(0, limit);
}

/**
 * 가격 포맷팅
 */
export function formatPrice(price: string): string {
    return price;
}

/**
 * 검색 히스토리 관리
 */
const SEARCH_HISTORY_KEY = 'yeoyeo_search_history';
const MAX_HISTORY_ITEMS = 10;

export function saveSearchHistory(query: string): void {
    if (!query.trim()) return;

    try {
        const history = getSearchHistory();
        const updated = [query, ...history.filter(item => item !== query)].slice(0, MAX_HISTORY_ITEMS);
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error('Failed to save search history:', error);
    }
}

export function getSearchHistory(): string[] {
    try {
        const history = localStorage.getItem(SEARCH_HISTORY_KEY);
        return history ? JSON.parse(history) : [];
    } catch (error) {
        console.error('Failed to get search history:', error);
        return [];
    }
}

export function clearSearchHistory(): void {
    try {
        localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
        console.error('Failed to clear search history:', error);
    }
}
