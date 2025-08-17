import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import GameDetailsLayout from "@/components/custom/GameDetailsLayout";
import { subscriptions } from "@/lib/products";

const infoSections = [
  {
    title: "About YouTube Premium Subscription",
    content: (
      <div className="text-base">
        <p className="mb-2">
          Enjoy ad-free videos, background play, and access to YouTube Music with YouTube Premium.
        </p>
        <ul className="list-disc pl-5">
          <li><b>Ad-Free Videos:</b> Watch videos without ads.</li>
          <li><b>Background Play:</b> Continue playing videos while using other apps.</li>
          <li><b>YouTube Music:</b> Access music streaming service included.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Select your YouTube Premium plan.</li>
        <li>Login with your Google account.</li>
        <li>Complete payment securely.</li>
        <li>Enjoy ad-free video streaming.</li>
      </ol>
    ),
  },
];

export default function YouTubePremiumSubscription() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [youtubePremium, setYouTubePremium] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  // Use image from subscriptions array
  const youtubePremiumProduct = subscriptions.find(p => p.title === "YouTube Premium");
  const infoImage = youtubePremiumProduct?.image;

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_SUBSCRIPTIONS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        const youtubeProduct = products.find(
          (g) => g.title && g.title.toLowerCase() === "youtube premium"
        );
        setYouTubePremium(youtubeProduct);

        if (youtubeProduct && Array.isArray(youtubeProduct.priceList)) {
          const items = youtubeProduct.priceList.map((item) => {
            const [label, price, hot] = item.split("|");
            return { label, price: Number(price), hot: hot === "true" };
          });
          setPriceList([
            {
              title: "YouTube Premium Subscription",
              categoryIcon: "/assets/icons/subscriptions/youtube.svg",
              items,
            },
          ]);
        }

        setSimilar(
          subscriptions.filter((g) => g.title.toLowerCase() !== "youtube premium").slice(0, 4)
        );
      } catch {
        setYouTubePremium(null);
        setPriceList([]);
        setSimilar([]);
      }
    }

    async function checkAuth() {
      try {
        await account.get();
        setIsSignedIn(true);
      } catch {
        setIsSignedIn(false);
      }
    }

    fetchSubscriptions();
    checkAuth();
  }, []);

  return (
    <GameDetailsLayout
      isSignedIn={isSignedIn}
      title="YouTube Premium"
      image={youtubePremiumProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
