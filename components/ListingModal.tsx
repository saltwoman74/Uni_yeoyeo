import React from 'react';
import type { Listing } from '../utils/searchUtils';

interface ListingModalProps {
    listing: Listing | null;
    onClose: () => void;
}

export default function ListingModal({ listing, onClose }: ListingModalProps) {
    if (!listing) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="modal-overlay"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div className="modal-content w-full max-w-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
                    <h2 id="modal-title" className="text-xl font-bold text-zinc-900">
                        {listing.complex}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-zinc-600 transition-colors p-2"
                        aria-label="닫기"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Image Placeholder */}
                    <div className="w-full h-64 bg-zinc-100 rounded-lg mb-6 flex items-center justify-center">
                        <div className="text-center text-zinc-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm">매물 이미지</p>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
                            <span className="text-sm text-zinc-500">매물 종류</span>
                            <span className="font-semibold text-zinc-900">{listing.type}</span>
                        </div>

                        <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
                            <span className="text-sm text-zinc-500">평형</span>
                            <span className="font-semibold text-zinc-900">{listing.size}</span>
                        </div>

                        <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
                            <span className="text-sm text-zinc-500">동/호수</span>
                            <span className="font-semibold text-zinc-900">{listing.unit}</span>
                        </div>

                        <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
                            <span className="text-sm text-zinc-500">가격</span>
                            <span className="text-2xl font-bold text-[#0F172A]">{listing.price}</span>
                        </div>

                        <div className="pb-4 border-b border-zinc-200">
                            <span className="text-sm text-zinc-500 block mb-2">특징</span>
                            <p className="text-zinc-900">{listing.features}</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <a
                            href="tel:010-5016-3331"
                            className="flex items-center justify-center px-6 py-3 bg-[#0F172A] text-white rounded-lg hover:bg-black transition-colors font-semibold"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.518.76a11.034 11.034 0 006.364 6.364l.76-1.518a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                            전화 문의
                        </a>
                        <a
                            href="https://chatbot-legacy-eogpxxvbf-qnehdtksznls-projects.vercel.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center px-6 py-3 bg-white border-2 border-[#0F172A] text-[#0F172A] rounded-lg hover:bg-zinc-50 transition-colors font-semibold"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                            </svg>
                            챗봇 상담
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
