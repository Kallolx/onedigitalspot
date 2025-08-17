import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import GameDetailsLayout from "@/components/custom/GameDetailsLayout";
import { productivity } from "@/lib/products";

const infoSections = [
  {
    title: "About Bumble Plus",
    content: (
      <div className="text-base">
        <p className="mb-2">
          Bumble Plus is a premium subscription that enhances your dating experience by giving extra control and visibility on the Bumble app.
        </p>
        <ul className="list-disc pl-5">
          <li><b>Unlimited Swipes:</b> Swipe without restrictions.</li>
          <li><b>Backtrack:</b> Undo accidental left swipes.</li>
          <li><b>Spotlight & SuperSwipes:</b> Stand out to more people.</li>
          <li><b>Rematch:</b> Rematch with expired connections.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Subscribe to Bumble Plus.</li>
        <li>Log in to your Bumble account.</li>
        <li>Use all premium features like unlimited swipes and backtrack.</li>
        <li>Connect with matches more effectively.</li>
      </ol>
    ),
  },
  {
    title: "Features Included",
    content: (
      <ul className="list-disc pl-5 text-base mb-4">
        <li><b>Unlimited Swipes</b></li>
        <li><b>Backtrack</b></li>
        <li><b>Spotlight & SuperSwipes</b></li>
        <li><b>Rematch Expired Connections</b></li>
        <li><b>Ad-Free Experience</b></li>
      </ul>
    ),
  },
];


export default function Bumble() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [bumble, setBumble] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const bumbleProduct = productivity.find(p => p.title === "Bumble Plus");
  const infoImage = bumbleProduct?.image;

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_SUBSCRIPTIONS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        const f = products.find(
          (g) => g.title && g.title.toLowerCase() === "bumble plus"
        );
        setBumble(f);

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
        setBumble(null);
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
      title="Bumble Plus"
      image={bumbleProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
