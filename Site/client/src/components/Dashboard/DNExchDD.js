import React, { useState } from 'react';
import '../../styles/Dashboard/DNExchDD.css'

export default function DNExchDD({selectedExch, setSelectedExch}) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const exchs = ["Aggregated", "Hyperliquid", "Binance", "Deribit", "OKX", "DYDX", "Paradex", "Kraken", "Coinbase", "Bybit"];

    const filteredExchs = exchs.filter((exch) => 
        exch.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleDropdown = () => {
        setIsDropdownOpen((prev) => !prev);
        setSearchTerm("");
    };

    const handleSelectExch = (exch) => {
        setSelectedExch(exch);
        setIsDropdownOpen(false);
    };
    
    return (
        <div className="exch-selector">
            <button onClick={toggleDropdown} className="exch-display">
                {selectedExch}
                <span className="dropdown-arrow">{isDropdownOpen ? 
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                    </svg>
                    : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                }</span>
            </button>

            {isDropdownOpen && (
                <div className="exch-dropdown">
                    {}
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search exchanges..."
                        className="exch-search"/>
                    
                    <ul className="exch-list">
                        {filteredExchs.length === 0 ? (
                            <li className="no-results">No Results Found</li>
                        ) : (
                            filteredExchs.map((exch) => (
                                <li
                                    key={exch}
                                    className="exch-item"
                                    onClick={() => handleSelectExch(exch)}
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