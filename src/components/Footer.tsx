'use client';

import React, { useState } from 'react';
// Removed 'next/image' and 'next/link' as they are Next.js specific and caused an error.
// We will use standard `<img>` and `<a>` tags instead.
import {
  CircleHelp,
  Newspaper,
  ShoppingBag,
  TrendingUp,
  Ship,
  RotateCcw,
  ChevronDown,
  Twitter,
  Instagram,
  Facebook,
  ArrowUpRight,
  Mail,
  Link,
} from 'lucide-react';

// --- Data Definitions (Translated to Mongolian) ---

interface LinkItem {
  name: string;
  href: string;
  icon?: React.ReactNode;
  external?: boolean;
}

interface FooterSection {
  id: string;
  title: string;
  links: LinkItem[];
}

const footerLinks: FooterSection[] = [
  {
    id: 'shop-links',
    title: 'Дэлгүүр',
    links: [
      { name: 'Танд санал болгох', href: '/for-you', icon: <TrendingUp size={16} /> },
      { name: 'Шинэ бараа', href: '/new', icon: <ShoppingBag size={16} /> },
      { name: 'Хямдрал', href: '/sale', icon: <TrendingUp size={16} /> },
      { name: 'Коллекц', href: '/collections' },
    ],
  },
  {
    id: 'help-links',
    title: 'Тусламж',
    links: [
      { name: 'Түгээмэл асуултууд', href: '/faq', icon: <CircleHelp size={16} /> },
      { name: 'Хүргэлтийн мэдээлэл', href: '/shipping', icon: <Ship size={16} /> },
      { name: 'Буцаалт', href: '/returns', icon: <RotateCcw size={16} /> },
      { name: 'Бидэнтэй холбогдох', href: '/contact', icon: <Mail size={16} /> },
    ],
  },
  {
    id: 'company-links',
    title: 'Компани',
    links: [
      { name: 'Saint-ийн тухай', href: '/about-us' },
      { name: 'Ажлын байр', href: '/careers' },
      { name: 'Хэвлэл мэдээлэл', href: '/press', icon: <Newspaper size={16} /> },
      { name: 'Бөөний худалдаа', href: '/wholesale' },
    ],
  },
];

// --- Component Props ---

interface FooterProps {
  className?: string;
}

// --- Component ---

const App: React.FC<FooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    // The parent element needs a background color for the effect to be visible.
    <div className='bg-black'>
