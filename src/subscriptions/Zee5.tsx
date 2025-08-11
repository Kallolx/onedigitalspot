import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import GameDetailsLayout from "@/components/GameDetailsLayout";
import { subscriptions } from "@/lib/products";

const infoSections = [
  {
    title: "About ZEE5 Subscription",
    content: (
      <div className="text-base">
        <p className="mb-2">
          Stream the latest Indian movies, TV shows, originals, and more on ZEE5.
          Enjoy a vast library of content in multiple languages with HD streaming.
        </p>
        <ul className="list-disc pl-5">
          <li><b>Personal Access:</b> Stream unlimited content anytime, anywhere.</li>
          <li><b>Multi-Device:</b> Watch on mobile, tablet, or TV.</li>
          <li><b>Ad-Free:</b> Enjoy uninterrupted viewing experience.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Choose your preferred ZEE5 subscription plan.</li>
        <li>Provide your ZEE5 account details for activation.</li>
        <li>Complete the payment process securely.</li>
        <li>Start streaming unlimited content instantly.</li>
      </ol>
    ),
  },
  {
    title: "Features Included",
    content: (
      <ul className="list-disc pl-5 text-base mb-4">
        <li><strong>HD Streaming:</strong> High quality video playback.</li>
        <li><strong>Multi-Language Content:</strong> Watch shows and movies in various Indian languages.</li>
        <li><strong>Exclusive Originals:</strong> Access ZEE5 original series and movies.</li>
        <li><strong>Offline Downloads:</strong> Download content and watch offline.</li>
      </ul>
    ),
  },
];

export default function Zee5Subscription() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [zee5, setZee5] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const infoImage = "/products/zee5.png"; // Replace with actual image path

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_SUBSCRIPTIONS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        const zee5Product = products.find(
          (g) => g.title && g.title.toLowerCase() === "zee5"
        );
        setZee5(zee5Product);

        if (zee5Product && Array.isArray(zee5Product.priceList)) {
          const items = zee5Product.priceList.map((item) => {
            const [label, price, hot] = item.split("|");
            return { label, price: Number(price), hot: hot === "true" };
          });
          setPriceList([
            {
              title: "ZEE5 Subscription",
              categoryIcon: "/assets/icons/zee5.svg", // Replace with actual icon path
              items,
            },
          ]);
        }

        setSimilar(
          subscriptions.filter((g) => g.title.toLowerCase() !== "zee5").slice(0, 4)
        );
      } catch (err) {
        setZee5(null);
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
      title="ZEE5"
      image={zee5?.image || ""}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
