"use client"
// components/InvestButton.jsx
// components/InvestButton.jsx
import Link from "next/link";
import { HandCoins } from "lucide-react";
import { useState, useEffect } from "react";

const InvestButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    // Start the animation sequence after component mounts
    const timer1 = setTimeout(() => {
      setIsVisible(true);
    }, 500); // 0.5 second delay

    const timer2 = setTimeout(() => {
      setShowText(true);
    }, 500); // Additional 0.3 seconds for text to appear

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="fixed bottom-4 shadow-4xl right-4 md:bottom-2 md:right-4 z-50">
      {/* Main Button Container - White rounded container with ghost-like animation */}
       {/* <div 
        className={`md:bg-white rounded-full shadow-4xl md:p-1.5 md:px-2 flex items-center transition-all duration-1000 ease-out ${
          isVisible 
            ? 'opacity-100' 
            : 'opacity-0'
        }`}
        style={{
          filter: isVisible ? 'drop-shadow(0 10px 25px rgba(0, 0, 0, 0.15))' : 'none'
        }}
      >
        {/* <div 
          className={`w-10 h-10 hidden md:flex cursor-pointer bg-black rounded-full flex items-center justify-center mr-2 transition-all duration-700 ease-out delay-100 shadow-lg ${
            isVisible 
              ? 'opacity-100' 
              : 'opacity-0'
          }`}
        >
          <HandCoins className="text-white" />
        </div> */}

        {/* <Link href="/invest">
          <button
            className={`bg-black flex flex-row items-center gap-2 text-white cursor-pointer px-4 py-2 md:px-6 md:py-3 rounded-full font-semibold text-sm tracking-wide hover:bg-neutral-800/90 shadow-lg transition-all duration-700 ease-out delay-100 ${
              isVisible 
                ? 'opacity-100' 
                : 'opacity-0'
            }`}
          >
            <HandCoins className="inline md:hidden" />
            <span className="md:hidden">
              INVEST
            </span>
            <span className="hidden md:inline">
              INVEST IN US
            </span>
          </button>
        </Link> */}

        {/* Right Dropdown Arrow */}
      {/* </div>  */}

 
      {/* Powered by footer with delayed animation */}
      <div 
        className={`mt-1 text-center hidden md:block transition-all duration-800 ease-out delay-500 ${
          showText 
            ? 'opacity-100' 
            : 'opacity-0'
        }`}
        style={{
          textShadow: showText ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'
        }}
      >
        <span className="text-[11px] right-1 leading-tight text-neutral-400">
          Developed by {" "}
          <span className="underline">
            <Link href="https://bytecode-smoky.vercel.app/" target="_blank">bytecode</Link>
             </span>🅁
        </span>
      </div>
    </div>
  );
};

export default InvestButton;