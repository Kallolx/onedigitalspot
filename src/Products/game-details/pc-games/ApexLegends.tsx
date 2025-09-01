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
  "Passes & Vouchers": "/assets/icons/games/voucher.svg",
  "Diamonds": "/assets/icons/games/apex.svg",
};

function groupPriceList(priceList) {
  const passes = [];
  const diamonds = [];
  priceList.forEach((item) => {
    const [label, price, hot, type] = item.split("|");
    const obj = { label, price: Number(price), hot: hot === "true" };
    if (type === "pass") {
      passes.push(obj);
    } else if (type === "diamond") {
      diamonds.push(obj);
    }
  });
  return [
    {
      title: "Apex Legends Passes",
      categoryIcon: categoryIcons["Passes & Vouchers"],
      items: passes,
    },
    {
      title: "Apex Coins",
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
        <li>Select your desired Apex Coins package above.</li>
        <li>Enter your Origin/EA Account email.</li>
        <li>Choose quantity and proceed to payment.</li>
      </ul>
    ),
  },
  {
    title: "How to Find Origin/EA Account",
    content: (
      <div className="mb-2">
        <p className="mb-2">
          Open Apex Legends, go to the main menu. Your Origin/EA Account email is the one you use to log into the game.
        </p>
      </div>
    ),
  },
];

export default function ApexLegends() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [playerId, setPlayerId] = useState("");
  const [apexLegends, setApexLegends] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Use image from subscriptions array
  const apexLegendsProduct = pcGames.find(p => p.title === "Apex Legends");
  const infoImage = apexLegendsProduct?.image;

  useEffect(() => {
    async function fetchProduct() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_PC_GAMES_ID;
        // Get all PC games
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        // Find Apex Legends (case-insensitive)
        const apexLegendsProduct = products.find((g) => g.title && g.title.toLowerCase() === "apex legends");
        setApexLegends(apexLegendsProduct);
        // Group priceList
        if (apexLegendsProduct && Array.isArray(apexLegendsProduct.priceList)) {
          setPriceList(groupPriceList(apexLegendsProduct.priceList));
        }
        // Get similar products
        setSimilar(pcGames.filter((g) => g.title !== "Apex Legends").slice(0, 4));
      } catch (err) {
        setApexLegends(null);
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
      title="Apex Legends"
      image={apexLegendsProduct?.image}
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
