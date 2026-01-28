# 네이버 지도 API 설정 가이드

여여부동산 웹사이트에서 네이버 지도를 표시하려면 다음 단계를 따라주세요.

## 1단계: 네이버 클라우드 플랫폼 가입 및 프로젝트 생성

1. [네이버 클라우드 플랫폼](https://www.ncloud.com/)에 접속하여 회원가입 또는 로그인
2. 콘솔로 이동하여 새 프로젝트 생성

## 2단계: Maps API 신청

1. 콘솔에서 **Services > Application Service > Maps** 선택
2. **이용 신청하기** 클릭
3. 약관 동의 후 신청 완료

## 3단계: 인증 정보 생성

1. **Application 등록** 메뉴로 이동
2. **Application 등록** 버튼 클릭
3. 다음 정보 입력:
   - Application 이름: `여여부동산 웹사이트`
   - Service 선택: **Maps**
   - Web Dynamic Map 선택
   - 웹 서비스 URL: 배포할 도메인 입력 (예: `https://yourdomain.com`)
     - 로컬 테스트용: `http://localhost:3000`도 추가
4. 등록 완료 후 **Client ID** 확인 및 복사

## 4단계: 프로젝트에 API 키 적용

### index.html 수정

`index.html` 파일의 `<head>` 섹션에 다음 스크립트 태그를 추가하세요:

```html
<head>
  <!-- 기존 내용 ... -->
  
  <!-- 네이버 지도 API -->
  <script type="text/javascript" 
          src="https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=YOUR_CLIENT_ID_HERE">
  </script>
</head>
```

**중요**: `YOUR_CLIENT_ID_HERE`를 3단계에서 복사한 실제 Client ID로 교체하세요.

### 환경 변수 설정 (선택사항)

`.env.local` 파일을 생성하고 다음 내용을 추가할 수 있습니다:

```
VITE_NAVER_MAP_CLIENT_ID=your_client_id_here
```

## 5단계: 확인

1. 개발 서버 실행:
   ```bash
   npm run dev
   ```

2. 브라우저에서 `http://localhost:3000` 접속

3. 페이지 하단 푸터 섹션에서 지도가 정상적으로 표시되는지 확인

## 문제 해결

### 지도가 표시되지 않는 경우

1. **브라우저 콘솔 확인**: F12를 눌러 개발자 도구를 열고 에러 메시지 확인
2. **Client ID 확인**: 올바른 Client ID를 입력했는지 확인
3. **도메인 설정 확인**: 네이버 클라우드 콘솔에서 등록한 도메인과 현재 접속 URL이 일치하는지 확인
4. **API 사용 제한**: 무료 플랜의 경우 일일 호출 제한이 있을 수 있습니다

### 로컬 개발 시 주의사항

- 네이버 클라우드 콘솔의 Application 설정에서 `http://localhost:3000`을 웹 서비스 URL로 추가해야 합니다
- 포트 번호가 다른 경우 해당 포트도 등록해야 합니다

## 참고 자료

- [네이버 Maps API 문서](https://navermaps.github.io/maps.js.ncp/)
- [네이버 클라우드 플랫폼 가이드](https://guide.ncloud-docs.com/docs/maps-overview)
- [API 요금 정보](https://www.ncloud.com/product/applicationService/maps)

## 지원

문의사항이 있으시면 네이버 클라우드 플랫폼 고객센터(1544-3889)로 연락하세요.
