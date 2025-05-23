'use client'; // Ensure this is at the very top

import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
} from 'react';
import { cn } from '@/functions'; // Assuming utility function exists
import { motion, AnimatePresence } from 'framer-motion';
import { Search, XIcon, ChevronRight, Clock, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../ui/button'; // Assuming Button component exists
import { useMediaQuery } from '@/hooks/use-media-query'; // Assuming hook exists
import Icons from '../global/icons'; // Assuming Icons component exists
import Wrapper from '../global/wrapper'; // Assuming Wrapper component exists
import Menu from './menu'; // Assuming Menu component exists
import MobileMenu from './mobile-menu'; // Assuming MobileMenu component exists
import AuthButton from '../../app/(frontend)/auth/AuthButton'; // Assuming AuthButton exists
import useCartStore from '../../app/store/cartStore'; // Assuming store exists
import Logo from '../../../public/images/Logo.svg'; // Assuming Logo exists

// Enhanced Search Input Component
const EnhancedSearchInput = forwardRef<
  HTMLInputElement,
  {
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    onClear: () => void;
    onSuggestionSelect: (suggestion: string) => void;
    value: string;
    // isMobile: boolean; // FIX: Removed unused prop
    searchSuggestions: string[];
  }
>(
  (
    {
      onChange,
      onSubmit,
      onClear,
      onSuggestionSelect,
      value,
      // isMobile, // FIX: Removed unused prop
      searchSuggestions,
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [activeSuggestion, setActiveSuggestion] = useState<number | null>(null);
    const suggestionsRef = useRef<HTMLUListElement>(null);
    const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Filter suggestions based on input value
    const filteredSuggestions = value
      ? searchSuggestions
          .filter((s) => s.toLowerCase().includes(value.toLowerCase()))
          .slice(0, 5) // Limit to 5 suggestions
      : [];

    const showSuggestions = isFocused && filteredSuggestions.length > 0;

    // Reset active suggestion when value or focus changes
    useEffect(() => {
      setActiveSuggestion(null);
    }, [value, isFocused]);

    // Handle keyboard navigation for suggestions
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (showSuggestions) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setActiveSuggestion((prev) =>
            prev === null ? 0 : Math.min(prev + 1, filteredSuggestions.length - 1)
          );
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setActiveSuggestion((prev) =>
            prev === null ? filteredSuggestions.length - 1 : Math.max(prev - 1, 0)
          );
        } else if (e.key === 'Enter' && activeSuggestion !== null) {
          e.preventDefault(); // Prevent form submission if selecting suggestion
          onSuggestionSelect(filteredSuggestions[activeSuggestion]);
          setActiveSuggestion(null); // Reset after selection
        } else if (e.key === 'Escape') {
          (e.target as HTMLInputElement).blur(); // Blur input on Escape
        }
      }
    };

    // Handle input focus - clear blur timeout if exists
    const handleFocus = () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = null;
      }
      setIsFocused(true);
    };

    // Handle input blur - use timeout to allow clicking suggestions
    const handleBlur = () => {
      // Use a short timeout to allow click events on suggestions to register
      blurTimeoutRef.current = setTimeout(() => {
        setIsFocused(false);
        setActiveSuggestion(null);
        blurTimeoutRef.current = null;
      }, 150); // 150ms delay
    };

    // Scroll active suggestion into view
    useEffect(() => {
      if (activeSuggestion !== null && suggestionsRef.current) {
        const activeElement = suggestionsRef.current.children[
          activeSuggestion
        ] as HTMLLIElement;
        if (activeElement) {
          activeElement.scrollIntoView({ block: 'nearest' });
        }
      }
    }, [activeSuggestion]);

    return (
      <form
        onSubmit={onSubmit}
        className="relative w-full"
        // Prevent Enter key from submitting form when a suggestion is active
        onKeyDown={(e) => {
          if (e.key === 'Enter' && activeSuggestion !== null) e.preventDefault();
        }}
      >
        <div className="relative flex items-center">
          {/* Animated search icon */}
          <motion.div
            initial={false}
            animate={{
              scale: isFocused ? 1.05 : 1,
              x: isFocused || value ? 0 : 2, // Slight move effect
              opacity: isFocused || value ? 1 : 0.7,
              rotate: isFocused ? [0, -10, 10, -5, 5, 0] : 0, // Fun rotate animation on focus
            }}
            transition={{
              scale: { type: 'spring', stiffness: 400, damping: 25 },
              rotate: { duration: 0.5, ease: 'easeInOut', times: [0, 0.2, 0.4, 0.6, 0.8, 1] },
            }}
            className="absolute left-5 z-10 pointer-events-none"
          >
            <Search className="text-neutral-400 w-5 h-5" />
          </motion.div>

          {/* Search input field */}
          <input
            ref={ref}
            type="text"
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Хайх..." // Search placeholder in Mongolian
            className={cn(
              `w-full py-4 pl-14 pr-12 text-base bg-neutral-900/40 backdrop-blur-xl border border-neutral-800 text-white focus:outline-none focus:ring-1 focus:ring-neutral-700 focus:border-neutral-700 shadow-inner shadow-black/10 transition-all duration-300 ease-out`,
              // Dynamically change border radius based on suggestions visibility
              showSuggestions ? 'rounded-t-2xl rounded-b-none border-b-transparent' : 'rounded-2xl'
            )}
            aria-label="Search"
            autoComplete="off"
            aria-autocomplete="list"
            aria-controls="search-suggestions-list"
            aria-expanded={showSuggestions}
            role="combobox"
          />

          {/* Clear button */}
          <AnimatePresence>
            {value && (
              <motion.button
                initial={{ scale: 0.8, opacity: 0, rotate: -90 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.8, opacity: 0, rotate: 90 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                type="button"
                onClick={onClear}
                className="absolute right-4 p-1.5 rounded-full bg-neutral-800/70 hover:bg-neutral-700 transition-colors z-10"
                aria-label="Clear search query"
              >
                <XIcon className="w-3.5 h-3.5 text-neutral-400" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Search suggestions dropdown */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: -5, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -5, height: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              className="absolute z-20 w-full overflow-hidden bg-neutral-900/90 backdrop-blur-xl border border-neutral-800 border-t-0 rounded-b-xl shadow-lg"
              style={{ marginTop: '-1px' }} // Overlap border slightly
            >
              <ul
                ref={suggestionsRef}
                className="py-1 max-h-[200px] overflow-y-auto"
                id="search-suggestions-list"
                role="listbox"
              >
                {filteredSuggestions.map((suggestion, index) => (
                  <motion.li
                    key={index}
                    layout // Animate layout changes
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.1 }}
                    className={cn(
                      `px-4 py-2.5 cursor-pointer text-sm transition-colors duration-150 flex items-center gap-2.5`,
                      activeSuggestion === index
                        ? 'bg-blue-600/30 text-white' // Highlight active suggestion
                        : 'text-neutral-300 hover:bg-neutral-800/50 hover:text-white'
                    )}
                    // Prevent blur when clicking suggestion
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onSuggestionSelect(suggestion)}
                    role="option"
                    aria-selected={activeSuggestion === index}
                    id={`suggestion-${index}`}
                  >
                    <Search className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                    <span className="truncate">{suggestion}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search button (appears when input is focused) */}
        {isFocused && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.1 }}
            className="mt-4" // Spacing above button
          >
            <Button
              type="submit"
              className="w-full bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl py-3 border-none transition-all duration-300"
            >
              <motion.span
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="flex items-center justify-center"
              >
                <Search className="w-4 h-4 mr-2" />
                Хайх {/* Search button text */}
              </motion.span>
            </Button>
          </motion.div>
        )}
      </form>
    );
  }
);
EnhancedSearchInput.displayName = 'EnhancedSearchInput';

