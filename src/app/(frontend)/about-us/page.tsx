'use client';
import React, { useState, useEffect } from 'react';
// Import 'Variants' from framer-motion
import { motion, Variants } from 'framer-motion';

// --- ENGLISH-ONLY CONTENT OBJECT ---
const content = {
  headerTitle: 'The Art Of Pioneering',
  heroSubtitle: 'Connecting Fashion, Culture, and Technology.',
  openLetterTitle: 'An Open Letter',
  openLetterP1A: 'From the heart of Ulaanbaatar, a new vision for fashion is materializing. SAINTO was born from a core realization: the fashion landscape in Mongolia and across Central Asia was ready for a monumental ',
  openLetterP1HighlightA: 'transformation',
  openLetterP1B: '. Consumers deserved more—more ',
  openLetterP1HighlightB: 'authenticity',
  openLetterP1C: ', fairer pricing, and a platform they could unequivocally trust.',
  openLetterP2:
    'Our journey began as a seed of ambition in December 2023. After a strategic pause, we reignited development in February 2025, transforming a singular idea into a powerful movement. We are not just bridging a gap; we are building a gateway—a direct link between the world’s most sought-after fashion and a discerning regional audience, all underpinned by unwavering authentication.',
  openLetterP3:
    'At SAINTO, our philosophy is resolute. Access to genuine, high-quality fashion should be simple, immediate, and limitless. We are here to guarantee that every item you acquire is more than a purchase; it is an investment in your confidence and a statement of your personal style.',
  coreValuesTitle: 'Our Core Values',
  coreValuesP1:
    'Our commitment is rooted in four core values that guide every decision. We are building an open Community, a place where enthusiasts connect over a shared passion for genuine style. We believe in a Simple and intuitive experience, stripping away complexity from browse to checkout. Our selection is Large, ensuring our vast catalog has something for everyone. Finally, we are Swift, leveraging strategic logistics to bring global fashion home to you faster than ever before.',
  whyChooseTitle: 'Why Customers Choose SAINTO',
  whyChooseP1:
    'In a market often plagued by counterfeits, we offer a beacon of trust. Our Authenticated Assurance means every item is sourced from globally trusted platforms, guaranteeing its legitimacy. This is paired with an Unparalleled Selection at fair prices and the Speed & Convenience of streamlined logistics. We are building a Trusted & Transparent platform for the long haul, because your confidence in us is our greatest asset.',
  saintoStandardTitle: 'The SAINTO Standard',
  saintoStandardP1:
    'We live by our guiding philosophy: "FIRST & FINEST." As the pioneering platform of our kind in the region, we are the FIRST to set new standards for accessibility and customer experience. We are also the FINEST, uncompromising in our pursuit of excellence, from the quality of our products to the seamlessness of our service.',
  saintoStandardP2:
    "Our ambition doesn't stop here. We envision SAINTO expanding far beyond our current horizons, becoming the dominant fashion retail platform across Central Asia and beyond. We possess the ambition, the vision, and the unwavering resolve to make it happen.",
  investTitle: 'Invest in Our Vision',
  investIntro:
    'Join us as we redefine fashion retail in Central Asia and beyond. We are actively seeking partners who share our passion for authenticity, innovation, and growth.',
  investButton: 'Learn More About Investment Opportunities',
  followTitle: 'Follow us on Instagram and Tiktok for updates.',
  instagramLink: 'Instagram',
  tiktokLink: 'Tiktok',
  saintoWord: 'SAINTO',
  saintoPhonetic: '[sey-n-toh] noun',
  saintoDefinition: 'A pioneer; one who is first or among the earliest in any field of inquiry, enterprise, or progress.',
  footerText: `©${new Date().getFullYear()} SAINTO. All rights reserved.`,
};

// Define animation variants
// Add the ': Variants' type to sectionVariants
const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut',
      staggerChildren: 0.15,
    },
  },
};

// Add the ': Variants' type to textVariants
const textVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

