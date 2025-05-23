'use client'

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from './Navbar/navigation-menu'
import { CalendarRangeIcon, CircleHelp, HashIcon, Newspaper, ShoppingBag, TrendingUp, UsersIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import { motion } from 'framer-motion'

// Define the Props type for the Item component
type Props = {
  title: string
  href: string
  children: React.ReactNode
  icon?: React.ReactNode
  logo?: string
  className?: string // Add specific prop types instead of [key: string]: any
  style?: React.CSSProperties
  // Add any other specific props you need
}

const Menu = () => {
  // Animation variants for menu items
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
        <NavigationMenuItem>
          <Link href="/for-you" legacyBehavior passHref>
            <NavigationMenuLink className="flex items-center h-10 px-4 py-2 text-sm font-medium rounded-md text-neutral-300 hover:text-neutral-400 w-max transition-colors duration-200">
              <TrendingUp className="w-4 h-4 mr-2" />
              For You
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        {/* Categories Section */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="flex items-center h-10 px-4 py-2 text-sm font-medium rounded-md text-neutral-300 hover:text-neutral-400 w-max transition-colors duration-200">

            Categories
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid rounded-3xl gap-3 p-4 md:w-[400px] lg:w-[500px] xl:w-[550px] lg:grid-cols-[.75fr_1fr]"
            >
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <Link
                    href="/shop-all"
                    className="flex flex-col justify-end w-full h-full p-6 no-underline rounded-lg outline-none select-none bg-gradient-to-tr from-accent to-accent/30 focus:shadow-md transition-all duration-200 hover:shadow-lg"
                  >
                    <ShoppingBag className="w-8 h-8 mb-2" />
                    <div className="my-2 text-xl font-medium">Shop All</div>
                    <p className="text-sm text-muted-foreground">
                      Explore all categories and collections.
                    </p>
                    <div className="mt-4 text-sm font-medium flex items-center">
                      Browse now 
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1">
                        <path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                      </svg>
                    </div>
                  </Link>
                </NavigationMenuLink>
              </li>
              {[
                {
                  title: "Sneakers",
                  href: "/categories/sneakers",
                  icon: <HashIcon className="w-5 h-5" />,
                  description: "Discover the latest sneaker drops."
                },
                {
                  title: "Apparel",
                  href: "/categories/apparel",
                  icon: <UsersIcon className="w-5 h-5" />,
                  description: "Shop trendy apparel and streetwear."
                },
                {
                  title: "Accessories",
                  href: "/categories/accessories",
                  icon: <CalendarRangeIcon className="w-5 h-5" />,
                  description: "Complete your look with accessories."
                }
              ].map((item, i) => (
                <motion.div 
                  key={item.title}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={menuItemVariants}
                >
                  <Item
                    title={item.title}
                    href={item.href}
                    icon={item.icon}
                  >
                    {item.description}
                  </Item>
                </motion.div>
              ))}
            </motion.ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Brands Section */}
        <NavigationMenuItem>
        <NavigationMenuTrigger className="flex items-center h-10 px-4 py-2 text-sm font-medium rounded-md text-neutral-300 hover:text-neutral-400 w-max transition-colors duration-200">
            Brands
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid rounded-3xl gap-3 p-4 md:w-[400px] lg:w-[600px] xl:w-[650px] grid-cols-2"
            >
              <li className="col-span-2 mb-2">
                <NavigationMenuLink asChild>
                  <Link
                    href="/brands"
                    className="flex flex-col justify-end w-full h-full p-6 no-underline rounded-lg outline-none select-none bg-gradient-to-tr from-accent to-accent/30 focus:shadow-md transition-all duration-200 hover:shadow-lg"
                  >
                    <div className="my-2 text-xl font-medium">Shop by Brand</div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Explore top brands and collections.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {['Nike', 'Adidas', 'Supreme', 'Stüssy', 'Bape'].map((brand) => (
                        <span key={brand} className="px-3 py-1 text-xs font-medium bg-background rounded-full border border-border/40">
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
                  title: "Nike",
                  href: "/brands/nike",
                  logo: "/logos/nike.svg",
                  description: "Shop the latest Nike sneakers and apparel."
                },
                {
                  title: "Adidas", 
                  href: "/brands/adidas",
                  logo: "/logos/adidas.svg",
                  description: "Find Adidas sneakers and apparel."
                },
                {
                  title: "Stüssy",
                  href: "/brands/stussy",
                  logo: "/logos/stussy.svg", 
                  description: "Discover Stüssy's iconic streetwear."
                },
                {
                  title: "Bape",
                  href: "/brands/bape",
                  logo: "/logos/bape.svg",
                  description: "Explore Bape's unique designs."
                },
                {
                  title: "Air Jordan",
                  href: "/brands/air-jordan",
                  logo: "/logos/air-jordan.svg",
                  description: "Shop Air Jordan's iconic sneakers."
                },
                {
                  title: "Supreme",
                  href: "/brands/supreme",
                  logo: "/logos/supreme.svg",
                  description: "Explore Supreme's streetwear collections."
                }
              ].map((brand, i) => (
                <motion.div 
                  key={brand.title}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={menuItemVariants}
                >
                  <BrandItem
                    title={brand.title}
                    href={brand.href}
                    logo={brand.logo}
                  >
                    {brand.description}
                  </BrandItem>
                </motion.div>
              ))}
              
              <li className="col-span-2 mt-2">
                <Link
                  href="/brands"
                  className="flex items-center justify-center w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  View all brands
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1">
                    <path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </Link>
              </li>
            </motion.ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Resources Section */}
        <NavigationMenuItem>
        <NavigationMenuTrigger className="flex items-center h-10 px-4 py-2 text-sm font-medium rounded-md text-neutral-300 hover:text-neutral-400 w-max transition-colors duration-200">
            Resources
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid w-[400px] gap-3 p-4 md:w-[400px] md:grid-cols-2 lg:w-[500px] xl:w-[500px]"
            >
              <Item title="Blog" href="/resources/blog" icon={<Newspaper className="w-5 h-5" />}>
                Read our latest articles and updates on streetwear trends.
              </Item>
              <Item
                title="Support"
                href="/resources/support"
                icon={<CircleHelp className="w-5 h-5" />}
              >
                Get help with orders, returns, and product information.
              </Item>
              <Item
                title="Style Guide" 
                href="/resources/style-guide"
                icon={<TrendingUp className="w-5 h-5" />}
              >
                Fashion tips and outfit inspiration from our experts.
              </Item>
              <Item
                title="Size Charts"
                href="/resources/size-guide"
                icon={<CalendarRangeIcon className="w-5 h-5" />}
              >
                Detailed sizing guides for all brands and products.
              </Item>
            </motion.ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* Help Section */}
        <NavigationMenuItem>
          <Link href="/HelpPage" legacyBehavior passHref>
          <NavigationMenuLink className="flex items-center h-10 px-4 py-2 text-sm font-medium rounded-md text-neutral-300 hover:text-neutral-400 w-max transition-colors duration-200">
              <CircleHelp className="w-4 h-4 mr-2" />
              Help
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        
        {/* Search button */}
        
      </NavigationMenuList>
    </NavigationMenu>
  )
}

