import React, { useState } from 'react';
import '../../styles/Dashboard/DNCoinDD.css'

export default function DNCoinDD({selectedCoin, setSelectedCoin}) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const coins = ["BTC", "ETH", "LTC", "XRP", "DOGE", "DOT", "SOL", "ADA", "AAVE"];

    const filteredCoins = coins.filter((coin) => 
        coin.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleDropdown = () => {
        setIsDropdownOpen((prev) => !prev);
        setSearchTerm("");
    };

    const handleSelectCoin = (coin) => {
        setSelectedCoin(coin);
        setIsDropdownOpen(false);
    };
    
    return (
        <div className="coin-selector">
            <button onClick={toggleDropdown} className="coin-display">
                {selectedCoin}
                <span className="dropdown-arrow">{isDropdownOpen ? 
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                    </svg>
                    : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>}</span>
            </button>

            {isDropdownOpen && (
                <div className="coin-dropdown">
                    {}
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search coins..."
                        className="coin-search"/>
                    
                    <ul className="coin-list">
                        {filteredCoins.length === 0 ? (
                            <li className="no-results">No Results Found</li>
                        ) : (
                            filteredCoins.map((coin) => (
                                <li
                                    key={coin}
                                    className="coin-item"
                                    onClick={() => handleSelectCoin(coin)}
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