<div className="w-full py-12 rounded-b-[2rem] sm:rounded-b-[2.5rem] md:rounded-b-[3rem] lg:rounded-b-[4rem] xl:rounded-b-[5rem] 2xl:rounded-b-[5rem] bg-[#252525] text-center">
 </div>
    <footer className={`relative overflow-visible bg-white dark:bg-zinc-900 ${className} animate-fade-in-up`}>
      {/* The main footer background.
          - `pt-12` creates space at the top for the curves.
          - `inverted-corners-top` is our custom class that applies the mask.
      */}
      <div className="relative bg-black text-white pt-12 md:pt-16 inverted-corners-top">
 
        <div className="relative z-10">
          <div className="container mx-auto px-6 sm:px-8 pb-12 pt-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-5 mb-16">
              {/* Brand Section */}
              <div className="lg:col-span-2">
                <Link
                  href="/"
                  className="inline-block mb-6 focus:outline-none focus-visible:ring-2 justify-center focus-visible:ring-white rounded-lg p-2 -m-2"
                >
                  <span className="sr-only">Saint Нүүр</span>
                  {/* Replaced Next.js Image with standard <img> tag */}
                  <img
                     width={150}
                     height={50}
                     alt="Saint лого"
                     src="/images/Logo.svg"
                     className="h-20 w-auto"
                  />
                </Link>
                <p className="text-zinc-400 leading-relaxed max-w-sm mb-8 text-base">
                Загварыг хялбар болгосон дижитал шийдэл. FIRST SAINT FINEST
                </p>

                {/* Social Links */}
                <div className="flex space-x-4">
                  {[
                    { href: 'https://twitter.com/saint', label: 'Saint on Twitter', icon: Twitter },
                    { href: 'https://instagram.com/saint', label: 'Saint on Instagram', icon: Instagram },
                    { href: 'https://facebook.com/saint', label: 'Saint on Facebook', icon: Facebook },
                  ].map((social) => (
                    <a
                      key={social.href}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white transition-all duration-300 group"
                    >
                      <social.icon
                        size={18}
                        className="group-hover:scale-110 transition-transform duration-300"
                      />
                    </a>
                  ))}
                </div>
              </div>

              {/* Link Columns */}
              {footerLinks.map((section) => (
                <div key={section.id} className="lg:col-span-1">
                  {/* Mobile Accordion */}
                  <button
                    className="flex items-center justify-between w-full lg:hidden py-3 text-left focus:outline-none group"
                    onClick={() => toggleSection(section.id)}
                    aria-expanded={expandedSections[section.id] || false}
                    aria-controls={`footer-section-${section.id}`}
                  >
                    <h3 className="text-lg font-semibold text-white group-focus-visible:text-zinc-300">
                      {section.title}
                    </h3>
                    <ChevronDown
                      size={20}
                      className={`text-zinc-400 transition-all duration-300 ${
                        expandedSections[section.id] ? 'rotate-180 text-white' : ''
                      }`}
                    />
                  </button>

                  {/* Desktop Title */}
                  <h3 className="hidden lg:block text-lg font-semibold text-white mb-6">
                    {section.title}
                  </h3>

                  {/* Links: Replaced Next.js Link with standard <a> tag */}
                  <nav
                    id={`footer-section-${section.id}`}
                    className={`
                      mt-4 lg:mt-0 space-y-4 transition-all duration-500 ease-in-out overflow-hidden
                      ${expandedSections[section.id] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                      lg:block lg:max-h-none lg:opacity-100 lg:overflow-visible
                    `}
                  >
                    {section.links.map((link, linkIdx) => (
                      <a
                        key={linkIdx}
                        href={link.href}
                        target={link.external ? '_blank' : undefined}
                        rel={link.external ? 'noopener noreferrer' : undefined}
                        className="flex items-center text-zinc-400 hover:text-white transition-colors duration-300 group focus:outline-none focus-visible:text-white"
                      >
                        {link.icon && (
                          <span className="flex-shrink-0 w-4 h-4 mr-3 text-zinc-500 group-hover:text-zinc-300 transition-colors duration-300">
                            {link.icon}
                          </span>
                        )}
                        <span className="group-hover:translate-x-1 transition-transform duration-300">
                          {link.name}
                        </span>
                        {link.external && (
                          <ArrowUpRight
                            size={14}
                            className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          />
                        )}
                      </a>
                    ))}
                  </nav>
                </div>
              ))}
            </div>

            {/* Bottom Section */}
            <div className="border-t border-zinc-800 pt-8">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                {/* Copyright */}
                <p className="text-zinc-500 text-sm order-2 lg:order-1">
                  © {currentYear} Saint. Бүх эрх хуулиар хамгаалагдсан.
                </p>

                {/* Legal Links: Replaced Next.js Link with standard <a> tag */}
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 order-1 lg:order-2">
                  {[
                    { href: '/privacy', name: 'Нууцлалын бодлого' },
                    { href: '/terms', name: 'Үйлчилгээний нөхцөл' },
                    { href: '/cookies', name: 'Күүкийн бодлого' },
                  ].map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="text-sm text-zinc-500 hover:text-white transition-colors duration-300 focus:outline-none focus-visible:underline focus-visible:text-white"
                    >
                      {link.name}
                    </a>
                  ))}
                </div>

                {/* Attribution */}
                <p className="text-sm text-zinc-600 order-3">
                © Saint.mn 2025. Made with 🤍 by {' '}
                  <a
                    href="https://bytecode-smoky.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-white transition-colors duration-300 focus:outline-none focus-visible:underline"
                  >
                    bytecode studio
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* This style tag contains the magic for the inverted corners and animations. */}
      {/* It's included here to make the component self-contained. */}
      <style jsx global>{`
        /* This is the custom class for the inverted corner effect.
          It uses CSS masks to "cut out" the corners.
          - The radius (47px/48px) should match the desired curve size. 
          - We use multiple gradients: two radial gradients for the corners and one
            linear gradient for the rest of the shape.
        */
        .inverted-corners-top {
          -webkit-mask-image: 
            radial-gradient(circle at top left, transparent 0, transparent 47px, black 48px),
            radial-gradient(circle at top right, transparent 0, transparent 47px, black 48px),
            linear-gradient(to top, black, black);
          mask-image: 
            radial-gradient(circle at top left, transparent 0, transparent 47px, black 48px),
            radial-gradient(circle at top right, transparent 0, transparent 47px, black 48px),
            linear-gradient(to top, black, black);
            
          /* The 'add' composite operation is needed for some browsers to combine the masks correctly. */
          -webkit-mask-composite: add;
          mask-composite: add;
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>
    </footer>
    </div>
  );
};

export default App;
