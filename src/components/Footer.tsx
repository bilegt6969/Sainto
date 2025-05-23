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
  Facebook
} from 'lucide-react';
import { useHorizontalDragScroll } from './hooks/useHorizontalDragScroll'; // Adjust path as needed

// --- Data Definitions ---

interface BrowseItem {
  name: string;
  href: string;
  type: 'category' | 'brand';
}

interface LinkItem {
  name: string;
  href: string;
  icon?: React.ReactNode;
}

interface FooterSection {
  id: string;
  title: string;
  links: LinkItem[];
}

const browseItems: BrowseItem[] = [
  { name: "Sneakers", href: "/categories/sneakers", type: "category" },
  { name: "Apparel", href: "/categories/apparel", type: "category" },
  { name: "Accessories", href: "/categories/accessories", type: "category" },
  { name: "Nike", href: "/brands/nike", type: "brand" },
  { name: "Adidas", href: "/brands/adidas", type: "brand" },
  { name: "Supreme", href: "/brands/supreme", type: "brand" },
  { name: "Stüssy", href: "/brands/stussy", type: "brand" },
  { name: "Bape", href: "/brands/bape", type: "brand" },
  { name: "Off-White", href: "/brands/off-white", type: "brand" },
  { name: "Jordan", href: "/brands/jordan", type: "brand" },
  { name: "PALACE", href: "/brands/palace", type: "brand" }
];

