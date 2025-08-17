

import React, { useEffect, useRef } from 'react';

interface PerformanceOptimizationProps {
  enableLazyLoading?: boolean;
  preloadCriticalResources?: boolean;
  enableImageOptimization?: boolean;
}

export const PerformanceOptimization = ({ 
  enableLazyLoading = true,
  preloadCriticalResources = true,
  enableImageOptimization = true 
}: PerformanceOptimizationProps) => {
  
  useEffect(() => {
    // Preload critical resources
    if (preloadCriticalResources) {
      preloadCriticalAssets();
    }

    // Enable lazy loading for images
    if (enableLazyLoading) {
      setupLazyLoading();
    }

    // Optimize images
    if (enableImageOptimization) {
      optimizeImages();
    }

    // Monitor Core Web Vitals with cleanup
    const observers: PerformanceObserver[] = [];


    // Cumulative Layout Shift (CLS)
    let cls = 0;
    const clsObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          cls += (entry as any).value;
        }
      }
      console.log('CLS:', cls);
    });
    clsObserver.observe({ type: 'layout-shift', buffered: true });
    observers.push(clsObserver);

    // First Input Delay (FID) - feature detection
    if (PerformanceObserver.supportedEntryTypes?.includes('first-input')) {
      const fidObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          console.log('FID:', (entry as any).processingStart - (entry as any).startTime);
        }
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
      observers.push(fidObserver);
    }

    // Largest Contentful Paint (LCP) - feature detection
    if (PerformanceObserver.supportedEntryTypes?.includes('largest-contentful-paint')) {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', (lastEntry as any).startTime);
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      observers.push(lcpObserver);
    }

    return () => {
      observers.forEach(obs => obs.disconnect());
    };
  }, [enableLazyLoading, preloadCriticalResources, enableImageOptimization]);

  return null;
};

// Preload critical resources for faster loading
const preloadCriticalAssets = () => {
  const criticalResources = [
    { href: '/assets/logo.svg', as: 'image' },
    { href: '/assets/1.png', as: 'image' },
    { href: '/assets/icons/mobile-games.svg', as: 'image' },
    { href: '/assets/icons/voucher.svg', as: 'image' }
  ];

  criticalResources.forEach(resource => {
    if (!document.querySelector(`link[rel="preload"][href="${resource.href}"]`)) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      document.head.appendChild(link);
    }
  });
};

let imageObserver: IntersectionObserver | null = null;
const setupLazyLoading = () => {
  if ('IntersectionObserver' in window && !imageObserver) {
    imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const dataSrc = img.getAttribute('data-src');
          if (dataSrc) {
            img.src = dataSrc;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img').forEach(img => {
      if (img.getAttribute('data-processed') === 'true') return;
      
      if (img.hasAttribute('src')) {
        const src = img.getAttribute('src');
        if (src) {
          img.setAttribute('data-src', src);
          img.removeAttribute('src');
        }
      }

      // Add attributes for perf
      img.setAttribute('loading', 'lazy');
      img.setAttribute('decoding', 'async');
      img.classList.add('lazy');
      img.setAttribute('data-processed', 'true');

      imageObserver!.observe(img);
    });
  }
};

// Optimize images with WebP format and responsive sizes
const optimizeImages = () => {
  const images = document.querySelectorAll('img');
  
  images.forEach(img => {
    // Add loading="lazy" for better performance
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
    
    // Add decoding="async" for better rendering
    if (!img.hasAttribute('decoding')) {
      img.setAttribute('decoding', 'async');
    }
  });
};

// (Removed measureWebVitals, now handled inline in useEffect with cleanup)

// Lazy loading utility component


export const LazyImage = ({ 
  src, 
  alt, 
  className, 
  width, 
  height,
  placeholder = '/assets/placeholder.svg' 
}: {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholder?: string;
}) => {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete) {
      img.classList.add('loaded');
    }
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={placeholder}
      data-src={src}
      alt={alt}
      className={`lazy ${className || ''}`}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      onLoad={e => e.currentTarget.classList.add('loaded')}
    />
  );
};

// Image optimization utilities

let webpSupport: boolean | null = null;
const supportsWebP = () => {
  if (webpSupport !== null) return webpSupport;
  try {
    webpSupport = document.createElement('canvas')
      .toDataURL('image/webp')
      .indexOf('data:image/webp') === 0;
  } catch {
    webpSupport = false;
  }
  return webpSupport;
};

export const getOptimizedImageUrl = (originalUrl: string, width?: number, quality = 80) => {
  // If using a CDN like Cloudinary or ImageKit, return optimized URL
  // For now, return original URL with WebP format if supported
  if (typeof window !== 'undefined' && supportsWebP()) {
    return originalUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }
  return originalUrl;
};

// Critical CSS injection for above-the-fold content
export const injectCriticalCSS = () => {
  const criticalCSS = `
    /* Critical CSS for OneDigitalSpot - Above the fold optimization */
    .hero-section {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .lazy {
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
    }
    
    .lazy.loaded {
      opacity: 1;
    }
    
    /* Preload animation to prevent CLS */
    .skeleton {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    }
    
    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;
  if (!document.getElementById('critical-css')) {
    const style = document.createElement('style');
    style.id = 'critical-css';
    style.textContent = criticalCSS;
    document.head.appendChild(style);
  }
};

export default PerformanceOptimization;
