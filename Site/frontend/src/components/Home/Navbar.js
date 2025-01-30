import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between 
            px-6 py-4 bg-[#1b1b1b] rounded-[27px]">
      {/* Logo Section */}
      <div className="flex items-center pr-[1rem]">
            <Image 
                src="/bitvu_favicon.svg"
                alt="Bitvu Logo"
                width={40}
                height={40}
            />
      </div>
       <svg 
            className="hidden md:block h-6 w-px text-gray-200" 
            viewBox="0 0 1 21" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
        >
            <line x1="0.5" y1="0.5" x2="0.499999" y2="20.5" stroke="currentColor"/>
        </svg>

      {/* Navigation Links */}
      <div className="md:flex items-center space-x-6 text-[#FAFAFA]
                        pl-[1rem] pr-[1rem]">
        <a href="#" className="hover:text-[#D3D3D3] transition-colors">Data</a>
        <a href="#" className="hover:text-[#D3D3D3] transition-colors">Features</a>
        <a href="#" className="hover:text-[#D3D3D3] transition-colors">Docs</a>
        <a href="#" className="hover:text-[#D3D3D3] transition-colors">Contact</a>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-6">
        <svg 
          className="hidden md:block h-6 w-px text-gray-200" 
          viewBox="0 0 1 21" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="0.5" y1="0.5" x2="0.499999" y2="20.5" stroke="currentColor"/>
        </svg>
        
        <a href="#" className="text-[#FAFAFA] hover:text-[#D3D3D3] transition-colors">Sign in</a>
        
        <Link href="/dashboard" className="px-4 py-2 bg-[#0077b2] 
        text-[#FAFAFA] rounded-[15px] hover:bg-[#0077B2] transition-colors
        hover:text-[#D3D3D3] [text-shadow:0_1px_3px_rgba(0,0,0,0.5)] 
        hover:bg-[rgba(0,119,178,0.8)]">
            Launch App
        </Link>
      </div>
    </nav>
  );
}