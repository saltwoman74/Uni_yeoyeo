import React, { useEffect, useRef } from 'react';

interface MapComponentProps {
    className?: string;
}

/**
 * 네이버 지도 컴포넌트
 * 
 * 사용 방법:
 * 1. 네이버 클라우드 플랫폼에서 API 키 발급
 *    https://www.ncloud.com/product/applicationService/maps
 * 
 * 2. index.html에 네이버 지도 스크립트 추가:
 *    <script type="text/javascript" 
 *            src="https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=YOUR_CLIENT_ID">
 *    </script>
 * 
 * 3. .env.local 파일에 클라이언트 ID 추가:
 *    VITE_NAVER_MAP_CLIENT_ID=your_client_id_here
 */

export default function MapComponent({ className = '' }: MapComponentProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);

    useEffect(() => {
        // 네이버 지도 API가 로드되었는지 확인
        if (typeof window !== 'undefined' && (window as any).naver && mapRef.current && !mapInstanceRef.current) {
            const { naver } = window as any;

            // 여여부동산 위치 (창원시 의창구 중동로 59, 유니시티 3단지)
            const position = new naver.maps.LatLng(35.2382, 128.6811);

            // 지도 생성
            const map = new naver.maps.Map(mapRef.current, {
                center: position,
                zoom: 16,
                zoomControl: true,
                zoomControlOptions: {
                    position: naver.maps.Position.TOP_RIGHT,
                },
                mapTypeControl: true,
            });

            // 마커 추가
            const marker = new naver.maps.Marker({
                position: position,
                map: map,
                title: '여여부동산중개사무소',
            });

            // 정보창 추가
            const infoWindow = new naver.maps.InfoWindow({
                content: `
          <div style="padding: 15px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">여여부동산중개사무소</h3>
            <p style="margin: 0; font-size: 13px; color: #666;">창원시 의창구 중동로 59</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; color: #666;">유니시티3단지 상가내</p>
            <a href="tel:010-5016-3331" style="display: inline-block; margin-top: 8px; color: #0F172A; font-weight: bold; text-decoration: none;">
              📞 010-5016-3331
            </a>
          </div>
        `,
            });

            // 마커 클릭 시 정보창 표시
            naver.maps.Event.addListener(marker, 'click', () => {
                if (infoWindow.getMap()) {
                    infoWindow.close();
                } else {
                    infoWindow.open(map, marker);
                }
            });

            // 기본적으로 정보창 열기
            infoWindow.open(map, marker);

            mapInstanceRef.current = map;
        }
    }, []);

    // 네이버 지도 API가 로드되지 않은 경우 안내 메시지 표시
    const isNaverMapsLoaded = typeof window !== 'undefined' && (window as any).naver;

    if (!isNaverMapsLoaded) {
        return (
            <div className={`bg-zinc-100 rounded-lg flex flex-col items-center justify-center p-8 ${className}`}>
                <div className="text-center max-w-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <h3 className="text-lg font-semibold text-zinc-700 mb-2">네이버 지도 API 설정 필요</h3>
                    <p className="text-sm text-zinc-500 mb-4">
                        네이버 지도를 표시하려면 API 키가 필요합니다.
                    </p>
                    <div className="bg-white rounded-lg p-4 text-left text-xs text-zinc-600 space-y-2">
                        <p className="font-semibold text-zinc-800">설정 방법:</p>
                        <ol className="list-decimal list-inside space-y-1 ml-2">
                            <li>
                                <a
                                    href="https://www.ncloud.com/product/applicationService/maps"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    네이버 클라우드 플랫폼
                                </a>
                                에서 API 키 발급
                            </li>
                            <li>index.html에 스크립트 태그 추가</li>
                            <li>.env.local에 클라이언트 ID 설정</li>
                        </ol>
                    </div>
                    <a
                        href="https://map.naver.com/p/search/창원시%20의창구%20중동로%2059"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-4 px-4 py-2 bg-[#03C75A] text-white rounded-lg hover:bg-[#02b350] transition-colors text-sm font-semibold"
                    >
                        네이버 지도에서 보기
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={mapRef}
            className={`rounded-lg ${className}`}
            style={{ minHeight: '300px' }}
            role="application"
            aria-label="여여부동산 위치 지도"
        />
    );
}
