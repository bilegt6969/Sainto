'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ChevronDown, X, Filter } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// --- TYPE DEFINITIONS ---
interface FilterOption {
  value: string
  label: string
  count?: number
}

interface FilterSection {
  id: string
  title: string
  type: 'checkbox' | 'radio' | 'range'
  options: FilterOption[]
}

// --- MAIN COMPONENT ---
const FiltersPanel = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({})
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['brand', 'category']))
  const [isLoading, setIsLoading] = useState(false)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // --- COMPREHENSIVE FILTER DATA ---
  const filterSections: FilterSection[] = [
    {
        id: 'brand',
        title: 'Brand',
        type: 'checkbox',
        options: [
            { value: 'adidas', label: 'adidas' },
            { value: 'air jordan', label: 'Air Jordan' },
            { value: 'asics', label: 'ASICS' },
            { value: 'balenciaga', label: 'Balenciaga' },
            { value: 'bape', label: 'BAPE' },
            { value: 'burberry', label: 'Burberry' },
            { value: 'comme des garcons play', label: 'CDG Play' },
            { value: 'converse', label: 'Converse' },
            { value: 'dior', label: 'Dior' },
            { value: 'fear of god', label: 'Fear Of God' },
            { value: 'gucci', label: 'Gucci' },
            { value: 'kith', label: 'Kith' },
            { value: 'louis vuitton', label: 'Louis Vuitton' },
            { value: 'new balance', label: 'New Balance' },
            { value: 'nike', label: 'Nike' },
            { value: 'off white', label: 'Off-White' },
            { value: 'puma', label: 'Puma' },
            { value: 'stone island', label: 'Stone Island' },
            { value: 'stussy', label: 'Stussy' },
            { value: 'supreme', label: 'Supreme' },
            { value: 'the north face', label: 'The North Face' },
            { value: 'ugg', label: 'Ugg' },
            { value: 'vans', label: 'Vans' },
            { value: 'yeezy', label: 'Yeezy' },
        ],
    },
    {
      id: 'web_groups', // Aligned with HTML hrefs
      title: 'Category',
      type: 'checkbox',
      options: [
        { value: 'sneakers', label: 'Sneakers' },
        { value: 'apparel', label: 'Apparel' },
        { value: 'space', label: 'Home' },
      ],
    },
    {
      id: 'gender',
      title: 'Gender',
      type: 'checkbox',
      options: [
        { value: 'men', label: 'Men' },
        { value: 'women', label: 'Women' },
        { value: 'youth', label: 'Youth' },
        { value: 'infant', label: 'Infant' },
      ],
    },
    {
        id: 'color',
        title: 'Color',
        type: 'checkbox',
        options: [
            { value: 'white', label: 'White' },
            { value: 'grey', label: 'Grey' },
            { value: 'black', label: 'Black' },
            { value: 'green', label: 'Green' },
            { value: 'blue', label: 'Blue' },
            { value: 'purple', label: 'Purple' },
            { value: 'pink', label: 'Pink' },
            { value: 'red', label: 'Red' },
            { value: 'orange', label: 'Orange' },
            { value: 'yellow', label: 'Yellow' },
            { value: 'cream', label: 'Cream' },
            { value: 'tan', label: 'Tan' },
            { value: 'brown', label: 'Brown' },
            { value: 'silver', label: 'Silver' },
            { value: 'gold', label: 'Gold' },
            { value: 'multi-color', label: 'Multi-Color' },
        ]
    },
    {
      id: 'size_converted',
      title: 'Size',
      type: 'checkbox',
      options: [
        { value: 'us_sneakers_men_4', label: 'US 4' },
        { value: 'us_sneakers_men_5', label: 'US 5' },
        { value: 'us_sneakers_men_6', label: 'US 6' },
        { value: 'us_sneakers_men_7', label: 'US 7' },
        { value: 'us_sneakers_men_8', label: 'US 8' },
        { value: 'us_sneakers_men_9', label: 'US 9' },
        { value: 'us_sneakers_men_10', label: 'US 10' },
        { value: 'us_sneakers_men_11', label: 'US 11' },
        { value: 'us_sneakers_men_12', label: 'US 12' },
        { value: 'us_sneakers_men_13', label: 'US 13' },
      ],
    },
    {
      id: 'product_condition', // Aligned with HTML hrefs
      title: 'Condition',
      type: 'checkbox',
      options: [
        { value: 'new_no_defects', label: 'New' },
        { value: 'new_with_defects', label: 'New with Defects' },
        { value: 'used', label: 'Used' },
      ],
    },
    {
      id: 'gp_instant_ship_lowest_price_cents', // Aligned with API
      title: 'Price',
      type: 'checkbox',
      options: [
        { value: '0-10000', label: 'Under $100' },
        { value: '10000-20000', label: '$100 - $200' },
        { value: '20000-50000', label: '$200 - $500' },
        { value: '50000-', label: 'Over $500' },
      ],
    },
    {
        id: 'release_date_year', // Aligned with HTML hrefs
        title: 'Release Year',
        type: 'checkbox',
        options: [
            { value: '2025', label: '2025' },
            { value: '2024', label: '2024' },
            { value: '2023', label: '2023' },
            { value: '2022', label: '2022' },
            { value: '2021', label: '2021' },
            { value: '2020', label: '2020' },
            { value: '2019', label: '2019' },
        ]
    }
  ]

  // --- EFFECTS ---
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const newActiveFilters: Record<string, string[]> = {}
    filterSections.forEach(section => {
      const values = params.getAll(section.id)
      if (values.length > 0) {
        newActiveFilters[section.id] = values
      }
    })
    setActiveFilters(newActiveFilters)
  }, [searchParams])

  useEffect(() => {
    document.body.style.overflow = isPanelOpen ? 'hidden' : 'unset'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isPanelOpen])

  // --- HANDLERS ---
  const updateURL = (filters: Record<string, string[]>) => {
    const params = new URLSearchParams()
    // Preserve existing non-filter params like 'sort' or 'query'
    searchParams.forEach((value, key) => {
      if (!filterSections.some(section => section.id === key)) {
        params.append(key, value)
      }
    })

    Object.entries(filters).forEach(([key, values]) => {
      values.forEach(val => params.append(key, val))
    })

    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    // A small delay to perceive the loading state
    setTimeout(() => setIsLoading(false), 250)
  }

  const handleFilterChange = (sectionId: string, value: string) => {
    setIsLoading(true)
    const newActiveFilters = { ...activeFilters }
    const currentValues = newActiveFilters[sectionId] || []

    if (currentValues.includes(value)) {
      newActiveFilters[sectionId] = currentValues.filter(v => v !== value)
      if (newActiveFilters[sectionId].length === 0) {
        delete newActiveFilters[sectionId]
      }
    } else {
      newActiveFilters[sectionId] = [...currentValues, value]
    }
    setActiveFilters(newActiveFilters)
    updateURL(newActiveFilters)
  }

  const clearAllFilters = () => {
    if (Object.keys(activeFilters).length === 0) return
    setIsLoading(true)
    setActiveFilters({})
    updateURL({})
  }

  const toggleSection = (sectionId: string) => {
    const newOpenSections = new Set(openSections)
    if (newOpenSections.has(sectionId)) {
      newOpenSections.delete(sectionId)
    } else {
      newOpenSections.add(sectionId)
    }
    setOpenSections(newOpenSections)
  }

  const togglePanel = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setIsPanelOpen(!isPanelOpen)
    setTimeout(() => setIsAnimating(false), 600)
  }

  // --- RENDER LOGIC ---
  const isFiltered = Object.keys(activeFilters).length > 0
  const totalActiveFilters = Object.values(activeFilters).reduce(
    (sum, values) => sum + values.length,
    0,
  )

  return (
    <>
      {/* Sticky Filter Button */}
      <motion.div
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50"
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <button
          onClick={togglePanel}
          disabled={isAnimating}
          className={`flex items-center gap-3 px-6 py-3.5 rounded-full shadow-lg backdrop-blur-lg border transition-colors ${
            isPanelOpen
              ? 'bg-white/20 border-white/30 text-white'
              : 'bg-gray-900/90 border-gray-700/50 text-white hover:bg-gray-800'
          }`}
        >
          <motion.div
            animate={{ rotate: isPanelOpen ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <Filter size={20} strokeWidth={2.5} />
          </motion.div>
          <span className="font-semibold text-sm tracking-wide">
            {isPanelOpen ? 'Close' : 'Filters'}
          </span>
          {totalActiveFilters > 0 && (
            <motion.div
              className="w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            >
              {totalActiveFilters > 9 ? '9+' : totalActiveFilters}
            </motion.div>
          )}
        </button>
      </motion.div>

      {/* Backdrop */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={togglePanel}
          />
        )}
      </AnimatePresence>

      {/* Filter Panel */}
      <motion.div
        className="fixed inset-x-0 bottom-0 z-50"
        initial={{ y: '100%', scale: 0.95 }}
        animate={{ y: isPanelOpen ? 0 : '100%', scale: isPanelOpen ? 1 : 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="mx-4 mb-4 bg-white/95 rounded-3xl shadow-2xl overflow-hidden border border-gray-100/50 max-w-3xl mx-auto">
          <div className="relative bg-gradient-to-b from-white/90 to-white/80 backdrop-blur-xl">
            {/* Loading Overlay */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-30 rounded-3xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative">
                    <motion.div
                      className="w-8 h-8 border-3 border-gray-200 border-t-blue-500 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <motion.div
                      className="absolute inset-0 w-8 h-8 border-3 border-transparent border-l-blue-300 rounded-full"
                      animate={{ rotate: -360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Handle */}
            <div className="flex justify-center pt-4 pb-2">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full transition-colors hover:bg-gray-400" />
            </div>

            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <motion.div className="p-2 bg-blue-50 rounded-xl" whileHover={{scale: 1.1}} transition={{type: 'spring', stiffness: 400, damping: 15}}>
                        <Filter size={20} className="text-blue-600" strokeWidth={2.5}/>
                    </motion.div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Filter Results</h2>
                        <p className="text-sm text-gray-500 mt-1">{totalActiveFilters > 0 ? `${totalActiveFilters} active filter${totalActiveFilters > 1 ? 's': ''}` : 'Refine your search'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {isFiltered && (
                        <motion.button onClick={clearAllFilters} className="px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
                            Clear All
                        </motion.button>
                    )}
                    <motion.button onClick={togglePanel} className="p-2 hover:bg-gray-100 rounded-xl" whileHover={{scale: 1.1}} whileTap={{scale: 0.9}}>
                        <X size={22} strokeWidth={2.5} className="text-gray-400 hover:text-gray-600" />
                    </motion.button>
                </div>
              </div>
            </div>
            
            {/* Active Filters */}
            <AnimatePresence>
            {isFiltered && (
                <motion.div 
                    className="px-6 py-4 bg-gradient-to-r from-blue-50/50 to-purple-50/30 border-b border-gray-100/80"
                    initial={{opacity: 0, y: -10}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: -10}}
                    transition={{duration: 0.2}}
                >
                    <div className="flex flex-wrap gap-2">
                    {Object.entries(activeFilters).map(([sectionId, values]) => (
                        values.map(value => {
                            const section = filterSections.find(s => s.id === sectionId)
                            const option = section?.options.find(o => o.value === value)
                            return (
                                <motion.div 
                                    key={`${sectionId}-${value}`} 
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-full text-sm font-medium shadow-sm border border-gray-200 hover:bg-blue-50 hover:border-blue-200"
                                    initial={{scale: 0.8, opacity: 0}}
                                    animate={{scale: 1, opacity: 1}}
                                    exit={{scale: 0.8, opacity: 0}}
                                    transition={{type: 'spring', stiffness: 400, damping: 15}}
                                >
                                    <span>{option?.label || value}</span>
                                    <motion.button onClick={() => handleFilterChange(sectionId, value)} className="p-1 hover:bg-blue-100 rounded-full" whileHover={{scale: 1.2}} whileTap={{scale: 0.8}}>
                                        <X size={12} strokeWidth={3} className="text-gray-400 hover:text-blue-600" />
                                    </motion.button>
                                </motion.div>
                            )
                        })
                    ))}
                    </div>
                </motion.div>
            )}
            </AnimatePresence>

            {/* Filter Sections */}
            <div className="max-h-[70vh] overflow-y-auto scrollbar-hide">
              <div className="divide-y divide-gray-100/80">
                {filterSections.map(section => {
                  const isOpen = openSections.has(section.id)
                  const activeCount = activeFilters[section.id]?.length || 0
                  return (
                    <div key={section.id} className="group">
                      {/* Section Header */}
                      <motion.button
                        onClick={() => toggleSection(section.id)}
                        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50/70"
                        whileHover={{ backgroundColor: 'rgba(243, 244, 246, 0.7)' }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center gap-4">
                            <motion.div 
                                className={`w-2 h-2 rounded-full ${activeCount > 0 ? 'bg-blue-500' : 'bg-gray-300'}`}
                                animate={{scale: activeCount > 0 ? 1.25 : 1}}
                                transition={{type: 'spring', stiffness: 400, damping: 15}}
                            />
                            <div>
                                <h3 className="font-semibold text-gray-900 text-lg">{section.title}</h3>
                                {activeCount > 0 && (
                                    <p className="text-sm text-blue-600 font-medium mt-0.5">{activeCount} selected</p>
                                )}
                            </div>
                        </div>
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        >
                          <ChevronDown size={20} strokeWidth={2.5} className={`text-gray-400 ${isOpen ? 'text-blue-500': ''}`} />
                        </motion.div>
                      </motion.button>
                      {/* Section Content */}
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-5 space-y-3 bg-gray-50/30">
                              {section.options.map(option => {
                                const isActive =
                                  activeFilters[section.id]?.includes(option.value) || false
                                return (
                                  <motion.label
                                    key={option.value}
                                    className="group/option flex items-center gap-4 py-2 cursor-pointer hover:bg-white/60 -mx-2 px-3 rounded-xl"
                                    whileHover={{scale: 1.02}}
                                    transition={{type: 'spring', stiffness: 400, damping: 20}}
                                  >
                                    <div className="relative">
                                      <input
                                        type="checkbox"
                                        checked={isActive}
                                        onChange={() => handleFilterChange(section.id, option.value)}
                                        className="sr-only peer"
                                      />
                                       <motion.div 
                                            className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center ${isActive ? 'bg-blue-500 border-blue-500 shadow-lg shadow-blue-500/25' : 'border-gray-300'}`}
                                            animate={{scale: isActive ? 1.1 : 1}}
                                            transition={{type: 'spring', stiffness: 500, damping: 15}}
                                        >
                                          {isActive && (
                                            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="currentColor">
                                              <path d="M10.28.28a.75.75 0 0 1 0 1.06l-6.5 6.5a.75.75 0 0 1-1.06 0L.22 5.34a.75.75 0 0 1 1.06-1.06L4.25 7.72l5.97-5.97a.75.75 0 0 1 1.06 0z" />
                                            </svg>
                                          )}
                                        </motion.div>
                                    </div>
                                    <div className="flex items-center justify-between flex-1 min-w-0">
                                      <span className="text-gray-700 group-hover/option:text-gray-900 font-medium">{option.label}</span>
                                      {option.count && (
                                        <span className="text-xs text-gray-400 font-semibold bg-gray-100 px-2 py-1 rounded-full">{option.count.toLocaleString()}</span>
                                      )}
                                    </div>
                                  </motion.label>
                                )
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100/80">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Showing results with selected filters</span>
                <div className="flex items-center gap-2">
                    <motion.div className="w-2 h-2 bg-green-400 rounded-full" animate={{scale: [1, 1.2, 1]}} transition={{duration: 1.5, repeat: Infinity}} />
                    <span className="font-medium">Live updates</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .border-3 {
            border-width: 3px;
        }
      `}</style>
    </>
  )
}

export default FiltersPanel