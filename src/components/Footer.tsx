'use client';
import React, { useState } from 'react'; // Removed unused 'useRef'
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

// --- Data Definitions ---

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

const footerLinks: FooterSection[] = [
  {
    id: "shop-links",
    title: "Дэлгүүр",
    links: [
      { name: "Танд зориулсан", href: "/for-you", icon: <TrendingUp size={16} /> },
      { name: "Шинэ бараа", href: "/new", icon: <ShoppingBag size={16} /> },
      { name: "Хямдрал", href: "/sale", icon: <TrendingUp size={16} /> }
    ]
  },
  {
    id: "help-links",
    title: "Тусламж",
    links: [
      { name: "Түгээмэл асуулт", href: "/faq", icon: <CircleHelp size={16} /> },
      { name: "Хүргэлт", href: "/shipping", icon: <Ship size={16} /> },
      { name: "Буцаалт", href: "/returns", icon: <RotateCcw size={16} /> },
      { name: "Холбоо барих", href: "/contact" }
    ]
  },
  {
    id: "company-links",
    title: "Компани",
    links: [
      { name: "Бидний тухай", href: "/about" },
      { name: "Ажлын байр", href: "/careers" },
      { name: "Блог", href: "/blog", icon: <Newspaper size={16} /> }
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

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <footer className={`bg-white text-neutral-800 rounded-3xl ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 py-16"> {/* Increased from py-12 to py-16 */}

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:grid-cols-5 mb-16"> {/* Increased gap from 8 to 12, mb from 10 to 16 */}
          {/* Logo & About */}
          <div className="md:col-span-2 lg:col-span-2">
          <Link href="/" className="inline-block mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-black rounded-md p-1 -m-1"> {/* Increased mb from 4 to 6 */}
            <span className="sr-only">Сэйнт Гэр</span>
            <Image
              width={300} // Increased from 140
              height={70} // Increased proportionally (maintaining approx 4.28:1 ratio)
              alt="Сэйнт лого"
              src="/images/logo.svg"
              className="h-auto w-auto max-w-[200px] sm:max-w-[300px]" // Responsive max-width, adjusted height to auto
              priority
            />
          </Link>
            <p className="text-sm text-neutral-600 leading-relaxed max-w-xs"> {/* Added max-width */}
              Загварын хувцас болон гудамжны загварын зайлшгүй хэрэгслүүдэд зориулсан дижитал PLUG.
            </p>
          </div>

          {/* Link Columns with Accordion */}
          {footerLinks.map((section) => (
            <div key={section.id} className="md:col-span-1">
              {/* Accordion Button for Mobile */}
              <button
                className="flex items-center justify-between w-full md:hidden py-3 text-left focus:outline-none group" // Increased py from 2 to 3
                onClick={() => toggleSection(section.id)}
                aria-expanded={expandedSections[section.id] || false} // Default to false if undefined
                aria-controls={`footer-section-${section.id}`}
                aria-label={`${section.title} холбоосууд`} // More descriptive label
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
              <h3 className="hidden md:block text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-6"> {/* Increased mb from 4 to 6 */}
                {section.title}
              </h3>

              {/* Links List */}
              <nav
                id={`footer-section-${section.id}`}
                className={`
                  mt-3 md:mt-0 space-y-4 transition-all duration-300 ease-in-out overflow-hidden
                  ${expandedSections[section.id] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} /* Smooth transition */
                  md:block md:max-h-none md:opacity-100 md:overflow-visible /* Reset for desktop */
                `} // Increased mt from 2 to 3, space-y from 3 to 4
                aria-hidden={!expandedSections[section.id] && typeof window !== 'undefined' && window.innerWidth < 768} // Hide from A11y when collapsed on mobile
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
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-6"> {/* Increased mb from 4 to 6 */}
              Холбогдох
            </h3>
            <div className="flex space-x-4">
              {[
                { href: "https://twitter.com/saint", label: "Сэйнт Твиттерт", icon: Twitter },
                { href: "https://instagram.com/saint", label: "Сэйнт Инстаграмт", icon: Instagram },
                { href: "https://facebook.com/saint", label: "Сэйнт Фэйсбүүкт", icon: Facebook },
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
        <div className="border-t border-neutral-200 pt-12"> {/* Increased pt from 8 to 12 */}
          <div className="flex flex-col items-center gap-y-8 gap-x-6 text-center md:flex-row md:justify-between md:text-left"> {/* Increased gap-y from 4 to 8 */}
            <p className="text-xs text-neutral-500 order-2 md:order-1">
              &copy; {currentYear} Сэйнт, бэтта. Бүх эрх хуулиар хамгаалагдсан.
            </p>

            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 order-1 md:order-2">
              {[
                { href: "/privacy", name: "Нууцлалын бодлого" },
                { href: "/terms", name: "Хэрэглээний нөхцөл" },
                { href: "/legal", name: "Хуулийн мэдээлэл" },
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
              Бүтээсэн <a href="https://bytecode.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-neutral-600 focus:outline-none focus-visible:text-black focus-visible:ring-1 focus-visible:ring-black rounded-sm">bytecode</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;