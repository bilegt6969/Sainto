'use client'

import React from 'react'
import { motion } from 'framer-motion'
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu'
import { cva } from 'class-variance-authority'
import {
  CalendarRangeIcon,
  HashIcon,
  ShoppingBag,
  TrendingUp,
  UsersIcon,
  Mail,
  ArrowRight,
  Zap,
  ChevronDown,
  CircleHelp
} from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- Mock Link for Preview ---
const Link = ({ href, children, className, ...props }: any) => {
  return (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  )
}

// --- Navigation Primitives ---

const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn('relative z-10 flex max-w-max flex-1 items-center justify-center', className)}
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
))
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName

const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={cn('group flex flex-1 list-none items-center justify-center space-x-1', className)}
    {...props}
  />
))
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName

const NavigationMenuItem = NavigationMenuPrimitive.Item

const navigationMenuTriggerStyle = cva(
  'group inline-flex h-10 w-max items-center justify-center rounded-full bg-  px-4 py-2 text-sm font-medium transition-colors hover:text-accent-foreground focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50',
)

const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    className={cn(navigationMenuTriggerStyle(), 'group', className)}
    {...props}
  >
    {children}{' '}
    <ChevronDown
      className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180"
      aria-hidden="true"
    />
  </NavigationMenuPrimitive.Trigger>
))
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName

const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    className={cn(
      'left-0 top-0 w-full data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 md:absolute md:w-auto ',
      className,
    )}
    {...props}
  />
))
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName

const NavigationMenuLink = NavigationMenuPrimitive.Link

const NavigationMenuViewport = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <div className={cn('absolute left-0 top-full flex justify-center')}>
    <NavigationMenuPrimitive.Viewport
      className={cn(
        'origin-top-center relative z-50 mt-4 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-visible bg-  text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]',
        className,
      )}
      ref={ref}
      {...props}
    />
  </div>
))
NavigationMenuViewport.displayName = NavigationMenuPrimitive.Viewport.displayName

// --- Main Menu Component ---

