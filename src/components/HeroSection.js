// web/src/components/heroSection.js

'use client'
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { urlFor } from '../../lib/sanity';

/**
 * A helper function to build image URLs from Sanity image objects.
 * This is more robust and allows for better optimization.
 * @param {object} source - The Sanity image object.
 * @returns {string|null} The image URL or null if no asset is available.
 */
const getImageUrl = (source) => {
  if (!source?.asset) {
    return null;
  }
  // Use Sanity's image URL builder for optimal performance
  // It enables features like automatic webp conversion, quality adjustments, etc.
  return urlFor(source).auto('format').fit('max').url();
};


const HeroSection = ({ heroData }) => {
  // Destructure with default values to prevent errors if heroData is null
  const { slides = [], carouselSettings } = heroData || {};
  
  // THE FIX: Default to an empty object if carouselSettings is null or undefined.
  // This prevents the "cannot read properties of null" error.
  const {
    autoplay = true,
    autoplaySpeed = 5000,
    showNavigation = true,
    showPagination = true,
    transition = 'slide'
  } = carouselSettings || {};

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState(1);
  const timeoutRef = useRef(null);

  // Animation variants for Framer Motion
  const variants = {
    slide: {
      enter: (direction) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0 }),
      center: { x: 0, opacity: 1, zIndex: 1 },
      exit: (direction) => ({ x: direction < 0 ? '100%' : '-100%', opacity: 0, zIndex: 0 })
    },
    fade: {
      enter: { opacity: 0 },
      center: { opacity: 1, zIndex: 1 },
      exit: { opacity: 0, zIndex: 0 }
    }
  };

  // --- Navigation and Autoplay Logic ---

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const goToSlide = (slideIndex) => {
    setDirection(slideIndex > currentSlide ? 1 : -1);
    setCurrentSlide(slideIndex);
  };

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    // Only run autoplay if enabled, there's more than one slide, and the user isn't hovering
    if (autoplay && slides.length > 1 && !isHovered) {
      resetTimeout();
      timeoutRef.current = setTimeout(nextSlide, autoplaySpeed);
    }
    // Cleanup timeout on component unmount or dependency change
    return () => resetTimeout();
  }, [currentSlide, isHovered, autoplay, autoplaySpeed, slides.length]);

  // Swipe handlers for touch devices and mouse dragging
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => nextSlide(),
    onSwipedRight: () => prevSlide(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  // --- Render Logic ---

  // Show a fallback if there are no slides to display
  if (!slides || slides.length === 0) {
    return (
      <section className="relative flex items-center justify-center h-[80vh] max-h-[800px] w-full overflow-hidden rounded-[2rem] bg-neutral-800 border border-neutral-700">
        <div className="text-center text-neutral-400">
          <h2 className="text-2xl font-bold">Hero Section</h2>
          <p>No slides have been configured.</p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative h-[80vh] max-h-[800px] w-full overflow-hidden rounded-[2rem] border border-neutral-700 bg-black"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...swipeHandlers}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={variants[transition]}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.4 }
          }}
          className="absolute inset-0 "
        >
          <SlideContent
            slide={slides[currentSlide]}
            isPriority={currentSlide === 0} // Prioritize loading only the first slide's image
          />
        </motion.div>
      </AnimatePresence>

      {/* Overlay for contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

      {/* UI Controls */}
      <div className="absolute inset-0 z-20">
        {showNavigation && slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white transition hover:bg-black/70"
              aria-label="Previous slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white transition hover:bg-black/70"
              aria-label="Next slide"
            >
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </>
        )}

        {showPagination && slides.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white w-6' : 'bg-white/50 w-3 hover:bg-white/70'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// --- Sub-component for Slide Content ---

// web/src/components/heroSection.js -> at the bottom of the file

// web/src/components/heroSection.js -> at the bottom of the file

const SlideContent = ({ slide, isPriority }) => {
  // We only need the images from the slide object now
  const { images } = slide;

  // Build URLs for different breakpoints, providing fallbacks
  const desktopUrl = getImageUrl(images?.desktop);
  const tabletUrl = getImageUrl(images?.tablet) || desktopUrl;
  const mobileUrl = getImageUrl(images?.mobile) || tabletUrl;

  // If no image is available at all, render a placeholder
  if (!mobileUrl) {
    return (
      <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
        <p className="text-neutral-500">Image not available</p>
      </div>
    );
  }

  return (
    <>
      {/* Using a <picture> element is the most performant way to handle responsive images.
      */}
      <picture>
        <source media="(min-width: 1024px)" srcSet={desktopUrl} />
        <source media="(min-width: 768px)" srcSet={tabletUrl} />
        <Image
          src={mobileUrl}
          alt="Hero background image" // Alt text can be generic if there's no title
          fill
          priority={isPriority} // Only the first slide gets priority loading
          className="object-cover"
          sizes="100vw"
        />
      </picture>

      {/* The text content and CTA button have been removed. 
        You can still keep an overlay for better contrast for the navigation dots.
      */}
    </>
  );
};

export default HeroSection;
