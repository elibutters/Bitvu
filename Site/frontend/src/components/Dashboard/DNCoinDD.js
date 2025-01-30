'use client';
import { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';

export default function DNCoinDD() {
    const { selectedCoin, setSelectedCoin } = useDashboard();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    
    const coins = ["BTC", "ETH", "LTC", "XRP", "DOGE", "DOT", "SOL", "ADA", "AAVE"];
    const filteredCoins = coins.filter(coin => 
        coin.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleDropdown = () => {
        setIsDropdownOpen(prev => !prev);
        setSearchTerm("");
    };

    const handleSelectCoin = (coin) => {
        setSelectedCoin(coin);
        setIsDropdownOpen(false);
    };

    return (
        <div className="relative ml-auto">
            <button
                onClick={toggleDropdown}
                className="flex items-center gap-1 bg-transparent text-white rounded px-2 py-1 w-[4.9rem] font-ibm-plex-sans font-semibold text-[0.95rem] hover:bg-gray-600 transition-colors"
            >
                {selectedCoin}
                <span className="pt-0.2 w-4">
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
                <div className="absolute top-full left-0 bg-gray-800 border border-gray-700 rounded mt-1 w-48 z-50">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search coins..."
                        className="w-full p-1 mb-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-gray-500"
                    />

                    <ul className="max-h-36 overflow-y-auto">
                        {filteredCoins.length === 0 ? (
                            <li className="text-gray-400 text-center p-1">No Results Found</li>
                        ) : (
                            filteredCoins.map((coin) => (
                                <li
                                    key={coin}
                                    onClick={() => handleSelectCoin(coin)}
                                    className="p-1 text-white cursor-pointer hover:bg-gray-600 transition-colors"
                                >
                                    {coin}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}