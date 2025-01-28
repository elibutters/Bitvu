import React, { useState } from 'react';
import '../../styles/Dashboard/DNTypeDD.css'

export default function DNTypeDD({selectedType, setSelectedType}) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const types = ["Spot", "Perps", "Futures", "Options"];

    const toggleDropdown = () => {
        setIsDropdownOpen((prev) => !prev);
    };

    const handleSelectType = (type) => {
        setSelectedType(type);
        setIsDropdownOpen(false);
    };
    
    return (
        <div className="type-selector">
            <button onClick={toggleDropdown} className="type-display">
                {selectedType}
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
                <div className="type-dropdown">
                    {}
                    <ul className="type-list">
                        {types.map((type) => (
                            <li
                                key={type}
                                className="type-item"
                                onClick={() => handleSelectType(type)}
                            >
                                {type}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}