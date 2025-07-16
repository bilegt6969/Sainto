'useclient';
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/functions';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, XIcon, Clock, ShoppingBag } from 'lucide-react';
//ChevronRightisreplacedbySVG
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../ui/button';
import { useMediaQuery } from '@/hooks/use-media-query';
import Icons from '../global/icons';
import Wrapper from '../global/wrapper';
import Menu from './menu';
import MobileMenu from './mobile-menu';
import AuthButton from '../../app/(frontend)/auth/AuthButton';
import useCartStore from '../../app/store/cartStore';
import Logo from '../../../public/images/Logo.svg';

// Smooth ease for transitions
const smoothEase: [number, number, number, number] = [0.4, 0, 0.2, 1];

// Spring transition for motion components
const springTransition = { type: 'spring', stiffness: 350, damping: 30, mass: 0.8 };

/***
 * SearchModal Component
 * A full-screen overlay for search functionality, including recent searches and quick links.
 */
const SearchModal = ({
    isOpen,
    onClose,
    searchQuery, // Add searchQuery to props
    setSearchQuery, // Add setSearchQuery to props
}: {
    isOpen: boolean;
    onClose: () => void;
    searchQuery: string; // Type definition for searchQuery prop
    setSearchQuery: (query: string) => void; // Type definition for setSearchQuery prop
}) => {
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [quickLinks, setQuickLinks] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const isMobileScreen = useMediaQuery('(max-width:1023px)');

    // Effect to load recent searches from local storage and fetch quick links
    useEffect(() => {
        const storedSearches = localStorage.getItem('recentSearches');
        if (storedSearches) {
            try {
                const parsed = JSON.parse(storedSearches);
                if (Array.isArray(parsed)) {
                    setRecentSearches(parsed.map(String));
                }
            } catch (e) {
                console.error('Failed to parse recent searches', e);
                localStorage.removeItem('recentSearches');
            }
        }
        const fetchQuickLinks = () => {
            setQuickLinks(['New Arrivals', 'Best Sellers', 'Sale', 'Collections', 'Accessories', 'Limited Editions', 'Men', 'Women']);
        };
        if (isOpen) {
            fetchQuickLinks();
        }
    }, [isOpen]);

    // Effect to manage focus and body scroll when modal opens/closes
    useEffect(() => {
        let focusTimeout: NodeJS.Timeout | null = null;
        if (isOpen) {
            focusTimeout = setTimeout(() => inputRef.current?.focus(), 400);
            document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
        } else {
            // Remove setSearchQuery(''); here
            document.body.style.overflow = ''; // Restore scrolling
        }
        return () => {
            if (focusTimeout) clearTimeout(focusTimeout);
            document.body.style.overflow = ''; // Ensure scroll is restored on unmount
        };
    }, [isOpen]);

    // Effect to handle clicks outside the modal to close it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    // Saves a search query to recent searches in local storage
    const saveRecentSearch = (query: string) => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) return;
        const updatedSearches = [
            trimmedQuery,
            ...recentSearches.filter((item) => item.toLowerCase() !== trimmedQuery.toLowerCase()),
        ].slice(0, 5); // Keep only the 5 most recent searches
        setRecentSearches(updatedSearches);
        try {
            localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
        } catch (error) {
            console.error('Failed to save recent searches to localStorage:', error);
        }
    };

    // Handles input change for the search query
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    // Handles form submission or quick link/recent search click
    const handleSubmitForm = (queryToSubmit: string) => {
        const trimmedQuery = queryToSubmit.trim();
        if (trimmedQuery) {
            saveRecentSearch(trimmedQuery);
            router.push(`/search?query=${encodeURIComponent(trimmedQuery)}`);
            onClose();
        }
    };

    // Handles the main search form submission
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleSubmitForm(searchQuery);
    };

    // Handles clicking on a recent search item
    const handleRecentSearchClick = (search: string) => {
        setSearchQuery(search);
        handleSubmitForm(search);
    };

    // Clears all recent searches from state and local storage
    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    // Effect to handle keyboard events (e.g., Escape key to close modal)
    useEffect(() => {
        const handleKeyDown = (e: globalThis.KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Framer Motion variants for container and items
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.07,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
    };

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: smoothEase }}
                    className={cn(
                        'fixed inset-0 flex flex-col items-center justify-start z-[101] pt-20 pb-8 overflow-y-auto custom-scrollbar',
                        'bg-white' // Background is always white
                    )}
                >
                    {/* Close Button (XIcon) - Top right one, outside the modalRef div */}
                    <motion.button
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ ...springTransition, delay: 0.1 }}
                        onClick={onClose}
                        type="button"
                        className={cn(
                            'absolute top-4 right-4 md:top-8 md:right-8 w-6 h-6 transition-colors flex items-center justify-center text-black' // Removed background and rounded-full, adjusted size
                        )}
                        aria-label="Close search"
                    >
                        <XIcon className="w-5 h-5" />
                    </motion.button>
                    <motion.div
                        ref={modalRef}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: smoothEase }}
                        className="w-full max-w-4xl px-4 relative flex flex-col items-center"
                    >
                        {/* Search Input Section */}
                        <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mb-12">
                            <div className="relative flex items-center w-full">
                                {/* Magnifying glass icon */}
                                <motion.button
                                    type="submit"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="text-black cursor-pointer" // Always black for visibility on white background
                                    aria-label="Submit search"
                                >
                                    <Search className="w-8 h-8 absolute left-0 top-1/2 -translate-y-1/2 text-neutral-700" />
                                    {/* Darker color for visibility */}
                                </motion.button>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleChange}
                                    placeholder="Хайх"
                                    className={cn(
                                        'w-full py-3 pl-10 pr-10 text-xl md:text-2xl lg:text-3xl bg-transparent border-b font-semibold focus:outline-none transition-colors duration-300',
                                        'text-black border-neutral-300 focus:border-black placeholder-neutral-500' // Darker text and border
                                    )}
                                    aria-label="Search"
                                    autoComplete="off"
                                />
                                {/* X icon to clear search field (bottom one) */}
                                {searchQuery && (
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        transition={{ ...springTransition, delay: 0.1 }}
                                        onClick={() => setSearchQuery('')} // Clears the search query
                                        type="button"
                                        className="absolute top-1/2 -translate-y-1/2 right-0 w-6 h-6 rounded-full transition-colors flex items-center justify-center bg-neutral-500 text-white" // Added grey background and white text, adjusted size
                                        aria-label="Clear search field"
                                    >
                                        <XIcon className="w-4 h-4" />
                                        {/* Adjusted icon size */}
                                    </motion.button>
                                )}
                            </div>
                        </form>
                        {/* Content Area for Recent Searches and Quick Links */}
                        <div className="w-full max-w-2xl overflow-y-auto px-0 md:px-4">
                            {/* Quick Links (Conditional Rendering) */}
                            {!isMobileScreen && ( // Only render Quick Links on non-mobile screens
                                <motion.div variants={containerVariants} initial="hidden" animate="show" exit="hidden" className="mb-10">
                                    <motion.h3 variants={itemVariants} className="text-sm font-semibold mb-4 text-neutral-700">
                                        {/* Darker header text */}
                                        Түргэн холбоос
                                    </motion.h3>
                                    <div className="space-y-2">
                                        {quickLinks.map((link, index) => (
                                            <motion.button
                                                key={index}
                                                variants={itemVariants}
                                                onClick={() => handleSubmitForm(link)}
                                                className="group w-full text-left transition-colors duration-200 flex items-center py-1.5 text-neutral-700 hover:text-black" // Darker text
                                            >
                                                {/* Conditional SVG for ChevronRight based on screen size */}
                                                {isMobileScreen ? (
                                                    <svg
                                                        height="16"
                                                        viewBox="0 0 9 16"
                                                        width="9"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="w-4 h-4 mr-2 transition-transform group-hover:translate-x-1 duration-200 text-neutral-700 group-hover:text-black"
                                                    >
                                                        <path d="m8.61248.1035-2.992.99a.5.5001-.7071-.7071l2.1366-2.1364h-6.316a.5.50010-1h6.316l-2.1368-2.1367a.5.5001.7071-.7071l2.992.99a.5.5001.0002.7073z"></path>
                                                    </svg>
                                                ) : (
                                                    <svg
                                                        height="25"
                                                        viewBox="0 0 13 25"
                                                        width="13"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="w-4 h-4 mr-2 transition-transform group-hover:translate-x-1 duration-200 text-neutral-700 group-hover:text-black"
                                                    >
                                                        <path d="m12.357713.4238-4.44444.4444a.6.6001-.8486-.8477l3.37-3.37h-9.3231a.65.650010-1.3008h9.3232l-3.37-3.37a.6.6001.8486-.8477l4.44444.4444a.5989.5989001-.0001.8474z"></path>
                                                    </svg>
                                                )}
                                                <span className="text-lg font-medium">{link}</span>
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                            {/* Recent Searches */}
                            <motion.div variants={containerVariants} initial="hidden" animate="show" exit="hidden" className="mb-4">
                                <motion.h3 variants={itemVariants} className="text-sm font-semibold mb-4 text-neutral-700">
                                    {/* Darker header text */}
                                    Саяхны хайлтууд
                                </motion.h3>
                                {recentSearches.length > 0 ? (
                                    <div className="space-y-2">
                                        {recentSearches.map((search, index) => (
                                            <motion.button
                                                key={index}
                                                variants={itemVariants}
                                                onClick={() => handleRecentSearchClick(search)}
                                                className="group w-full text-left transition-colors duration-200 flex items-center py-1.5 text-neutral-700 hover:text-black" // Darker text
                                            >
                                                {/* Conditional SVG for ChevronRight based on screen size */}
                                                {isMobileScreen ? (
                                                    <svg
                                                        height="16"
                                                        viewBox="0 0 9 16"
                                                        width="9"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="w-4 h-4 mr-2 transition-transform group-hover:translate-x-1 duration-200 text-neutral-700 group-hover:text-black"
                                                    >
                                                        <path d="m8.61248.1035-2.992.99a.5.5001-.7071-.7071l2.1366-2.1364h-6.316a.5.50010-1h6.316l-2.1368-2.1367a.5.5001.7071-.7071l2.992.99a.5.5001.0002.7073z"></path>
                                                    </svg>
                                                ) : (
                                                    <svg
                                                        height="25"
                                                        viewBox="0 0 13 25"
                                                        width="13"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="w-4 h-4 mr-2 transition-transform group-hover:translate-x-1 duration-200 text-neutral-700 group-hover:text-black"
                                                    >
                                                        <path d="m12.357713.4238-4.44444.4444a.6.6001-.8486-.8477l3.37-3.37h-9.3231a.65.650010-1.3008h9.3232l-3.37-3.37a.6.6001.8486-.8477l4.44444.4444a.5989.5989001-.0001.8474z"></path>
                                                    </svg>
                                                )}
                                                <span className="text-lg font-medium">{search}</span>
                                            </motion.button>
                                        ))}
                                    </div>
                                ) : (
                                    <motion.div variants={itemVariants} className="text-center py-8 text-sm text-neutral-600">
                                        {/* Darker text for no history message */}
                                        <Clock className="w-6 h-6 mx-auto mb-3 text-neutral-600" />
                                        {/* Darker clock icon */}
                                        Хайлтын түүх байхгүй байна.
                                    </motion.div>
                                )}
                                {recentSearches.length > 0 && (
                                    <motion.button
                                        variants={itemVariants}
                                        onClick={clearRecentSearches}
                                        className="mt-6 text-sm transition-colors duration-200 block mx-auto text-neutral-700 hover:text-black" // Darker clear button text
                                    >
                                        Цэвэрлэх
                                    </motion.button>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

/***
 * Navbar Component
 * The main navigation bar, including logo, menu, search button, cart, and auth button.
 */
const Navbar = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState(''); // State for search query in Navbar
    const isLargeScreen = useMediaQuery('(min-width:1024px)');
    const isMobile = !isLargeScreen;
    const cart = useCartStore((state) => state.cart);
    const itemCount = cart.reduce((total: number, item: { quantity: number }) => total + item.quantity, 0);

    // Close mobile menu if screen size changes to large
    useEffect(() => {
        if (isLargeScreen && isOpen) {
            setIsOpen(false);
        }
    }, [isLargeScreen, isOpen]);

    // Manage body scroll for mobile menu
    useEffect(() => {
        if (isOpen && isMobile) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen, isMobile]);

    // Effect to clear search query when search modal is closed
    // You might want to remove this if you want to remember the search query
    // This is optional based on your exact requirement
    // useEffect(() => {
    //     if (!isSearchOpen) {
    //         setSearchQuery('');
    //     }
    // }, [isSearchOpen]);

    return (
        <div className="relative w-full text-neutral-400">
            {/* Spacer for fixed header */}
            <div className="z-[99] fixed pointer-events-none inset-x-0 h-[88px]"></div>
            <header
                className={cn(
                    'fixed top-4 inset-x-0 mx-auto max-w-6xl px-2 md:px-12 z-[100]',
                    'h-12'
                )}
            >
                <Wrapper
                    className={cn(
                        'relative backdrop-blur-lg backdrop-brightness-40 rounded-xl lg:rounded-3xl border border-[rgba(124,124,124,0.2)] px-1 md:px-2 flex items-center justify-start h-full'
                    )}
                >
                    <div className="flex items-center justify-between w-full">
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
                            <motion.div whileHover={{ y: -1 }} whileTap={{ y: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 25 }}>
                                <Button
                                    size="sm"
                                    variant="tertiary"
                                    onClick={() => setIsSearchOpen(true)}
                                    className="rounded-full text-white transition-all duration-200 px-3 py-1.5 glossy-button-effect hover:brightness-125 hover:scale-105 active:scale-95"
                                    aria-label="Хайх"
                                >
                                    <Search className="w-4 h-4 relative z-10" />
                                    <span className="ml-1.5 hidden sm:inline relative z-10">Хайх</span>
                                </Button>
                            </motion.div>
                            {/* Shopping Bag Button */}
                            <motion.div whileHover={{ y: -1 }} whileTap={{ y: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 25 }}>
                                <Link
                                    href="/bag"
                                    className="relative flex items-center duration-300 transition-all ease-soft-spring text-neutral-400 hover:text-white p-1.5 rounded-full hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                                    aria-label={`Shopping bag with ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
                                >
                                    <ShoppingBag className="w-6 h-6" />
                                    <AnimatePresence>
                                        {itemCount > 0 && (
                                            <motion.span
                                                initial={{ scale: 0, y: 5 }}
                                                animate={{ scale: 1, y: 0 }}
                                                exit={{ scale: 0 }}
                                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                                className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-medium rounded-full px-1.5 leading-tight flex items-center justify-center min-w-[16px] h-[16px]"
                                                aria-hidden="true"
                                            >
                                                {itemCount > 9 ? '9+' : itemCount}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </Link>
                            </motion.div>
                            {/* AuthButton */}
                            <motion.div whileHover={{ y: -3 }} whileTap={{ y: -3 }} transition={{ type: 'spring', stiffness: 500, damping: 25 }}>
                                <AuthButton />
                            </motion.div>
                            {/* Mobile Menu Toggle Button */}
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="lg:hidden">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setIsOpen((prev) => !prev)}
                                    className="p-2 w-8 h-8 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full"
                                    aria-label={isOpen ? 'Close menu' : 'Open menu'}
                                    aria-expanded={isOpen}
                                    aria-controls="mobile-menu-content"
                                >
                                    <AnimatePresence initial={false} mode="wait">
                                        <motion.div
                                            key={isOpen ? 'x' : 'menu'}
                                            initial={{ rotate: isOpen ? 90 : -90, opacity: 0, scale: 0.5 }}
                                          animate={{ rotate: 0, opacity: 1, scale: 1 }}
                                            exit={{ rotate: isOpen ? -90 : 90, opacity: 0, scale: 0.5 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {isOpen ? <XIcon className="w-4 h-4" /> : <Icons.menu className="w-3.5 h-3.5" />}
                                        </motion.div>
                                    </AnimatePresence>
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                    {/* Mobile Menu Content */}
                    {!isLargeScreen && <MobileMenu isOpen={isOpen} setIsOpen={setIsOpen} authButton={<AuthButton />} />}
                </Wrapper>
            </header>
            {/* SearchModal Component */}
            <SearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                searchQuery={searchQuery} // Pass searchQuery
                setSearchQuery={setSearchQuery} // Pass setSearchQuery
            />
        </div>
    );
};

export default Navbar;