#!/usr/bin/env node

// OneDigitalSpot Sitemap Generator for Bangladesh SEO
// Run with: node scripts/generate-sitemap.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUrl = 'https://onedigitalspot.com';
const currentDate = new Date().toISOString().split('T')[0];

// Main pages with high priority
const mainPages = [
  { url: '', changefreq: 'daily', priority: '1.0', lastmod: currentDate },
  { url: '/mobile-games', changefreq: 'daily', priority: '0.9', lastmod: currentDate },
  { url: '/gift-cards', changefreq: 'daily', priority: '0.9', lastmod: currentDate },
  { url: '/ai-tools', changefreq: 'daily', priority: '0.9', lastmod: currentDate },
  { url: '/subscriptions', changefreq: 'daily', priority: '0.9', lastmod: currentDate },
  { url: '/pc-games', changefreq: 'daily', priority: '0.8', lastmod: currentDate },
  { url: '/top-up-games', changefreq: 'daily', priority: '0.8', lastmod: currentDate }
];

// Product categories for Bangladesh market
const gameProducts = [
  'pubg-mobile-uc', 'free-fire-diamonds', 'mobile-legends-diamonds',
  'clash-of-clans-gems', 'clash-royale-gems', 'brawl-stars-gems',
  'call-of-duty-mobile-cp', 'pokemon-go-coins', 'roblox-robux',
  'minecraft-minecoins', 'valorant-vp', 'league-of-legends-rp',
  'garena-shells', 'steam-wallet', 'epic-games-vbucks'
];

const giftCards = [
  'steam-wallet-card', 'google-play-card', 'apple-store-card',
  'amazon-gift-card', 'netflix-gift-card', 'spotify-gift-card',
  'playstation-store-card', 'xbox-gift-card', 'nintendo-eshop-card'
];

const aiTools = [
  'chatgpt-plus', 'claude-pro', 'midjourney-subscription',
  'jasper-ai', 'copy-ai', 'writesonic', 'grammarly-premium',
  'canva-pro', 'notion-pro', 'figma-pro'
];

const subscriptions = [
  'netflix-premium', 'youtube-premium', 'spotify-premium',
  'amazon-prime', 'disney-plus', 'hbo-max', 'apple-music',
  'adobe-creative-cloud', 'microsoft-365', 'zoom-pro'
];

// Bangladesh-specific landing pages
const bangladeshPages = [
  '/bangladesh-digital-products',
  '/bkash-payment-games',
  '/nagad-gaming-topup',
  '/rocket-digital-services',
  '/dhaka-game-credits',
  '/chittagong-digital-store',
  '/sylhet-gaming-hub',
  '/rajshahi-digital-market',
  '/khulna-game-topup',
  '/barisal-digital-services',
  '/rangpur-gaming-store',
  '/mymensingh-digital-hub'
];

// SEO-targeted pages
const seoPages = [
  '/best-game-topup-bangladesh',
  '/cheapest-pubg-uc-bangladesh',
  '/instant-free-fire-diamonds',
  '/mobile-legends-diamonds-bd',
  '/steam-wallet-bangladesh',
  '/netflix-subscription-bd',
  '/chatgpt-plus-bangladesh',
  '/secure-payment-bkash-nagad',
  '/24-7-gaming-support',
  '/trusted-digital-platform-bd',
  '/fastest-delivery-bangladesh',
  '/authentic-game-credits'
];

// Blog/content pages for SEO
const contentPages = [
  '/blog/gaming-tips-bangladesh',
  '/blog/payment-methods-guide',
  '/blog/mobile-gaming-trends-bd',
  '/blog/ai-tools-productivity',
  '/blog/streaming-services-comparison',
  '/guides/pubg-mobile-guide',
  '/guides/free-fire-tips',
  '/guides/mobile-legends-strategy',
  '/guides/payment-security-tips',
  '/news/gaming-updates-bangladesh',
  '/news/digital-trends-bd',
  '/support/faq',
  '/support/payment-help',
  '/support/delivery-info',
  '/support/refund-policy',
  '/about-us',
  '/contact-us',
  '/terms-service',
  '/privacy-policy'
];

function generateSitemap() {
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;

  // Add main pages
  mainPages.forEach(page => {
    sitemap += `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
  });

  // Add game products
  gameProducts.forEach(product => {
    sitemap += `  <url>
    <loc>${baseUrl}/mobile-games/${product}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  });

  // Add gift cards
  giftCards.forEach(card => {
    sitemap += `  <url>
    <loc>${baseUrl}/gift-cards/${card}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  });

  // Add AI tools
  aiTools.forEach(tool => {
    sitemap += `  <url>
    <loc>${baseUrl}/ai-tools/${tool}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  });

  // Add subscriptions
  subscriptions.forEach(sub => {
    sitemap += `  <url>
    <loc>${baseUrl}/subscriptions/${sub}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  });

  // Add Bangladesh-specific pages
  bangladeshPages.forEach(page => {
    sitemap += `  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
  });

  // Add SEO pages
  seoPages.forEach(page => {
    sitemap += `  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
  });

  // Add content pages
  contentPages.forEach(page => {
    sitemap += `  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
  });

  sitemap += `</urlset>`;

  return sitemap;
}

function generateRobotsTxt() {
  return `User-agent: *
Allow: /

# Bangladesh-specific optimization
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot  
Allow: /
Crawl-delay: 1

# Social media crawlers
User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /

User-agent: WhatsApp
Allow: /

# Block sensitive areas
Disallow: /admin/
Disallow: /api/
Disallow: /checkout/
Disallow: /payment/
Disallow: /_next/

# Allow important files
Allow: /sitemap.xml
Allow: /robots.txt
Allow: /*.css
Allow: /*.js
Allow: /*.png
Allow: /*.jpg
Allow: /*.svg

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Host
Host: ${baseUrl}`;
}

// Generate files
try {
  const sitemap = generateSitemap();
  const robots = generateRobotsTxt();
  
  // Write sitemap.xml
  fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), sitemap);
  console.log('✅ Generated sitemap.xml with', sitemap.split('<url>').length - 1, 'URLs');
  
  // Write robots.txt
  fs.writeFileSync(path.join(__dirname, '../public/robots.txt'), robots);
  console.log('✅ Generated robots.txt');
  
  console.log('🚀 SEO files generated successfully for Bangladesh market dominance!');
  console.log('📊 Total URLs in sitemap:', sitemap.split('<url>').length - 1);
  
} catch (error) {
  console.error('❌ Error generating SEO files:', error);
}

export { generateSitemap, generateRobotsTxt };
