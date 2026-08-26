import React, { useState } from 'react';
import officialLogoImg from '../assets/images/popidi_official_logo.png';

interface NeonLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  className?: string;
  showSubtitle?: boolean;
  pulse?: boolean;
}

export const NeonLogo: React.FC<NeonLogoProps> = ({ 
  size = 'md', 
  className = '',
  showSubtitle = false,
  pulse = false
}) => {
  const [imgSrc, setImgSrc] = useState<string>(officialLogoImg || '/popidi_official_logo.png');
  const [retryStep, setRetryStep] = useState(0);

  // Natural dimension presets (maintaining 1:1 natural aspect ratio)
  const sizeConfig = {
    sm: {
      box: 'w-16 h-16 sm:w-20 sm:h-20',
      title: 'text-xs font-black',
      subtitle: 'text-[9px]',
    },
    md: {
      box: 'w-28 h-28 sm:w-36 sm:h-36',
      title: 'text-sm sm:text-base font-black',
      subtitle: 'text-[11px]',
    },
    lg: {
      box: 'w-44 h-44 sm:w-56 sm:h-56',
      title: 'text-base sm:text-lg font-black',
      subtitle: 'text-xs',
    },
    xl: {
      box: 'w-64 h-64 sm:w-80 sm:h-80',
      title: 'text-lg sm:text-xl font-black',
      subtitle: 'text-xs sm:text-sm',
    },
    hero: {
      box: 'w-80 h-80 sm:w-[420px] sm:h-[420px] md:w-[500px] md:h-[500px] lg:w-[560px] lg:h-[560px] max-w-full',
      title: 'text-2xl sm:text-3xl font-black',
      subtitle: 'text-xs sm:text-sm',
    }
  };

  const cfg = sizeConfig[size] || sizeConfig.md;

  const handleImageError = () => {
    const fallbackChain = [
      '/popidi_official_logo.png',
      '/popidi_logo.png',
      '/logo.png',
      '/popidi_logo.jpg'
    ];

    if (retryStep < fallbackChain.length) {
      setImgSrc(fallbackChain[retryStep]);
      setRetryStep(prev => prev + 1);
    }
  };

  return (
    <div className={`inline-flex flex-col items-center justify-center select-none text-center ${className}`}>
      {/* Natural Image Logo Container without alterations */}
      <div className={`relative flex items-center justify-center aspect-square ${cfg.box}`}>
        <img
          src={imgSrc}
          alt="PO-PI-DI Hamburgueria & Choperia"
          referrerPolicy="no-referrer"
          className={`relative z-10 w-full h-full object-contain transition-transform duration-300 ${pulse ? 'animate-pulse-smooth' : ''}`}
          loading="eager"
          onError={handleImageError}
        />
      </div>

      {/* Optional Brand Subtitle */}
      {showSubtitle && (
        <div className="text-center mt-2 flex flex-col items-center">
          <div className={`neon-text-green font-black tracking-widest uppercase ${cfg.title}`}>
            PO-PI-DI
          </div>
          <div className={`neon-text-pink font-semibold italic -mt-0.5 font-serif ${cfg.subtitle}`}>
            Hamburgueria & Choperia
          </div>
        </div>
      )}
    </div>
  );
};
