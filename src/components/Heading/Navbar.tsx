'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/functions';                     // Assuming this utility is correctly defined
import { motion, AnimatePresence, Variants } from 'framer-motion'
import {
  Search,
  XIcon,          // Used by Navbar
  Clock,          // Used by new SearchModal
  ShoppingBag,    // Used by Navbar
  X,              // Used by new SearchModal
  TrendingUp,     // Used by new SearchModal
  Tag,            // Used by new SearchModal
  Grid,           // Used by new SearchModal
  Eye,            // Used by new SearchModal
  GitBranch,      // Used by new SearchModal
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../ui/button';               // Assuming this path is correct
import { useMediaQuery } from '@/hooks/use-media-query'; // Assuming this hook is correct
import Icons from '../global/icons';                 // Assuming this path is correct
import Wrapper from '../global/wrapper';             // Assuming this path is correct
import Menu from './menu';                           // Assuming this path is correct
import MobileMenu from './mobile-menu';              // Assuming this path is correct
import AuthButton from '../../app/(frontend)/auth/AuthButton'; // Corrected path to AuthButton
import useCartStore from '../../app/store/cartStore'; // Assuming path is correct
import Logo from '../../../public/images/Logo.svg';   // Corrected path to Logo

// Smooth ease for transitions
const smoothEase: [number, number, number, number] = [0.4, 0, 0.2, 1];

// Spring transition for motion components
const springTransition = {
  type: 'spring',
  stiffness: 350,
  damping: 30,
  mass: 0.8,
  
}as const;

// --- NEW SEARCH MODAL DATA ---
// Mock data for fashion resale platform
const trendingItems = [
  { name: 'Jordan 1 Retro High', count: 2847 },
  { name: 'Yeezy Boost 350', count: 1923 },
  { name: 'Nike Dunk Low', count: 1756 },
  { name: 'Air Max 90', count: 1432 },
  { name: 'Supreme Box Logo', count: 1289 },
];

const categories = [
  { name: 'Sneakers', count: 12847, icon: 'Sneaker' },
  { name: 'Streetwear', count: 8932, icon: 'T-Shirt' },
  { name: 'Luxury Bags', count: 4521, icon: 'Bag' },
  { name: 'Watches', count: 2134, icon: 'Watch' },
  { name: 'Accessories', count: 6789, icon: 'Backpack' },
  { name: 'Vintage', count: 3456, icon: 'Clock' },
];

const brands = [
  { name: 'Nike', logo: 'N', color: 'bg-black' },
  { name: 'Adidas', logo: 'A', color: 'bg-black' },
  { name: 'Supreme', logo: 'S', color: 'bg-red-600' },
  { name: 'Off-White', logo: 'OW', color: 'bg-black' },
  { name: 'Yeezy', logo: 'Y', color: 'bg-neutral-800' },
  { name: 'Jordan', logo: 'J', color: 'bg-red-600' },
  { name: 'Balenciaga', logo: 'B', color: 'bg-black' },
];

const conditions = [
  { name: 'New with Tags', count: 3421, desc: 'Unworn with original packaging' },
  { name: 'Excellent', count: 5632, desc: 'Gently used, minimal wear' },
  { name: 'Good', count: 4521, desc: 'Used with normal wear' },
  { name: 'Fair', count: 2134, desc: 'Visible wear and imperfections' },
];

const priceRanges = [
  { name: 'Under ₮100,000', count: 4521 },
  { name: '₮100,000-₮300,000', count: 6789 },
  { name: '₮300,000-₮500,000', count: 3456 },
  { name: 'Over ₮500,000', count: 2134 },
];

// --- NEW SEARCH MODAL COMPONENT ---


const SearchModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('trending');
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);


  const router = useRouter(); // <-- ADD THIS LINE HERE

  // Mock recent searches for the demo
  useEffect(() => {
    const storedSearches = [
      'Jordan 1 Retro',
      'Yeezy 350',
      'Supreme Box Logo',
      'Dunk Low',
    ];
    setRecentSearches(storedSearches);
  }, [isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Escape key handling
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
      onClose();
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.04, delayChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
  };

  const desktopPanelVariants: Variants = {
    hidden: { opacity: 0.8, y: -20, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: springTransition,
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.98,
      transition: { duration: 0.2, ease: smoothEase },
    },
  };

  const tabs = [
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'brands', label: 'Brands', icon: Grid },
    { id: 'condition', label: 'Condition', icon: Eye },
    { id: 'price', label: 'Price', icon: GitBranch },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'trending':
        return (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-2"
          >
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                Trending Now
              </h3>
            </div>

            {trendingItems.map((item, idx) => (
              <motion.button
                key={idx}
                variants={itemVariants}
                whileHover={{ x: 4 }}
                className="w-full text-left flex items-center justify-between py-3 px-4 rounded-xl hover:bg-neutral-700/30 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center text-xs font-bold text-white">
                    #{idx + 1}
                  </div>
                  <span className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors">
                    {item.name}
                  </span>
                </div>
                <span className="text-xs text-neutral-500 tabular-nums">
                  {item.count.toLocaleString()}
                </span>
              </motion.button>
            ))}
          </motion.div>
        );

      case 'categories':
        return (
          <motion.div variants={containerVariants} initial="hidden" animate="show">
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                Browse Categories
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat, idx) => (
                <motion.button
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-neutral-800/40 hover:bg-neutral-700/40 transition-colors border border-neutral-700/30 hover:border-neutral-600/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-sm font-medium text-neutral-200">{cat.name}</span>
                  </div>
                  <span className="text-xs text-neutral-500 tabular-nums">
                    {cat.count.toLocaleString()}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      case 'brands':
        return (
          <motion.div variants={containerVariants} initial="hidden" animate="show">
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                Popular Brands
              </h3>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              {brands.map((brand, idx) => (
                <motion.button
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-shrink-0 w-16 h-16 rounded-2xl ${brand.color} text-white font-bold text-lg flex items-center justify-center shadow-lg`}
                >
                  {brand.logo}
                </motion.button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {brands.map((brand, idx) => (
                <motion.button
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ x: 4 }}
                  className="text-left py-3 px-4 rounded-xl hover:bg-neutral-700/30 transition-colors"
                >
                  <span className="text-sm font-medium text-neutral-200">{brand.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      case 'condition':
        return (
          <motion.div variants={containerVariants} initial="hidden" animate="show">
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                Item Condition
              </h3>
            </div>

            <div className="space-y-2">
              {conditions.map((condition, idx) => (
                <motion.button
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ x: 4 }}
                  className="w-full text-left p-4 rounded-xl hover:bg-neutral-700/30 transition-colors group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors">
                      {condition.name}
                    </span>
                    <span className="text-xs text-neutral-500 tabular-nums">
                      {condition.count.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-xs text-neutral-500">{condition.desc}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      case 'price':
        return (
          <motion.div variants={containerVariants} initial="hidden" animate="show">
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
                Price Range
              </h3>
            </div>

            <div className="space-y-2">
              {priceRanges.map((range, idx) => (
                <motion.button
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ x: 4 }}
                  className="w-full text-left flex items-center justify-between py-3 px-4 rounded-xl hover:bg-neutral-700/30 transition-colors group"
                >
                  <span className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors">
                    {range.name}
                  </span>
                  <span className="text-xs text-neutral-500 tabular-nums">
                    {range.count.toLocaleString()}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Desktop backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: smoothEase }}
            className="fixed inset-0 z-[99] bg-black/30 backdrop-blur-sm hidden md:block"
            onClick={onClose}
          />

          {/* Desktop Search Panel */}
          <motion.div
            ref={modalRef}
            variants={desktopPanelVariants}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="fixed z-[99] hidden md:block top-24 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[520px] bg-[#2a2a2a] rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Header */}
            <div className="px-6 pt-6 pb-4 border-b border-neutral-700/50">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-0 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                  placeholder="Хайх..."
                  className="w-full py-3 pl-8 pr-10 text-sm bg-transparent text-neutral-200 placeholder-neutral-500 focus:outline-none"
                  autoComplete="off"
                />
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setSearchQuery('')}
                    type="button"
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-neutral-600 hover:bg-neutral-500 flex items-center justify-center transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </motion.button>
                )}
              </div>

              {/* Quick filters */}
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
                {[
                  'New Arrivals',
                  'Verified Sellers',
                  'Under ₮200K',
                  'Free Shipping',
                  'Local Sellers',
                ].map((filter, idx) => (
                  <button
                    key={idx}
                    className="flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full bg-neutral-700/40 text-neutral-300 hover:bg-neutral-700/60 transition-colors"
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex h-[calc(100%-128px)]">
              {/* Sidebar Navigation */}
              <div className="w-48 border-r border-neutral-700/50 p-4 space-y-1 bg-neutral-800/20">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        activeTab === tab.id
                          ? 'bg-neutral-700/60 text-white shadow-sm'
                          : 'text-neutral-400 hover:bg-neutral-700/30 hover:text-neutral-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}

                {/* Recent Searches in Sidebar */}
                <div className="pt-4 mt-4 border-t border-neutral-700/50">
                  <div className="flex items-center gap-2 px-3 mb-2">
                    <Clock className="w-3.5 h-3.5 text-neutral-500" />
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                      Recent
                    </span>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.slice(0, 3).map((search, idx) => (
                      <button
                        key={idx}
                        className="w-full text-left px-3 py-2 text-xs text-neutral-400 hover:text-neutral-300 hover:bg-neutral-700/30 rounded-lg transition-colors truncate"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
                {renderContent()}
              </div>
            </div>
          </motion.div>

          {/* Mobile Version (Full Screen) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99] bg-[#2a2a2a] md:hidden overflow-y-auto"
          >
            <div className="p-4 pt-20">
              <div className="relative mb-6">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Хайх..."
                  className="w-full py-3 pl-10 pr-10 text-base bg-neutral-800 rounded-xl text-neutral-200 placeholder-neutral-500 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-5 h-5 text-neutral-400" />
                  </button>
                )}
              </div>

              {/* Mobile tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-white text-black'
                        : 'bg-neutral-700/40 text-neutral-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {renderContent()}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/**
 * Navbar Component
 * The main navigation bar, including logo, menu, search button, cart, and auth button.
 */
const Navbar = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const isLargeScreen = useMediaQuery('(min-width:1024px)');
  const isMobile = !isLargeScreen;
  const cart = useCartStore((state) => state.cart);
  const itemCount = cart.reduce(
    (total: number, item: { quantity: number }) => total + item.quantity,
    0
  );
  const isMdScreen = useMediaQuery('(min-width:768px)');

  // Ghost animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 5);
    return () => clearTimeout(timer);
  }, []);

  // Close mobile menu on screen resize
  useEffect(() => {
    if (isLargeScreen && isOpen) {
      setIsOpen(false);
    }
  }, [isLargeScreen, isOpen]);

  // Centralized body-scroll logic
  useEffect(() => {
    const isMobileMenuOpen = isOpen && isMobile;
    const isMobileSearchOpen = isSearchOpen && !isMdScreen;
    if (isMobileMenuOpen || isMobileSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isMobile, isSearchOpen, isMdScreen]);

  // Framer Motion variants for navbar
  const navbarVariants: Variants = {
    hidden: { y: -50 },
    show: {
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 40,
        mass: 1,
        duration: 0.1,
      },
    },
  };

  return (
    <div className="relative w-full text-neutral-400">
      {/* Spacer for fixed header */}
      <div className="z-[99] fixed pointer-events-none inset-x-0 h-[88px]"></div>

      <AnimatePresence>
        {isVisible && (
          <motion.header
            variants={navbarVariants}
            initial="hidden"
            animate="show"
            exit="hidden"
            className={cn(
              'fixed top-4 inset-x-0 mx-auto max-w-6xl px-2 md:px-12 z-[100]',
              'h-12'
            )}
          >
            <Wrapper
              className={cn(
                'relative h-full flex items-center justify-start px-1 sm:px-2 md:px-2',
                'rounded-3xl border border-white/20 bg-black/70 backdrop-blur-xl',
                'before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-b before:from-white/25 before:to-transparent before:opacity-75 before:pointer-events-none'
              )}
            >
              <div className="flex items-center mx-1 sm:mx-0 justify-between w-full">
                <div className="flex items-center gap-4 flex-shrink-0">
                  {/* Logo */}
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/"
                      className="text-lg font-semibold transition-colors text-foreground bg-[#232323] hover:bg-neutral-900 py-0 px-[5px] rounded-full border border-neutral-700 flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      aria-label="Homepage"
                    >
                      <Image
                        height={60}
                        width={60}
                        src={Logo}
                        alt="saintoLogo"
                        priority
                        className="transition-transform duration-300 transform px-1"
                      />
                    </Link>
                  </motion.div>

                  {/* Desktop Menu */}
                  <div className="items-center hidden lg:flex">
                    <Menu />
                  </div>
                </div>

                <div className="flex items-center gap-2 lg:gap-4">
                  {/* Search Button */}
                  <motion.div whileTap={{ y: 1 }}>
                    <Button
                      size="sm"
                      variant="tertiary"
                      onClick={() => setIsSearchOpen((prev) => !prev)} // TOGGLE
                      className="rounded-full text-white transition-all items-center duration-200 px-3 py-2 glossy-button-effect hover:brightness-125 hover:scale-105 active:scale-95"
                      aria-label={isSearchOpen ? 'Хайх талбарыг хаах' : 'Хайх'}
                      aria-expanded={isSearchOpen}
                    >
                      <Search className="w-4 h-4 relative z-10" />
                      <span className="ml-0 sm:ml-2 hidden sm:inline relative z-10">Хайх</span>
                    </Button>
                  </motion.div>

                  {/* Shopping Bag Button */}
                  <motion.div
                    whileTap={{ y: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 25,
                    }}
                  >
                    <Link
                      href="/bag"
                      className="relative flex items-center duration-300 transition-all ease-soft-spring text-neutral-300 hover:text-white p-1.5 rounded-full hover:bg-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      aria-label={`Shopping bag with ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
                    >
                      <ShoppingBag className="w-6 h-6" />
                      <AnimatePresence>
                        {itemCount > 0 && (
                          <motion.span
                            initial={{ scale: 0, y: 5 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0 }}
                            transition={{
                              type: 'spring',
                              stiffness: 500,
                              damping: 30,
                            }}
                            className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-medium rounded-full px-1.5 leading-tight flex items-center justify-center min-w-[16px] h-[16px]"
                            aria-hidden="true"
                          >
                            {itemCount > 9 ? '9+' : itemCount}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  </motion.div>

                  {/* Auth Button */}
                  <motion.div
                    className="hidden sm:inline"
                    whileTap={{ y: -3 }}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 25,
                    }}
                  >
                    <AuthButton />
                  </motion.div>

                  {/* Mobile Menu Toggle Button */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="lg:hidden"
                  >
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setIsOpen((prev) => !prev)}
                      className="p-2 w-8 h-8 text-neutral-200 hover:text-white hover:bg-neutral-800 rounded-full"
                      aria-label={isOpen ? 'Close menu' : 'Open menu'}
                      aria-expanded={isOpen}
                      aria-controls="mobile-menu-content"
                    >
                      <AnimatePresence initial={false} mode="wait">
                        <motion.div
                          key={isOpen ? 'x' : 'menu'}
                          initial={{
                            rotate: isOpen ? 90 : -90,
                            opacity: 0,
                            scale: 0.5,
                          }}
                          animate={{ rotate: 0, opacity: 1, scale: 1 }}
                          exit={{
                            rotate: isOpen ? -90 : 90,
                            opacity: 0,
                            scale: 0.5,
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          {isOpen ? (
                            <XIcon className="w-4 h-4" />
                          ) : (
                            <Icons.menu className="w-3.5 h-3.5" />
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </Button>
                  </motion.div>
                </div>
              </div>

              {/* Mobile Menu Content */}
              {!isLargeScreen && (
                <MobileMenu
                  isOpen={isOpen}
                  setIsOpen={setIsOpen}
                  authButton={<AuthButton />}
                />
              )}
            </Wrapper>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Search Modal Component */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};

export default Navbar;