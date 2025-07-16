// components/LayoutClientWrapper.tsx
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Heading/Navbar'; // Adjust path if needed
import Footer from '@/components/Footer';     // Adjust path if needed

interface LayoutClientWrapperProps {
  children: React.ReactNode;
}

export default function LayoutClientWrapper({ children }: LayoutClientWrapperProps) {
  const pathname = usePathname();

  // Determine if the current page is an authentication page
  const isAuthPage = pathname.includes('/auth/login') || pathname.includes('/auth/signup');

  return (
    <>
      {/* Fixed Navbar - Only show if not on login/signup page */}
      {!isAuthPage && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <Navbar />
        </div>
      )}

      {/* Main content area */}
      <main className={`flex-1 ${!isAuthPage ? 'pt-20' : ''} relative overflow-hidden`}>
        {children}
        {/* Analytics can stay here or be moved if it has specific client-side needs */}
      </main>

      {/* Footer - Only show if not on login/signup page */}
      {!isAuthPage && (
        <Footer variant="dark" />
      )}
    </>
  );
}