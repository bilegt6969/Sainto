import React from 'react';
  
const Footer = ({ variant = 'dark' }) => {
  const isDark = variant === 'dark';
  
  return (
    <footer className={`relative ${isDark ? 'bg-black' : 'bg-gray-50'} overflow-hidden`}>
      {/* Main Content Section */}
      <div className="relative z-10 px-4 sm:px-6 pt-12 sm:pt-16 md:pt-20 lg:pt-24 -translate-y-4 sm:-translate-y-8 md:-translate-y-10 lg:-translate-y-5">
        <div className="max-w-7xl mx-auto text-center">
          {/* Main Heading */}
          <h2 className={`text-3xl sm:text-4xl md:text-4xl lg:text-6xl xl:text-7xl 2xl:text-7xl font-medium ${isDark ? 'text-neutral-300' : 'text-[#5e5e5e]'} leading-tight -mb-0 sm:mb-8 max-w-2xl sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto px-2`}>
          The Art of Pioneering  <br/>  built by Gen Z for ALL as your only <br/> 

          <span className={`${isDark ? 'text-white' : 'text-black'} font-medium text-5xl sm:text-3xl md:text-6xl lg:text-8xl xl:text-7xl 2xl:text-8xl`}>DRIP PLUG.</span>



           </h2>
          
          {/* CTA Button */}
         
        </div>
      </div>
      
      {/* Large Background Text */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className={`font-bitcount ${isDark ? 'text-neutral-300 opacity-20' : 'text-[#BDBCBD] opacity-60'} font-bold text-[5rem] xs:text-[8rem] sm:text-[10rem] md:text-[12rem] lg:text-[16rem] xl:text-[20rem] 2xl:text-[26rem] leading-none select-none flex items-start`}>
          {""}SAINTO<span className='text-[3rem] xs:text-[5rem] sm:text-[6rem] md:text-[7rem] lg:text-[10rem] xl:text-[10rem] 2xl:text-[10rem]'>®</span>
        </div>
      </div>

      {/* Bottom Gradient Shadow */}
      <div className={`absolute bottom-0 left-0 right-0 h-32 sm:h-40 md:h-48 lg:h-56 xl:h-64 ${isDark ? 'bg-gradient-to-t from-black via-black to-transparent' : 'bg-gradient-to-t from-white via-white to-transparent'} z-5 pointer-events-none`}></div>
      
      {/* Bottom Footer Links */}
      <div className="relative z-10 px-4 sm:px-6 py-4 sm:py-6">
  <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm text-neutral-400 space-y-3 sm:space-y-0">
    
    {/* Left Section */}
    <div className="text-center sm:text-left items-center order-2 sm:order-1">
      ®   {new Date().getFullYear()} SAINTO. All rights reserved.
    </div>

    {/* Middle Section (Navigation Links) */}
    <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4 order-3 sm:order-2">
      <a href="#" className="hover:text-gray-200 transition-colors whitespace-nowrap">About</a>
      <a href="#" className="hover:text-gray-200 transition-colors whitespace-nowrap">Contact Us</a>
      <a href="#" className="hover:text-gray-200 transition-colors whitespace-nowrap">FAQ</a>
      <a href="#" className="hover:text-gray-200 transition-colors whitespace-nowrap">Support</a>
      <a href="#" className="hover:text-gray-200 transition-colors whitespace-nowrap">For You</a>
    </div>

    {/* Right Section */}
    <div className="flex flex-wrap justify-center sm:justify-end space-x-4 sm:space-x-6 order-1 sm:order-3">
      <a href="#" className="hover:text-gray-200 transition-colors whitespace-nowrap">Terms of Service</a>
      <span className="whitespace-nowrap">
        Powered by{' '}
        <a
          href="https://bytecode-smoky.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-neutral-300 font-medium underline-animation transition-all text-white duration-300 ease-in-out"
        >
          Bytecode Studio
        </a>
      </span>
    </div>

  </div>
</div>

      <style>{`
               .underline-animation {
                position: relative; /* This is crucial for positioning the pseudo-element */
                display: inline-block; /* Or any other display that allows the pseudo-element to be contained */
                text-decoration: none; /* Hide the default underline */
              }
              
              .underline-animation::after {
                content: ''; /* Required for pseudo-elements to display */
                position: absolute;
                bottom: 0;
                left: 0;
                width: 0; /* Start with zero width */
                height: 1px; /* Adjust the thickness of the line */
                background-color: currentColor; /* Matches the text color */
                transition: width 0.3s ease-out; /* Smooth transition */
              }
              
              .underline-animation:hover::after {
                width: 100%; /* Expand the width to 100% on hover */
              }
            `}</style>
    </footer>
  );
};

export default Footer;