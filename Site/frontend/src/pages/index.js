import React from 'react';
import Navbar from '@/components/Home/Navbar';
import Hero from '@/components/Home/Hero';
import LaunchButton from '@/components/Home/LaunchButton';
//import '../styles/Home/Home.css'

function Home() {
    return (
      <div className="flex flex-col items-center mt-[15px] min-h-[541px]">
        <Navbar />
        <Hero />
        <LaunchButton />
      </div>
    );
}
export default Home;