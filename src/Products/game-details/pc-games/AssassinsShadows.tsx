import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import { pcGames } from "@/lib/products";
import GameDetailsLayout from "@/components/custom/GameDetailsLayout";

// Define the SelectedItem interface here since it's needed by the component
interface SelectedItem {
  categoryIdx: number;
  itemIdx: number;
  quantity: number;
}

const categoryIcons = {
  "AC Shadows": "/assets/icons/games/ac.svg", // AC Shadows icon
};

function groupPriceList(priceList) {
  const acShadows = [];
  priceList.forEach((item) => {
    if (typeof item === "string") {
      const [label, price, hot] = item.split("|");
      acShadows.push({ label, price: Number(price), hot: hot === "true" });
    } else if (item.label && item.price) {
      acShadows.push(item);
    }
  });
  return [
    { title: "Steam | Epic Games", categoryIcon: categoryIcons["AC Shadows"], items: acShadows },
  ];
}

const infoSections = [
  {
    title: "How to Buy",
    content: (
      <ul className="list-disc pl-5 text-base mb-4">
        <li>Select your desired AC Shadows package above.</li>
        <li>Choose quantity and proceed to payment.</li>
        <li>Receive your items instantly after successful payment.</li>
      </ul>
    ),
  },
];

export default function AssassinsShadows() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [assassinsShadows, setAssassinsShadows] = useState<any>(null);
  const [priceList, setPriceList] = useState<any[]>([]);
  const [similar, setSimilar] = useState<any[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Use image from subscriptions array
  const assassinsShadowsProduct = pcGames.find((p) => p.title === "AC Shadows");
  const infoImage = assassinsShadowsProduct?.image;

  useEffect(() => {
    async function fetchProduct() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_PC_GAMES_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;

        const acShadowsGame = products.find((g) => g.title?.toLowerCase() === "ac shadows");
        setAssassinsShadows(acShadowsGame);

        if (acShadowsGame && Array.isArray(acShadowsGame.priceList)) setPriceList(groupPriceList(acShadowsGame.priceList));

        setSimilar(pcGames.filter((g) => g.title !== "AC Shadows").slice(0, 4));
      } catch {
        setAssassinsShadows(null);
        setPriceList([]);
        setSimilar([]);
      }
    }

    async function checkAuth() {
      try { await account.get(); setIsSignedIn(true); }
      catch { setIsSignedIn(false); }
    }

    fetchProduct();
    checkAuth();
  }, []);

  return (
    <GameDetailsLayout
      isSignedIn={isSignedIn}
      title="Assassin's Creed Shadows"
      image={assassinsShadowsProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
