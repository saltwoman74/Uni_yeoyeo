import React, { useState, useEffect, useRef } from 'react';
import { generateSearchSuggestions, getSearchHistory, saveSearchHistory } from '../utils/searchUtils';
import type { Listing } from '../utils/searchUtils';

interface SearchBarProps {
    onSearch: (query: string) => void;
    listings: Listing[];
    placeholder?: string;
    className?: string;
}

export default function SearchBar({ onSearch, listings, placeholder = '매물종류(매매,전세,월세).단지.평형(타입)', className = '' }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [history, setHistory] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setHistory(getSearchHistory());
    }, []);

    useEffect(() => {
        if (query.trim()) {
            const newSuggestions = generateSearchSuggestions(listings, query, 5);
            setSuggestions(newSuggestions);
        } else {
            setSuggestions([]);
        }
    }, [query, listings]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (searchQuery: string) => {
        if (searchQuery.trim()) {
            saveSearchHistory(searchQuery);
            setHistory(getSearchHistory());
            onSearch(searchQuery);
            setShowSuggestions(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch(query);
    };

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
        handleSearch(suggestion);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        onSearch(e.target.value);
    };

    const displayItems = query.trim() ? suggestions : history.slice(0, 5);

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <form onSubmit={handleSubmit}>
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={handleInputChange}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder={placeholder}
                        className="w-full px-5 py-3 text-base border border-zinc-300 rounded-full focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-shadow pr-12"
                        aria-label="매물 검색"
                        aria-autocomplete="list"
                        aria-controls="search-suggestions"
                        aria-expanded={showSuggestions && displayItems.length > 0}
                    />
                    <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#0F172A] text-white rounded-full p-2 hover:bg-black transition-colors"
                        aria-label="검색"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </form>

            <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
                단지명, 동, 가격, 방향, 특징(예: 공원뷰, 남향, 에어컨) 등으로 검색하면<br />
                아래 매물 카드에 결과가 표시됩니다.
            </p>

            {showSuggestions && displayItems.length > 0 && (
                <div
                    id="search-suggestions"
                    className="search-suggestions"
                    role="listbox"
                >
                    {!query.trim() && history.length > 0 && (
                        <div className="px-4 py-2 text-xs text-zinc-400 border-b border-zinc-200">
                            최근 검색어
                        </div>
                    )}
                    {displayItems.map((item, index) => (
                        <div
                            key={index}
                            className="search-suggestion-item"
                            onClick={() => handleSuggestionClick(item)}
                            role="option"
                            aria-selected={false}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleSuggestionClick(item);
                                }
                            }}
                        >
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {query.trim() ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    )}
                                </svg>
                                <span className="text-sm text-zinc-700">{item}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
