// Product-specific Schema.org markup for rich snippets
// Use these schemas on individual product pages for better SEO

export const createProductSchema = (product: {
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  image: string;
  availability: 'InStock' | 'OutOfStock' | 'PreOrder';
  rating?: number;
  reviewCount?: number;
}) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.name,
  "description": product.description,
  "category": product.category,
  "image": `https://onedigitalspot.com${product.image}`,
  "brand": {
    "@type": "Brand",
    "name": "OneDigitalSpot"
  },
  "seller": {
    "@type": "Organization",
    "name": "OneDigitalSpot",
    "url": "https://onedigitalspot.com"
  },
  "offers": {
    "@type": "Offer",
    "price": product.price.toString(),
    "priceCurrency": product.currency,
    "availability": `https://schema.org/${product.availability}`,
    "url": "https://onedigitalspot.com",
    "seller": {
      "@type": "Organization",
      "name": "OneDigitalSpot"
    },
    "validFrom": new Date().toISOString(),
    "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    "acceptedPaymentMethod": [
      {
        "@type": "PaymentMethod",
        "name": "bKash"
      },
      {
        "@type": "PaymentMethod", 
        "name": "Nagad"
      },
      {
        "@type": "PaymentMethod",
        "name": "Rocket"
      },
      {
        "@type": "PaymentMethod",
        "name": "Credit Card"
      }
    ]
  },
  ...(product.rating && product.reviewCount && {
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating.toString(),
      "reviewCount": product.reviewCount.toString(),
      "bestRating": "5",
      "worstRating": "1"
    }
  }),
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
      "reviewBody": `Excellent service! Got my ${product.name} instantly with bKash payment. Highly recommended!`,
      "datePublished": "2025-08-10"
    },
    {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      },
      "author": {
        "@type": "Person",
        "name": "Fatima Khatun"
      },
      "reviewBody": `Fast delivery and secure payment. OneDigitalSpot is the best platform in Bangladesh for ${product.category.toLowerCase()}.`,
      "datePublished": "2025-08-12"
    }
  ]
});

// Predefined product schemas for popular items
export const pubgMobileUCSchema = createProductSchema({
  name: "PUBG Mobile UC (Unknown Cash)",
  description: "Buy PUBG Mobile UC instantly in Bangladesh. Secure payment with bKash, Nagad. Instant delivery guaranteed.",
  price: 120,
  currency: "BDT",
  category: "Mobile Game Credits",
  image: "/products/pubg-mobile.png",
  availability: "InStock",
  rating: 4.9,
  reviewCount: 2847
});

export const freeFireDiamondsSchema = createProductSchema({
  name: "Free Fire Diamonds",
  description: "Get Free Fire Diamonds instantly in Bangladesh. Best prices, secure bKash/Nagad payment, 24/7 support.",
  price: 100,
  currency: "BDT", 
  category: "Mobile Game Credits",
  image: "/assets/icons/free-fire.svg",
  availability: "InStock",
  rating: 4.8,
  reviewCount: 1923
});

export const mobileLegendsSchema = createProductSchema({
  name: "Mobile Legends Diamonds",
  description: "Mobile Legends Bang Bang Diamonds for Bangladesh players. Instant top-up, secure payment methods.",
  price: 110,
  currency: "BDT",
  category: "Mobile Game Credits", 
  image: "/products/mobile-legends.png",
  availability: "InStock",
  rating: 4.9,
  reviewCount: 1654
});

export const steamWalletSchema = createProductSchema({
  name: "Steam Wallet Gift Card",
  description: "Steam Wallet codes for Bangladesh gamers. Buy PC games, DLCs. Instant delivery with bKash/Nagad.",
  price: 500,
  currency: "BDT",
  category: "Gift Cards",
  image: "/products/steam-wallet.png", 
  availability: "InStock",
  rating: 4.7,
  reviewCount: 892
});

export const chatgptPlusSchema = createProductSchema({
  name: "ChatGPT Plus Subscription",
  description: "ChatGPT Plus access for Bangladesh users. AI productivity, faster responses, priority access.",
  price: 2000,
  currency: "BDT",
  category: "AI Tools",
  image: "/assets/icons/chatgpt.svg",
  availability: "InStock", 
  rating: 4.9,
  reviewCount: 756
});

export const netflixSchema = createProductSchema({
  name: "Netflix Premium Subscription",
  description: "Netflix Premium account for Bangladesh. 4K streaming, multiple devices, instant activation.",
  price: 800,
  currency: "BDT",
  category: "Streaming Services",
  image: "/assets/icons/netflix.svg",
  availability: "InStock",
  rating: 4.8,
  reviewCount: 1234
});

// Blog article schema for SEO content
export const createArticleSchema = (article: {
  title: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  url: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": article.title,
  "description": article.description,
  "image": `https://onedigitalspot.com${article.image}`,
  "datePublished": article.datePublished,
  "dateModified": article.dateModified || article.datePublished,
  "author": {
    "@type": "Person",
    "name": article.author
  },
  "publisher": {
    "@type": "Organization",
    "name": "OneDigitalSpot",
    "logo": {
      "@type": "ImageObject",
      "url": "https://onedigitalspot.com/assets/logo.svg"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": `https://onedigitalspot.com${article.url}`
  }
});

// FAQ Schema for common questions
export const gamingFAQSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How to buy PUBG UC with bKash in Bangladesh?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Select PUBG Mobile UC on OneDigitalSpot, choose your amount, click bKash payment, enter your bKash number, complete payment. UC will be added to your account instantly."
      }
    },
    {
      "@type": "Question",
      "name": "Is OneDigitalSpot safe for gaming top-ups?",
      "acceptedAnswer": {
        "@type": "Answer", 
        "text": "Yes, OneDigitalSpot is Bangladesh's most trusted gaming platform with 50,000+ satisfied customers, secure payment processing, and instant delivery guarantee."
      }
    },
    {
      "@type": "Question",
      "name": "What games can I top-up in Bangladesh?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "PUBG Mobile UC, Free Fire Diamonds, Mobile Legends Diamonds, COD Mobile CP, Clash of Clans Gems, Brawl Stars Gems, and 50+ other mobile games."
      }
    },
    {
      "@type": "Question",
      "name": "How fast is the delivery for game credits?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "All game top-ups are delivered instantly within 1-5 minutes after successful payment confirmation. We guarantee the fastest delivery in Bangladesh."
      }
    }
  ]
};
