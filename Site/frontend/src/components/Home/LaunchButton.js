import React from 'react';
import Link from 'next/link';

export default function LaunchButton() {
    return (
        <div className="flex gap-8">
            <Link href="/dashboard">
                <div className="flex items-center justify-center 
                gap-[10px] mt-[30px] py-4 px-[30px] 
                rounded-[30px] w-[150px] bg-[#0077b2] text-[#f8f8f8] 
                [text-shadow:0_1px_3px_rgba(0,0,0,0.5)] shadow-[0_0_8px_rgba(0,119,178,0.8)] 
                hover:bg-[rgba(0,119,178,0.8)] hover:text-[#cccccc] transition-colors 
                cursor-pointer">
                    Launch App
                </div>
            </Link>
            <div className="flex items-center justify-center 
            gap-[10px] mt-[30px] py-4 px-[30px] relative 
            rounded-[30px] w-[150px] border-2 border-[rgba(0,119,178,1.0)] 
            bg-transparent text-[#f8f8f8] [text-shadow:0_1px_3px_rgba(0,0,0,0.5)] 
            shadow-[0_0_8px_rgba(0,119,178,1.0)] 
            hover:border-[rgba(0,119,178,0.8)] hover:text-[#cccccc] 
            transition-colors cursor-pointer">
                Get Data
            </div>
        </div>
    )
}