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
  "Passes & Vouchers": "/assets/icons/voucher.svg",
  "Diamonds": "/assets/icons/diamond.svg",
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
      if (item.label.toLowerCase().includes("pass") || item.label.toLowerCase().includes("voucher")) {
        passes.push(item);
      } else {
        diamonds.push(item);
      }
    }
  });

  return [
    {
      title: "Passes & Vouchers",
      categoryIcon: categoryIcons["Passes & Vouchers"],
      items: passes,
    },
    {
      title: "Diamond Packages",
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
        <li>Select your desired Diamond package or pass above.</li>
        <li>Enter your Free Fire Player ID.</li>
        <li>Choose quantity and proceed to payment.</li>
      </ul>
    ),
  },
  {
    title: "How to Find Your Player ID",
    content: (
      <div className="mb-2">
        <p className="mb-2">
          Open Garena Free Fire and tap your avatar in the top-left corner. Your Player ID will be displayed below your username.
        </p>
      </div>
    ),
  },
];

export default function FreeFire() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [playerId, setPlayerId] = useState("");
  const [freefire, setFreefire] = useState<any>(null);
  const [priceList, setPriceList] = useState<any[]>([]);
  const [similar, setSimilar] = useState<any[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  // Use image from subscriptions array
  const freeFireProduct = mobileGames.find(
    (p) => p.title === "Free Fire"
  );
  const infoImage = freeFireProduct?.image;

  useEffect(() => {
    async function fetchProduct() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_MOBILE_GAMES_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        const ffProduct = products.find(
          (g) => g.title && g.title.toLowerCase() === "free fire"
        );
        setFreefire(ffProduct);
        if (ffProduct && Array.isArray(ffProduct.priceList)) {
          setPriceList(groupPriceList(ffProduct.priceList));
        }
        setSimilar(mobileGames.filter((g) => g.title !== "Free Fire").slice(0, 4));
      } catch (err) {
        setFreefire(null);
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
      title="Free Fire"
      image={freeFireProduct?.image}
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
