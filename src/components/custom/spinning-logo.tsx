"use client"

import React from 'react';
import { cn } from '@/lib/utils';

export const SpinningLogos: React.FC = () => {
  // Responsive values - smaller for mobile, larger for desktop
  const radiusToCenterOfIcons = {
    mobile: 120, // Reduced from 200
    desktop: 200
  };
  const iconWrapperWidth = {
    mobile: 50, // Reduced from 80
    desktop: 80
  };
  const ringPadding = {
    mobile: 40, // Reduced from 60
    desktop: 60
  };

  const toRadians = (degrees: number): number => (Math.PI / 180) * degrees;

  const icons = [
    { src: '/assets/icons/ai-tools/chatgpt.svg', alt: 'ChatGPT' },
    { src: '/assets/icons/ai-tools/claude.svg', alt: 'Claude' },
    { src: '/assets/icons/games/pubg-mobile.svg', alt: 'PUBG Mobile' },
    { src: '/assets/icons/design/figma.svg', alt: 'Figma' },
    { src: '/assets/icons/ai-tools/gemini.svg', alt: 'Gemini' },
    { src: '/assets/icons/ai-tools/perplexity.svg', alt: 'Perplexity' },
    { src: '/assets/icons/gift-cards/valorant.svg', alt: 'Valorant' },
    { src: '/assets/icons/games/mobile-legends.svg', alt: 'Mobile Legends' },
    { src: '/assets/icons/ai-tools/github.svg', alt: 'GitHub' },
    { src: '/assets/icons/ai-tools/grok.svg', alt: 'Grok' },
    { src: '/assets/icons/design/canva.svg', alt: 'Canva' },
    { src: '/assets/icons/ai-tools/cursor.svg', alt: 'Cursor' },
  ];

  return (
    <div className="flex justify-center items-center w-full h-full p-2 md:p-4 overflow-hidden">
      {/* Mobile container */}
      <div
        style={{
          width: radiusToCenterOfIcons.mobile * 2.5 + iconWrapperWidth.mobile + ringPadding.mobile,
          height: radiusToCenterOfIcons.mobile * 2.5 + iconWrapperWidth.mobile + ringPadding.mobile,
        }}
        className="relative rounded-full bg-transparent block md:hidden"
      >
        <div className="absolute inset-0 animate-spin-slow">
          {icons.map((icon, index) => {
            const angle = (360 / icons.length) * index;
            return (
              <div
                key={`mobile-${index}`}
                style={{
                  top: `calc(50% - ${iconWrapperWidth.mobile / 2}px + ${radiusToCenterOfIcons.mobile * Math.sin(toRadians(angle))}px)`,
                  left: `calc(50% - ${iconWrapperWidth.mobile / 2}px + ${radiusToCenterOfIcons.mobile * Math.cos(toRadians(angle))}px)`,
                  width: iconWrapperWidth.mobile,
                  height: iconWrapperWidth.mobile,
                }}
                className={cn(
                  "absolute flex items-center justify-center rounded-full  border"
                )}
                aria-label={icon.alt}
              >
                <img src={icon.src} alt={icon.alt} className="w-8 h-8 object-contain" />
              </div>
            );
          })}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-background rounded-full w-24 h-24 flex items-center justify-center border-2">
            <img src="/assets/only-icon.svg" alt="OneDigitalSpot Logo" className="w-16 h-16 object-contain" />
          </div>
        </div>
      </div>

      {/* Desktop container */}
      <div
        style={{
          width: radiusToCenterOfIcons.desktop * 3 + iconWrapperWidth.desktop + ringPadding.desktop,
          height: radiusToCenterOfIcons.desktop * 3 + iconWrapperWidth.desktop + ringPadding.desktop,
        }}
        className="relative rounded-full bg-transparent hidden md:block"
      >
        <div className="absolute inset-0 animate-spin-slow">
          {icons.map((icon, index) => {
            const angle = (360 / icons.length) * index;
            return (
              <div
                key={`desktop-${index}`}
                style={{
                  top: `calc(50% - ${iconWrapperWidth.desktop / 2}px + ${radiusToCenterOfIcons.desktop * Math.sin(toRadians(angle))}px)`,
                  left: `calc(50% - ${iconWrapperWidth.desktop / 2}px + ${radiusToCenterOfIcons.desktop * Math.cos(toRadians(angle))}px)`,
                  width: iconWrapperWidth.desktop,
                  height: iconWrapperWidth.desktop,
                }}
                className={cn(
                  "absolute flex items-center justify-center rounded-full border"
                )}
                aria-label={icon.alt}
              >
                <img src={icon.src} alt={icon.alt} className="w-14 h-14 object-contain" />
              </div>
            );
          })}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-background rounded-full w-40 h-40 md:w-56 md:h-56 flex items-center justify-center  border-2">
            <img src="/assets/only-icon.svg" alt="OneDigitalSpot Logo" className="w-28 h-28 md:w-40 md:h-40 object-contain" />
          </div>
        </div>
      </div>
    </div>
  );
};