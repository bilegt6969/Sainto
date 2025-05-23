'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion' // Assuming this is from shadcn/ui
import { cn } from '@/functions'
import { useClickOutside } from '@/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarRangeIcon,
  ChevronRight, // Using ChevronRight for accordion indicator
  CircleHelp,
  HashIcon,
  Layers3,
  Newspaper,
  ShoppingBag,
  Tags,
  TrendingUp,
  UsersIcon,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'

interface Props {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  authButton?: React.ReactNode
}

const MobileMenu = ({ isOpen, setIsOpen, authButton }: Props) => {
  const ref = useClickOutside(() => setIsOpen(false))

  // Apple-inspired animation variants
  const variants = {
    open: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { opacity: 0, y: -20, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  }

  // Base classes for list items (Apple Style)
  // text-base or text-[17px] is common for Apple lists
  const baseItemClasses =
    'flex items-center w-full text-start px-5 py-3 text-[17px] font-medium text-neutral-900 dark:text-neutral-100 transition-colors duration-150 ease-in-out'
  const hoverActiveClasses = 'hover:text-neutral-600 dark:hover:text-neutral-400 active:text-neutral-500 dark:active:text-neutral-500' // Subtle hover/active
  const separatorClasses = 'border-b border-neutral-200/70 dark:border-neutral-800/70' // Subtle separator

  // Sub-item specific classes
  const subItemClasses = cn(baseItemClasses, 'pl-10 font-normal') // Indent and potentially lighter weight

  // Helper function to close menu on click
  const handleLinkClick = () => setIsOpen(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={ref}
          initial="closed"
          animate="open"
          exit="closed"
          variants={variants}
          // Apple-style container: positioning, blur, background, shadow
          className={cn(
            'absolute top-16 inset-x-0 max-h-[calc(100vh-80px)] overflow-y-auto z-50 p-3 md:p-4', // Adjusted padding slightly
          )}
        >
          {/* Inner container for background, border, shadow, blur */}
          <div className="w-full bg-neutral-100/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-300/50 dark:border-neutral-700/50 rounded-2xl shadow-xl overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.2 }} // Simple fade-in for content
              className="flex flex-col justify-start"
            >
              {/* Optional Auth Button Area - styled similarly */}
              {authButton && (
                <div className={cn("w-full px-3 py-2", separatorClasses)}>
                  {authButton}
                </div>
              )}

              <ul className="flex flex-col items-start w-full"> {/* Removed space-y, using borders */}
                {/* For You */}
                <li onClick={handleLinkClick} className={cn(separatorClasses)}>
                  <Link href="/for-you" className={cn(baseItemClasses, hoverActiveClasses)}>
                    <TrendingUp className="w-4 h-4 mr-4 flex-shrink-0 text-neutral-600 dark:text-neutral-400" />
                    For You
                  </Link>
                </li>

                {/* Categories Accordion */}
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="categories" className={cn("border-transparent", separatorClasses)}>
                    {/* Custom Trigger Styling */}
                    <AccordionTrigger className={cn(baseItemClasses, hoverActiveClasses, '[&[data-state=open]>svg]:rotate-90')}>
                      <ShoppingBag className="w-4 h-4 mr-4 flex-shrink-0 text-neutral-600 dark:text-neutral-400" />
                      <span className="flex-1 text-start">Categories</span>
                      <ChevronRight className="w-4 h-4 ml-auto transition-transform duration-200 text-neutral-400 dark:text-neutral-600" />
                    </AccordionTrigger>
                    <AccordionContent className="pt-0 pb-1 pr-1 overflow-hidden"> {/* Adjusted padding */}
                      <ul className="flex flex-col">
                        {/* Shop All */}
                        <li onClick={handleLinkClick}>
                          <Link href="/shop-all" className={cn(subItemClasses, hoverActiveClasses)}>
                             <ShoppingBag className="w-4 h-4 mr-4 flex-shrink-0 text-neutral-500 dark:text-neutral-500" />
                             Shop All Categories
                          </Link>
                        </li>
                         {/* Category Items */}
                        {[
                            { title: "Sneakers", href: "/categories/sneakers", icon: <HashIcon className="w-4 h-4 mr-4 flex-shrink-0 text-neutral-500 dark:text-neutral-500" /> },
                            { title: "Apparel", href: "/categories/apparel", icon: <UsersIcon className="w-4 h-4 mr-4 flex-shrink-0 text-neutral-500 dark:text-neutral-500" /> },
                            { title: "Accessories", href: "/categories/accessories", icon: <CalendarRangeIcon className="w-4 h-4 mr-4 flex-shrink-0 text-neutral-500 dark:text-neutral-500" /> }
                        ].map((item) => (
                             <li key={item.title} onClick={handleLinkClick}>
                                  <Link href={item.href} className={cn(subItemClasses, hoverActiveClasses)}>
                                      {item.icon}
                                      {item.title}
                                  </Link>
                             </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Brands Accordion */}
                <Accordion type="single" collapsible className="w-full">
                 <AccordionItem value="brands" className={cn("border-transparent", separatorClasses)}>
                    <AccordionTrigger className={cn(baseItemClasses, hoverActiveClasses, '[&[data-state=open]>svg]:rotate-90')}>
                      <Tags className="w-4 h-4 mr-4 flex-shrink-0 text-neutral-600 dark:text-neutral-400" />
                       <span className="flex-1 text-start">Brands</span>
                       <ChevronRight className="w-4 h-4 ml-auto transition-transform duration-200 text-neutral-400 dark:text-neutral-600" />
                    </AccordionTrigger>
                    <AccordionContent className="pt-0 pb-1 pr-1 overflow-hidden">
                      <ul className="flex flex-col">
                         {/* Brand Items */}
                         {[
                            { title: "Nike", href: "/brands/nike", logo: "/logos/nike.svg" },
                            { title: "Adidas", href: "/brands/adidas", logo: "/logos/adidas.svg" },
                            { title: "Stüssy", href: "/brands/stussy", logo: "/logos/stussy.svg" },
                            { title: "Bape", href: "/brands/bape", logo: "/logos/bape.svg" },
                            { title: "Air Jordan", href: "/brands/air-jordan", logo: "/logos/air-jordan.svg" },
                            { title: "Supreme", href: "/brands/supreme", logo: "/logos/supreme.svg" }
                         ].map((brand) => (
                             <li key={brand.title} onClick={handleLinkClick}>
                                  <Link href={brand.href} className={cn(subItemClasses, hoverActiveClasses, "flex items-center")}>
                                      <div className="relative w-5 h-5 mr-4 flex-shrink-0">
                                          <Image
                                              src={brand.logo}
                                              alt={`${brand.title} logo`}
                                              fill
                                              sizes="20px"
                                              className="object-contain"
                                          />
                                      </div>
                                      {brand.title}
                                  </Link>
                             </li>
                         ))}
                         {/* View All Brands */}
                         <li onClick={handleLinkClick}>
                             <Link href="/brands" className={cn(subItemClasses, 'text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 font-medium')}> {/* Explicit link color */}
                                  View all brands
                                  <ChevronRight className="w-4 h-4 ml-1 inline-block" />
                             </Link>
                         </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Resources Accordion */}
                <Accordion type="single" collapsible className="w-full">
                   <AccordionItem value="resources" className={cn("border-transparent", separatorClasses)}>
                    <AccordionTrigger className={cn(baseItemClasses, hoverActiveClasses, '[&[data-state=open]>svg]:rotate-90')}>
                        <Layers3 className="w-4 h-4 mr-4 flex-shrink-0 text-neutral-600 dark:text-neutral-400" />
                        <span className="flex-1 text-start">Resources</span>
                        <ChevronRight className="w-4 h-4 ml-auto transition-transform duration-200 text-neutral-400 dark:text-neutral-600" />
                    </AccordionTrigger>
                    <AccordionContent className="pt-0 pb-1 pr-1 overflow-hidden">
                       <ul className="flex flex-col">
                         {/* Resource Items */}
                         {[
                            { title: "Blog", href: "/resources/blog", icon: <Newspaper className="w-4 h-4 mr-4 flex-shrink-0 text-neutral-500 dark:text-neutral-500" /> },
                            { title: "Support", href: "/resources/support", icon: <CircleHelp className="w-4 h-4 mr-4 flex-shrink-0 text-neutral-500 dark:text-neutral-500" /> },
                            { title: "Style Guide", href: "/resources/style-guide", icon: <TrendingUp className="w-4 h-4 mr-4 flex-shrink-0 text-neutral-500 dark:text-neutral-500" /> },
                            { title: "Size Charts", href: "/resources/size-guide", icon: <CalendarRangeIcon className="w-4 h-4 mr-4 flex-shrink-0 text-neutral-500 dark:text-neutral-500" /> }
                         ].map((item) => (
                             <li key={item.title} onClick={handleLinkClick}>
                                  <Link href={item.href} className={cn(subItemClasses, hoverActiveClasses)}>
                                      {item.icon}
                                      {item.title}
                                  </Link>
                             </li>
                         ))}
                       </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Help */}
                <li onClick={handleLinkClick}> {/* No border-bottom on the last item */}
                  <Link href="/HelpPage" className={cn(baseItemClasses, hoverActiveClasses)}>
                    <CircleHelp className="w-4 h-4 mr-4 flex-shrink-0 text-neutral-600 dark:text-neutral-400" />
                    Help
                  </Link>
                </li>
              </ul>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default MobileMenu