import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import GameDetailsLayout from "@/components/custom/GameDetailsLayout";
import { productivity } from "@/lib/products";

const infoSections = [
  {
    title: "About Tinder Plus",
    content: (
      <div className="text-base">
        <p className="mb-2">
          Tinder Plus is a premium dating subscription that offers unlimited swipes, passport feature, and other tools to enhance your dating experience.
        </p>
        <ul className="list-disc pl-5">
          <li><b>Unlimited Likes:</b> Swipe right as much as you want.</li>
          <li><b>Passport Feature:</b> Match with people worldwide.</li>
          <li><b>Rewind:</b> Undo accidental left swipes.</li>
          <li><b>Ad-Free Experience:</b> Enjoy Tinder without interruptions.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Subscribe to Tinder Plus.</li>
        <li>Log in to your Tinder account.</li>
        <li>Enjoy unlimited swipes, passport, and other premium features.</li>
        <li>Match and chat with people globally.</li>
      </ol>
    ),
  },
  {
    title: "Features Included",
    content: (
      <ul className="list-disc pl-5 text-base mb-4">
        <li><b>Unlimited Likes</b></li>
        <li><b>Passport to Anywhere</b></li>
        <li><b>Rewind Last Swipe</b></li>
        <li><b>Boost Once a Month</b></li>
        <li><b>Ad-Free Experience</b></li>
      </ul>
    ),
  },
];


export default function TinderPlus() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [tinder, setTinder] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const tinderProduct = productivity.find(p => p.title === "Tinder Plus");
  const infoImage = tinderProduct?.image;

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_SUBSCRIPTIONS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        const f = products.find(
          (g) => g.title && g.title.toLowerCase() === "tinder plus"
        );
        setTinder(f);

        if (f && Array.isArray(f.priceList)) {
          const items = f.priceList.map((item) => {
            const [label, price, hot] = item.split("|");
            return { label, price: Number(price), hot: hot === "true" };
          });

          setPriceList([
            {
              title: "Figma Subscription",
              categoryIcon: "/assets/icons/tools/figma.svg",
              items,
            },
          ]);
        }

        setSimilar(
          productivity.filter((g) => g.title.toLowerCase() !== "figma").slice(0, 4)
        );
      } catch {
        setTinder(null);
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
      title="Tinder Plus"
      image={tinderProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
