'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/functions'
import { useClickOutside } from '@/hooks'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  ShoppingBag,
  Tags,
  Layers3,
  CircleHelp,
  ChevronRight,
  X,
  Newspaper,
  Ruler,
  BookOpen,
  Hash,
  Users,
  Calendar,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'

interface Props {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  authButton?: React.ReactNode
}

// Define specific item types
interface MenuItemWithIcon {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MenuItemWithLogo {
  title: string;
  href: string;
  logo: string;
}

// Menu data structure with more specific types (optional but good practice)
interface MenuData {
  categories: MenuItemWithIcon[];
  brands: MenuItemWithLogo[];
  resources: MenuItemWithIcon[];
}

const menuItems: MenuData = {
  categories: [
    { title: "Shop All Categories", href: "/shop-all", icon: ShoppingBag },
    { title: "Sneakers", href: "/categories/sneakers", icon: Hash },
    { title: "Apparel", href: "/categories/apparel", icon: Users },
    { title: "Accessories", href: "/categories/accessories", icon: Calendar },
  ],
  brands: [
    { title: "Nike", href: "/brands/nike", logo: "/logos/nike.svg" },
    { title: "Adidas", href: "/brands/adidas", logo: "/logos/adidas.svg" },
    { title: "Stüssy", href: "/brands/stussy", logo: "/logos/stussy.svg" },
    { title: "Bape", href: "/brands/bape", logo: "/logos/bape.svg" },
    { title: "Air Jordan", href: "/brands/air-jordan", logo: "/logos/air-jordan.svg" },
    { title: "Supreme", href: "/brands/supreme", logo: "/logos/supreme.svg" },
  ],
  resources: [
    { title: "Blog", href: "/resources/blog", icon: Newspaper },
    { title: "Support", href: "/resources/support", icon: CircleHelp },
    { title: "Style Guide", href: "/resources/style-guide", icon: BookOpen },
    { title: "Size Charts", href: "/resources/size-guide", icon: Ruler },
  ],
}

const MobileMenu = ({ isOpen, setIsOpen, authButton }: Props) => {
  const ref = useClickOutside(() => setIsOpen(false))

  const handleClose = () => setIsOpen(false)

  const menuVariants = {
    hidden: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: { duration: 0.2, ease: "easeInOut" }
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    },
  }

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delay: 0.1, duration: 0.2 }
    },
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop: Darker with more blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 md:hidden"
            onClick={handleClose}
          />

          {/* Menu: Themed with neutral-800 */}
          <motion.div
            ref={ref}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={menuVariants}
            className="fixed top-4 left-4 right-4 z-50 md:hidden"
          >
            <div className="bg-neutral-800 rounded-2xl shadow-2xl overflow-hidden border border-neutral-700">
              <motion.div variants={contentVariants}>
                {/* Header with close button */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-700">
                  <h2 className="text-lg font-semibold text-neutral-100">
                    Menu
                  </h2>
                  <button
                    onClick={handleClose}
                    className="p-2 rounded-full hover:bg-neutral-700 transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5 text-neutral-400 hover:text-neutral-200" />
                  </button>
                </div>

                {/* Auth button container */}
                {authButton && (
                  <div className="p-4 border-b border-neutral-700">
                    {authButton}
                  </div>
                )}

                {/* Navigation */}
                <nav className="max-h-[70vh] overflow-y-auto">
                  <div className="py-2">
                    {/* For You */}
                    <MenuItem
                      href="/for-you"
                      icon={TrendingUp}
                      label="For You"
                      onClick={handleClose}
                    />

                    {/* Categories */}
                    <AccordionSection
                      title="Categories"
                      icon={ShoppingBag}
                      items={menuItems.categories}
                      onItemClick={handleClose}
                      renderItem={(item: MenuItemWithIcon) => ( // item is now MenuItemWithIcon
                        <MenuItem
                          key={item.title}
                          href={item.href}
                          icon={item.icon}
                          label={item.title}
                          onClick={handleClose}
                          isSubItem
                        />
                      )}
                    />

                    {/* Brands */}
                    <AccordionSection
                      title="Brands"
                      icon={Tags}
                      items={menuItems.brands}
                      onItemClick={handleClose}
                      renderItem={(brand: MenuItemWithLogo) => ( // brand is now MenuItemWithLogo
                        <BrandMenuItem
                          key={brand.title}
                          href={brand.href}
                          logo={brand.logo}
                          label={brand.title}
                          onClick={handleClose}
                        />
                      )}
                      footer={
                        <MenuItem
                          href="/brands"
                          label="View all brands"
                          onClick={handleClose}
                          isSubItem
                          isAction
                        />
                      }
                    />

                    {/* Resources */}
                    <AccordionSection
                      title="Resources"
                      icon={Layers3}
                      items={menuItems.resources}
                      onItemClick={handleClose}
                      renderItem={(item: MenuItemWithIcon) => ( // item is now MenuItemWithIcon
                        <MenuItem
                          key={item.title}
                          href={item.href}
                          icon={item.icon}
                          label={item.title}
                          onClick={handleClose}
                          isSubItem
                        />
                      )}
                    />

                    {/* Help */}
                    <MenuItem
                      href="/help"
                      icon={CircleHelp}
                      label="Help"
                      onClick={handleClose}
                    />
                  </div>
                </nav>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Menu item component
interface MenuItemProps {
  href: string
  icon?: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  isSubItem?: boolean
  isAction?: boolean
}

const MenuItem = ({ href, icon: Icon, label, onClick, isSubItem, isAction }: MenuItemProps) => (
  <Link
    href={href}
    onClick={onClick}
    className={cn(
      "flex items-center w-full px-4 py-3 text-left transition-colors hover:bg-neutral-700/70 group",
      isSubItem && "pl-12",
      isAction && "text-blue-400 hover:text-blue-300 font-medium"
    )}
  >
    {Icon && (
      <Icon className={cn(
        "w-5 h-5 mr-3 text-neutral-400 group-hover:text-neutral-200",
        isSubItem && "w-4 h-4",
        isAction && "text-blue-400 group-hover:text-blue-300"
      )} />
    )}
    <span className="text-neutral-100 group-hover:text-white">{label}</span>
    {isAction && <ChevronRight className="w-4 h-4 ml-auto text-blue-400 group-hover:text-blue-300" />}
  </Link>
)

// Brand menu item with logo
interface BrandMenuItemProps {
  href: string
  logo: string
  label: string
  onClick: () => void
}

const BrandMenuItem = ({ href, logo, label, onClick }: BrandMenuItemProps) => (
  <Link
    href={href}
    onClick={onClick}
    className="flex items-center w-full pl-12 pr-4 py-3 text-left transition-colors hover:bg-neutral-700/70 group"
  >
    <div className="relative w-4 h-4 mr-3">
      <Image
        src={logo}
        alt={`${label} logo`}
        fill
        sizes="16px"
        className="object-contain brightness-0 invert"
      />
    </div>
    <span className="text-neutral-100 group-hover:text-white">{label}</span>
  </Link>
)

// Accordion section component
// MODIFIED: Made props generic with TItem
interface AccordionSectionProps<TItem> {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: TItem[]; // Use TItem[] instead of any[]
  onItemClick: () => void;
  renderItem: (item: TItem) => React.ReactNode; // Use TItem instead of any
  footer?: React.ReactNode;
}

// MODIFIED: Made component generic with <TItem,> and used generic props
const AccordionSection = <TItem,>({
  title,
  icon: Icon,
  items,
  renderItem,
  footer,
}: AccordionSectionProps<TItem>) => (
  <Accordion type="single" collapsible className="w-full">
    <AccordionItem value={title.toLowerCase()} className="border-none">
      <AccordionTrigger className="flex items-center w-full px-4 py-3 text-left hover:bg-neutral-700/70 hover:no-underline [&[data-state=open]>svg:last-child]:rotate-90 group">
        <Icon className="w-5 h-5 mr-3 text-neutral-400 group-hover:text-neutral-200" />
        <span className="flex-1 text-neutral-100 group-hover:text-white font-medium">{title}</span>
        {/* ChevronRight for accordion trigger is usually handled by the AccordionTrigger component itself if styled.
            If you need one explicitly, ensure it's correctly placed and styled.
            The original comment mentioned it was removed to prevent duplication.
        */}
      </AccordionTrigger>
      <AccordionContent className="pb-0">
        <div className="bg-neutral-900/30">
          {items.map(renderItem)}
          {footer}
        </div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
)

export default MobileMenu;