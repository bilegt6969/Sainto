// components/LayoutClientWrapper.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Heading/Navbar'; // Adjust path if needed
import Footer from '@/components/Footer';     // Adjust path if needed
import Faq from '@/components/faq';

interface LayoutClientWrapperProps {
  children: React.ReactNode;
}

export default function LayoutClientWrapper({ children }: LayoutClientWrapperProps) {
  const pathname = usePathname();
  const [isNotFound, setIsNotFound] = useState(false);
  
  useEffect(() => {
    // Check if the current page has the not-found indicator
    const checkNotFound = () => {
      const hasNotFoundClass = document.body.classList.contains('not-found-page');
      const hasNotFoundData = document.querySelector('[data-page="not-found"]') !== null;
      setIsNotFound(hasNotFoundClass || hasNotFoundData);
    };
    
    // Check immediately and after a short delay
    checkNotFound();
    const timer = setTimeout(checkNotFound, 50);
    
    return () => clearTimeout(timer);
  }, [pathname]);
  
  // Determine if the current page is an authentication page
  const isAuthPage = pathname.includes('/auth/login') || pathname.includes('/auth/signup');
  
  // Hide navbar/footer/faq on auth pages OR 404 pages
  const shouldHideNavAndFooter = isAuthPage || isNotFound;
  
  return (
    <>
      {/* Fixed Navbar - Only show if not on auth/404 pages */}
      {!shouldHideNavAndFooter && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar />
        </div>
      )}
      
      {/* Main content area */}
      <main className={`flex-1 ${!shouldHideNavAndFooter ? 'pt-20' : ''} relative overflow-hidden`}>
        {children}
      </main>
      
      {/* FAQ - Only show if not on auth/404 pages */}
      {!shouldHideNavAndFooter && (
        <Faq />
      )}
      
      {/* Footer - Only show if not on auth/404 pages */}
      {!shouldHideNavAndFooter && (
        <Footer variant=" " />
      )}
    </>
  );
}