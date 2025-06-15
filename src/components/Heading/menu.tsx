'use client'

import React from 'react'
import Link from 'next/link'
 import { motion } from 'framer-motion'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from './Navbar/navigation-menu'

import {
  CalendarRangeIcon,
  CircleHelp,
  HashIcon,
   ShoppingBag,
  TrendingUp,
  UsersIcon,
} from 'lucide-react'

type Props = {
  title: string
  href: string
  children: React.ReactNode
  icon?: React.ReactNode
  logo?: string
  className?: string
  style?: React.CSSProperties
}

const Menu = () => {
  const menuItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
      },
    }),
  }

  return (
    <NavigationMenu className="relative z-10">
      <NavigationMenuList className="space-x-1">
        {/* For You */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href="/for-you"
              className="flex items-center h-10 px-4 py-2 text-sm font-medium rounded-md text-neutral-300 hover:text-neutral-400 transition-colors duration-200"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              For You
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Categories */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="flex items-center h-10 px-4 py-2 text-sm font-medium rounded-md text-neutral-300 hover:text-neutral-400 transition-colors duration-200">
            Categories
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid gap-3 p-4 rounded-3xl md:w-[400px] lg:w-[500px] xl:w-[550px] lg:grid-cols-[.75fr_1fr]"
            >
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <Link
                    href="/shop-all"
                    className="flex flex-col justify-end h-full p-6 rounded-lg no-underline outline-none select-none bg-gradient-to-tr from-accent to-accent/30 hover:shadow-lg transition-all duration-200"
                  >
                    <ShoppingBag className="w-8 h-8 mb-2" />
                    <div className="my-2 text-xl font-medium">Shop All</div>
                    <p className="text-sm text-muted-foreground">
                      Explore all categories and collections.
                    </p>
                    <div className="mt-4 text-sm font-medium flex items-center">
                      Browse now
                      <svg
                        className="ml-1"
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8.146 3.146a.5.5 0 01.708 0l4 4a.5.5 0 010 .708l-4 4a.5.5 0 11-.708-.708L11.293 8H2.5a.5.5 0 010-1h8.793L8.146 3.854a.5.5 0 010-.708z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                  </Link>
                </NavigationMenuLink>
              </li>

              {[
                {
                  title: 'Sneakers',
                  href: '/categories/sneakers',
                  icon: <HashIcon className="w-5 h-5" />,
                  description: 'Discover the latest sneaker drops.',
                },
                {
                  title: 'Apparel',
                  href: '/categories/apparel',
                  icon: <UsersIcon className="w-5 h-5" />,
                  description: 'Shop trendy apparel and streetwear.',
                },
                {
                  title: 'Accessories',
                  href: '/categories/accessories',
                  icon: <CalendarRangeIcon className="w-5 h-5" />,
                  description: 'Complete your look with accessories.',
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={menuItemVariants}
                >
                  <Item title={item.title} href={item.href} icon={item.icon}>
                    {item.description}
                  </Item>
                </motion.div>
              ))}
            </motion.ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Brands */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="flex items-center h-10 px-4 py-2 text-sm font-medium rounded-md text-neutral-300 hover:text-neutral-400 transition-colors duration-200">
            Brands
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid gap-3 p-4 rounded-3xl md:w-[400px] lg:w-[600px] xl:w-[650px] grid-cols-2"
            >
              <li className="col-span-2 mb-2">
                <NavigationMenuLink asChild>
                  <Link
                    href="/brands"
                    className="flex flex-col justify-end p-6 rounded-lg no-underline outline-none select-none bg-gradient-to-tr from-accent to-accent/30 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="my-2 text-xl font-medium">Shop by Brand</div>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Explore top brands and collections.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {['Nike', 'Adidas', 'Supreme', 'Stüssy', 'Bape'].map((brand) => (
                        <span
                          key={brand}
                          className="px-3 py-1 text-xs font-medium bg-background rounded-full border border-border/40"
                        >
                          {brand}
                        </span>
                      ))}
                      <span className="px-3 py-1 text-xs font-medium bg-background rounded-full border border-border/40">
                        +20 more
                      </span>
                    </div>
                  </Link>
                </NavigationMenuLink>
              </li>

              {[
                {
                  title: 'Nike',
                  href: '/brands/nike',
                  logo: '/logos/nike.svg',
                  description: 'Shop the latest Nike sneakers and apparel.',
                },
                {
                  title: 'Adidas',
                  href: '/brands/adidas',
                  logo: '/logos/adidas.svg',
                  description: 'Find Adidas sneakers and apparel.',
                },
                {
                  title: 'Stüssy',
                  href: '/brands/stussy',
                  logo: '/logos/stussy.svg',
                  description: "Discover Stüssy's iconic streetwear.",
                },
                {
                  title: 'Bape',
                  href: '/brands/bape',
                  logo: '/logos/bape.svg',
                  description: "Explore Bape's unique designs.",
                },
                {
                  title: 'Air Jordan',
                  href: '/brands/air-jordan',
                  logo: '/logos/air-jordan.svg',
                  description: "Shop Air Jordan's iconic sneakers.",
                },
                {
                  title: 'Supreme',
                  href: '/brands/supreme',
                  logo: '/logos/supreme.svg',
                  description: "Explore Supreme's streetwear collections.",
                },
              ].map((brand, i) => (
                <motion.div
                  key={brand.title}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={menuItemVariants}
                >
                  <BrandItem title={brand.title} href={brand.href} logo={brand.logo}>
                    {brand.description}
                  </BrandItem>
                </motion.div>
              ))}

              <li className="col-span-2 mt-2 flex justify-center">
                <Link
                  href="/brands"
                  className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md text-accent hover:text-accent/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                >
                  See all brands
                </Link>
              </li>
            </motion.ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* About */}
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link
              href="/about-us"
              className="flex items-center h-10 px-4 py-2 text-sm font-medium rounded-md text-neutral-300 hover:text-neutral-400 transition-colors duration-200"
            >
              <CircleHelp className="w-4 h-4 mr-2" />
              About
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

const Item = React.forwardRef<HTMLAnchorElement, Props>(
  ({ className, title, children, href, icon, ...props }, ref) => (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          ref={ref}
          className={`flex items-center p-3 rounded-md hover:bg-accent/50 transition-colors duration-200 ${className || ''}`}
          {...props}
        >
          {icon && <div className="mr-3">{icon}</div>}
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{title}</span>
            <p className="text-xs text-muted-foreground">{children}</p>
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  )
)
Item.displayName = 'Item'

const BrandItem = React.forwardRef<HTMLAnchorElement, Props>(
  ({ className, title, children, href, ...props }, ref) => (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          ref={ref}
          className={`flex items-center p-3 rounded-md hover:bg-accent/50 transition-colors duration-200 ${className || ''}`}
          {...props}
        >
           
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{title}</span>
            <p className="text-xs text-muted-foreground">{children}</p>
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  )
)
BrandItem.displayName = 'BrandItem'

export default Menu
