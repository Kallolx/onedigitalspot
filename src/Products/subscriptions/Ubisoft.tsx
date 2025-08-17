import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import GameDetailsLayout from "@/components/custom/GameDetailsLayout";
import { subscriptions } from "@/lib/products";

const infoSections = [
  {
    title: "About Ubisoft+",
    content: (
      <div className="text-base">
        <p className="mb-2">
          Ubisoft+ gives you access to 100+ Ubisoft titles, including new
          releases, premium editions, and DLCs. Play on PC or stream via
          cloud platforms.
        </p>
        <ul className="list-disc pl-5">
          <li><b>PC Access:</b> Full Ubisoft library on PC.</li>
          <li><b>Multi-Platform:</b> Play on cloud with partners like Xbox Cloud Gaming.</li>
          <li><b>Premium Editions:</b> Includes all expansions & season passes.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Select your Ubisoft+ plan.</li>
        <li>Provide your Ubisoft account email.</li>
        <li>Complete your secure payment.</li>
        <li>Install Ubisoft Connect or access via cloud partner.</li>
        <li>Play premium Ubisoft titles instantly.</li>
      </ol>
    ),
  },
  {
    title: "Benefits Included",
    content: (
      <ul className="list-disc pl-5 text-base mb-4">
        <li><strong>Day-One Access:</strong> Play Ubisoft titles the day they launch.</li>
        <li><strong>100+ Games:</strong> Access to Assassin’s Creed, Far Cry, Rainbow Six, and more.</li>
        <li><strong>Premium Editions:</strong> Get all DLCs and expansions included.</li>
        <li><strong>Cross-Platform:</strong> PC + cloud streaming availability.</li>
        <li><strong>Exclusive Rewards:</strong> Earn in-game items & cosmetics.</li>
      </ul>
    ),
  },
];

export default function UbisoftPlus() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [ubi, setUbi] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const ubiProduct = subscriptions.find(p => p.title === "Ubisoft+");
  const infoImage = ubiProduct?.image;

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_SUBSCRIPTIONS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        const ubiPlus = products.find(
          (g) => g.title && g.title.toLowerCase() === "ubisoft+"
        );
        setUbi(ubiPlus);

        if (ubiPlus && Array.isArray(ubiPlus.priceList)) {
          const items = ubiPlus.priceList.map((item) => {
            const [label, price, hot] = item.split("|");
            return { label, price: Number(price), hot: hot === "true" };
          });
          setPriceList([
            {
              title: "Ubisoft+",
              categoryIcon: "/assets/icons/subscriptions/ubisoft.svg",
              items,
            },
          ]);
        }

        setSimilar(
          subscriptions.filter((g) => g.title.toLowerCase() !== "ubisoft+").slice(0, 4)
        );
      } catch (err) {
        setUbi(null);
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
      title="Ubisoft+"
      image={ubiProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
