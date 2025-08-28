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
        // Select the first active ad (you can implement more complex logic later)
        const selectedAd = activeAds[0];
        setCurrentAd(selectedAd);
        
        // Show ad after 2 seconds
        setTimeout(() => {
          setCurrentAd(selectedAd);
          setIsVisible(true);
        }, 2000);
      }
    } catch (error) {
      console.error("Error fetching ads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  // Don't render anything if no ad is available or not visible
  if (isLoading || !currentAd || !isVisible) {
    return null;
  }

  return (
    <AdComponent
      adData={currentAd}
      onClose={handleClose}
      delay={0} // No delay since we're already managing visibility
    />
  );
};

export default AdIntegration;
