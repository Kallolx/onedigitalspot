#!/usr/bin/env node

// OneDigitalSpot SEO Audit Script for Bangladesh Market Analysis
// Run with: npm run seo:check

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetKeywords = [
  'digital products bangladesh',
  'game topup bangladesh', 
  'pubg uc bangladesh',
  'free fire diamonds bangladesh',
  'mobile legends diamonds bangladesh',
  'steam wallet bangladesh',
  'netflix subscription bangladesh',
  'chatgpt plus bangladesh',
  'bkash gaming payment',
  'nagad digital services',
  'instant game delivery bangladesh',
  'trusted gaming platform bangladesh',
  'best digital store bangladesh',
  'onedigitalspot',
  'one digital spot bangladesh'
];

const competitors = [
  'gamershop.com.bd',
  'digitalgaming.bd',
  'gamezoneba.com',
  'bdgamers.com',
  'topupbd.com'
];

function auditSEOChecklist() {
  console.log('🔍 OneDigitalSpot SEO Audit for Bangladesh Market Dominance');
  console.log('============================================================');
  
  const results = {
    technical: [],
    content: [],
    keywords: [],
    local: [],
    social: [],
    performance: []
  };

  // Technical SEO Checks
  console.log('\n📋 Technical SEO Audit:');
  
  // Check if files exist
  const requiredFiles = [
    'public/sitemap.xml',
    'public/robots.txt', 
    'public/manifest.json',
    'public/.htaccess'
  ];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} exists`);
      results.technical.push({ item: file, status: 'pass' });
    } else {
      console.log(`❌ ${file} missing`);
      results.technical.push({ item: file, status: 'fail' });
    }
  });

  // Check HTML file for meta tags
  const htmlPath = path.join(__dirname, '..', 'index.html');
  if (fs.existsSync(htmlPath)) {
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    const metaChecks = [
      { tag: 'meta name="description"', name: 'Meta Description' },
      { tag: 'meta name="keywords"', name: 'Meta Keywords' },
      { tag: 'meta property="og:title"', name: 'Open Graph Title' },
      { tag: 'meta property="og:description"', name: 'Open Graph Description' },
      { tag: 'meta property="og:image"', name: 'Open Graph Image' },
      { tag: 'meta name="twitter:card"', name: 'Twitter Card' },
      { tag: 'script type="application/ld+json"', name: 'Structured Data' },
      { tag: 'meta name="geo.region"', name: 'Geographic Targeting' },
      { tag: 'link rel="canonical"', name: 'Canonical URL' }
    ];
    
    metaChecks.forEach(check => {
      if (htmlContent.includes(check.tag)) {
        console.log(`✅ ${check.name} implemented`);
        results.technical.push({ item: check.name, status: 'pass' });
      } else {
        console.log(`❌ ${check.name} missing`);
        results.technical.push({ item: check.name, status: 'fail' });
      }
    });
  }

  // Content SEO Analysis
  console.log('\n📝 Content SEO Analysis:');
  
  const contentGuidelines = [
    'Bangladesh-specific content',
    'Local payment methods (bKash, Nagad)',
    'Bengali language support',
    'Gaming culture references',
    'Local testimonials',
    'Bangladesh delivery information',
    'Customer support in local time'
  ];
  
  contentGuidelines.forEach(guideline => {
    console.log(`📋 Check: ${guideline}`);
    results.content.push({ item: guideline, status: 'review' });
  });

  // Keyword Strategy
  console.log('\n🎯 Target Keywords for Bangladesh:');
  targetKeywords.forEach((keyword, index) => {
    console.log(`${index + 1}. ${keyword}`);
    results.keywords.push({ keyword, priority: index < 5 ? 'high' : 'medium' });
  });

  // Local SEO Checklist
  console.log('\n🇧🇩 Bangladesh Local SEO:');
  
  const localSEOItems = [
    'Google My Business listing',
    'Local business schema markup',
    'Bangladesh address in footer',
    'Local phone number',
    'Bengali language meta tags',
    'Bangladesh-specific landing pages',
    'Local customer reviews',
    'Social media profiles with BD focus'
  ];
  
  localSEOItems.forEach(item => {
    console.log(`📋 ${item}`);
    results.local.push({ item, status: 'pending' });
  });

  // Performance Recommendations
  console.log('\n⚡ Performance Optimization:');
  
  const performanceItems = [
    'Enable Gzip compression',
    'Optimize images (WebP format)',
    'Minimize CSS/JS files',
    'Use CDN for static assets',
    'Enable browser caching',
    'Lazy load images',
    'Optimize Core Web Vitals',
    'Mobile-first optimization'
  ];
  
  performanceItems.forEach(item => {
    console.log(`📋 ${item}`);
    results.performance.push({ item, status: 'review' });
  });

  // Competitor Analysis
  console.log('\n🏆 Competitor Analysis:');
  console.log('Monitor these competitors regularly:');
  competitors.forEach((competitor, index) => {
    console.log(`${index + 1}. ${competitor}`);
  });

  // Social Media Strategy
  console.log('\n📱 Social Media SEO:');
  
  const socialPlatforms = [
    'Facebook Business Page (@onedigitalspot)',
    'Instagram Business (@onedigitalspot)', 
    'TikTok Creator Account (@onedigitalspot)',
    'YouTube Channel (OneDigitalSpot)',
    'LinkedIn Company Page',
    'Twitter/X Business Account'
  ];
  
  socialPlatforms.forEach(platform => {
    console.log(`📋 ${platform}`);
    results.social.push({ platform, status: 'setup' });
  });

  // Action Items
  console.log('\n🚀 Immediate Action Items for #1 Ranking:');
  console.log('1. Create high-quality backlinks from BD gaming sites');
  console.log('2. Publish Bangladesh gaming industry blog posts');
  console.log('3. Get customer reviews mentioning "Bangladesh"');
  console.log('4. Create social media content in Bengali');
  console.log('5. Partner with BD gaming influencers');
  console.log('6. Submit to Bangladesh business directories');
  console.log('7. Create location-specific landing pages');
  console.log('8. Optimize for mobile users (majority in BD)');

  // Save audit results
  const auditReport = {
    timestamp: new Date().toISOString(),
    targetMarket: 'Bangladesh',
    targetKeywords,
    competitors,
    results,
    recommendations: [
      'Focus on Bangladesh-specific content',
      'Optimize for mobile users',
      'Implement local payment methods',
      'Create social proof with local testimonials',
      'Build local backlinks and partnerships'
    ]
  };

  const reportPath = path.join(__dirname, '..', 'seo-audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(auditReport, null, 2));
  
  console.log('\n📊 SEO Audit Complete!');
  console.log(`📄 Detailed report saved to: seo-audit-report.json`);
  console.log('🎯 Focus on high-priority items to dominate Bangladesh market!');
  
  return auditReport;
}

// Run audit if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  auditSEOChecklist();
}

export { auditSEOChecklist, targetKeywords, competitors };
