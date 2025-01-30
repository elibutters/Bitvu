'use client';
import { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';

export default function DNExchDD() {
    const { selectedExchange, setSelectedExchange } = useDashboard();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    
    const exchs = ["Aggregated", "Hyperliquid", "Binance", "Deribit", "OKX", "DYDX", "Paradex", "Kraken", "Coinbase", "Bybit"];
    const filteredExchs = exchs.filter(exch => 
        exch.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleDropdown = () => {
        setIsDropdownOpen(prev => !prev);
        setSearchTerm("");
    };

    const handleSelectExch = (exch) => {
        setSelectedExchange(exch);
        setIsDropdownOpen(false);
    };

    return (
        <div className="relative ml-auto">
            <button
                onClick={toggleDropdown}
                className="flex items-center justify-between bg-transparent text-white rounded px-2 py-1 w-[7.4rem] font-ibm-plex-sans font-semibold text-[0.95rem] hover:bg-gray-600 transition-colors"
            >
                {selectedExchange}
                <span className="pl-2 pt-0.5 w-4">
                    {isDropdownOpen ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                    )}
                </span>
            </button>

            {isDropdownOpen && (
                <div className="absolute top-full left-0 bg-gray-800 border border-gray-700 rounded mt-1 w-[200px] z-50">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search exchanges..."
                        className="w-full p-1 mb-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-gray-500 text-sm"
                    />

                    <ul className="max-h-36 overflow-y-auto">
                        {filteredExchs.length === 0 ? (
                            <li className="text-gray-400 text-center p-1 text-sm">No Results Found</li>
                        ) : (
                            filteredExchs.map((exch) => (
                                <li
                                    key={exch}
                                    onClick={() => handleSelectExch(exch)}
                                    className="p-1 text-sm text-white cursor-pointer hover:bg-gray-600 transition-colors"
                                >
                                    {exch}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}