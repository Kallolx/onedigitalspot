import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import GameDetailsLayout from "@/components/custom/GameDetailsLayout";
import { subscriptions } from "@/lib/products";

const infoSections = [
  {
    title: "About Hulu Subscription",
    content: (
      <div className="text-base">
        <p className="mb-2">
          Stream your favorite TV shows, movies, and exclusive Hulu Originals.
          Enjoy ad-free options and live TV streaming.
        </p>
        <ul className="list-disc pl-5">
          <li><b>On-Demand Streaming:</b> Thousands of TV episodes and movies.</li>
          <li><b>Ad-Free Option:</b> Stream without interruptions.</li>
          <li><b>Live TV:</b> Watch live channels with the Live TV add-on.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Select your Hulu subscription plan.</li>
        <li>Log in with your Hulu account.</li>
        <li>Complete payment securely.</li>
        <li>Start streaming instantly.</li>
      </ol>
    ),
  },
];

export default function HuluSubscription() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [hulu, setHulu] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  // Use image from subscriptions array
  const huluProduct = subscriptions.find(p => p.title === "Hulu");
  const infoImage = huluProduct?.image;

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_SUBSCRIPTIONS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        const huluProduct = products.find(
          (g) => g.title && g.title.toLowerCase() === "hulu"
        );
        setHulu(huluProduct);

        if (huluProduct && Array.isArray(huluProduct.priceList)) {
          const items = huluProduct.priceList.map((item) => {
            const [label, price, hot] = item.split("|");
            return { label, price: Number(price), hot: hot === "true" };
          });
          setPriceList([
            {
              title: "Hulu Subscription",
              categoryIcon: "/assets/icons/subscriptions/hulu.svg",
              items,
            },
          ]);
        }

        setSimilar(
          subscriptions.filter((g) => g.title.toLowerCase() !== "hulu").slice(0, 4)
        );
      } catch {
        setHulu(null);
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
      title="Hulu"
      image={huluProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