const App = () => {
  const [heroBackgroundStyles, setHeroBackgroundStyles] = useState({
    imageOpacity: 0.8,
    filter: 'blur(0px)',
    overlayOpacity: 0,
  });

  const [mainBackgroundOpacity, setMainBackgroundOpacity] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      const heroSectionScrollHeight = window.innerHeight * 0.8;
      const mainContentStartScroll = window.innerHeight * 0.6;

      const scrollProgressHero = Math.min(1, scrollY / heroSectionScrollHeight);
      const scrollProgressMain = Math.min(1, Math.max(0, (scrollY - mainContentStartScroll) / (heroSectionScrollHeight - mainContentStartScroll)));

      const newImageOpacity = 0.8 * (1 - scrollProgressHero) + 0.1 * scrollProgressHero;
      const newBlur = 10 * scrollProgressHero;
      const newOverlayOpacity = scrollProgressHero;

      setHeroBackgroundStyles({
        imageOpacity: newImageOpacity,
        filter: `blur(${newBlur}px)`,
        overlayOpacity: newOverlayOpacity,
      });

      setMainBackgroundOpacity(scrollProgressMain);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const paragraphStyle = "text-xl md:text-xl tracking-tight font-light leading-snug mb-8 text-[#8C8C8C]";

  return (
    <motion.div
      className="min-h-screen bg-[#0B0B0B] text-gray-100 font-inter antialiased overflow-x-hidden relative"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
    >
      <motion.header
        className="px-6 md:px-16 lg:px-24 flex justify-between items-center py-6 relative z-30"
        variants={textVariants}
      >
       </motion.header>

      <section className="relative h-[100vh] flex flex-col justify-center items-center text-center w-full mx-auto">
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
          style={{
            backgroundImage: "url('https://i.pinimg.com/1200x/42/da/f0/42daf05e14d15ce40323dac0303576fa.jpg')",
            filter: heroBackgroundStyles.filter,
            opacity: heroBackgroundStyles.imageOpacity,
            transition: 'opacity 0.3s ease-out, filter 0.3s ease-out',
            boxShadow: '0 0 100px 50px rgba(0,0,0,0.8) inset',
          }}
          aria-hidden="true"
        ></div>
        <div
          className="fixed inset-0 bg-[#0B0B0B] "
          style={{
            opacity: heroBackgroundStyles.overlayOpacity,
            transition: 'opacity 0.3s ease-out',
          }}
          aria-hidden="true"
        ></div>
        <motion.h1
          className="text-3xl md:text-5xl lg:text-7xl font-playfair-display tracking-tight font-medium leading-tight mb-8 text-white relative z-20"
          variants={textVariants}
        >
          {content.headerTitle}
        </motion.h1>
        <motion.p
          className="text-xl md:text-2xl  font-medium text-neutral-100 tracking-tight leading-relaxed relative z-20"
          variants={textVariants}
        >
          {content.heroSubtitle}
        </motion.p>
      </section>

      <main
        className="max-w-4xl mx-auto px-6 md:px-16 lg:px-24 py-20 space-y-24 relative z-20"
        style={{ backgroundColor: `rgba(11,11,11,${mainBackgroundOpacity})`, transition: 'background-color 0.3s ease-out' }}
      >
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h3
            className="text-4xl font-playfair-display font-light mb-10 tracking-tight text-white font-medium leading-tight"
            variants={textVariants}
          >
            {content.openLetterTitle}
          </motion.h3>
          <motion.p className={paragraphStyle} variants={textVariants}>
            {content.openLetterP1A}
            <strong className="text-white">{content.openLetterP1HighlightA}</strong>
            {content.openLetterP1B}
            <strong className="text-white">{content.openLetterP1HighlightB}</strong>
            {content.openLetterP1C}
          </motion.p>
          <motion.p
            className={paragraphStyle}
            variants={textVariants}
          >
            {content.openLetterP2}
          </motion.p>
          <motion.p
            className={paragraphStyle}
            variants={textVariants}
          >
            {content.openLetterP3}
          </motion.p>
        </motion.section>

        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h3 className="text-4xl font-playfair-display font-light mb-10 tracking-tight text-white font-medium leading-tight" variants={textVariants}>
            {content.coreValuesTitle}
          </motion.h3>
          <motion.p
            className={paragraphStyle}
            variants={textVariants}
          >
            {content.coreValuesP1}
          </motion.p>
        </motion.section>

        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h3 className="text-4xl font-playfair-display font-light mb-10 tracking-tight text-white font-medium leading-tight" variants={textVariants}>
            {content.whyChooseTitle}
          </motion.h3>
          <motion.p
            className={paragraphStyle}
            variants={textVariants}
          >
            {content.whyChooseP1}
          </motion.p>
        </motion.section>

        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h3 className="text-4xl font-playfair-display font-light mb-10 tracking-tight text-white font-medium leading-tight" variants={textVariants}>
            {content.saintoStandardTitle}
          </motion.h3>
          <motion.p
            className={paragraphStyle}
            variants={textVariants}
          >
            {content.saintoStandardP1}
          </motion.p>
          <motion.p
            className={paragraphStyle}
            variants={textVariants}
          >
            {content.saintoStandardP2}
          </motion.p>
        </motion.section>

        <motion.section
          className="text-center flex flex-col items-center justify-center"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h3 className="text-4xl font-playfair-display font-medium leading-tight mb-6 text-white" variants={textVariants}>
            {content.investTitle}
          </motion.h3>
          <motion.p
            className="text-xl md:text-xl tracking-tight font-light leading-snug max-w-2xl mx-auto mb-12 text-[#8C8C8C]"
            variants={textVariants}
          >
            {content.investIntro}
          </motion.p>
          <motion.button
            onClick={() => alert('Investment Opportunities Coming Soon!')}
            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-black   rounded-full bg-white backdrop-blur-2xl shadow-xl border border-white/30 hover:bg-white/90 hover:border-white/50 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            aria-label="Learn more about investment opportunities"
            whileHover={{ scale: 1.05, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -2px rgba(0,0,0,0.05)' }}
            whileTap={{ scale: 0.95 }}
            variants={textVariants}
          >
            {content.investButton}
          </motion.button>
        </motion.section>

        

        <motion.section
          className="py-20 flex flex-col items-center justify-center gap-8 justify-end md:gap-16"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.h2 className="text-6xl md:text-8xl font-playfair-display font-bold text-center text-white w-full md:w-1/3" variants={textVariants}>
            {content.saintoWord}
          </motion.h2>
          <motion.div className="w-full md:w-2/3" variants={textVariants}>
            <p className="text-lg text-gray-400 mb-2 italic">{content.saintoPhonetic}</p>
            <p className="text-xl text-gray-300 leading-relaxed">{content.saintoDefinition}</p>
          </motion.div>
        </motion.section>
      </main>
      
      <motion.footer
        className="text-center py-8 px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <p className="text-sm text-gray-500">{content.footerText}</p>
      </motion.footer>

      <style>{`
        body {
          background-color: black;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        .font-playfair-display {
          font-family: 'Playfair Display', serif;
        }
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </motion.div>
  );
};

export default App;