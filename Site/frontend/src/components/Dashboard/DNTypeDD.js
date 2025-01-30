'use client';
import { useState } from 'react';
import { useDashboard } from '@/context/DashboardContext';

export default function DNTypeDD() {
  const { selectedType, setSelectedType } = useDashboard();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const types = ["Spot", "Perps", "Futures", "Options"];

  return (
    <div className="relative ml-auto">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="inline-flex items-center gap-2 bg-transparent text-white rounded px-3 py-1.5 font-semibold hover:bg-gray-600 transition-colors w-[5.7rem]"
      >
        {selectedType}
        <span className="w-4 h-4">
          {isDropdownOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          )}
        </span>
      </button>

      {isDropdownOpen && (
        <div className="absolute top-full left-0 w-48 bg-gray-800 border border-gray-600 rounded mt-1 shadow-lg z-50">
          <ul className="max-h-40 overflow-y-auto py-1">
            {types.map((type) => (
              <li
                key={type}
                onClick={() => {
                  setSelectedType(type);
                  setIsDropdownOpen(false);
                }}
                className="px-3 py-1.5 text-white hover:bg-gray-700 cursor-pointer transition-colors"
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