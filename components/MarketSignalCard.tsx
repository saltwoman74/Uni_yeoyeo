import React from 'react';

interface MarketSignalProps {
    status: string;
    buyer: string;
    seller: string;
    updated: string;
}

export default function MarketSignalCard({ status, buyer, seller, updated }: MarketSignalProps) {
    // 신호등 색상 결정 (5단계)
    const getSignalColor = (status: string) => {
        switch (status) {
            case '상승': return { bg: 'bg-green-600', glow: 'shadow-green-600/50' };
            case '약상승': return { bg: 'bg-green-400', glow: 'shadow-green-400/50' };
            case '보합': return { bg: 'bg-yellow-500', glow: 'shadow-yellow-500/50' };
            case '약하락': return { bg: 'bg-orange-500', glow: 'shadow-orange-500/50' };
            case '하락': return { bg: 'bg-red-600', glow: 'shadow-red-600/50' };
            default: return { bg: 'bg-zinc-500', glow: 'shadow-zinc-500/50' };
        }
    };

    const signalColor = getSignalColor(status);

    return (
        <div className="bg-gradient-to-br from-[#0F172A] to-[#1e293b] text-white rounded-2xl p-6 sm:p-8 shadow-2xl transition-all hover:shadow-3xl hover:-translate-y-1 border border-zinc-700/50">
            {/* 헤더 */}
            <div className="flex justify-between items-center mb-4 sm:mb-6">
                <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                        <span className="text-xl sm:text-2xl">🎯</span>
                        여여부동산 행동강령
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">Market Signal</p>
                </div>
                <p className="text-xs text-zinc-400">기준: {updated}</p>
            </div>

            {/* 신호등 스타일 표시 - 5단계 */}
            <div className="bg-black/30 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    {/* 신호등 5개 */}
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${status === '하락' ? 'bg-red-600 shadow-lg shadow-red-600/50' : 'bg-zinc-700'} transition-all duration-300`}></div>
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${status === '약하락' ? 'bg-orange-500 shadow-lg shadow-orange-500/50' : 'bg-zinc-700'} transition-all duration-300`}></div>
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${status === '보합' ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50' : 'bg-zinc-700'} transition-all duration-300`}></div>
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${status === '약상승' ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-zinc-700'} transition-all duration-300`}></div>
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${status === '상승' ? 'bg-green-600 shadow-lg shadow-green-600/50' : 'bg-zinc-700'} transition-all duration-300`}></div>
                </div>

                {/* 현재 상태 */}
                <div className="text-center">
                    <p className="text-sm sm:text-base text-zinc-400 mb-2">현재 시장 상태</p>
                    <div className={`inline-block px-5 sm:px-7 py-2 sm:py-2.5 rounded-full ${signalColor.bg} text-white font-bold text-xl sm:text-2xl shadow-lg ${signalColor.glow}`}>
                        {status}
                    </div>
                </div>
            </div>

            {/* 핵심 원칙 */}
            <div className="bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/30 rounded-lg p-4 mb-6">
                <p className="text-base font-bold text-[#D4AF37] mb-2 flex items-center gap-2">
                    <span>⚡</span>
                    핵심 원칙
                </p>
                <p className="text-base text-zinc-300 leading-relaxed">
                    <strong className="text-white">남들과 생각이나 행동이 달라야 한다</strong><br />
                    거래 희망자는 경쟁자입니다. 차별화된 전략이 필요합니다.
                </p>
            </div>

            {/* 포지션 가이드 */}
            <div className="space-y-4">
                {/* 매수 포지션 */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <p className="text-base font-bold text-blue-400">매수 Position</p>
                    </div>
                    <p className="text-base text-zinc-300 leading-relaxed">{buyer}</p>
                </div>

                {/* 매도 포지션 */}
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <p className="text-base font-bold text-orange-400">매도 Position</p>
                    </div>
                    <p className="text-base text-zinc-300 leading-relaxed">{seller}</p>
                </div>
            </div>

            {/* 하단 강조 메시지 */}
            <div className="mt-6 pt-4 border-t border-zinc-700">
                <p className="text-xs text-center text-zinc-400 italic">
                    "시장을 읽고, 타이밍을 잡고, 차별화된 전략으로 성공하세요"
                </p>
            </div>
        </div>
    );
}
