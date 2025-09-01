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
  "AC Mirage": "/assets/icons/games/ac.svg", // AC Mirage icon
};

function groupPriceList(priceList) {
  const acMirage = [];
  priceList.forEach((item) => {
    if (typeof item === "string") {
      const [label, price, hot] = item.split("|");
      acMirage.push({ label, price: Number(price), hot: hot === "true" });
    } else if (item.label && item.price) {
      acMirage.push(item);
    }
  });
  return [
    { title: "Steam | Epic Games", categoryIcon: categoryIcons["AC Mirage"], items: acMirage },
  ];
}

const infoSections = [
  {
    title: "How to Buy",
    content: (
      <ul className="list-disc pl-5 text-base mb-4">
        <li>Select your desired AC Mirage package above.</li>
        <li>Choose quantity and proceed to payment.</li>
        <li>Receive your items instantly after successful payment.</li>
      </ul>
    ),
  },
];

export default function ACMirage() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [acMirage, setAcMirage] = useState<any>(null);
  const [priceList, setPriceList] = useState<any[]>([]);
  const [similar, setSimilar] = useState<any[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Use image from subscriptions array
  const acMirageProduct = pcGames.find((p) => p.title === "AC Mirage");
  const infoImage = acMirageProduct?.image;

  useEffect(() => {
    async function fetchProduct() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_PC_GAMES_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;

        const acMirageGame = products.find((g) => g.title?.toLowerCase() === "ac mirage");
        setAcMirage(acMirageGame);

        if (acMirageGame && Array.isArray(acMirageGame.priceList)) setPriceList(groupPriceList(acMirageGame.priceList));

        setSimilar(pcGames.filter((g) => g.title !== "AC Mirage").slice(0, 4));
      } catch {
        setAcMirage(null);
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
      title="Assassin's Creed Mirage"
      image={acMirageProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
