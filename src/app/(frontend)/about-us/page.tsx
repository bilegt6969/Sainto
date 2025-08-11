'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Define interfaces for translations
interface Translation {
  headerTitle: string;
  heroSubtitle: string;
  openLetterTitle: string;
  openLetterP1: string;
  openLetterP2: string;
  openLetterP3: string;
  quoteText: string;
  quoteAuthor: string;
  coreValuesTitle: string;
  coreValuesIntro: string;
  community: string;
  simple: string;
  large: string;
  swift: string;
  whyChooseTitle: string;
  whyChooseIntro: string;
  authenticatedAssurance: string;
  unparalleledSelection: string;
  speedConvenience: string;
  trustedTransparent: string;
  saintoStandardTitle: string;
  saintoStandardP1: string;
  saintoStandardP2: string;
  saintoStandardP3: string;
  saintoStandardP4: string;
  investTitle: string;
  investIntro: string;
  investButton: string;
  footerText: string;
}

interface Content {
  en: Translation;
  mn: Translation;
}

// Define animation variants
const sectionVariants = {
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

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 1, ease: 'easeOut' } },
};

const contentTransitionVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
};

// Content object with explicit type
const content: Content = {
  en: {
    headerTitle: 'The Art Of Pioneering',
    heroSubtitle: 'Connecting Fashion, Culture, and Technology.',
    openLetterTitle: 'An Open Letter',
    openLetterP1:
      'From the bustling streets of Ulaanbaatar, a new vision for fashion retail is taking shape. SAINTO was born from a simple yet profound realization: the fashion landscape in Mongolia and across Central Asia was ripe for transformation. Consumers yearned for genuine products, accessible pricing, and a trustworthy platform that stood by its promises.',
    openLetterP2:
      'Our journey began in December 2023, a seed of ambition planted, and after a brief pause, we officially commenced development in February 2025. What started as a singular vision—to bridge the gap between discerning customers and authenticated global fashion—is evolving into a robust platform designed to redefine online retail in the region.',
    openLetterP3:
      'At SAINTO, we fundamentally believe that access to authentic, high-quality fashion should be simple, fast, and vast. We\'re here to ensure that every purchase is not just a transaction, but an investment in confidence and style.',
    quoteText:
      'Fashion is not just about clothes; it\'s about confidence, authenticity, and the story you tell with every piece.',
    quoteAuthor: '—Bilegt Amartuvshin, The founder',
    coreValuesTitle: 'Open Community, Simple, Large, Swift',
    coreValuesIntro:
      'Our commitment extends beyond just products. We are building a platform rooted in core values that drive every decision:',
    community:
      'Community: SAINTO is more than a marketplace; it’s a growing community where fashion enthusiasts connect with authenticity. We foster an environment of trust and shared passion for genuine style.',
    simple:
      'Simple: We strip away complexity, offering an intuitive, seamless shopping experience. From Browse to checkout, clarity and ease are paramount.',
    large:
      'Large: Our database boasts a vast array of over 500,000 product choices, from everyday essentials to high-fashion statements. This expansive selection ensures there’s something for everyone, from an 8-year-old’s first branded item to an 80-year-old’s timeless piece.',
    swift:
      'Swift: Leveraging strategic sourcing from our warehouse in Hong Kong, we are committed to significantly faster shipping times, bringing global fashion closer to home, quicker than ever before.',
    whyChooseTitle: 'Why Customers Choose SAINTO',
    whyChooseIntro:
      'In a market often plagued by counterfeits and inflated prices, SAINTO offers a beacon of trust and value:',
    authenticatedAssurance:
      'Authenticated Assurance: We meticulously source our curated collection from globally trusted and official authentication platforms, guaranteeing the legitimacy of every item.',
    unparalleledSelection:
      'Unparalleled Selection: Access to an immense, diverse product catalog ensures you find exactly what you\'re looking for, at a price that makes sense.',
    speedConvenience:
      'Speed & Convenience: Our streamlined logistics mean your desired fashion arrives at your doorstep with unprecedented speed for the region.',
    trustedTransparent:
      'Trusted & Transparent: We are dedicated to building long-term relationships based on honesty and reliability. Your trust is our greatest asset, and we\'re here to stay, committed to serving our community for the long haul.',
    saintoStandardTitle: 'The SAINTO Standard',
    saintoStandardP1: 'We live by our guiding philosophy: "FIRST & FINEST."',
    saintoStandardP2:
      'FIRST: As the pioneering fashion retail platform of its kind in Mongolia, we are at the forefront of innovation, setting new standards for authenticity, accessibility, and customer experience in Central Asia.',
    saintoStandardP3:
      'FINEST: We are uncompromising in our pursuit of excellence, from the quality of our authenticated products to the seamlessness of our service. Every detail is curated to deliver the best.',
    saintoStandardP4:
      'Our ambition doesn\'t stop here. We envision SAINTO expanding far beyond our current horizons, becoming the dominant fashion retail platform across Central Asia and beyond, eventually encompassing a wide array of affordable and luxurious clothing for all. We possess the ambition, the vision, and the unwavering resolve to make it happen.',
    investTitle: 'Invest in Our Vision',
    investIntro:
      'Join us as we redefine fashion retail in Central Asia and beyond. We are actively seeking partners who share our passion for authenticity, innovation, and growth.',
    investButton: 'Learn More About Investment Opportunities',
    footerText: `©${new Date().getFullYear()} SAINTO. All rights reserved.`,
  },
  mn: {
    headerTitle: 'Анхдагч байх нь урлаг',
    heroSubtitle: 'Загвар, Жинхэнэ байдал, Боломжийг Холбож байна.',
    openLetterTitle: 'Нээлттэй Захидал',
    openLetterP1:
      'Улаанбаатарын завгүй гудамжнаас хувцас загварын жижиглэн худалдааны шинэ алсын хараа бий болж байна. САЙНТО нь Монгол болон Төв Ази дахь хувцас загварын салбар өөрчлөгдөхөд бэлэн болсон гэсэн энгийн бөгөөд гүн гүнзгий ойлголтоос үүссэн юм. Хэрэглэгчид жинхэнэ бүтээгдэхүүн, боломжийн үнэ, амлалтаа биелүүлдэг найдвартай платформыг эрэлхийлж байв.',
    openLetterP2:
      'Бидний аялал 2023 оны 12-р сард эхэлж, амбицын үрийг суулгасан бөгөөд богино хугацааны завсарлагааны дараа 2025 оны 2-р сард албан ёсоор хөгжүүлэлтээ эхлүүлсэн. Эхэндээ ухаалаг хэрэглэгчид болон баталгаатай дэлхийн хувцас загварын хоорондох зайг холбох гэсэн нэгдмэл алсын хараа нь бүс нутгийн онлайн жижиглэн худалдааг дахин тодорхойлоход зориулагдсан бат бөх платформ болж хувирч байна.',
    openLetterP3:
      'САЙНТО-д бид жинхэнэ, өндөр чанартай хувцас загварт хүрэх нь энгийн, хурдан бөгөөд өргөн хүрээтэй байх ёстой гэдэгт гүнээ итгэдэг. Бид худалданавалт бүр зөвхөн гүйлгээ биш, харин итгэл үнэмшил, хэв маягт оруулсан хөрөнгө оруулалт байх баталгааг хангахын тул энд байна.',
    quoteText:
      'Загвар гэдэг нь зүгээр л хувцас биш; энэ бол өөртөө итгэх итгэл, жинхэнэ байдал, мөн таны хэсэг бүрээр дамжуулан өгүүлдэг түүх юм.',
    quoteAuthor: '—САЙНТО-гийн Алсын Хараа',
    coreValuesTitle: 'Нээлттэй Нийгэмлэг, Энгийн, Өргөн, Шуурхай',
    coreValuesIntro:
      'Бидний амлалт зөвхөн бүтээгдэхүүнээс илүү өргөн хүрээтэй. Бид шийдвэр бүрийг удирдан чиглүүлдэг үндсэн үнэт зүйлсэд суурилсан платформыг бий болгож байна:',
    community:
      'Нийгэмлэг: САЙНТО бол зүгээр нэг зах зээл биш; энэ бол хувцас загварын сонирхогчид жинхэнэ байдалтай холбогддог өсөн нэмэгдэж буй нийгэмлэг юм. Бид итгэлцэл, жинхэнэ хэв маягийн төлөөх нийтлэг хүсэл тэмүүллийн орчинг бүрдүүлдэг.',
    simple:
      'Энгийн: Бид нарийн төвөгтэй байдлыг арилгаж, хялбар, тасралтгүй худалдааны туршлагыг санал болгодог. Үзэхээс эхлээд төлбөр тооцоо хүртэл тодорхой, хялбар байдал нь хамгийн чухал.',
    large:
      'Өргөн: Манай мэдээллийн санд өдөр тутмын хэрэглээнээс эхлээд өндөр загварын бүтээгдэхүүн хүртэл 500,000 гаруй төрлийн бүтээгдэхүүн бий. Энэхүү өргөн сонголт нь 8 настай хүүхдийн анхны брэндийн бүтээгдэхүүнээс эхлээд 80 настай хүний ​​цаг хугацааг давсан бүтээгдэхүүн хүртэл хүн бүрт зориулсан зүйл байх баталгааг хангадаг.',
    swift:
      'Шуурхай: Хонг Конг дахь агуулахаас стратегийн эх үүсвэр ашиглан бид тээвэрлэлтийн хугацааг мэдэгдэхүйц хурдасгаж, дэлхийн хувцас загварыг бүс нутагт урьд өмнө байгаагүй хурдан хүргэхээр зорьж байна.',
    whyChooseTitle: 'Хэрэглэгчид САЙНТО-г Яагаад Сонгодог вэ?',
    whyChooseIntro:
      'Хуурамч бүтээгдэхүүн, хэт өндөр үнээр дүүрэн зах зээлд САЙНТО нь итгэлцэл, үнэ цэнийн гэрэлт цамхаг болж байна:',
    authenticatedAssurance:
      'Баталгаатай Баталгаа: Бид сонгосон цуглуулгаа дэлхийн хэмжээнд итгэмжлэгдсэн, албан ёсны баталгаажуулалтын платформоос нарийн нягтлан авдаг бөгөөд ингэснээр бүтээгдэхүүн бүрийн жинхэнэ байдлыг баталгаажуулдаг.',
    unparalleledSelection:
      'Хосгүй Сонголт: Асар том, олон төрлийн бүтээгдэхүүний каталогид нэвтрэх нь таны хайж буй зүйлийг яг таг олох боломжийг олгодог.',
    speedConvenience:
      'Хурд ба Тав Тух: Бидний оновчтой логистик нь таны хүссэн хувцас загварыг бүс нутагт урьд өмнө байгаагүй хурдаар таны үүдэнд хүргэнэ гэсэн үг.',
    trustedTransparent:
      'Итгэмжлэгдсэн ба Ил Тод: Бид шударга, найдвартай байдалд суурилсан урт хугацааны харилцааг бий болгохыг зорьдог. Таны итгэл бол бидний хамгийн том хөрөнгө бөгөөд бид энд үлдэж, нийгэмлэгтээ урт хугацаанд үйлчлэхээр зорьж байна.',
    saintoStandardTitle: 'САЙНТО-гийн Стандарт',
    saintoStandardP1: 'Бид "ЭХЛЭЛ БА ШИЛДЭГ" гэсэн удирдамж философио баримталдаг.',
    saintoStandardP2:
      'ЭХЛЭЛ: Монголын анхдагч хувцас загварын жижиглэн худалдааны платформ болохын хувьд бид Төв Ази дахь жинхэнэ байдал, хүртээмжтэй байдал, хэрэглэгчийн туршлагын шинэ стандартыг тогтоож, инновацийн тэргүүн эгнээнд байна.',
    saintoStandardP3:
      'ШИЛДЭГ: Бид баталгаатай бүтээгдэхүүний чанараас эхлээд үйлчилгээний тасралтгүй байдал хүртэл төгс төгөлдөр байдлыг эрэлхийлэхдээ буулт хийдэггүй. Бүх нарийн ширийн зүйлийг хамгийн сайн үр дүнг өгөхийн тулд боловсруулсан.',
    saintoStandardP4:
      'Бидний амбиц энд зогсохгүй. Бид САЙНТО-гоо одоогийн хил хязгаараас хальж, Төв Ази болон бусад бүс нутагт хувцас загварын жижиглэн худалдааны тэргүүлэх платформ болж, эцэст нь бүх хүмүүст зориулсан хямд, тансаг хувцасны өргөн сонголтыг хамарна гэж төсөөлж байна. Бидэнд үүнийг хэрэгжүүлэх амбиц, алсын хараа, зориг бий.',
    investTitle: 'Бидний Алсын Хараанд Хөрөнгө Оруулна Уу',
    investIntro:
      'Бидэнтэй хамт Төв Ази болон бусад бүс нутагт хувцас загварын жижиглэн худалдааг дахин тодорхойлоход нэгдээрэй. Бид жинхэнэ байдал, инноваци, өсөлтийн төлөөх хүсэл тэмүүллээ хуваалцах түншүүдийг идэвхтэй эрэлхийлж байна.',
    investButton: 'Хөрөнгө Оруулалтын Боломжуудын Тухай Илүү Ихийг Мэдэх',
    footerText: `©${new Date().getFullYear()} САЙНТО. Бүх эрх хуулиар хамгаалагдсан.`,
  },
};

