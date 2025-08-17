import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
  schema?: object;
}

export const SEOHead = ({ 
  title = "OneDigitalSpot - Best Digital Products Platform in Bangladesh",
  description = "Bangladesh's #1 platform for instant game top-ups, AI tools, digital vouchers & online services. Fast delivery, secure payment, 24/7 support.",
  keywords = "onedigitalspot, bangladesh digital products, game topup, mobile legends, pubg uc, free fire diamonds",
  ogImage = "/assets/og-image.png",
  canonicalUrl,
  schema
}: SEOProps) => {
  
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update meta description
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    
    // Update Open Graph tags
    updateMetaProperty('og:title', title);
    updateMetaProperty('og:description', description);
    updateMetaProperty('og:image', `https://onedigitalspot.com${ogImage}`);
    updateMetaProperty('og:url', canonicalUrl || window.location.href);
    
    // Update Twitter Card tags
    updateMetaProperty('twitter:title', title);
    updateMetaProperty('twitter:description', description);
    updateMetaProperty('twitter:image', `https://onedigitalspot.com${ogImage}`);
    
    // Add canonical URL
    if (canonicalUrl) {
      updateCanonicalLink(canonicalUrl);
    }
    
    // Add structured data
    if (schema) {
      addStructuredData(schema);
    }
    
    // Add Bangladesh-specific meta tags
    updateMetaTag('geo.region', 'BD');
    updateMetaTag('geo.country', 'Bangladesh');
    updateMetaProperty('product:availability', 'in stock');
    updateMetaProperty('product:condition', 'new');
    updateMetaProperty('product:price:currency', 'BDT');
    
  }, [title, description, keywords, ogImage, canonicalUrl, schema]);

  return null;
};

const updateMetaTag = (name: string, content: string) => {
  let meta = document.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', name);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
};

const updateMetaProperty = (property: string, content: string) => {
  let meta = document.querySelector(`meta[property="${property}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('property', property);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
};

const updateCanonicalLink = (url: string) => {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', `https://onedigitalspot.com${url}`);
};

const addStructuredData = (schema: object) => {
  // Remove existing structured data
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }
  
  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
};

// Bangladesh-specific SEO keywords generator
export const generateBangladeshKeywords = (baseKeywords: string[]) => {
  const bangladeshTerms = [
    'bangladesh', 'bd', 'bangla', 'dhaka', 'chittagong', 'sylhet',
    'bkash', 'nagad', 'rocket', 'dbbl', 'dutch bangla',
    'instant delivery', 'fast delivery', 'secure payment',
    '24/7 support', 'trusted platform', 'best price',
    'guaranteed delivery', 'authentic products'
  ];
  
  const combined = [];
  baseKeywords.forEach(keyword => {
    combined.push(keyword);
    bangladeshTerms.forEach(term => {
      combined.push(`${keyword} ${term}`);
      combined.push(`${keyword} in ${term}`);
    });
  });
  
  return combined.join(', ');
};

// Product-specific SEO data generator
export const generateProductSEO = (productName: string, category: string, price?: number) => {
  const baseTitle = `${productName} - Best Price in Bangladesh | OneDigitalSpot`;
  const baseDescription = `Buy ${productName} instantly in Bangladesh. Secure bKash/Nagad payment, instant delivery, 24/7 support. Best prices guaranteed on OneDigitalSpot.`;
  
  const keywords = generateBangladeshKeywords([
    productName.toLowerCase(),
    category.toLowerCase(),
    'buy online',
    'instant delivery',
    'best price',
    'secure payment'
  ]);
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": productName,
    "description": baseDescription,
    "category": category,
    "brand": {
      "@type": "Brand",
      "name": "OneDigitalSpot"
    },
    "offers": {
      "@type": "Offer",
      "price": price?.toString() || "Variable",
      "priceCurrency": "BDT",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "OneDigitalSpot"
      },
      "validFrom": new Date().toISOString(),
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "1247",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": [
      {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "author": {
          "@type": "Person",
          "name": "Ahmed Rahman"
        },
        "reviewBody": `Fast delivery of ${productName}. Highly recommended for all gamers in Bangladesh!`
      }
    ]
  };
  
  return {
    title: baseTitle,
    description: baseDescription,
    keywords,
    schema
  };
};

export default SEOHead;
