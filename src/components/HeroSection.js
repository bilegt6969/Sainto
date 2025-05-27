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
  backgroundImage: {
    asset: {
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
    backgroundImage,
  } = heroData;

  const imageUrl = backgroundImage?.asset?.url
    ? urlFor(backgroundImage).url()
    : '/default-hero.jpg';

  return (
    <section className="relative h-[80vh] max-h-[800px] mx-2 md:mx-2 w-full overflow-hidden rounded-[2rem] border border-neutral-700 md:h-[75vh] sm:h-[70vh] xs:h-[60vh]">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={imageUrl}
          alt="Hero background"
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover"
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
