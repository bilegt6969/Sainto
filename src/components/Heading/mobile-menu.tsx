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
  Ruler,
  BookOpen,
  Hash,
  Users,
  Calendar,
} from 'lucide-react'
import Link from 'next/link'
import React from 'react'

interface Props {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  authButton?: React.ReactNode
}

interface MenuItemWithIcon {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MenuItemLink {
  title: string;
  href: string;
}

interface MenuData {
  categories: MenuItemWithIcon[];
  brands: MenuItemLink[];
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 md:hidden"
            onClick={handleClose}
          />

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

                {authButton && (
                  <div className="p-4 border-b border-neutral-700">
                    {authButton}
                  </div>
                )}

                <nav className="max-h-[70vh] overflow-y-auto">
                  <div className="py-2">
                    <MenuItem
                      href="/for-you"
                      icon={TrendingUp}
                      label="For You"
                      onClick={handleClose}
                    />

                    <AccordionSection
                      title="Categories"
                      icon={ShoppingBag}
                      items={menuItems.categories}
                      onItemClick={handleClose}
                      renderItem={(item: MenuItemWithIcon) => (
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

                    <AccordionSection
                      title="Brands"
                      icon={Tags}
                      items={menuItems.brands}
                      onItemClick={handleClose}
                      renderItem={(brand: MenuItemLink) => (
                        <MenuItem
                          key={brand.title}
                          href={brand.href}
                          label={brand.title}
                          onClick={handleClose}
                          isSubItem
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

                    <AccordionSection
                      title="Resources"
                      icon={Layers3}
                      items={menuItems.resources}
                      onItemClick={handleClose}
                      renderItem={(item: MenuItemWithIcon) => (
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

interface AccordionSectionProps<TItem> {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: TItem[];
  onItemClick: () => void;
  renderItem: (item: TItem) => React.ReactNode;
  footer?: React.ReactNode;
}

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

export default MobileMenu
