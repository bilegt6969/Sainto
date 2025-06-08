'use client';
import React, { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
  Mail
} from 'lucide-react';
import { useHorizontalDragScroll } from './hooks/useHorizontalDragScroll';

// --- Data Definitions ---

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
    id: "shop-links",
    title: "Shop",
    links: [
      { name: "For You", href: "/for-you", icon: <TrendingUp size={16} /> },
      { name: "New Arrivals", href: "/new", icon: <ShoppingBag size={16} /> },
      { name: "Sale", href: "/sale", icon: <TrendingUp size={16} /> },
      { name: "Collections", href: "/collections" }
    ]
  },
  {
    id: "help-links",
    title: "Support",
    links: [
      { name: "FAQ", href: "/faq", icon: <CircleHelp size={16} /> },
      { name: "Shipping Info", href: "/shipping", icon: <Ship size={16} /> },
      { name: "Returns", href: "/returns", icon: <RotateCcw size={16} /> },
      { name: "Contact Us", href: "/contact", icon: <Mail size={16} /> }
    ]
  },
  {
    id: "company-links",
    title: "Company",
    links: [
      { name: "About Saint", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Press", href: "/press", icon: <Newspaper size={16} /> },
      { name: "Wholesale", href: "/wholesale" }
    ]
  }
];

// --- Component Props ---

interface FooterProps {
  className?: string;
}

// --- Component ---

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useHorizontalDragScroll(scrollContainerRef);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <footer className={`bg-black text-white relative overflow-hidden ${className}`}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 opacity-50"></div>
      
      <div className="relative z-10">
        {/* Newsletter Section */}
        <div className="border-b border-zinc-800">
          <div className="container mx-auto px-4 sm:px-6 py-16">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                Stay in the Loop
              </h2>
              <p className="text-zinc-400 mb-8 text-lg">
                Get exclusive drops, early access, and insider updates delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all duration-300"
                />
                <button className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-zinc-200 transition-all duration-300 flex items-center justify-center gap-2 group">
                  Subscribe
                  <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="container mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-5 mb-16">
            
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <Link href="/" className="inline-block mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-lg p-2 -m-2">
                <span className="sr-only">Saint Home</span>
                <Image
                  width={200}
                  height={50}
                  alt="Saint logo"
                  src="/images/logo-white.svg" // You'll need a white version of your logo
                  className="h-12 w-auto brightness-0 invert" // This converts your logo to white if it's black
                  priority
                />
              </Link>
              <p className="text-zinc-400 leading-relaxed max-w-sm mb-8 text-lg">
                Your digital plug for curated fashion and streetwear essentials. 
                Discover the latest trends and timeless pieces.
              </p>
              
              {/* Social Links */}
              <div className="flex space-x-4">
                {[
                  { href: "https://twitter.com/saint", label: "Saint on Twitter", icon: Twitter },
                  { href: "https://instagram.com/saint", label: "Saint on Instagram", icon: Instagram },
                  { href: "https://facebook.com/saint", label: "Saint on Facebook", icon: Facebook },
                ].map((social) => (
                  <a
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white transition-all duration-300 group"
                  >
                    <social.icon size={18} className="group-hover:scale-110 transition-transform duration-300" />
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
                    className={`text-zinc-400 transition-all duration-300 ${expandedSections[section.id] ? 'rotate-180 text-white' : ''}`}
                  />
                </button>

                {/* Desktop Title */}
                <h3 className="hidden lg:block text-lg font-semibold text-white mb-6">
                  {section.title}
                </h3>

                {/* Links */}
                <nav
                  id={`footer-section-${section.id}`}
                  className={`
                    mt-4 lg:mt-0 space-y-4 transition-all duration-300 ease-in-out overflow-hidden
                    ${expandedSections[section.id] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                    lg:block lg:max-h-none lg:opacity-100 lg:overflow-visible
                  `}
                >
                  {section.links.map((link, linkIdx) => (
                    <Link
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
                        <ArrowUpRight size={14} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      )}
                    </Link>
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
                © {currentYear} Saint. All rights reserved.
              </p>

              {/* Legal Links */}
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 order-1 lg:order-2">
                {[
                  { href: "/privacy", name: "Privacy Policy" },
                  { href: "/terms", name: "Terms of Service" },
                  { href: "/cookies", name: "Cookie Policy" },
                ].map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-zinc-500 hover:text-white transition-colors duration-300 focus:outline-none focus-visible:underline focus-visible:text-white"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              {/* Attribution */}
              <p className="text-sm text-zinc-600 order-3">
                Crafted by{' '}
                <a 
                  href="https://bytecode.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-zinc-400 hover:text-white transition-colors duration-300 focus:outline-none focus-visible:underline"
                >
                  bytecode
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;