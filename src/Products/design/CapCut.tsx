import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import GameDetailsLayout from "@/components/GameDetailsLayout";
import { productivity } from "@/lib/products";

const infoSections = [
  {
    title: "About Capcut Pro Subscription",
    content: (
      <div className="text-base">
        <p className="mb-2">
          Unlock advanced video editing features and premium effects with Capcut Pro.
          Create stunning videos with no watermarks and export in HD quality.
        </p>
        <ul className="list-disc pl-5">
          <li><b>Premium Effects & Filters:</b> Access exclusive editing tools.</li>
          <li><b>No Watermarks:</b> Export videos without branding.</li>
          <li><b>High Quality Export:</b> Export videos in Full HD or higher.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Choose your Capcut Pro subscription plan.</li>
        <li>Log in with your Capcut account details.</li>
        <li>Complete payment securely.</li>
        <li>Enjoy full access to premium video editing features.</li>
      </ol>
    ),
  },
];

export default function CapcutProSubscription() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [capcut, setCapcut] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  // Use image from subscriptions array
  const capcutProduct = productivity.find(p => p.title === "Capcut Pro");
  const infoImage = capcutProduct?.image;

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_SUBSCRIPTIONS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        const capcutProduct = products.find(
          (g) => g.title && g.title.toLowerCase() === "capcut pro"
        );
        setCapcut(capcutProduct);

        if (capcutProduct && Array.isArray(capcutProduct.priceList)) {
          const items = capcutProduct.priceList.map((item) => {
            const [label, price, hot] = item.split("|");
            return { label, price: Number(price), hot: hot === "true" };
          });
          setPriceList([
            {
              title: "Capcut Pro Subscription",
              categoryIcon: "/assets/icons/capcut.svg",
              items,
            },
          ]);
        }

        setSimilar(
          productivity.filter((g) => g.title.toLowerCase() !== "capcut pro").slice(0, 4)
        );
      } catch {
        setCapcut(null);
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
      title="Capcut Pro"
      image={capcutProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
