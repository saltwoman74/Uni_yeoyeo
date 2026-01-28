# 여여부동산 웹사이트 - 데이터 관리 가이드

## 📋 목차

1. [관리자 패널 접근](#관리자-패널-접근)
2. [매물 데이터 관리](#매물-데이터-관리)
3. [시장 데이터 업데이트](#시장-데이터-업데이트)
4. [Market Signal 관리](#market-signal-관리)
5. [뉴스 데이터 관리](#뉴스-데이터-관리)
6. [자동화 옵션](#자동화-옵션)

---

## 관리자 패널 접근

### 접근 방법

1. 웹사이트 URL 끝에 `#admin` 추가 (예: `http://localhost:3000#admin`)
2. 또는 브라우저 콘솔에서 `window.location.hash = 'admin'` 실행
3. 관리자 로그인 화면이 표시됩니다

### 초기 비밀번호

```
비밀번호: 1234
```

> ⚠️ **보안 주의**: 프로덕션 환경에서는 반드시 비밀번호를 변경하세요.

---

## 매물 데이터 관리

### 현재 위치

파일: `HomePage.tsx`  
변수: `listingsData` (라인 10-41)

### 데이터 구조

```typescript
{
  type: string;        // "아파트" | "빌라" | "상가" | "오피스텔"
  complex: string;     // 단지명
  size: string;        // 평형 (예: "34평")
  unit: string;        // 동/호수 (예: "A동 15층")
  price: string;       // 가격 (예: "5억 2,000" 또는 "3,000/150")
  features: string;    // 특징 (예: "남향, 역세권")
  category: string;    // "unicity" | "all"
}
```

### 업데이트 방법

#### 방법 1: 직접 수정 (간단)

1. `HomePage.tsx` 파일 열기
2. `listingsData` 배열 찾기
3. 기존 항목 수정 또는 새 항목 추가
4. 저장 후 `npm run dev`로 확인

**예시:**
```typescript
const listingsData: Listing[] = [
  { 
    type: '아파트', 
    complex: '유니시티 3단지', 
    size: '34평', 
    unit: 'A동 15층', 
    price: '5억 2,000', 
    features: '남향, 역세권', 
    category: 'unicity' 
  },
  // 새 매물 추가
  { 
    type: '아파트', 
    complex: '유니시티 2단지', 
    size: '25평', 
    unit: 'B동 10층', 
    price: '4억 5,000', 
    features: '동향, 리모델링', 
    category: 'unicity' 
  },
];
```

#### 방법 2: JSON 파일 사용 (권장)

1. `public/data/listings.json` 파일 생성
2. JSON 형식으로 매물 데이터 작성
3. `HomePage.tsx`에서 fetch로 불러오기

**listings.json:**
```json
[
  {
    "type": "아파트",
    "complex": "유니시티 3단지",
    "size": "34평",
    "unit": "A동 15층",
    "price": "5억 2,000",
    "features": "남향, 역세권",
    "category": "unicity"
  }
]
```

**HomePage.tsx 수정:**
```typescript
const [listings, setListings] = useState<Listing[]>([]);

useEffect(() => {
  fetch('/data/listings.json')
    .then(res => res.json())
    .then(data => setListings(data));
}, []);
```

#### 방법 3: API 연동 (고급)

백엔드 API를 구축하여 실시간 CRUD 작업 지원

---

## 시장 데이터 업데이트

### 현재 위치

파일: `HomePage.tsx`  
변수: `marketData` (라인 85-102)

### 업데이트 항목

| 항목 | 데이터 소스 | 업데이트 주기 |
|------|------------|--------------|
| **기준금리** | 한국은행 | 월 1회 (금융통화위원회 회의 후) |
| **환율** | 서울외국환중개 | 일 1회 |
| **물가지수** | 통계청 | 월 1회 |
| **인구** | 행정안전부 | 분기 1회 |
| **수요와 공급** | 부동산114, KB부동산 | 주 1회 |

### 수정 예시

```typescript
const marketData = {
  interestRate: { 
    value: '3.50%',      // ← 여기 수정
    change: '0.25%p ↑',  // ← 여기 수정
    type: 'up'           // 'up' | 'down'
  },
  // ... 다른 항목들
};
```

---

## Market Signal 관리

### ⭐ 가장 중요한 섹션

**여여부동산 행동강령**은 사이트의 핵심 차별화 요소입니다.

### 현재 위치

파일: `HomePage.tsx`  
경로: `marketData.marketSignal`

### 데이터 구조

```typescript
marketSignal: {
  status: string;   // "매수우위" | "관망" | "매도우위"
  buyer: string;    // 매수자 행동 가이드
  seller: string;   // 매도자 행동 가이드
  updated: string;  // 업데이트 날짜
}
```

### 업데이트 가이드

#### 1. 시장 상태 판단

- **매수우위**: 공급 > 수요, 가격 하락 추세
- **관망**: 균형 상태, 관망 필요
- **매도우위**: 수요 > 공급, 가격 상승 추세

#### 2. 포지션 메시지 작성

**핵심 원칙**: "남들과 생각이나 행동이 달라야 한다"

**매수 Position 예시:**
```
"지금은 관망입니다. 급매물이 나올 때까지 기다리세요. 
경쟁자들이 서두를 때 우리는 여유를 가집니다."
```

**매도 Position 예시:**
```
"지금은 관망입니다. 시장이 회복될 때까지 보유하세요. 
급하게 팔면 경쟁자에게 기회를 줍니다."
```

#### 3. 업데이트 예시

```typescript
marketSignal: {
  status: '매수우위',  // ← 시장 상태 변경
  buyer: '지금이 매수 적기입니다. 협상력을 최대한 활용하세요.',  // ← 메시지 수정
  seller: '시장이 회복될 때까지 보유를 권장합니다.',  // ← 메시지 수정
  updated: '2026.01.28'  // ← 날짜 업데이트
}
```

### UI 반영

- **신호등 색상**: status에 따라 자동 변경 (녹색/노란색/빨간색)
- **메시지**: buyer/seller 텍스트가 카드에 표시
- **강조**: "남들과 달라야 한다" 메시지 항상 표시

---

## 뉴스 데이터 관리

### 현재 위치

파일: `HomePage.tsx`  
변수: `newsData` (라인 50-54)

### 데이터 구조

```typescript
{
  title: string;       // 뉴스 제목
  source: string;      // 출처
  date: string;        // 날짜
  link: string;        // URL
}
```

### 수동 업데이트

```typescript
const newsData = [
  { 
    title: '창원 유니시티 아파트 거래량 증가', 
    source: '경남신문', 
    date: '2026.01.28', 
    link: 'https://example.com/news/1' 
  },
  // 새 뉴스 추가
];
```

---

## 자동화 옵션

### 1. 매물 데이터 자동화

#### Google Sheets 연동

```typescript
// Google Sheets API 사용
const SHEET_ID = 'your-sheet-id';
const API_KEY = 'your-api-key';

fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1?key=${API_KEY}`)
  .then(res => res.json())
  .then(data => {
    const listings = data.values.map(row => ({
      type: row[0],
      complex: row[1],
      size: row[2],
      unit: row[3],
      price: row[4],
      features: row[5],
      category: row[6]
    }));
    setListings(listings);
  });
```

### 2. 시장 데이터 자동화

#### 한국은행 API

```typescript
// 기준금리 자동 업데이트
const BOK_API_KEY = 'your-bok-api-key';

fetch(`https://ecos.bok.or.kr/api/StatisticSearch/${BOK_API_KEY}/json/kr/1/1/722Y001/M/202601/202601/0101000`)
  .then(res => res.json())
  .then(data => {
    const rate = data.StatisticSearch.row[0].DATA_VALUE;
    // marketData 업데이트
  });
```

### 3. 뉴스 자동화

#### RSS 피드

```typescript
// 네이버 뉴스 RSS
const RSS_URL = 'https://news.naver.com/main/rss/section.naver?sid=101';

fetch(RSS_URL)
  .then(res => res.text())
  .then(xml => {
    // XML 파싱 후 newsData 업데이트
  });
```

---

## 배포 및 업데이트 프로세스

### 1. 로컬 테스트

```bash
# 데이터 수정 후
npm run dev

# 브라우저에서 확인
# http://localhost:3000
```

### 2. 프로덕션 빌드

```bash
npm run build
npm run preview
```

### 3. 배포

```bash
# Vercel 배포 (예시)
vercel --prod

# 또는 Git push로 자동 배포
git add .
git commit -m "데이터 업데이트"
git push origin main
```

---

## 주의사항

### ⚠️ 필수 체크리스트

- [ ] JSON 형식이 올바른지 확인
- [ ] 특수문자 이스케이프 처리 (`"`, `'`, `\`)
- [ ] 이미지 URL은 HTTPS 사용
- [ ] 로컬에서 먼저 테스트
- [ ] 프로덕션 배포 전 백업 생성

### 🔒 보안

- 관리자 비밀번호 정기 변경
- API 키는 환경 변수로 관리 (`.env.local`)
- Git에 민감한 정보 커밋 금지

---

## 문의

데이터 관리 관련 문의사항은 개발자에게 연락하세요.

**여여부동산중개사무소**  
TEL: 010-5016-3331
