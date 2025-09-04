import React, { useState, useEffect } from 'react';
import { databases } from '@/lib/appwrite';
import AdComponent from './AdComponent';

interface AdData {
  $id: string;
  title: string;
  description: string;
  websiteUrl: string;
  logo: string;
  features: string[];
  ctaText: string;
  isActive: boolean;
  showOnce: boolean;
  maxShows: number;
  createdAt?: string;
  updatedAt?: string;
}

// This component integrates the ad system into your main application
const AdIntegration: React.FC = () => {
  const [currentAd, setCurrentAd] = useState<AdData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
  const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_ADS_ID;

  useEffect(() => {
    // Check if user has already clicked the ad in this browser session
    const adClicked = sessionStorage.getItem('adClicked');
    
    if (adClicked === 'true') {
      setIsLoading(false);
      return;
    }
    
    fetchActiveAd();
  }, []);

  const fetchActiveAd = async () => {
    try {
      setIsLoading(true);
      const response = await databases.listDocuments(databaseId, collectionId);
      
      // Map Appwrite documents to our AdData interface
      const ads = response.documents.map((doc: any) => ({
        $id: doc.$id,
        title: doc.title,
        description: doc.description,
        websiteUrl: doc.websiteUrl,
        logo: doc.logo,
        features: doc.features || [],
        ctaText: doc.ctaText,
        isActive: doc.isActive,
        showOnce: doc.showOnce,
        maxShows: doc.maxShows,
        createdAt: doc.$createdAt,
        updatedAt: doc.$updatedAt,
      }));
      
      // Filter active ads
      const activeAds = ads.filter(ad => ad.isActive);

      if (activeAds.length > 0) {
        // Find an ad that hasn't exceeded its maxShows
        const availableAd = activeAds.find(ad => {
          const adShownKey = `adShown_${ad.$id}`;
          const currentShows = parseInt(localStorage.getItem(adShownKey) || '0');
          return currentShows < ad.maxShows;
        });
        
        if (availableAd) {
          setCurrentAd(availableAd);
          
          // Show ad after 2 seconds
          setTimeout(() => {
            setCurrentAd(availableAd);
            setIsVisible(true);
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Error fetching ads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    
    if (currentAd) {
      // Track how many times this specific ad has been shown
      const adShownKey = `adShown_${currentAd.$id}`;
      const currentShows = parseInt(localStorage.getItem(adShownKey) || '0');
      localStorage.setItem(adShownKey, (currentShows + 1).toString());
    }
  };

  const handleAdClick = () => {
    // Mark that the ad was clicked in this browser session
    sessionStorage.setItem('adClicked', 'true');
    setIsVisible(false);
    
    if (currentAd) {
      // Track how many times this specific ad has been shown
      const adShownKey = `adShown_${currentAd.$id}`;
      const currentShows = parseInt(localStorage.getItem(adShownKey) || '0');
      localStorage.setItem(adShownKey, (currentShows + 1).toString());
    }
  };

  // Function to clear ad tracking (for testing purposes)
  const clearAdTracking = () => {
    sessionStorage.removeItem('adClicked');
    // Clear all ad shown counters
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('adShown_')) {
        localStorage.removeItem(key);
      }
    });
  };

  // Don't render anything if no ad is available or not visible
  if (isLoading || !currentAd || !isVisible) {
    return null;
  }

  return (
    <>
      <AdComponent
        adData={currentAd}
        onClose={handleClose}
        onAdClick={handleAdClick}
        delay={0} // No delay since we're already managing visibility
      />
      
      {/* Debug button - only show in development */}
      {import.meta.env.DEV && (
        <button
          onClick={clearAdTracking}
          className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded-full text-xs z-50"
          title="Clear ad tracking (dev only)"
        >
          🗑️
        </button>
      )}
    </>
  );
};

export default AdIntegration;
