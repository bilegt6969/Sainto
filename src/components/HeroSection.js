'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { urlFor } from '../../lib/sanity'; // Ensure this path is correct

const getImageUrl = (source) => {
  if (!source?.asset) {
    return null;
  }
  // No need for .auto('format').fit('max') here as urlFor already includes it
  return urlFor(source).url(); 
};

const HeroSection = ({ heroData }) => {
  const { slides = [], carouselSettings } = heroData || {};
  const {
    autoplay = true,
    autoplaySpeed = 5000,
    showNavigation = true,
    showPagination = true,
    transition = 'slide',
  } = carouselSettings || {};

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState(1);
  const timeoutRef = useRef(null);

  const variants = {
    slide: {
      enter: (direction) => ({
        x: direction > 0 ? '100%' : '-100%',
        opacity: 0,
        scale: 0.95,
      }),
      center: {
        x: 0,
        opacity: 1,
        scale: 1,
        zIndex: 1,
        transition: {
          x: { type: 'spring', stiffness: 300, damping: 30 },
          opacity: { duration: 0.5 },
          scale: { duration: 0.5 },
        },
      },
      exit: (direction) => ({
        x: direction < 0 ? '100%' : '-100%',
        opacity: 0,
        scale: 0.95,
        zIndex: 0,
        transition: {
          x: { type: 'spring', stiffness: 300, damping: 30 },
          opacity: { duration: 0.5 },
          scale: { duration: 0.5 },
        },
      }),
    },
    fade: {
      enter: { opacity: 0 },
      center: { opacity: 1, zIndex: 1 },
      exit: { opacity: 0, zIndex: 0 },
    },
  };

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const goToSlide = (slideIndex) => {
    setDirection(slideIndex > currentSlide ? 1 : -1);
    setCurrentSlide(slideIndex);
  };

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (autoplay && slides.length > 1 && !isHovered) {
      resetTimeout();
      timeoutRef.current = setTimeout(nextSlide, autoplaySpeed);
    }
    return () => resetTimeout();
  }, [currentSlide, isHovered, autoplay, autoplaySpeed, slides.length, nextSlide]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => nextSlide(),
    onSwipedRight: () => prevSlide(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  if (!slides || slides.length === 0) {
    return (
      <section className="relative flex items-center justify-center w-full overflow-hidden rounded-[2rem] bg-neutral-900 border border-neutral-700 shadow-2xl aspect-[16/9]">
        <div className="text-center text-neutral-400 p-8">
          <h2 className="text-3xl font-semibold text-white mb-2">Welcome to Sainto</h2>
          <p className="text-lg font-light">No hero slides have been configured yet. Please add content to showcase your products.</p>
        </div>
      </section>
    );
  }

  return (
    // MODIFIED: Use padding-bottom for aspect ratio, remove fixed height
    <section
      className="relative w-full overflow-hidden rounded-[2rem]  ] shadow-2xl shadow-neutral-950/50 flex items-center justify-center
                 aspect-[16/9]" // <-- ADDED: Tailwind's aspect ratio utility
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
          className="absolute inset-0"
        >
          <SlideContent 
            slide={slides[currentSlide]} 
            isPriority={currentSlide === 0} 
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-70"></div>

      <div className="absolute inset-0 z-20 flex items-center justify-between pointer-events-none">
        {showNavigation && slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="relative left-4 p-3 rounded-full bg-white/5 backdrop-blur-lg border border-white/10 text-white shadow-xl transition-all duration-300 ease-in-out hover:bg-white/15 hover:scale-105 active:scale-95 pointer-events-auto hidden lg:block"
              aria-label="Previous slide"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="relative right-4 p-3 rounded-full bg-white/5 backdrop-blur-lg border border-white/10 text-white shadow-xl transition-all duration-300 ease-in-out hover:bg-white/15 hover:scale-105 active:scale-95 pointer-events-auto hidden lg:block"
              aria-label="Next slide"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </>
        )}

        {showPagination && slides.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 p-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg pointer-events-auto hidden lg:flex">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 w-2 rounded-full transition-all duration-300 ease-in-out shadow-sm
                            ${index === currentSlide ? 'bg-white w-5' : 'bg-white/30 hover:bg-white/50'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const SlideContent = ({ slide, isPriority }) => {
  const { backgroundImage } = slide;
  const imageUrl = getImageUrl(backgroundImage);

  if (!imageUrl) {
    return (
      <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
        <p className="text-neutral-500 text-lg">Image not available for this slide.</p>
      </div>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt="Hero background image"
      fill
      priority={isPriority}
      // MODIFIED: Changed object-cover to object-contain to show full image
      className="object-contain object-center" // <-- CHANGED from object-cover
      sizes="100vw"
    />
  );
};

export default HeroSection;