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
  "Passes & Vouchers": "/assets/icons/voucher.svg",
  "Diamonds": "/assets/icons/gift-cards/valorant.svg",
};

function groupPriceList(priceList) {
  const passes = [];
  const diamonds = [];
  priceList.forEach((item) => {
    const [label, price, hot, type] = item.split("|");
    const obj = { label, price: Number(price), hot: hot === "true" };
    if (type === "voucher") {
      passes.push(obj);
    } else if (type === "diamond") {
      diamonds.push(obj);
    }
  });
  return [
    {
      title: "Passes & Vouchers",
      categoryIcon: categoryIcons["Passes & Vouchers"],
      items: passes,
    },
    {
      title: "Diamonds",
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
        <li>Select your desired Valorant Points package above.</li>
        <li>Enter your Riot ID.</li>
        <li>Choose quantity and proceed to payment.</li>
      </ul>
    ),
  },
  {
    title: "How to Find Riot ID",
    content: (
      <div className="mb-2">
        <p className="mb-2">
          Open Valorant, click on your profile in the top-right corner. Your Riot ID is displayed below your username.
        </p>
      </div>
    ),
  },
];

export default function Valorant() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [playerId, setPlayerId] = useState("");
  const [valorant, setValorant] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false); // <-- Add this state

    // Use image from subscriptions array
    const valorantProduct = pcGames.find(p => p.title === "Valorant");
    const infoImage = valorantProduct?.image;

  useEffect(() => {
    async function fetchProduct() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_PC_GAMES_ID;
        // Get all PC games
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        // Find Valorant (case-insensitive)
        const valorantProduct = products.find((g) => g.title && g.title.toLowerCase() === "valorant");
        setValorant(valorantProduct);
        // Group priceList
        if (valorantProduct && Array.isArray(valorantProduct.priceList)) {
          setPriceList(groupPriceList(valorantProduct.priceList));
        }
        // Get similar products
        setSimilar(pcGames.filter((g) => g.title !== "Valorant").slice(0, 4));
      } catch (err) {
        setValorant(null);
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
    checkAuth(); // <-- Check Appwrite auth
  }, []);

  return (
    <GameDetailsLayout
      isSignedIn={isSignedIn}
      title="Valorant"
      image={valorantProduct?.image}
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
