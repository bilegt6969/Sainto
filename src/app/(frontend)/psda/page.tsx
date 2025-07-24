import React from 'react';
import data from './data.json'; // Adjust this path if needed

const GatherPage = () => {
 

  // Filter products to ensure we only use those with a valid pictureUrl
  const availableProducts = data?.data?.productsList?.filter(
    (product) => product.pictureUrl && product.pictureUrl.trim() !== ''
  ) || [];

  // Define the number of images you want in the arc.
  const numImagesInArc =11;

  // Prepare the array of images for the arc using your exact logic
  const imagesForArc = Array.from({ length: numImagesInArc }).map((_, index) => {
    // Use modulo operator to cycle through available products if numImagesInArc > availableProducts.length
    const productIndex = index % availableProducts.length;
    const product = availableProducts[productIndex];

    // Get the image URL and title, providing fallbacks
    const url = product?.pictureUrl;
    const alt = product?.title || `Product image ${index + 1}`;

    return {
      id: `arc-image-${index}`, // Unique ID for React key prop
      url: url || '/placeholder.png', // Use product URL or a fallback placeholder image
      alt: alt,
    };
  });

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Arc Container */}
      <div className="relative w-full h-96 flex justify-center items-end">
        {imagesForArc.map((img, index) => {
          // Calculate position for each image in the arc
          const totalAngle = 178; // degrees
          const startAngleOffset = -89; // degrees
          const currentAngle = startAngleOffset + (index / (numImagesInArc - 1)) * totalAngle;
          const arcRadius = 360;
          
          return (
            <div
              key={index}
              className="absolute bottom-0 left-1/2 w-30 h-30 overflow-hidden rounded-2xl bg-white shadow-lg"
              style={{
                width: '120px',
                height: '120px',
                transform: `
                  translateX(-50%) 
                  rotate(${currentAngle}deg) 
                  translateY(-${arcRadius}px)
                `,
                boxShadow: '0 6px 15px rgba(255, 255, 255, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'transform 0.3s ease-out'
              }}
            >
              <img
                src={img.url}
                alt={img.alt}
                className="w-full h-full object-cover rounded-xl"
                style={{
                  transform: `rotate(${-currentAngle}deg)`
                }}
              />
            </div>
          );
        })}
        
        {/* Blurry bottom effect */}
        <div 
          className="absolute bottom-0 left-0 w-full pointer-events-none"
          style={{
            height: '200px',
            background: 'linear-gradient(to top, #000, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0))',
            zIndex: 5
          }}
        />
      </div>

      {/* Center Content */}
 

      {/* Navigation Arrow */}
      <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
        <button className="text-white text-2xl hover:text-gray-300 transition-colors">
          ›
        </button>
      </div>
    </div>
  );
};

export default GatherPage;