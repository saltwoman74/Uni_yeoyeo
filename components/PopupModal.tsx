import React, { useState, useEffect, useCallback } from 'react';

interface PopupModalProps {
    onClose: () => void;
}

// --- Accordion Section Component ---
function AccordionSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-zinc-100 last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-3 px-1 text-left group"
                style={{ minHeight: 'auto', minWidth: 'auto' }}
            >
                <span className="text-sm font-bold text-zinc-800 group-hover:text-[#B8941F] transition-colors">{title}</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[2000px] opacity-100 pb-4' : 'max-h-0 opacity-0'}`}
            >
                {children}
            </div>
        </div>
    );
}

// --- Info Table ---
function InfoTable({ rows }: { rows: { label: string; value: string }[] }) {
    return (
        <div className="rounded-lg overflow-hidden border border-zinc-100 text-xs">
            {rows.map((row, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'bg-zinc-50/70' : 'bg-white'}`}>
                    <div className="w-[110px] shrink-0 px-3 py-2 font-semibold text-zinc-600 border-r border-zinc-100">{row.label}</div>
                    <div className="flex-1 px-3 py-2 text-zinc-700">{row.value}</div>
                </div>
            ))}
        </div>
    );
}

// --- Badge ---
function Badge({ children, color = 'gold' }: { children: React.ReactNode; color?: 'gold' | 'blue' | 'green' }) {
    const colors = {
        gold: 'bg-purple-50 text-[#6D28D9] border-purple-200/50',
        blue: 'bg-blue-50 text-blue-700 border-blue-100',
        green: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    };
    return (
        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${colors[color]}`}>
            {children}
        </span>
    );
}

export default function PopupModal({ onClose }: PopupModalProps) {
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = useCallback((skipToday: boolean) => {
        if (skipToday) {
            const today = new Date().toISOString().split('T')[0];
            localStorage.setItem('yeoyeo_popup_dismissed', today);
        }
        setIsClosing(true);
        setTimeout(() => onClose(), 280);
    }, [onClose]);

    // ESC key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose(false);
        };
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [handleClose]);

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-start p-4 pl-6 popup-overlay ${isClosing ? 'popup-closing' : 'popup-entering'}`}
            onClick={(e) => { if (e.target === e.currentTarget) handleClose(false); }}
        >
            {/* Popup Card */}
            <div
                className={`popup-card relative w-full max-w-[520px] max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden ${isClosing ? 'popup-card-closing' : 'popup-card-entering'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative shrink-0 px-5 pt-5 pb-4" style={{ background: 'linear-gradient(135deg, #FCE4EC 0%, #E8EAF6 50%, #DBEAFE 100%)' }}>
                    {/* Close Button */}
                    <button
                        onClick={() => handleClose(false)}
                        className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-zinc-800/5 hover:bg-zinc-800/10 transition-colors"
                        style={{ minHeight: 'auto', minWidth: 'auto' }}
                        aria-label="닫기"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Title Area */}
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-5 rounded-full" style={{ background: '#7C3AED' }} />
                        <span className="text-[10px] font-bold tracking-widest text-[#6D28D9] uppercase">여여부동산 · 정책 브리핑</span>
                    </div>
                    <h2 className="text-base font-black text-[#0F172A] leading-snug">
                        2026년 신생아 주택청약 및 <span className="text-[#6D28D9]">특례대출 개편</span> 안내
                    </h2>
                    <p className="mt-1.5 text-[11px] text-zinc-500 leading-relaxed">
                        저출생 대응 및 신혼부부·출산가구 주거 안정을 위한 핵심 변경 사항
                    </p>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto px-5 py-3 popup-scrollbar">
                    {/* Key Highlights */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="text-center p-2.5 rounded-xl bg-gradient-to-b from-amber-50 to-white border border-amber-100/60">
                            <div className="text-lg font-black text-[#6D28D9]">35%</div>
                            <div className="text-[10px] text-zinc-500 leading-tight mt-0.5">신생아 우선공급<br />비율 확대</div>
                        </div>
                        <div className="text-center p-2.5 rounded-xl bg-gradient-to-b from-blue-50 to-white border border-blue-100/60">
                            <div className="text-lg font-black text-blue-600">2억</div>
                            <div className="text-[10px] text-zinc-500 leading-tight mt-0.5">구입자금 소득<br />기준 상향</div>
                        </div>
                        <div className="text-center p-2.5 rounded-xl bg-gradient-to-b from-emerald-50 to-white border border-emerald-100/60">
                            <div className="text-lg font-black text-emerald-600">1.6%</div>
                            <div className="text-[10px] text-zinc-500 leading-tight mt-0.5">특례금리<br />최저 수준</div>
                        </div>
                    </div>

                    {/* Accordion Sections */}
                    <AccordionSection title="1. 출산특례 신설 및 확대" defaultOpen={true}>
                        <div className="space-y-3 pl-1">
                            <div>
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <Badge color="gold">자격 요건</Badge>
                                </div>
                                <ul className="text-xs text-zinc-600 space-y-1 list-none">
                                    <li className="flex items-start gap-1.5"><span className="text-[#7C3AED] mt-0.5">•</span>2024.6.19 이후 출생 자녀 보유 가구</li>
                                    <li className="flex items-start gap-1.5"><span className="text-[#7C3AED] mt-0.5">•</span>청약신청자 또는 배우자 중 1인 충족</li>
                                    <li className="flex items-start gap-1.5"><span className="text-[#7C3AED] mt-0.5">•</span>입양 자녀도 동일 인정</li>
                                </ul>
                            </div>
                            <InfoTable rows={[
                                { label: '기존 제한 폐지', value: '생애 당첨 제한 해제' },
                                { label: '배우자 제약', value: '혼인 전 당첨이력 배제 불적용' },
                                { label: '추가 기회', value: '신규 출산 시 1회 추가 기회 부여' },
                                { label: '처분 의무', value: '기존주택 처분 전제 조건' },
                            ]} />
                        </div>
                    </AccordionSection>

                    <AccordionSection title="2. 혼인특례 및 결혼 메리트">
                        <div className="space-y-3 pl-1">
                            <div>
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <Badge color="blue">배우자 당첨이력 배제 확대</Badge>
                                </div>
                                <ul className="text-xs text-zinc-600 space-y-1 list-none">
                                    <li className="flex items-start gap-1.5"><span className="text-blue-400 mt-0.5">•</span><b>기존:</b> 배우자의 혼인 전 당첨이력만 배제</li>
                                    <li className="flex items-start gap-1.5"><span className="text-blue-400 mt-0.5">•</span><b>변경:</b> 본인의 혼인 전 당첨이력도 배제 (신혼부부 특공)</li>
                                </ul>
                            </div>
                            <div className="bg-blue-50/50 rounded-lg p-3 text-xs text-zinc-600 space-y-2">
                                <p className="font-semibold text-zinc-700">💡 사례: 결혼 전 특공 당첨 경험자</p>
                                <p>혼인 전 생애최초 특공 당첨 → 혼인 후 신혼부부 특공 신청 가능 → 출산 시 신생아 특공까지 가능</p>
                            </div>
                        </div>
                    </AccordionSection>

                    <AccordionSection title="3. 신생아 우선공급 확대">
                        <div className="space-y-3 pl-1">
                            <InfoTable rows={[
                                { label: '기존(2025년)', value: '우선공급 비율 20%' },
                                { label: '2026년', value: '우선공급 비율 35%로 확대' },
                                { label: '청약저축', value: '월 납입액 10만원 → 25만원 상향' },
                                { label: '소득 기준', value: '폐지 또는 대폭 완화 추진 중' },
                            ]} />
                        </div>
                    </AccordionSection>

                    <AccordionSection title="4. 신생아 특례대출 개편">
                        <div className="space-y-3 pl-1">
                            <div>
                                <p className="text-[11px] font-semibold text-zinc-500 mb-1.5 tracking-wide">구입자금 대출</p>
                                <InfoTable rows={[
                                    { label: '최대 한도', value: '5억원' },
                                    { label: 'LTV', value: '70% (생애최초 80%)' },
                                    { label: '특례금리', value: '연 1.6% ~ 2.7% (5년)' },
                                    { label: '소득 기준', value: '1.3억 → 2억 (한시 3년)' },
                                ]} />
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold text-zinc-500 mb-1.5 tracking-wide">전세자금 대출</p>
                                <InfoTable rows={[
                                    { label: '최대 한도', value: '3억원 (보증금 80% 이내)' },
                                    { label: '기간', value: '4년 (최장 12년 연장)' },
                                    { label: '특례금리', value: '연 1.1% ~ 2.3% (4년)' },
                                    { label: '소득 기준', value: '1.0억 → 1.5억 (예정)' },
                                ]} />
                            </div>
                            <div className="bg-amber-50/60 rounded-lg p-3 text-xs text-zinc-600">
                                <p className="font-semibold text-[#5B21B6] mb-1">✨ 추가 출산 우대</p>
                                <p>추가 출산 시 금리 0.3%p 인하 + 특례기간 5년 연장. 최대 15년 장기 저금리 고정 가능!</p>
                            </div>
                        </div>
                    </AccordionSection>

                    <AccordionSection title="5. 실무 활용 전략">
                        <div className="space-y-3 pl-1">
                            <div>
                                <p className="text-[11px] font-semibold text-zinc-500 mb-1.5">🎯 출산 예정 가구</p>
                                <ul className="text-xs text-zinc-600 space-y-1 list-none">
                                    <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-0.5">•</span>출산 후 2년 이내가 특례대출 골든타임</li>
                                    <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-0.5">•</span>출생증명서 발급 후 즉시 청약 신청</li>
                                    <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-0.5">•</span>대출과 청약 전략적 병행 권장</li>
                                </ul>
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold text-zinc-500 mb-1.5">💍 신혼부부</p>
                                <ul className="text-xs text-zinc-600 space-y-1 list-none">
                                    <li className="flex items-start gap-1.5"><span className="text-blue-400 mt-0.5">•</span>혼인 전 당첨이력 있어도 신혼부부 특공 가능</li>
                                    <li className="flex items-start gap-1.5"><span className="text-blue-400 mt-0.5">•</span>결혼 → 신생아 특공 → 단계별 기회 활용</li>
                                    <li className="flex items-start gap-1.5"><span className="text-blue-400 mt-0.5">•</span>맞벌이 부부 소득 합산 기준 유리</li>
                                </ul>
                            </div>
                        </div>
                    </AccordionSection>

                    <AccordionSection title="6. 신청 절차 및 유의사항">
                        <div className="space-y-3 pl-1">
                            <div>
                                <p className="text-[11px] font-semibold text-zinc-500 mb-1.5">📋 신청 순서</p>
                                <ol className="text-xs text-zinc-600 space-y-1 list-decimal list-inside">
                                    <li>자격 요건 확인 (출생일, 소득, 무주택)</li>
                                    <li>청약통장 가입 및 점수 확보</li>
                                    <li>입주자모집공고 확인</li>
                                    <li>특별공급 우선 신청</li>
                                    <li>일반공급 신청 (필요시)</li>
                                </ol>
                            </div>
                            <div className="bg-red-50/50 rounded-lg p-3 text-xs text-zinc-600">
                                <p className="font-semibold text-red-600 mb-1">⚠️ 주의사항</p>
                                <ul className="space-y-0.5 list-none">
                                    <li>• 같은 차수 특별/일반공급 동시 신청 불가</li>
                                    <li>• 기존주택 입주 전 처분 미이행 시 당첨 취소</li>
                                    <li>• 전년도 소득 기준 적용 (배우자 합산)</li>
                                </ul>
                            </div>
                            <div className="text-[11px] text-zinc-400">
                                <p>📌 참고: <a href="https://www.myhome.go.kr" target="_blank" rel="noopener" className="underline hover:text-[#7C3AED]">마이홈 포털</a> | 각 시도 청약 부서</p>
                            </div>
                        </div>
                    </AccordionSection>

                    {/* Conclusion */}
                    <div className="mt-4 p-3 rounded-xl border border-[#7C3AED]/20 bg-gradient-to-r from-purple-50/40 to-white">
                        <p className="text-xs text-zinc-700 leading-relaxed">
                            <span className="font-bold text-[#5B21B6]">2024.6.19 이후 출생 자녀</span>를 둔 가구는 역사적으로 가장 유리한 주택 취득 기회를 맞이하고 있습니다.
                            자세한 상담은 <span className="font-bold text-[#0F172A]">여여부동산</span>으로 연락해 주세요.
                        </p>
                    </div>

                    {/* PDF Offer */}
                    <div className="mt-3 p-3 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center gap-3">
                        <div className="w-9 h-9 shrink-0 rounded-lg bg-red-50 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-[11px] text-zinc-600 leading-relaxed">
                            이 내용이 필요하시면 <span className="font-bold text-[#0F172A]">PDF파일</span>로 보내드려요.<br />
                            <span className="text-zinc-400">여여부동산에 문의해 주세요 📞</span>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="shrink-0 px-5 py-3 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                    <button
                        onClick={() => handleClose(true)}
                        className="text-[11px] text-zinc-400 hover:text-zinc-600 transition-colors flex items-center gap-1"
                        style={{ minHeight: 'auto', minWidth: 'auto' }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        오늘 하루 보지 않기
                    </button>
                    <button
                        onClick={() => handleClose(false)}
                        className="px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', minHeight: 'auto', minWidth: 'auto' }}
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
}