const Menu = () => {
  return (
    <NavigationMenu className="relative z-10">
      {/* DESIGN FIX:
        Removed the 'bg-black/95', border, and shadow. 
        Now it's just 'gap-1', so it sits perfectly transparently on your existing navbar.
      */}
      <NavigationMenuList className="gap-1">
        
        {/* 1. For You */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href="/for-you"
              className="group flex items-center h-9 px-4 text-sm font-medium rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              <TrendingUp className="w-4 h-4 mr-2 text-neutral-500 group-hover:text-white transition-colors" />
              For You
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* 2. Categories (Dropdown) */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="h-9 px-4 text-sm font-medium rounded-full text-neutral-400 hover:text-white data-[state=open]:text-white data-[state=open]:bg-white/5 transition-all duration-200 bg-transparent">
            Categories
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              // UPDATED: bg-black/60 for better transparency, so backdrop-blur-xl is clearly visible
              className="flex w-[600px] gap-2 p-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-2xl overflow-hidden"
            >
              {/* Left Column: Navigation Links */}
              <div className="flex flex-col justify-center w-1/2 p-2 space-y-1">
                <div className="px-3 pb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Browse
                </div>
                {[
                  {
                    title: 'Sneakers',
                    href: '/categories/sneakers',
                    icon: <HashIcon className="w-4 h-4" />,
                    desc: 'Latest drops & heat',
                  },
                  {
                    title: 'Apparel',
                    href: '/categories/apparel',
                    icon: <UsersIcon className="w-4 h-4" />,
                    desc: 'Streetwear collections',
                  },
                  {
                    title: 'Accessories',
                    href: '/categories/accessories',
                    icon: <CalendarRangeIcon className="w-4 h-4" />,
                    desc: 'Belts, bags & hats',
                  },
                ].map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group flex items-start p-3 rounded-2xl hover:bg-white/5 transition-colors duration-200"
                  >
                    <div className="mt-1 mr-4 p-2 rounded-full bg-white/5 text-neutral-400 group-hover:text-white group-hover:bg-white/10 transition-colors">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-neutral-200 group-hover:text-white">
                        {item.title}
                      </div>
                      <p className="text-xs text-neutral-500 group-hover:text-neutral-400">
                        {item.desc}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Right Column: Featured Card */}
              <div className="w-1/2">
                <Link
                  href="/shop-all"
                  className="flex flex-col justify-between h-full p-6 bg-[#EFEFEA] rounded-[24px] hover:opacity-90 transition-opacity cursor-pointer no-underline"
                >
                  <div className="flex justify-end">
                    <ShoppingBag className="w-12 h-12 text-neutral-800 opacity-10" />
                  </div>
                  
                  <div className="flex items-center justify-center flex-1">
                    <div className="grid grid-cols-2 gap-2 opacity-20">
                        <div className="w-2 h-2 bg-black rounded-full" />
                        <div className="w-2 h-2 bg-black rounded-full" />
                        <div className="w-2 h-2 bg-black rounded-full" />
                        <div className="w-2 h-2 bg-black rounded-full" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900">
                      Shop All
                    </h3>
                    <p className="text-sm text-neutral-600 leading-tight mt-1">
                      Explore our entire catalog.
                    </p>
                  </div>
                </Link>
              </div>
            </motion.div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* 3. Brands (Dropdown) */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="h-9 px-4 text-sm font-medium rounded-full text-neutral-400 hover:text-white hover:bg-white/10 data-[state=open]:text-white data-[state=open]:bg-white/10 transition-all duration-200 bg-transparent">
            Brands
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              // UPDATED: bg-black/60 for better transparency
              className="flex w-[700px] gap-2 p-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-2xl overflow-hidden"
            >
              {/* Left Column: Two columns of text links */}
              <div className="flex-1 p-4">
                <div className="px-2 pb-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  Top Brands
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  {[
                    { name: 'Nike', desc: 'Just do it' },
                    { name: 'Adidas', desc: 'Three stripes' },
                    { name: 'Stüssy', desc: 'Iconic street' },
                    { name: 'Bape', desc: 'A Bathing Ape' },
                    { name: 'Air Jordan', desc: 'Flight' },
                    { name: 'Supreme', desc: 'NY Skate' },
                    { name: 'Palace', desc: 'London Skate' },
                    { name: 'Yeezy', desc: 'By Kanye' },
                  ].map((brand) => (
                    <Link
                      key={brand.name}
                      href={`/brands/${brand.name.toLowerCase()}`}
                      className="group block p-3 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <div className="text-sm font-medium text-neutral-200 group-hover:text-white">
                        {brand.name}
                      </div>
                      <div className="text-xs text-neutral-500 group-hover:text-neutral-400 truncate">
                        {brand.desc}
                      </div>
                    </Link>
                  ))}
                </div>
                <Link 
                  href="/brands" 
                  className="mt-4 flex items-center text-xs text-neutral-400 hover:text-white px-3 transition-colors"
                >
                  View all brands <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </div>

              {/* Right Column: Featured Brand Card */}
              <div className="w-[240px]">
                <Link
                  href="/brands/nike"
                  className="flex flex-col h-full bg-[#202020] rounded-[24px] p-1 hover:bg-[#252525] transition-colors border border-white/5"
                >
                  <div className="flex-1 bg-neutral-800/50 rounded-[20px] m-1 flex items-center justify-center relative overflow-hidden group">
                    <Zap className="w-10 h-10 text-white/20 group-hover:text-white/40 transition-all duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white font-semibold">
                        New Arrivals
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-200">Brand Spotlight</span>
                      <ArrowRight className="w-4 h-4 text-neutral-500" />
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Latest drops from top partners.
                    </p>
                  </div>
                </Link>
              </div>
            </motion.div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* 4. About (Simple Link) */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href="/about-us"
              className="group flex items-center h-9 px-4 text-sm font-medium rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              <CircleHelp className="w-4 h-4 mr-2 text-neutral-500 group-hover:text-white transition-colors" />
              About
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* 5. Contact (Simple Link) */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href="/contact"
              className="group flex items-center h-9 px-4 text-sm font-medium rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              <Mail className="w-4 h-4 mr-2 text-neutral-500 group-hover:text-white transition-colors" />
              Contact Us
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export default Menu