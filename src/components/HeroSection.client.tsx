import React from 'react';

// Define types for the media objects
type MediaObject = {
  url: string;
  alt?: string;
  // Add other media properties as needed
};

// Define types for text elements
type TextElement = {
  text: string;
  style?: string;
  size?: string;
  letterSpacing?: string;
  bold?: boolean;
  color?: string;
};

// Define types for buttons
type CTAButton = {
  text: string;
  url: string;
  targetBlank?: boolean;
  style?: 'primary' | 'secondary' | 'link';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  iconPosition?: 'left' | 'right';
};

// Define types for spacing
type Spacing = {
  paddingTop?: string;
  paddingBottom?: string;
  paddingX?: string;
  // Add other spacing properties as needed
};

// Define types for content alignment
type ContentAlignment = {
  textAlignment?: string;
  verticalAlignment?: string;
  maxWidth?: string;
};

// Define the main HeroData type
type HeroData = {
  headline?: TextElement;
  subHeadline?: TextElement;
  supportingText?: TextElement;
  ctaButtons?: CTAButton[];
  backgroundImage?: MediaObject;
  backgroundVideo?: MediaObject;
  backgroundColor?: string;
  backgroundType?: 'color' | 'image' | 'video' | 'gradient';
  spacing?: Spacing;
  contentAlignment?: ContentAlignment;
  minHeight?: string;
  darkMode?: boolean;
  darkModeBackgroundColor?: string;
};

// Define props for the component
interface HeroSectionProps {
  heroData?: HeroData;
}

function HeroSection({ heroData }: HeroSectionProps) {
  // Handle cases where heroData might be missing
  if (!heroData) {
    return null;
  }

  // Destructure for easier access
  const {
    headline,
    subHeadline,
    supportingText,
    ctaButtons,
    backgroundImage,
    backgroundVideo,
    backgroundColor,
    backgroundType,
    spacing,
    contentAlignment,
    minHeight,
    darkMode,
    darkModeBackgroundColor,
  } = heroData;

  // --- Determine Background Styles ---
  const backgroundStyles: React.CSSProperties = {};
  if (backgroundType === 'color') {
    // Handle dark mode color override
    const bgColor = darkMode && darkModeBackgroundColor ? darkModeBackgroundColor : backgroundColor;
    backgroundStyles.backgroundColor = bgColor || '#ffffff';
  } else if (backgroundType === 'image' && backgroundImage?.url) {
    backgroundStyles.backgroundImage = `url(${backgroundImage.url})`;
    backgroundStyles.backgroundSize = 'cover';
    backgroundStyles.backgroundPosition = 'center';
  }

  // --- Construct CSS Classes from CMS data ---
  const paddingClasses = `${spacing?.paddingTop || 'pt-20'} ${spacing?.paddingBottom || 'pb-20'} ${spacing?.paddingX || 'px-6'}`;
  const alignmentClasses = `${contentAlignment?.textAlignment || 'text-center'} ${contentAlignment?.verticalAlignment || 'items-center'}`;
  const minHeightClass = minHeight || 'min-h-[80vh]';
  const maxWidthClass = contentAlignment?.maxWidth || 'max-w-[980px]';

  const sectionClasses = `
    relative flex flex-col justify-center overflow-hidden
    ${paddingClasses}
    ${alignmentClasses}
    ${minHeightClass}
    ${darkMode ? 'text-white' : 'text-gray-900'}
  `;

  // --- Render ---
  return (
    <section className={sectionClasses} style={backgroundStyles}>
      {/* Optional: Background Video */}
      {backgroundType === 'video' && backgroundVideo?.url && (
        <video
          src={backgroundVideo.url}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover -z-10"
        />
      )}

      {/* Content Container */}
      <div className={`relative z-10 w-full mx-auto ${maxWidthClass}`}>
        {/* Headline */}
        {headline?.text && (
          <h1
            className={`
              font-semibold
              ${headline.style || 'sans'}
              ${headline.size || 'text-7xl'}
              ${headline.letterSpacing || 'tracking-tight'}
              ${headline.bold ? 'font-bold' : 'font-medium'}
              mb-4
            `}
            style={{ color: darkMode ? '#f5f5f7' : headline.color || '#1d1d1f' }}
          >
            {headline.text}
          </h1>
        )}

        {/* Sub-Headline */}
        {subHeadline?.text && (
          <h2
            className={`
              ${subHeadline.style || 'sans'}
              ${subHeadline.size || 'text-2xl'}
              ${subHeadline.letterSpacing || 'tracking-normal'}
              ${subHeadline.bold ? 'font-bold' : 'font-normal'}
              mb-6
            `}
            style={{ color: darkMode ? '#a1a1a6' : subHeadline.color || '#6e6e73' }}
          >
            {subHeadline.text}
          </h2>
        )}

        {/* Supporting Text */}
        {supportingText?.text && (
          <p
            className={`
              ${supportingText.style || 'sans'}
              ${supportingText.size || 'text-lg'}
              ${supportingText.letterSpacing || 'tracking-normal'}
              ${supportingText.bold ? 'font-bold' : 'font-normal'}
              mb-8
              max-w-prose
              ${contentAlignment?.textAlignment === 'text-center' ? 'mx-auto' : ''}
            `}
            style={{ color: darkMode ? '#f5f5f7' : supportingText.color || '#1d1d1f' }}
          >
            {supportingText.text}
          </p>
        )}

        {/* CTA Buttons */}
        {ctaButtons && ctaButtons.length > 0 && (
          <div className="flex flex-wrap gap-4 justify-center">
            {ctaButtons.map((button, index) => (
              <a
                key={index}
                href={button.url}
                target={button.targetBlank ? '_blank' : '_self'}
                rel={button.targetBlank ? 'noopener noreferrer' : undefined}
                className={`
                  inline-flex items-center justify-center px-5 py-2 rounded-full text-base font-medium transition-colors duration-200
                  ${button.style === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                  ${button.style === 'secondary' ? 'bg-gray-200 text-black hover:bg-gray-300' : ''}
                  ${button.style === 'link' ? 'text-blue-600 hover:underline' : ''}
                  ${button.size === 'large' ? 'px-6 py-3 text-lg' : ''}
                  ${button.size === 'small' ? 'px-4 py-1.5 text-sm' : ''}
                `}
              >
                {button.icon && button.iconPosition === 'left' && <span className="mr-2">{/* Icon SVG/Component */}</span>}
                {button.text}
                {button.icon && button.iconPosition === 'right' && <span className="ml-2">{/* Icon SVG/Component */}</span>}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default HeroSection;