// Search Modal Component
const SearchModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [focusedRecent, setFocusedRecent] = useState<number | null>(null);
  const [quickLinks, setQuickLinks] = useState<string[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  // FIX: Removed unused state variable
  // const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

  // Debounce utility function
  // FIX: Updated generic signature to avoid 'any'
  const debounce = <F extends (...args: Parameters<F>) => ReturnType<F>>(
    func: F,
    waitFor: number
  ) => {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: Parameters<F>): Promise<ReturnType<F>> =>
      new Promise((resolve) => {
        if (timeout) {
          clearTimeout(timeout);
        }
        timeout = setTimeout(() => resolve(func(...args)), waitFor);
      });
  };

  // Fetch Search Suggestions based on Query (Debounced)
  const fetchSuggestionsDebounced = useRef(
    debounce(async (query: string) => {
      if (!query) {
        setSearchSuggestions([]);
        return;
      }
      // setIsLoadingSuggestions(true); // FIX: Removed call to unused setter
      try {
        // Use a relative path for API routes within the same Next.js app
        const apiUrl = `/api/search-suggestions?q=${encodeURIComponent(query)}`;
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        // Ensure suggestions is an array, default to empty array if not
        const suggestions = Array.isArray(data?.suggestions) ? data.suggestions : [];
        setSearchSuggestions(suggestions);
      } catch (error) {
        console.error('Failed to fetch search suggestions:', error);
        setSearchSuggestions([]); // Clear suggestions on error
      } finally {
        // setIsLoadingSuggestions(false); // FIX: Removed call to unused setter
      }
    }, 300) // 300ms debounce delay
  ).current;

  // Fetch suggestions when searchQuery changes
  useEffect(() => {
    fetchSuggestionsDebounced(searchQuery);
  }, [searchQuery, fetchSuggestionsDebounced]);

  // Fetch Quick Links (e.g., from an API or predefined list)
  const fetchQuickLinks = async () => {
    setIsLoadingLinks(true);
    // Example using an external API endpoint
    const quickLinksApiUrl = 'http://localhost:3000/api/search-suggestions'; // Replace if needed
    const fallbackLinks = ['New Arrivals', 'Best Sellers', 'Sale', 'Collections']; // Fallback data

    try {
      const response = await fetch(quickLinksApiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data?.suggestions)) {
        setQuickLinks(data.suggestions.slice(0, 8)); // Take first 8 suggestions as quick links
      } else {
        console.warn("API response for quick links did not contain a 'suggestions' array.");
        setQuickLinks(fallbackLinks); // Use fallback on unexpected format
      }
    } catch (error) {
      console.error('Failed to fetch quick links from API:', error);
      setQuickLinks(fallbackLinks); // Use fallback on error
    } finally {
      setIsLoadingLinks(false);
    }
  };

  // Effects for Loading Data, Focus, Click Outside
  useEffect(() => {
    // Load recent searches from localStorage
    const storedSearches = localStorage.getItem('recentSearches');
    if (storedSearches) {
      try {
        const parsed = JSON.parse(storedSearches);
        if (Array.isArray(parsed)) {
          // Ensure items are strings
          setRecentSearches(parsed.map(String));
        }
      } catch (e) {
        console.error('Failed to parse recent searches', e);
        localStorage.removeItem('recentSearches'); // Clear invalid data
      }
    }
    // Fetch quick links when modal opens
    if (isOpen) {
      fetchQuickLinks();
    }
   }, [isOpen]); // Dependency: only run when isOpen changes

  // Auto-focus input when modal opens
  useEffect(() => {
    let focusTimeout: NodeJS.Timeout | null = null;
    if (isOpen) {
      // Delay focus slightly to allow modal animation
      focusTimeout = setTimeout(() => inputRef.current?.focus(), 400);
    } else {
      // Reset state when modal closes
      setSearchQuery('');
      setSearchSuggestions([]);
      setFocusedRecent(null);
    }
    // Cleanup timeout on unmount or if isOpen changes
    return () => {
      if (focusTimeout) clearTimeout(focusTimeout);
    };
  }, [isOpen]);

  // Handle clicks outside the modal to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    // Cleanup listener on unmount
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Handlers
  const saveRecentSearch = (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return; // Don't save empty searches
    // Add new search, remove duplicates (case-insensitive), limit to 5
    const updatedSearches = [
      trimmedQuery,
      ...recentSearches.filter((item) => item.toLowerCase() !== trimmedQuery.toLowerCase()),
    ].slice(0, 5);
    setRecentSearches(updatedSearches);
    try {
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    } catch (error) {
      console.error('Failed to save recent searches to localStorage:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setFocusedRecent(null); // Clear recent search focus when typing
  };

  const handleClear = () => {
    setSearchQuery('');
    setSearchSuggestions([]); // Clear suggestions as well
    inputRef.current?.focus(); // Refocus input after clearing
  };

  // Handle selecting a suggestion from the dropdown
  const handleSuggestionSelect = (suggestion: string) => {
    setSearchQuery(suggestion); // Update input field
    setSearchSuggestions([]); // Clear suggestions dropdown
    handleSubmitForm(suggestion); // Submit the search
  };

  // Navigate to search results page
  const handleSubmitForm = (queryToSubmit: string) => {
    const trimmedQuery = queryToSubmit.trim();
    if (trimmedQuery) {
      saveRecentSearch(trimmedQuery); // Save before navigating
      router.push(`/search?query=${encodeURIComponent(trimmedQuery)}`);
      onClose(); // Close modal after search
    }
  };

  // Handle form submission (e.g., pressing Enter in input)
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Only submit if Enter was pressed directly in input (not on a suggestion)
    // or if there are no suggestions shown
    if (!inputRef.current?.contains(document.activeElement) || !searchSuggestions.length) {
         handleSubmitForm(searchQuery);
    }
  };

  // Handle clicking on a recent search item
  const handleRecentSearchClick = (search: string) => {
    setSearchQuery(search); // Update input field
    handleSubmitForm(search); // Submit the search
  };

  // Clear all recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
    setFocusedRecent(null); // Reset focus state
  };

  // Keyboard Navigation (Escape only for closing modal)
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

  // Animation Configurations
  const modalSpringConfig = { type: 'spring', stiffness: 350, damping: 30, mass: 0.8 };
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  // Render JSX
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          /* Backdrop */
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-start lg:items-center justify-center z-50 px-4 pt-16 lg:pt-4 pb-4" // Added padding
        >
          <motion.div
            /* Modal Box */
            ref={modalRef}
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ ...modalSpringConfig, exit: { duration: 0.2, ease: 'easeInOut' } }}
            className="bg-neutral-900/70 backdrop-blur-xl border border-neutral-800 rounded-3xl w-full max-w-[640px] p-6 md:p-8 shadow-2xl relative overflow-hidden max-h-[calc(100vh-5rem)] lg:max-h-[90vh] flex flex-col" // Max height and flex column
          >
            {/* Optional Background Gradients */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
              {/* Add gradient elements here if desired */}
            </div>

            {/* Fixed Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
              className="mb-5 flex items-center flex-shrink-0" // Prevent header from shrinking
            >
              <Search className="w-5 h-5 text-neutral-300 mr-2.5" />
              <h2 className="text-xl md:text-2xl font-medium text-white">Хайх</h2>
            </motion.div>

            {/* Search Input Area */}
            <div className="mb-6 flex-shrink-0 relative z-10">
              <EnhancedSearchInput
                ref={inputRef}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onClear={handleClear}
                onSuggestionSelect={handleSuggestionSelect}
                value={searchQuery}
                // isMobile={isMobile} // Prop removed from EnhancedSearchInput
                searchSuggestions={searchSuggestions}
              />
            </div>

            {/* Scrollable Content Area */}
            <div className="overflow-y-auto flex-grow min-h-0 pr-1 mr-[-4px]"> {/* Allow content to scroll */}
              {!searchQuery && ( // Show recent searches and quick links only when query is empty
                <>
                  {/* Recent Searches Section */}
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    className="mb-8 text-neutral-300"
                  >
                    <motion.div variants={itemVariants} className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-medium text-neutral-400 flex items-center">
                        <Clock className="w-4 h-4 mr-2 opacity-70" />
                        Саяхных айлтууд {/* Recent Searches Title */}
                      </h3>
                      {recentSearches.length > 0 && (
                        <motion.button
                          onClick={clearRecentSearches}
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="text-xs text-neutral-500 hover:text-neutral-300 px-2 py-1 rounded-md hover:bg-neutral-800/50 transition-colors"
                        >
                          Цэвэрлэх {/* Clear Button */}
                        </motion.button>
                      )}
                    </motion.div>
                    {recentSearches.length > 0 ? (
                      <ul className="space-y-1.5">
                        {recentSearches.map((search, index) => (
                          <motion.li
                            key={index}
                            variants={itemVariants}
                            custom={index} // Stagger based on index
                            className={cn(
                              `cursor-pointer hover:bg-neutral-800/60 px-4 py-3 rounded-xl transition-all duration-200 flex items-center group text-sm`,
                              focusedRecent === index ? 'bg-neutral-800/70 text-white ring-1 ring-neutral-700' : 'text-neutral-300'
                            )}
                            onClick={() => handleRecentSearchClick(search)}
                            onMouseEnter={() => setFocusedRecent(index)}
                            onMouseLeave={() => setFocusedRecent(null)}
                            role="button"
                            tabIndex={0} // Make it focusable
                            onKeyDown={(e) => { // Allow selection with Enter/Space
                              if (e.key === 'Enter' || e.key === ' ') handleRecentSearchClick(search);
                            }}
                          >
                            <motion.div
                               animate={{
                                   x: focusedRecent === index ? 2 : 0,
                                   opacity: focusedRecent === index ? 1 : 0.6,
                                   scale: focusedRecent === index ? 1.1 : 1
                               }}
                               transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                                <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-neutral-300 mr-3" />
                            </motion.div>
                            <span className="truncate">{search}</span>
                          </motion.li>
                        ))}
                      </ul>
                    ) : (
                      <motion.div
                        variants={itemVariants}
                        className="text-center py-6 text-sm text-neutral-500 bg-neutral-900/30 rounded-2xl border border-neutral-800/50"
                      >
                        <p>Саяхных айлт байхгүй</p> {/* No Recent Searches Message */}
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Quick Links Section */}
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    className="mb-4" // Margin at the bottom
                  >
                    <motion.h3 variants={itemVariants} className="text-sm font-medium text-neutral-400 mb-4 flex items-center">
                       <ShoppingBag className="w-3.5 h-3.5 text-neutral-500 mr-2"/>
                       Түргэн холбоос {/* Quick Links Title */}
                    </motion.h3>
                    {isLoadingLinks ? (
                      // Skeleton loader for quick links
                      <div className="grid grid-cols-2 gap-3">
                        {[...Array(6)].map((_, index) => ( // Show 6 skeleton items
                          <motion.div
                            key={index}
                            className="h-12 bg-neutral-800/40 border border-neutral-700/30 rounded-xl overflow-hidden relative animate-pulse"
                          />
                        ))}
                      </div>
                    ) : (
                      // Actual quick links grid
                      <div className="grid grid-cols-2 gap-3">
                        {quickLinks.map((category, index) => (
                          <motion.button
                            key={category + index} // Use category + index for key
                            type="button"
                            className="text-left px-4 py-3 bg-neutral-800/40 hover:bg-neutral-800/80 border border-neutral-700/30 rounded-xl text-neutral-300 transition-all relative overflow-hidden group text-sm"
                            variants={itemVariants}
                            custom={index} // Stagger animation
                            whileHover={{ scale: 1.02, y: -2, transition: { type: "spring", stiffness: 400, damping: 15 } }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSubmitForm(category)} // Submit category as search query
                          >
                            {/* Subtle hover gradient effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <span className="relative z-10 truncate">{category}</span>
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </>
              )}
            </div>

            {/* Close button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              onClick={onClose}
              type="button"
              className="absolute top-5 right-5 md:top-6 md:right-6 bg-neutral-800/40 hover:bg-neutral-700/50 p-2.5 rounded-full transition-colors flex-shrink-0 z-20" // Ensure it's above content
              aria-label="Close search"
            >
              <XIcon className="w-4 h-4 text-neutral-400" />
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Navbar Component
// Navbar Component
const Navbar = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false); // Mobile menu state
  const [isSearchOpen, setIsSearchOpen] = useState(false); // Search modal state
  const isLargeScreen = useMediaQuery('(min-width: 1024px)');
  // Fix: Variable is used in useEffect, so keep it but tell ESLint to ignore the warning
   const isMobile = !isLargeScreen; 
  const cart = useCartStore((state) => state.cart);
  const itemCount = cart.reduce((total: number, item: { quantity: number }) => total + item.quantity, 0);

  // Effect to close mobile menu on resize to larger screen
  useEffect(() => {
    if (isLargeScreen && isOpen) {
      setIsOpen(false);
    }
  }, [isLargeScreen, isOpen]);

  // Effect for body scroll lock when mobile menu is open
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    // Cleanup function to reset overflow on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isMobile]);

  // Rest of the component remains unchanged
  return (
    <div className="relative w-full text-neutral-400">
      {/* Fixed header spacing - Adjusted Height */}
      <div className="z-[99] fixed pointer-events-none inset-x-0 h-[88px]"></div> {/* Spacer div */}

      {/* Main Navbar Header - Adjusted Height Logic */}
      <header
        className={cn(
          'fixed top-4 inset-x-0 mx-auto max-w-6xl px-2 md:px-12 z-[100] transform transition-all duration-300 ease-out', // Added transition-all
          // Height controlled by mobile menu state
          isOpen ? 'h-[calc(100%-24px)]' : 'h-12' // Use h-12 when collapsed
        )}
      >
        {/* Wrapper: applies background, border, rounded corners */}
        {/* Removed fixed height from Wrapper, header tag controls height now */}
        <Wrapper className="relative backdrop-blur-lg backdrop-brightness-75 rounded-xl lg:rounded-3xl border border-[rgba(124,124,124,0.2)] px-1 md:px-2 flex items-center justify-start h-full">
          {/* Header Content Row - Adjusted vertical alignment */}
          {/* Added sticky and margin auto for vertical centering within the dynamic header height */}
          <div className="flex items-center justify-between w-full sticky mt-[7px] lg:mt-auto mb-auto inset-x-0">
            {/* Left side: Logo and Desktop Menu */}
            <div className="flex items-center gap-4 flex-shrink-0 pl-0"> {/* Ensure no extra padding */}
              {/* Logo - Adjusted Size */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/"
                  className="text-lg font-semibold transition-colors text-foreground bg-[#232323] hover:bg-neutral-900 py-0 px-[5px] rounded-full border border-neutral-700 flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label="Homepage"
                >
                  <Image
                    height={60} // Adjusted Height
                    width={60} // Adjusted Width
                    src={Logo}
                    alt="Saint Logo"
                    priority
                    className="transition-transform duration-300 transform px-1" // Keep inner padding?
                  />
                </Link>
              </motion.div>
              {/* Desktop Menu */}
              <div className="items-center hidden lg:flex">
                <Menu />
              </div>
            </div>

            {/* Right side: Icons */}
            <div className="flex items-center gap-2 lg:gap-4"> {/* Use gap */}
              {/* Search Button */}
              <motion.div whileHover={{ y: -1 }} whileTap={{ y: 1 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>
                <Button
                  size="sm"
                  variant="tertiary"
                  onClick={() => setIsSearchOpen(true)}
                  className="rounded-full text-white border border-neutral-700 transition-all duration-200 hover:bg-neutral-800 px-3 py-1.5"
                  aria-label="Хайх" // Search aria label
                >
                  <Search className="w-4 h-4" />
                  <span className="ml-1.5 hidden sm:inline">Хайх</span> {/* Search text */}
                </Button>
              </motion.div>

              {/* Shopping Bag Link */}
              <motion.div whileHover={{ y: -1 }} whileTap={{ y: 1 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>
                <Link
                  href="/bag"
                  className="relative flex items-center duration-300 transition-all ease-soft-spring text-neutral-400 hover:text-white p-1.5 rounded-full hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label={`Shopping bag with ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
                >
                  <ShoppingBag className="w-6 h-6" /> {/* Adjusted size slightly */}
                  {/* Cart item count badge */}
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
                        {itemCount > 9 ? '9+' : itemCount} {/* Show 9+ if count > 9 */}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>

              {/* Auth Button */}
              <motion.div whileHover={{ y: -1 }} whileTap={{ y: 1 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>
                <AuthButton />
              </motion.div>

              {/* Mobile Menu Toggle */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="lg:hidden">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsOpen((prev) => !prev)}
                  className="p-2 w-8 h-8 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full"
                  aria-label={isOpen ? "Close menu" : "Open menu"}
                  aria-expanded={isOpen}
                  aria-controls="mobile-menu-content"
                >
                  {/* Animated Icon Swap */}
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

          {/* Mobile Menu Component */}
          {/* Render only on mobile screens */}
          {!isLargeScreen && (
            <MobileMenu isOpen={isOpen} setIsOpen={setIsOpen} authButton={<AuthButton />} />
          )}
        </Wrapper>
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};

export default Navbar;

 