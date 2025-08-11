import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import GameDetailsLayout from "@/components/GameDetailsLayout";
import { subscriptions } from "@/lib/products";

const infoSections = [
  {
    title: "About Google One Subscription",
    content: (
      <div className="text-base">
        <p className="mb-2">
          Get expanded cloud storage across Google Drive, Gmail, and Photos with Google One.
          Enjoy extra benefits including family sharing and expert support.
        </p>
        <ul className="list-disc pl-5">
          <li><b>Expanded Storage:</b> Choose plans from 100GB to 2TB or more.</li>
          <li><b>Family Sharing:</b> Share your plan with up to 5 family members.</li>
          <li><b>Extra Benefits:</b> Access Google experts and get special offers.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Select your Google One plan.</li>
        <li>Login with your Google account.</li>
        <li>Complete payment securely.</li>
        <li>Access your expanded storage and benefits immediately.</li>
      </ol>
    ),
  },
];

export default function GoogleOneSubscription() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [googleOne, setGoogleOne] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  // Use image from subscriptions array
  const googleOneProduct = subscriptions.find(p => p.title === "Google One");
  const infoImage = googleOneProduct?.image;

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_SUBSCRIPTIONS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        const googleProduct = products.find(
          (g) => g.title && g.title.toLowerCase() === "google one"
        );
        setGoogleOne(googleProduct);

        if (googleProduct && Array.isArray(googleProduct.priceList)) {
          const items = googleProduct.priceList.map((item) => {
            const [label, price, hot] = item.split("|");
            return { label, price: Number(price), hot: hot === "true" };
          });
          setPriceList([
            {
              title: "Google One Subscription",
              categoryIcon: "/assets/icons/googleone.svg",
              items,
            },
          ]);
        }

        setSimilar(
          subscriptions.filter((g) => g.title.toLowerCase() !== "google one").slice(0, 4)
        );
      } catch {
        setGoogleOne(null);
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
      title="Google One"
      image={googleOneProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
