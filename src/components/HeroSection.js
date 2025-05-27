import Image from 'next/image';
import Link from 'next/link';
import { urlFor } from '../../lib/sanity';

const DEFAULT_HERO = {
  title: 'Welcome to Our Store',
  subtitle: 'Discover amazing products',
  primaryButton: {
    text: 'Shop Now',
    link: '/products',
  },
  backgroundImageDesktop: {
    asset: {
      _id: 'default',
      url: '/default-hero.jpg',
    },
  },
};

export default function HeroSection({ heroData = DEFAULT_HERO }) {
  const {
    title,
    subtitle,
    description,
    primaryButton,
    backgroundImageDesktop,
    backgroundImageTablet,
    backgroundImageMobile,
  } = heroData;

  // Helper function to get image URL from Sanity image object
  const getImageUrl = (imageObj, fallback = '/default-hero.jpg') => {
    if (!imageObj?.asset) return fallback;
    
    try {
      // Use urlFor for Sanity image optimization
      return urlFor(imageObj).url();
    } catch  {
      // Fallback to direct asset URL if urlFor fails
      return imageObj.asset.url || fallback;
    }
  };

  // Get URLs for all breakpoints with proper fallbacks
  const desktopImageUrl = getImageUrl(backgroundImageDesktop);
  const tabletImageUrl = getImageUrl(backgroundImageTablet, desktopImageUrl);
  const mobileImageUrl = getImageUrl(backgroundImageMobile, tabletImageUrl);

  return (
    <section className="relative h-[80vh] max-h-[800px] mx-2 md:mx-2 w-full overflow-hidden rounded-[2rem] border border-neutral-700 md:h-[75vh] sm:h-[70vh] xs:h-[60vh]">
      {/* Desktop Background Image */}
      <div className="absolute inset-0 -z-10 hidden lg:block">
        <Image
          src={desktopImageUrl}
          alt="Hero background desktop"
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{
            objectPosition: backgroundImageDesktop?.hotspot 
              ? `${backgroundImageDesktop.hotspot.x * 100}% ${backgroundImageDesktop.hotspot.y * 100}%`
              : 'center',
          }}
        />
      </div>

      {/* Tablet Background Image */}
      <div className="absolute inset-0 -z-10 hidden md:block lg:hidden">
        <Image
          src={tabletImageUrl}
          alt="Hero background tablet"
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{
            objectPosition: backgroundImageTablet?.hotspot 
              ? `${backgroundImageTablet.hotspot.x * 100}% ${backgroundImageTablet.hotspot.y * 100}%`
              : backgroundImageDesktop?.hotspot 
                ? `${backgroundImageDesktop.hotspot.x * 100}% ${backgroundImageDesktop.hotspot.y * 100}%`
                : 'center',
          }}
        />
      </div>

      {/* Mobile Background Image */}
      <div className="absolute inset-0 -z-10 block md:hidden">
        <Image
          src={mobileImageUrl}
          alt="Hero background mobile"
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{
            objectPosition: backgroundImageMobile?.hotspot 
              ? `${backgroundImageMobile.hotspot.x * 100}% ${backgroundImageMobile.hotspot.y * 100}%`
              : backgroundImageTablet?.hotspot 
                ? `${backgroundImageTablet.hotspot.x * 100}% ${backgroundImageTablet.hotspot.y * 100}%`
                : backgroundImageDesktop?.hotspot 
                  ? `${backgroundImageDesktop.hotspot.x * 100}% ${backgroundImageDesktop.hotspot.y * 100}%`
                  : 'center',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-center">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 text-white">
          <div className="max-w-2xl">
            <h1 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl leading-tight">
              {title}
            </h1>

            {subtitle && (
              <h2 className="mb-4 text-lg font-medium sm:text-xl md:text-2xl leading-snug">
                {subtitle}
              </h2>
            )}

            {description && (
              <p className="mb-6 text-base sm:text-lg md:text-xl leading-relaxed">
                {description}
              </p>
            )}

            {primaryButton && (
              <div className="mt-6">
                <Link
                  href={primaryButton.link}
                  className="inline-block rounded bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700 sm:text-base"
                >
                  {primaryButton.text}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}