// Reusable Item Component
const Item = ({ title, href, children, icon, ...props }: Props) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          passHref
          href={href}
          {...props}
          className="grid grid-cols-[.15fr_1fr] select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-colors hover:bg-accent/50 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group"
        >
          <div className="flex items-center justify-center p-1.5 w-9 h-9 rounded-md border border-border/80 bg-background/80 group-hover:border-accent/50 transition-colors duration-200">
            {icon}
          </div>
          <div className="text-start ml-3">
            <span className="text-sm font-medium group-hover:text-foreground leading-none">
              {title}
            </span>
            <p className="text-sm mt-1 line-clamp-2 text-muted-foreground">{children}</p>
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}

// Brand Item Component with Logo
const BrandItem = ({ title, href, children, logo, ...props }: Props) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          passHref
          href={href}
          {...props}
          className="flex items-start p-3 rounded-lg no-underline outline-none transition-all hover:bg-accent/50 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group"
        >
          <div className="flex items-center justify-center p-1.5 w-10 h-10 mr-3 rounded-md border border-border/80 bg-background/80 group-hover:border-accent/50 transition-colors">
            {logo ? (
              <div className="relative w-6 h-6">
                <Image
                  src={logo}
                  alt={`${title} logo`}
                  fill
                  sizes="24px"
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center w-6 h-6 font-bold">
                {title.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium group-hover:text-foreground">
              {title}
            </div>
            <p className="text-xs mt-1 line-clamp-2 text-muted-foreground">
              {children}
            </p>
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}

Item.displayName = 'Item'
BrandItem.displayName = 'BrandItem'

export default Menu