const footerLinks: FooterSection[] = [
  {
    id: "shop-links",
    title: "Shop",
    links: [
      { name: "For You", href: "/for-you", icon: <TrendingUp size={16} /> },
      { name: "New Arrivals", href: "/new", icon: <ShoppingBag size={16} /> },
      { name: "Sale", href: "/sale", icon: <TrendingUp size={16} /> }
    ]
  },
  {
    id: "help-links",
    title: "Help",
    links: [
      { name: "FAQ", href: "/faq", icon: <CircleHelp size={16} /> },
      { name: "Shipping", href: "/shipping", icon: <Ship size={16} /> },
      { name: "Returns", href: "/returns", icon: <RotateCcw size={16} /> },
      { name: "Contact", href: "/contact" }
    ]
  },
  {
    id: "company-links",
    title: "Company",
    links: [
      { name: "About", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Blog", href: "/blog", icon: <Newspaper size={16} /> }
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
  const { isDragging } = useHorizontalDragScroll(scrollContainerRef); // Use the custom hook

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <footer className={`bg-white text-neutral-800 rounded-3xl ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 py-12">

        {/* Browse Section */}
        <div className="mb-12"> {/* Increased bottom margin */}
          <h3 className="text-base font-semibold text-neutral-900 mb-4">
            Explore Collections & Brands
          </h3>
          <div
            ref={scrollContainerRef}
            className="relative overflow-x-auto pb-4 -mx-2" // Removed scrollbar-hide
            style={{
              scrollBehavior: 'smooth',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch', // Keep for iOS momentum scrolling
              cursor: isDragging ? 'grabbing' : 'grab', // Cursor style managed by hook now
            }}
          >
            {/* Inner container prevents margin collapse and allows padding */}
            <div className="flex gap-3 min-w-max px-2"> {/* Slightly increased gap */}
              {browseItems.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  className={`
                    flex-shrink-0 text-sm px-4 py-2 rounded-full transition-all duration-300 whitespace-nowrap border
                    ${item.type === 'category'
                      ? 'bg-neutral-50 border-neutral-200 hover:bg-neutral-100 hover:border-neutral-300 text-neutral-700'
                      : 'bg-black border-black text-white hover:bg-neutral-800 font-medium'}
                    scroll-snap-align-start
                    rounded-2xl
                    shadow-sm hover:shadow-md
                    transform hover:-translate-y-0.5 active:scale-95 /* Subtle hover lift */
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${item.type === 'category' ? 'focus-visible:ring-neutral-400' : 'focus-visible:ring-black'}
                  `}
                  draggable="false" // Prevent native image/link dragging interfering
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5 mb-10"> {/* Adjusted margin */}
          {/* Logo & About */}
          <div className="md:col-span-2 lg:col-span-2">
          <Link href="/" className="inline-block mb-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-black rounded-md p-1 -m-1">
  <span className="sr-only">Saint Home</span>
  <Image
    width={300} // Increased from 140
    height={70} // Increased proportionally (maintaining 5:1 ratio)
    alt="Saint logo"
    src="/images/logo.svg"
    className="h-18 w-auto " // Added subtle shadow
    priority
  />
</Link>
            <p className="text-sm text-neutral-600 leading-relaxed max-w-xs"> {/* Added max-width */}
              Digital PLUG for curated fashion and streetwear essentials.
            </p>
          </div>

          {/* Link Columns with Accordion */}
          {footerLinks.map((section) => (
            <div key={section.id} className="md:col-span-1">
              {/* Accordion Button for Mobile */}
              <button
                className="flex items-center justify-between w-full md:hidden py-2 text-left focus:outline-none group" // Added group for potential focus styling
                onClick={() => toggleSection(section.id)}
                aria-expanded={expandedSections[section.id] || false} // Default to false if undefined
                aria-controls={`footer-section-${section.id}`}
                aria-label={`${section.title} links`} // More descriptive label
              >
                <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 group-focus-visible:text-black"> {/* Highlight on focus */}
                  {section.title}
                </h3>
                <ChevronDown
                  size={16}
                  className={`text-neutral-500 transition-transform duration-200 group-focus-visible:text-black ${expandedSections[section.id] ? 'rotate-180' : ''}`}
                  aria-hidden="true" // Decorative icon
                />
              </button>

              {/* Section Title for Desktop */}
              <h3 className="hidden md:block text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-4">
                {section.title}
              </h3>

              {/* Links List */}
              <nav
                id={`footer-section-${section.id}`}
                className={`
                  mt-2 md:mt-0 space-y-3 transition-all duration-300 ease-in-out overflow-hidden
                  ${expandedSections[section.id] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} /* Smooth transition */
                  md:block md:max-h-none md:opacity-100 md:overflow-visible /* Reset for desktop */
                `}
                aria-hidden={!expandedSections[section.id]} // Hide from A11y when collapsed on mobile
              >
                {section.links.map((link, linkIdx) => (
                  <Link
                    key={linkIdx}
                    href={link.href}
                    className="flex items-center text-sm text-neutral-600 hover:text-neutral-900 transition-colors duration-200 group focus:outline-none focus-visible:text-black rounded" // Added focus styles
                  >
                    {link.icon && (
                      <span className="flex-shrink-0 w-4 h-4 mr-2.5 text-neutral-400 group-hover:text-neutral-700 group-focus-visible:text-black transition-colors duration-200">
                        {link.icon}
                      </span>
                    )}
                    <span className="group-focus-visible:underline">{link.name}</span> {/* Underline on focus */}
                  </Link>
                ))}
              </nav>
            </div>
          ))}

          {/* Connect Section */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-4">
              Connect
            </h3>
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
                  className="text-neutral-500 hover:text-black transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black rounded-sm"
                >
                  <social.icon size={20} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-200 pt-8"> {/* Increased padding */}
          <div className="flex flex-col items-center gap-y-4 gap-x-6 text-center md:flex-row md:justify-between md:text-left">
            <p className="text-xs text-neutral-500 order-2 md:order-1">
              &copy; {currentYear} Saint, betta. All rights reserved.
            </p>

            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 order-1 md:order-2">
              {[
                { href: "/privacy", name: "Privacy Policy" },
                { href: "/terms", name: "Terms of Use" },
                { href: "/legal", name: "Legal" },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors duration-200 focus:outline-none focus-visible:underline focus-visible:text-black"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Updated Attribution */}
            <p className="text-xs text-neutral-400 italic order-3">
              Built by <a href="https://bytecode.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-neutral-600 focus:outline-none focus-visible:text-black focus-visible:ring-1 focus-visible:ring-black rounded-sm">bytecode</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;