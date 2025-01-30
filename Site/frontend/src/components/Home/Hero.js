import React from 'react';

export default function Hero() {
    return (
        <div className="w-full flex flex-col items-center 
        justify-center text-center py-20 px-0">
            <div className="text-6xl font-bold mb-8 max-w-4xl leading-tight">
                The Leader in Crypto<br />Derivatives Insights
            </div>
            <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
                Institutional grade crypto derivatives dashboard.<br />
                Robust tick-level historical data.<br />
                Built by traders for traders.
            </p>
        </div>
    )
}