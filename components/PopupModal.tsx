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
                        저출생 대응 및 신혼부부·출산가구 주거 안정을 위한 핵심 변경사항
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
                            <div className="text-lg font-black text-blue-600">5년</div>
                            <div className="text-[10px] text-zinc-500 leading-tight mt-0.5">공공분양 당첨<br />기간 단축</div>
                        </div>
                        <div className="text-center p-2.5 rounded-xl bg-gradient-to-b from-emerald-50 to-white border border-emerald-100/60">
                            <div className="text-lg font-black text-emerald-600">25만원</div>
                            <div className="text-[10px] text-zinc-500 leading-tight mt-0.5">월 납입 인정액<br />상향조정</div>
                        </div>
                    </div>

                    {/* Accordion Sections */}
                    <AccordionSection title="1. 민영주택 신생아 특별공급 신설 (2026년 상반기)" defaultOpen={true}>
                        <div className="space-y-3 pl-1">
                            <div>
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <Badge color="gold">독립 특공 유형 신설</Badge>
                                </div>
                                <ul className="text-xs text-zinc-600 space-y-1 list-none">
                                    <li className="flex items-start gap-1.5"><span className="text-[#7C3AED] mt-0.5">•</span>기존 공공분양 → 민영주택으로 확대</li>
                                    <li className="flex items-start gap-1.5"><span className="text-[#7C3AED] mt-0.5">•</span>신혼부부·생애최초 내 우선공급 → 별도 독립 유형 전환</li>
                                </ul>
                            </div>
                            <InfoTable rows={[
                                { label: '공급 비율', value: '신혼부부 특공 내 20% → 검토 중' },
                                { label: '공공분양', value: '일반공급 물량의 50% 우선 배정' },
                                { label: '대상', value: '2세 미만 자녀 가구' },
                            ]} />
                        </div>
                    </AccordionSection>

                    <AccordionSection title="2. 청약 자격 요건 완화">
                        <div className="space-y-3 pl-1">
                            <div>
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <Badge color="blue">임신 중 태아 인정</Badge>
                                </div>
                                <ul className="text-xs text-zinc-600 space-y-1 list-none">
                                    <li className="flex items-start gap-1.5"><span className="text-blue-400 mt-0.5">•</span>태아도 자녀 수 포함하여 청약 신청 가능</li>
                                    <li className="flex items-start gap-1.5"><span className="text-blue-400 mt-0.5">•</span>출산 전부터 청약 기회 확보</li>
                                </ul>
                            </div>
                            <InfoTable rows={[
                                { label: '맞벌이 소득', value: '월평균 소득 기준 200%까지 완화' },
                                { label: '납입 인정액', value: '월 10만원 → 25만원 상향' },
                                { label: '당첨 기간', value: '공공분양 12년 → 5년 단축' },
                                { label: '결혼 페널티', value: '배우자 과거 당첨 이력 무관' },
                            ]} />
                        </div>
                    </AccordionSection>

                    <AccordionSection title="3. 신생아 특례대출 (2026년 기준)">
                        <div className="space-y-3 pl-1">
                            <InfoTable rows={[
                                { label: '소득 기준', value: '부부 합산 2.0억 이하 (외벌이 1.3억)' },
                                { label: '자산 기준', value: '5.11억 원 이하' },
                                { label: '구입자금', value: '최대 4억원 (종전 5억)' },
                                { label: '전세자금', value: '최대 2.4억원 (종전 3억)' },
                            ]} />
                            <div className="bg-amber-50/60 rounded-lg p-3 text-xs text-zinc-600">
                                <p className="font-semibold text-[#5B21B6] mb-1">✨ 금리 우대 혜택 (연 1.6~3.3%)</p>
                                <ul className="space-y-0.5 list-none">
                                    <li>• 5년간 우대금리 제공, 고정금리 적용</li>
                                    <li>• 지방 소재 주택 0.2%p 추가 인하</li>
                                    <li>• 추가 출산 자녀 1명당 0.2%p 우대</li>
                                    <li>• 2년 초과 미성년 자녀 1명당 0.1%p 우대</li>
                                </ul>
                            </div>
                        </div>
                    </AccordionSection>

                    <AccordionSection title="4. 서울시 무주택 출산가구 주거비 지원">
                        <div className="space-y-3 pl-1">
                            <div>
                                <p className="text-[11px] font-semibold text-zinc-500 mb-1.5 tracking-wide">지원 금액 및 기간</p>
                                <InfoTable rows={[
                                    { label: '지원 금액', value: '월 최대 30만원 (총 최대 720만원)' },
                                    { label: '기본 기간', value: '2년간 지원' },
                                    { label: '추가 지원', value: '추가 출산시 1년 연장 (최대 4년)' },
                                    { label: '쌍태아+', value: '쌍태아 1년, 삼태아 이상 2년 추가' },
                                ]} />
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold text-zinc-500 mb-1.5 tracking-wide">주거 요건 완화</p>
                                <InfoTable rows={[
                                    { label: '전세보증금', value: '3억 → 5억 이하로 완화' },
                                    { label: '월세 기준', value: '130만원 → 229만원 이하로 완화' },
                                    { label: '신청 기간', value: '2026.2.2 ~ 6.30 (상반기)' },
                                ]} />
                            </div>
                        </div>
                    </AccordionSection>

                    <AccordionSection title="5. 서울시 공공주택 공급 확대">
                        <div className="space-y-3 pl-1">
                            <div className="bg-blue-50/50 rounded-lg p-3 text-xs text-zinc-600 space-y-2">
                                <p className="font-semibold text-zinc-700">💍 신혼부부 주택 공급</p>
                                <p>2026년부터 매년 4,000호 공급 (연간 신혼부부 약 10% 목표). 장기전세주택Ⅱ(미리내집) 도입으로 출산 시 최장 20년 거주 가능.</p>
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <Badge color="green">신생아가구 우선 입주</Badge>
                                </div>
                                <ul className="text-xs text-zinc-600 space-y-1 list-none">
                                    <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-0.5">•</span>공고일 기준 2년 내 출생 자녀 보유 가구</li>
                                    <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-0.5">•</span>2023.8.30 이후 출생 자녀 및 태아 포함</li>
                                    <li className="flex items-start gap-1.5"><span className="text-emerald-500 mt-0.5">•</span>6세 이하 자녀 혼인/한부모가족도 지원</li>
                                </ul>
                            </div>
                        </div>
                    </AccordionSection>

                    <AccordionSection title="6. 창원시 주거 정책 (2026년)">
                        <div className="space-y-3 pl-1">
                            <div className="text-[11px] font-semibold text-zinc-500 mb-1.5">🏙️ 공동주택 공급 및 예산</div>
                            <InfoTable rows={[
                                { label: '공동주택', value: '2026년 신규 14,412호 공급 예정' },
                                { label: '주거복지', value: '792억원 투입 (전년비 89억 증액)' },
                                { label: '이자 지원', value: '신혼·출산가구 구입자금 대출이자' },
                            ]} />
                            <div className="mt-2">
                                <p className="text-[11px] font-semibold text-zinc-500 mb-1.5">🧑‍🤝‍🧑 청년 및 저소득층 지원</p>
                                <ul className="text-xs text-zinc-600 space-y-1 list-none">
                                    <li className="flex items-start gap-1.5"><span className="text-blue-400 mt-0.5">•</span>청년 주거 기본 조례 제정 및 실태 조사</li>
                                    <li className="flex items-start gap-1.5"><span className="text-blue-400 mt-0.5">•</span>2028년까지 청년 주택 2,000호 추가 공급</li>
                                    <li className="flex items-start gap-1.5"><span className="text-blue-400 mt-0.5">•</span>주거급여(중위 48%), 임대보증금/이사비 지원</li>
                                </ul>
                            </div>
                            <div className="bg-red-50/50 rounded-lg p-3 text-xs text-zinc-600 mt-2">
                                <p className="font-semibold text-red-600 mb-1">🎁 다자녀 및 출산 지원</p>
                                <ul className="space-y-0.5 list-none">
                                    <li>• 4자녀 이상: 임대보증금 지원, 공공시설 감면</li>
                                    <li>• 출산축하금/장려물품 (창원시 주소지 필수)</li>
                                    <li>• 영구임대주택 예비입주자 모집 (2026.2.6 공고)</li>
                                </ul>
                            </div>
                        </div>
                    </AccordionSection>

                    {/* Conclusion */}
                    <div className="mt-4 p-3 rounded-xl border border-[#7C3AED]/20 bg-gradient-to-r from-purple-50/40 to-white">
                        <p className="text-xs text-zinc-700 leading-relaxed">
                            <span className="font-bold text-[#5B21B6]">2026년 주거정책 개편</span>은 출산 가구가 별도 물량을 배정받고, 임신 중부터 청약 기회를 얻으며, 소득·주거 요건이 완화되는 등 <span className="font-bold text-[#0F172A]">실질적인 주거 안정 지원</span>을 강화했습니다.
                            정부는 재정 부담과 형평성을 고려하여 제도를 급격히 확대하지 않고 실수요자 중심의 원칙을 유지하는 방향으로 정책을 운영하고 있습니다.
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
