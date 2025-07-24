import React from 'react';
  
const Footer = ({ variant = 'dark' }) => {
  const isDark = variant === 'dark';
  
  return (
    <footer className={`relative ${isDark ? 'bg-black' : 'bg-gray-50'} overflow-hidden`}>
      {/* Main Content Section */}
      <div className="relative z-10 px-4 sm:px-6 py-12 sm:py-16 md:py-20 lg:py-24 -translate-y-6 sm:-translate-y-8 md:-translate-y-10 lg:-translate-y-12">
        <div className="max-w-7xl mx-auto text-center">
          {/* Main Heading */}
          <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-medium ${isDark ? 'text-gray-300' : 'text-[#5e5e5e]'} leading-tight mb-6 sm:mb-8 max-w-2xl sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto px-2`}>
            Work seamlessly with a creative team that&apos;s built to match your pace and{' '}
            <span className={`${isDark ? 'text-white' : 'text-black'} font-medium`}>exceed</span> your expectations.
          </h2>
          
          {/* CTA Button */}
         
        </div>
      </div>
      
      {/* Large Background Text */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className={`font-bitcount ${isDark ? 'text-gray-200 opacity-10' : 'text-[#BDBCBD] opacity-60'} font-bold text-[6rem] xs:text-[8rem] sm:text-[10rem] md:text-[14rem] lg:text-[18rem] xl:text-[22rem] 2xl:text-[26rem] leading-none select-none`}>
          SAINTO.
        </div>
      </div>

      {/* Bottom Gradient Shadow */}
      <div className={`absolute bottom-0 left-0 right-0 h-32 sm:h-40 md:h-48 lg:h-56 xl:h-64 ${isDark ? 'bg-gradient-to-t from-black via-black to-transparent' : 'bg-gradient-to-t from-white via-white to-transparent'} z-5 pointer-events-none`}></div>
      
      {/* Bottom Footer Links */}
      <div className="relative z-10 px-4 sm:px-6 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm text-gray-400 space-y-3 sm:space-y-0">
          <div className="text-center sm:text-left order-2 sm:order-1">
            © {new Date().getFullYear()} SAINTO. All rights reserved.
          </div>
          <div className="flex flex-wrap justify-center sm:justify-end space-x-4 sm:space-x-6 order-1 sm:order-2">
            <a href="#" className="hover:text-gray-200 transition-colors whitespace-nowrap">
              Terms of Service
            </a>
            <a href="#" className="hover:text-gray-200 transition-colors text-white whitespace-nowrap">
              Powered by 
              <a
  href="https://bytecode-smoky.vercel.app/"
  target="_blank"
  rel="noopener noreferrer"
  className="hover:text-gray-200 transition-colors text-white whitespace-nowrap"
> {" "}
  Bytecode Studios
</a>
            </a>
           </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;