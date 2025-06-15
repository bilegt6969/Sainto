'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Package, ShieldCheck, Globe, Zap } from 'lucide-react';

// --- Reusable Feature Card Component (Adapted from Support Page Design) ---
interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
  }
  
  const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
    <motion.div
      className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 h-full flex flex-col"
      whileHover={{ y: -5, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
    >
      <div className="mb-5 text-blue-400">{icon}</div>
      <h3 className="text-xl font-medium text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-neutral-400 leading-relaxed">{description}</p>
    </motion.div>
  );
  

// --- Arrow Icon for Links ---
const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1.5 transition-transform duration-300 group-hover:translate-x-1">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
);


// --- Main About Page Component ---
const AboutPage = () => {
    // Animation variants for Framer Motion
    const sectionVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.7,
                delay: 0.2,
                ease: [0.16, 1, 0.3, 1]
            }
        }
    };

    return (
        <div className="min-h-screen bg-black font-sans antialiased text-neutral-200">
            <main className="max-w-5xl mx-auto px-6 py-20 md:py-32">

                {/* --- 1. Hero Section --- */}
                <motion.section
                    className="text-center mb-24 md:mb-32"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <h1 className="text-5xl md:text-7xl font-semibold text-white tracking-tighter mb-6">
                        Бид таны ертөнцийг бүтээнэ
                    </h1>
                    <p className="text-lg md:text-xl text-neutral-400 max-w-3xl mx-auto">
                        Дэлхийн хувцас загварын шинэ шилдэг сонголтууд таны босгон дээр.
                    </p>
                </motion.section>

                {/* --- 2. Our Purpose Section --- */}
                <motion.section
                    className="grid md:grid-cols-3 gap-8 md:gap-12 mb-24 md:mb-32 items-start"
                    variants={sectionVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <div className="md:col-span-1">
                        <h2 className="text-3xl md:text-4xl font-medium text-white tracking-tight">Бидний тухай</h2>
                    </div>
                    <div className="md:col-span-2">
                        <p className="text-lg text-neutral-300 leading-relaxed">
                            Fifteen years ago, not all businesses could accept credit cards. Square set out to change that — inventing the first mobile card reader of its kind. This allowed businesses to take payments anywhere and keep thriving in the economy. It also completely disrupted how the financial system thinks about small businesses.
                        </p>
                        <p className="mt-4 text-lg text-neutral-300 leading-relaxed">
                            Today, Square is the largest business technology platform serving all kinds of businesses. From global chains to mom-and-pop shops, our tools unlock endless possibilities.
                        </p>
                    </div>
                </motion.section>

                {/* --- 3. The Revolution Story Section --- */}
                <motion.section
                    className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 md:p-12 mb-24 md:mb-32"
                    variants={sectionVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="order-2 md:order-1">
                            <h3 className="text-3xl font-medium text-white tracking-tight mb-4">
                                Захиалгын соёлыг шинэчлэгч.
                            </h3>
                            <p className="text-neutral-400 leading-relaxed mb-6">
                                Инстаграм, Фэйсбүүкээр дамжуулан захиалга хийдэг эрсдэлтэй, ойлгомгүй үйл явцыг бид халж байна. Манай платформ нь GOAT.com-ийн агуулахтай шууд холбогдож, таны хүссэн бүтээгдэхүүнийг найдвартай, хурдан, ил тод байдлаар захиалах боломжийг олгодог.
                            </p>
                            <a href="/shop" className="inline-flex items-center text-blue-400 font-medium hover:text-blue-300 transition-colors group">
                                Процессийг танилцуулах <ArrowRightIcon />
                            </a>
                        </div>
                        <div className="order-1 md:order-2 w-full h-auto">
                            <img
                                src="image_0498d1.jpg"
                                alt="A person surrounded by sneaker boxes"
                                className="rounded-xl object-cover w-full h-full"
                                onError={(e) => { e.currentTarget.src = 'https://placehold.co/800x800/18181b/444444?text=Style+Revolution'; }}
                            />
                        </div>
                    </div>
                </motion.section>

                {/* --- 4. Our Ecosystem Section --- */}
                <motion.section
                    className="mb-24 md:mb-32"
                    variants={sectionVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <div className="text-center mb-16 md:mb-20">
                        <h2 className="text-4xl md:text-5xl font-medium text-white tracking-tight">
                            Бидний танд санал болгох зүйлс
                        </h2>
                        <p className="mt-4 text-lg text-neutral-400 max-w-2xl mx-auto">
                            Таны захиалгын туршлагыг дээд зэргээр хялбар, найдвартай байлгах цогц систем.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <FeatureCard
                            icon={<Globe size={28} />}
                            title="Өргөн сонголт"
                            description="Дэлхийн шилдэг брэндийн 400,000+ бараанаас сонголтоо хийгээрэй."
                        />
                        <FeatureCard
                            icon={<ShieldCheck size={28} />}
                            title="Найдвартай эх үүсвэр"
                            description="Бүтээгдэхүүн бүр GOAT.com-оос баталгаажиж, танд хүргэгддэг."
                        />
                        <FeatureCard
                            icon={<Zap size={28} />}
                            title="Хялбар захиалга"
                            description="Хэдхэн товчлуур дараад таны захиалга шууд Хонг Конгоос хөдөлнө."
                        />
                        <FeatureCard
                            icon={<Package size={28} />}
                            title="Анхдагч шийдэл"
                            description="Монголын анхны гудамжны хувцасны нэгдсэн, найдвартай платформ."
                        />
                    </div>
                </motion.section>

                {/* --- 5. CTA (Call to Action) Section --- */}
                <motion.section
                    className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 md:p-12 text-center"
                    variants={sectionVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <h2 className="text-3xl md:text-4xl font-medium text-white tracking-tight mb-4">
                        Өөрийн стилийг бүтээхэд бэлэн үү?
                    </h2>
                    <p className="text-lg text-neutral-400 mb-8 max-w-2xl mx-auto">
                        Дэлхийн трэндийг өнөөдөр мэдэрч, өөрийн хүссэн хувцас, пүүзээ захиалаарай.
                    </p>
                    <motion.a
                        href="/shop"
                        className="inline-block bg-blue-600 text-white font-medium px-8 py-3 rounded-lg text-lg hover:bg-blue-500 transition-all duration-300 shadow-lg shadow-blue-500/20"
                        whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                    >
                        Коллекц үзэх
                    </motion.a>
                </motion.section>

            </main>

            {/* Global Styles for Font */}
            <style jsx global>{`
                @font-face {
                    font-family: 'SF Pro Display';
                    src: url('/fonts/sf-pro-display-regular.woff2') format('woff2');
                    font-weight: normal;
                    font-style: normal;
                    font-display: swap;
                }
                @font-face {
                    font-family: 'SF Pro Display';
                    src: url('/fonts/sf-pro-display-medium.woff2') format('woff2');
                    font-weight: 500;
                    font-style: normal;
                    font-display: swap;
                }
                @font-face {
                    font-family: 'SF Pro Display';
                    src: url('/fonts/sf-pro-display-semibold.woff2') format('woff2');
                    font-weight: 600;
                    font-style: normal;
                    font-display: swap;
                }
                body {
                    font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, Helvetica, Arial, sans-serif;
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                    background-color: black;
                    color: #f5f5f5;
                }
            `}</style>
        </div>
    );
};

export default AboutPage;