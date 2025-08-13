import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import GameDetailsLayout from "@/components/GameDetailsLayout";
import { subscriptions } from "@/lib/products";

const infoSections = [
  {
    title: "About Ullu Premium Subscription",
    content: (
      <div className="text-base">
        <p className="mb-2">
          Watch exclusive adult web series, movies, and originals on Ullu Premium.
          Enjoy high-quality streaming and new releases every week.
        </p>
        <ul className="list-disc pl-5">
          <li><b>Exclusive Content:</b> Access adult-themed web series and movies.</li>
          <li><b>High Quality:</b> Stream videos in HD quality.</li>
          <li><b>Ad-Free:</b> No ads, no interruptions.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Select your Ullu Premium subscription plan.</li>
        <li>Log in with your Ullu account credentials.</li>
        <li>Complete the payment process securely.</li>
        <li>Start watching premium adult content instantly.</li>
      </ol>
    ),
  },
  {
    title: "Features Included",
    content: (
      <ul className="list-disc pl-5 text-base mb-4">
        <li><strong>Exclusive Web Series:</strong> Access a variety of adult web series.</li>
        <li><strong>HD Streaming:</strong> High definition video quality.</li>
        <li><strong>Ad-Free Viewing:</strong> Enjoy content without ads.</li>
        <li><strong>New Releases Weekly:</strong> Stay updated with fresh content every week.</li>
      </ul>
    ),
  },
];

export default function UlluPremiumSubscription() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [ullu, setUllu] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  // Use image from subscriptions array
  const ulluProduct = subscriptions.find(p => p.title === "Ullu Premium");
  const infoImage = ulluProduct?.image;

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_SUBSCRIPTIONS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        const ulluProduct = products.find(
          (g) => g.title && g.title.toLowerCase() === "ullu premium"
        );
        setUllu(ulluProduct);

        if (ulluProduct && Array.isArray(ulluProduct.priceList)) {
          const items = ulluProduct.priceList.map((item) => {
            const [label, price, hot] = item.split("|");
            return { label, price: Number(price), hot: hot === "true" };
          });
          setPriceList([
            {
              title: "Ullu Premium Subscription",
              categoryIcon: "/assets/icons/subscriptions/video.svg", // Replace with actual icon path
              items,
            },
          ]);
        }

        setSimilar(
          subscriptions.filter((g) => g.title.toLowerCase() !== "ullu premium").slice(0, 4)
        );
      } catch (err) {
        setUllu(null);
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
      title="Ullu Premium"
      image={ulluProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
