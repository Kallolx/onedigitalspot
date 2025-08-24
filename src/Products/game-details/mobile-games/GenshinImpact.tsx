import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import { mobileGames } from "@/lib/products";
import GameDetailsLayout from "@/components/custom/GameDetailsLayout";

interface SelectedItem {
  categoryIdx: number;
  itemIdx: number;
  quantity: number;
}

const categoryIcons = {
  "Passes & Vouchers": "/assets/icons/games/voucher.svg",
  "Diamonds": "/assets/icons/games/genshin-impact.svg",
};

function groupPriceList(priceList: any[]) {
  const passes: any[] = [];
  const diamonds: any[] = [];

  priceList.forEach((item) => {
    if (typeof item === "string") {
      const [label, price, hot, type] = item.split("|");
      const obj = { label, price: Number(price), hot: hot === "true" };
      if (type === "pass" || type === "voucher") {
        passes.push(obj);
      } else if (type === "diamond") {
        diamonds.push(obj);
      }
    } else if (typeof item === "object" && item.label && item.price) {
      if (item.label.toLowerCase().includes("pass")) {
        passes.push(item);
      } else {
        diamonds.push(item);
      }
    }
  });

  return [
    {
      title: "Battle Passes",
      categoryIcon: categoryIcons["Passes & Vouchers"],
      items: passes,
    },
    {
      title: "Genesis Crystals",
      categoryIcon: categoryIcons["Diamonds"],
      items: diamonds,
    },
  ];
}

const infoSections = [
  {
    title: "How to Buy",
    content: (
      <ul className="list-disc pl-5 text-base mb-4">
        <li>Select your desired Genesis Crystals or Blessing package above.</li>
        <li>Enter your Genshin Impact UID and server.</li>
        <li>Choose quantity and proceed to payment.</li>
      </ul>
    ),
  },
  {
    title: "How to Find Your UID & Server",
    content: (
      <div className="mb-2">
        <p className="mb-2">
          Open Genshin Impact and look at the bottom right of your game screen. Your UID is displayed there, along with your server (e.g. Asia, America, Europe, TW/HK/MO).
        </p>
        <ul className="list-disc pl-5 text-base mb-4">
          <li>Log in to Genshin Impact with your account.</li>
          <li>Your UID is shown at the bottom right corner of the main screen.</li>
          <li>Note your server region (Asia, America, Europe, or TW/HK/MO).</li>
        </ul>
      </div>
    ),
  },
];

export default function GenshinImpact() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [genshin, setGenshin] = useState<any>(null);
  const [priceList, setPriceList] = useState<any[]>([]);
  const [similar, setSimilar] = useState<any[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [playerId, setPlayerId] = useState("");
  // Use image from subscriptions array
  const genshinProduct = mobileGames.find(
    (p) => p.title === "Genshin Impact"
  );
  const infoImage = genshinProduct?.image;

  useEffect(() => {
    async function fetchProduct() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_MOBILE_GAMES_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        const genshinProduct = products.find(
          (g) => g.title && g.title.toLowerCase() === "genshin impact"
        );
        setGenshin(genshinProduct);
        if (genshinProduct && Array.isArray(genshinProduct.priceList)) {
          setPriceList(groupPriceList(genshinProduct.priceList));
        }
        setSimilar(mobileGames.filter((g) => g.title !== "Genshin Impact").slice(0, 4));
      } catch (err) {
        setGenshin(null);
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

    fetchProduct();
    checkAuth();
  }, []);

  return (
    <GameDetailsLayout
      isSignedIn={isSignedIn}
      title="Genshin Impact"
      image={genshinProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      playerId={playerId}
      setPlayerId={setPlayerId}
      infoImage={infoImage}
    />
  );
}
