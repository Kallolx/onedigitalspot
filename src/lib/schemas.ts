// Enhanced Schema.org Structured Data for OneDigitalSpot
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "OneDigitalSpot",
  "alternateName": ["One Digital Spot", "1DigitalSpot"],
  "description": "Bangladesh's leading platform for digital products, mobile game top-ups, AI tools, and premium subscriptions",
  "url": "https://onedigitalspot.com",
  "logo": "https://onedigitalspot.com/assets/logo.svg",
  "image": "https://onedigitalspot.com/assets/logo.svg",
  "foundingDate": "2024",
  "founder": {
    "@type": "Person",
    "name": "OneDigitalSpot Team"
  },
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "BD",
    "addressRegion": "Dhaka",
    "addressLocality": "Dhaka",
    "streetAddress": "Digital Commerce Hub, Dhaka"
  },
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "telephone": "+880-XXX-XXXX",
      "contactType": "customer service",
      "availableLanguage": ["English", "Bengali"],
      "areaServed": "BD",
      "serviceType": "Digital Products Support"
    },
    {
      "@type": "ContactPoint",
      "contactType": "sales",
      "availableLanguage": ["English", "Bengali"],
      "areaServed": "BD"
    }
  ],
  "sameAs": [
    "https://facebook.com/onedigitalspot",
    "https://instagram.com/onedigitalspot",
    "https://tiktok.com/@onedigitalspot",
    "https://youtube.com/@onedigitalspot"
  ],
  "areaServed": {
    "@type": "Country",
    "name": "Bangladesh"
  },
  "serviceType": [
    "Digital Products",
    "Mobile Game Top-up",
    "Gift Cards",
    "AI Tools Subscription",
    "Premium Software Access"
  ],
  "knowsAbout": [
    "Mobile Gaming",
    "Digital Entertainment",
    "Software Subscriptions",
    "Gaming Credits",
    "Digital Payments",
    "Bangladesh Digital Market"
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Digital Products Catalog",
    "itemListElement": [
      {
        "@type": "OfferCatalog",
        "name": "Mobile Games",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "PUBG Mobile UC",
              "description": "Unknown Cash for PUBG Mobile Bangladesh"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "Free Fire Diamonds",
              "description": "Free Fire Diamonds for Bangladesh players"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "Mobile Legends Diamonds",
              "description": "Mobile Legends Bang Bang Diamonds"
            }
          }
        ]
      },
      {
        "@type": "OfferCatalog",
        "name": "AI Tools",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "SoftwareApplication",
              "name": "ChatGPT Plus Subscription",
              "description": "Premium ChatGPT access for Bangladesh"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "SoftwareApplication",
              "name": "Claude Pro Subscription",
              "description": "Anthropic Claude AI premium access"
            }
          }
        ]
      }
    ]
  }
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "OneDigitalSpot",
  "description": "Bangladesh's #1 Digital Products Platform",
  "url": "https://onedigitalspot.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://onedigitalspot.com/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  },
  "inLanguage": "en-BD",
  "copyrightYear": 2024,
  "copyrightHolder": {
    "@type": "Organization",
    "name": "OneDigitalSpot"
  },
  "publisher": {
    "@type": "Organization",
    "name": "OneDigitalSpot",
    "logo": {
      "@type": "ImageObject",
      "url": "https://onedigitalspot.com/assets/logo.svg"
    }
  }
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://onedigitalspot.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Mobile Games",
      "item": "https://onedigitalspot.com/mobile-games"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Gift Cards",
      "item": "https://onedigitalspot.com/gift-cards"
    },
    {
      "@type": "ListItem",
      "position": 4,
      "name": "AI Tools",
      "item": "https://onedigitalspot.com/ai-tools"
    },
    {
      "@type": "ListItem",
      "position": 5,
      "name": "Subscriptions",
      "item": "https://onedigitalspot.com/subscriptions"
    }
  ]
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "OneDigitalSpot",
  "description": "Leading digital products platform in Bangladesh",
  "url": "https://onedigitalspot.com",
  "telephone": "+880-XXX-XXXX",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Digital Commerce Center",
    "addressLocality": "Dhaka",
    "addressRegion": "Dhaka Division",
    "postalCode": "1000",
    "addressCountry": "BD"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 23.8103,
    "longitude": 90.4125
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday",
      "Tuesday", 
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday"
    ],
    "opens": "00:00",
    "closes": "23:59"
  },
  "paymentAccepted": ["bKash", "Nagad", "Rocket", "Credit Card", "Bank Transfer"],
  "currenciesAccepted": "BDT",
  "serviceArea": {
    "@type": "Country",
    "name": "Bangladesh"
  }
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What payment methods do you accept in Bangladesh?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We accept bKash, Nagad, Rocket, and major credit cards for all digital product purchases in Bangladesh."
      }
    },
    {
      "@type": "Question", 
      "name": "How fast is the delivery for game top-ups?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "All game top-ups including PUBG UC, Free Fire Diamonds, and Mobile Legends Diamonds are delivered instantly after successful payment confirmation."
      }
    },
    {
      "@type": "Question",
      "name": "Do you provide 24/7 customer support?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, OneDigitalSpot provides 24/7 customer support for all digital product purchases and account-related queries."
      }
    },
    {
      "@type": "Question",
      "name": "Is OneDigitalSpot trusted and secure?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, OneDigitalSpot is Bangladesh's most trusted digital products platform with secure payment processing and verified vendor partnerships."
      }
    }
  ]
};

// Export schemas for use in components
export {
  organizationSchema,
  websiteSchema,
  breadcrumbSchema,
  localBusinessSchema,
  faqSchema
};
