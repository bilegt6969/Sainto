'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '../../../lib/utils' // Assuming standard utils path, adjust if needed
import { useClickOutside } from '@/hooks/use-click-outside'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import {
  ShoppingBag,
  Hash,
  Users, 
  Calendar,
  CircleHelp,
  BookOpen,
  Ruler,
  X,
  ArrowUpRight,
  Plus,
  Minus,
} from 'lucide-react'
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom' // <--- IMPORT THIS

// --- Types ---
interface Props {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  authButton?: React.ReactNode
}

interface MenuItemWithIcon {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface MenuItemLink {
  title: string
  href: string
}

interface MenuData {
  categories: MenuItemWithIcon[]
  brands: MenuItemLink[]
  resources: MenuItemWithIcon[]
}

// --- Data ---
const menuItems: MenuData = {
  categories: [
    { title: "Shop All Categories", href: "/shop-all", icon: ShoppingBag },
    { title: "Sneakers", href: "/categories/sneakers", icon: Hash },
    { title: "Apparel", href: "/categories/apparel", icon: Users },
    { title: "Accessories", href: "/categories/accessories", icon: Calendar },
  ],
  brands: [
    { title: "Nike", href: "/brands/nike" },
    { title: "Adidas", href: "/brands/adidas" },
    { title: "Stüssy", href: "/brands/stussy" },
    { title: "Bape", href: "/brands/bape" },
    { title: "Air Jordan", href: "/brands/air-jordan" },
    { title: "Supreme", href: "/brands/supreme" },
  ],
  resources: [
    { title: "Support", href: "/resources/support", icon: CircleHelp },
    { title: "Style Guide", href: "/resources/style-guide", icon: BookOpen },
    { title: "Size Charts", href: "/resources/size-guide", icon: Ruler },
  ],
}

// --- Component ---
const MobileMenu = ({ isOpen, setIsOpen, authButton }: Props) => {
  const ref = useClickOutside(() => setIsOpen(false))
  const [mounted, setMounted] = useState(false)

  // 1. Wait for mount to avoid hydration mismatch with Portal
  useEffect(() => {
    setMounted(true)
  }, [])

  const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  }

  const menuVariants: Variants = {
    hidden: { 
      y: '100%', 
      opacity: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    exit: { 
      y: '100%', 
      opacity: 0, 
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  }

  const handleClose = () => setIsOpen(false)

  // If not mounted on client yet, return null
  if (!mounted) return null

  // 2. Wrap the entire output in createPortal(..., document.body)
  // This moves the HTML div to the bottom of the <body> tag, outside the Navbar.
  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex flex-col justify-end md:hidden">
          {/* Backdrop */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={overlayVariants}
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Close Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.1 }}
            onClick={handleClose}
            className="absolute top-6 left-6 z-[10000] p-3 bg-white rounded-full shadow-lg active:scale-95 transition-transform"
          >
            <X className="w-6 h-6 text-black" />
          </motion.button>

          {/* Main Card Container */}
          <motion.div
            ref={ref}
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-[10000] w-full h-[85vh] bg-white rounded-t-[32px] overflow-hidden flex flex-col"
          >
            <div className="flex-1 overflow-y-auto px-6 pt-12 pb-8">
              
              {/* Accordion Group: Categories */}
              <Accordion type="single" collapsible className="w-full mb-2" defaultValue="categories">
                <CustomAccordionItem 
                  value="categories" 
                  title="Categories" 
                  items={menuItems.categories} 
                  onClick={handleClose}
                />
              </Accordion>

              {/* Direct Links Group */}
              <div className="border-t border-gray-200">
                 <DirectLinkItem href="/for-you" title="For You" onClick={handleClose} />
                 <div className="border-t border-gray-200" />
                 <DirectLinkItem href="/brands" title="Brands Index" onClick={handleClose} />
              </div>

              {/* Accordion Group: Brands */}
              <div className="border-t border-gray-200 mb-6">
                <Accordion type="single" collapsible className="w-full">
                  <CustomAccordionItem 
                    value="brands" 
                    title="Featured Brands" 
                    items={menuItems.brands} 
                    onClick={handleClose}
                  />
                  <CustomAccordionItem 
                    value="resources" 
                    title="Resources" 
                    items={menuItems.resources} 
                    onClick={handleClose}
                  />
                </Accordion>
              </div>

              {/* Auth / Custom Button Area */}
              {authButton && (
                 <div className="mb-8 px-2">
                    {authButton}
                 </div>
              )}

              {/* Footer Links */}
              <div className="mt-auto pt-4 space-y-3 px-1">
                <FooterLink href="/careers" label="Careers" onClick={handleClose} />
                <FooterLink href="/media" label="Media" onClick={handleClose} />
                <FooterLink href="/contact" label="Contact" onClick={handleClose} />
                <FooterLink href="/lang" label="Français" onClick={handleClose} />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body // <--- Target DOM Node
  )
}

// --- Sub-Components ---

const CustomAccordionItem = ({ value, title, items, onClick }: any) => {
  return (
    <AccordionItem value={value} className="border-none">
      <AccordionTrigger className="py-5 hover:no-underline group [&[data-state=open]>div>div>.plus]:hidden [&[data-state=open]>div>div>.minus]:block [&[data-state=closed]>div>div>.plus]:block [&[data-state=closed]>div>div>.minus]:hidden">
        <div className="flex items-center justify-between w-full">
          <span className="text-3xl font-bold text-black tracking-tight">{title}</span>
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-colors group-hover:bg-gray-200">
            <Plus className="w-5 h-5 text-black plus" />
            <Minus className="w-5 h-5 text-black minus hidden" />
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-6">
        <div className="flex flex-col space-y-4 pl-1">
          {items.map((item: any, idx: number) => (
            <Link
              key={idx}
              href={item.href}
              onClick={onClick}
              className="text-xl text-gray-800 hover:text-black transition-colors font-medium"
            >
              {item.title}
            </Link>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

const DirectLinkItem = ({ href, title, onClick }: { href: string, title: string, onClick: () => void }) => (
  <Link 
    href={href} 
    onClick={onClick}
    className="flex items-center justify-between w-full py-5 group"
  >
    <span className="text-3xl font-bold text-black tracking-tight">{title}</span>
    <ArrowUpRight className="w-6 h-6 text-black transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
  </Link>
)

const FooterLink = ({ href, label, onClick }: { href: string, label: string, onClick: () => void }) => (
  <Link 
    href={href} 
    onClick={onClick} 
    className="block text-base font-medium text-gray-900 hover:text-gray-600"
  >
    {label}
  </Link>
)

export default MobileMenu