const App = () => {
  const [lang, setLang] = useState<'en' | 'mn'>('en');
  const [isChangingLang, setIsChangingLang] = useState(false);
  const t = content[lang];

  const [heroBackgroundStyles, setHeroBackgroundStyles] = useState({
    imageOpacity: 0.8,
    filter: 'blur(0px)',
    overlayOpacity: 0,
  });

  const [mainBackgroundOpacity, setMainBackgroundOpacity] = useState(0);

  const toggleLanguage = () => {
    setIsChangingLang(true);
    setTimeout(() => {
      setLang((prevLang) => (prevLang === 'en' ? 'mn' : 'en'));
      setIsChangingLang(false);
    }, 200);
  };

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

  return (
    <motion.div
      className="min-h-screen bg-black text-gray-100 font-inter antialiased overflow-x-hidden relative"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
    >
      <motion.header
        className="px-6 md:px-16 lg:px-24 flex justify-between items-center py-6 relative z-30"
        variants={textVariants}
      >
        <h1 className="text-xl md:text-2xl font-semibold text-white"></h1>
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
          className="fixed inset-0 bg-black z-10"
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
          {t.headerTitle}
        </motion.h1>
        <motion.p
          className="text-2xl md:text-3xl font-playfair-display font-medium text-gray-300 tracking-tight leading-relaxed relative z-20"
          variants={textVariants}
        >
          {t.heroSubtitle}
        </motion.p>
      </section>

      <main
        className="max-w-3xl mx-auto px-6 md:px-16 lg:px-24 py-20 space-y-32 relative z-20"
        style={{ backgroundColor: `rgba(0,0,0,${mainBackgroundOpacity})`, transition: 'background-color 0.3s ease-out' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={lang}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={contentTransitionVariants}
            className={isChangingLang ? 'opacity-0' : ''}
          >
            {isChangingLang && (
              <div className="absolute inset-0 bg-gray-900 animate-pulse rounded-lg z-50"></div>
            )}
            <motion.section
              className="mb-20"
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.h3
                className="text-4xl font-playfair-display font-light mb-10 tracking-tight text-white font-medium leading-tight"
                variants={textVariants}
              >
                {t.openLetterTitle}
              </motion.h3>
              <motion.p
                className="text-xl md:text-2xl font-playfair-display tracking-tight font-medium leading-snug mb-8 text-gray-300"
                variants={textVariants}
              >
                {t.openLetterP1}
              </motion.p>
              <motion.p
                className="text-xl md:text-2xl font-playfair-display tracking-tight font-medium leading-snug mb-8 text-gray-300"
                variants={textVariants}
              >
                {t.openLetterP2}
              </motion.p>
              <motion.p
                className="text-xl md:text-2xl font-playfair-display tracking-tight font-medium leading-snug mb-8 text-gray-300"
                variants={textVariants}
              >
                {t.openLetterP3}
              </motion.p>
            </motion.section>

            <motion.section
              className="w-full my-32"
              variants={imageVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <img
                src="https://i.pinimg.com/1200x/ad/d8/81/add8814c3c89b58eeed94fde089de780.jpg"
                alt="SAINTO Team Collaboration"
                className="w-full h-auto object-cover rounded-3xl shadow-2xl"
              />
            </motion.section>

            <motion.section
              className="my-32 p-10 md:p-16 bg-white/5 backdrop-blur-xl shadow-2xl rounded-3xl text-center border border-gray-800"
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.p
                className="text-3xl md:text-4xl font-playfair-display font-light italic leading-relaxed text-white mb-6"
                variants={textVariants}
              >
                &quot;{t.quoteText}&quot;
              </motion.p>
              <motion.p
                className="text-lg md:text-xl font-playfair-display font-medium text-gray-400"
                variants={textVariants}
              >
                {t.quoteAuthor}
              </motion.p>
            </motion.section>

            <motion.section
              className="mb-20"
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.h3 className="text-4xl font-playfair-display font-light mb-10 text-white" variants={textVariants}>
                {t.coreValuesTitle}
              </motion.h3>
              <motion.p
                className="text-xl md:text-2xl font-playfair-display font-light leading-loose mb-8 text-gray-300"
                variants={textVariants}
              >
                {t.coreValuesIntro}
              </motion.p>
              <ul className="list-none space-y-6 pl-0">
                <motion.li
                  className="flex items-start text-xl md:text-2xl leading-loose text-gray-300 font-inter"
                  variants={listItemVariants}
                >
                  <span className="inline-block w-3 h-3 rounded-full bg-gray-600 mr-5 mt-2 flex-shrink-0"></span>
                  <div>
                    <strong className="text-white font-medium font-playfair-display">{t.community.split(':')[0]}:</strong>
                    {t.community.split(':')[1]}
                  </div>
                </motion.li>
                <motion.li
                  className="flex items-start text-xl md:text-2xl leading-loose text-gray-300 font-inter"
                  variants={listItemVariants}
                >
                  <span className="inline-block w-3 h-3 rounded-full bg-gray-600 mr-5 mt-2 flex-shrink-0"></span>
                  <div>
                    <strong className="text-white font-medium font-playfair-display">{t.simple.split(':')[0]}:</strong>
                    {t.simple.split(':')[1]}
                  </div>
                </motion.li>
                <motion.li
                  className="flex items-start text-xl md:text-2xl leading-loose text-gray-300 font-inter"
                  variants={listItemVariants}
                >
                  <span className="inline-block w-3 h-3 rounded-full bg-gray-600 mr-5 mt-2 flex-shrink-0"></span>
                  <div>
                    <strong className="text-white font-medium font-playfair-display">{t.large.split(':')[0]}:</strong>
                    {t.large.split(':')[1]}
                  </div>
                </motion.li>
                <motion.li
                  className="flex items-start text-xl md:text-2xl leading-loose text-gray-300 font-inter"
                  variants={listItemVariants}
                >
                  <span className="inline-block w-3 h-3 rounded-full bg-gray-600 mr-5 mt-2 flex-shrink-0"></span>
                  <div>
                    <strong className="text-white font-medium font-playfair-display">{t.swift.split(':')[0]}:</strong>
                    {t.swift.split(':')[1]}
                  </div>
                </motion.li>
              </ul>
            </motion.section>

            <motion.section
              className="w-full my-32"
              variants={imageVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <img
                src="https://i.pinimg.com/1200x/fd/b4/b4/fdb4b43651c4dcd50bd5c785b3d9a043.jpg"
                alt="Abstract Fashion Art"
                className="w-full h-auto object-cover rounded-3xl shadow-2xl"
              />
            </motion.section>

            <motion.section
              className="mb-20"
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.h3 className="text-4xl font-playfair-display font-light mb-10 text-white" variants={textVariants}>
                {t.whyChooseTitle}
              </motion.h3>
              <motion.p
                className="text-xl md:text-2xl font-playfair-display font-light leading-loose mb-8 text-gray-300"
                variants={textVariants}
              >
                {t.whyChooseIntro}
              </motion.p>
              <ul className="list-none space-y-6 pl-0">
                <motion.li
                  className="flex items-start text-xl md:text-2xl leading-loose text-gray-300 font-inter"
                  variants={listItemVariants}
                >
                  <span className="inline-block w-3 h-3 rounded-full bg-gray-600 mr-5 mt-2 flex-shrink-0"></span>
                  <div>
                    <strong className="text-white font-medium font-playfair-display">{t.authenticatedAssurance.split(':')[0]}:</strong>
                    {t.authenticatedAssurance.split(':')[1]}
                  </div>
                </motion.li>
                <motion.li
                  className="flex items-start text-xl md:text-2xl leading-loose text-gray-300 font-inter"
                  variants={listItemVariants}
                >
                  <span className="inline-block w-3 h-3 rounded-full bg-gray-600 mr-5 mt-2 flex-shrink-0"></span>
                  <div>
                    <strong className="text-white font-medium font-playfair-display">{t.unparalleledSelection.split(':')[0]}:</strong>
                    {t.unparalleledSelection.split(':')[1]}
                  </div>
                </motion.li>
                <motion.li
                  className="flex items-start text-xl md:text-2xl leading-loose text-gray-300 font-inter"
                  variants={listItemVariants}
                >
                  <span className="inline-block w-3 h-3 rounded-full bg-gray-600 mr-5 mt-2 flex-shrink-0"></span>
                  <div>
                    <strong className="text-white font-medium font-playfair-display">{t.speedConvenience.split(':')[0]}:</strong>
                    {t.speedConvenience.split(':')[1]}
                  </div>
                </motion.li>
                <motion.li
                  className="flex items-start text-xl md:text-2xl leading-loose text-gray-300 font-inter"
                  variants={listItemVariants}
                >
                  <span className="inline-block w-3 h-3 rounded-full bg-gray-600 mr-5 mt-2 flex-shrink-0"></span>
                  <div>
                    <strong className="text-white font-medium font-playfair-display">{t.trustedTransparent.split(':')[0]}:</strong>
                    {t.trustedTransparent.split(':')[1]}
                  </div>
                </motion.li>
              </ul>
            </motion.section>

            <motion.section
              className="mb-20"
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.h3 className="text-4xl font-playfair-display font-light mb-10 text-white" variants={textVariants}>
                {t.saintoStandardTitle}
              </motion.h3>
              <motion.p
                className="text-xl md:text-2xl font-playfair-display font-light leading-loose mb-8 text-gray-300"
                variants={textVariants}
              >
                {t.saintoStandardP1}
              </motion.p>
              <motion.p
                className="text-xl md:text-2xl font-playfair-display font-light leading-loose mb-8 text-gray-300"
                variants={textVariants}
              >
                <strong className="text-white font-medium font-playfair-display">{t.saintoStandardP2.split(':')[0]}:</strong>
                {t.saintoStandardP2.split(':')[1]}
              </motion.p>
              <motion.p
                className="text-xl md:text-2xl font-playfair-display font-light leading-loose mb-8 text-gray-300"
                variants={textVariants}
              >
                <strong className="text-white font-medium font-playfair-display">{t.saintoStandardP3.split(':')[0]}:</strong>
                {t.saintoStandardP3.split(':')[1]}
              </motion.p>
              <motion.p
                className="text-xl md:text-2xl font-playfair-display font-light leading-loose text-gray-300"
                variants={textVariants}
              >
                {t.saintoStandardP4}
              </motion.p>
            </motion.section>

            <motion.section
              className="my-32 text-center flex flex-col items-center justify-center"
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.h3 className="text-4xl font-playfair-display font-medium leading-tight mb-6 text-white" variants={textVariants}>
                {t.investTitle}
              </motion.h3>
              <motion.p
                className="text-xl md:text-2xl font-playfair-display font-light leading-loose max-w-2xl mx-auto mb-12 text-gray-300"
                variants={textVariants}
              >
                {t.investIntro}
              </motion.p>
              <motion.button
                onClick={() => alert('Investment Opportunities Coming Soon!')}
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white rounded-full bg-white/20 backdrop-blur-2xl shadow-xl border border-white/30 hover:bg-white/30 hover:border-white/50 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                aria-label="Learn more about investment opportunities"
                whileHover={{ scale: 1.05, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -2px rgba(0,0,0,0.05)' }}
                whileTap={{ scale: 0.95 }}
                variants={textVariants}
              >
                {t.investButton}
              </motion.button>
            </motion.section>
          </motion.div>
        </AnimatePresence>
      </main>

      <motion.button
        onClick={toggleLanguage}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 px-5 py-3 rounded-full text-base font-medium bg-white/10 backdrop-blur-md text-gray-200 shadow-lg border border-gray-700 hover:bg-white/15 transition-all duration-300 ease-in-out z-50 flex items-center justify-center min-w-[120px]"
        aria-label="Toggle language"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {lang === 'en' ? 'Монгол (MN)' : 'English (EN)'}
      </motion.button>

      <style>{`
        body {
          background-color: black;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        .font-playfair-display {
          font-family: 'Playfair Display', serif;
        }
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
        .bg-grid-pattern {
          background-image: linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>
    </motion.div>
  );
};

export default App;