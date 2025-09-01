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
  BF6: "/assets/icons/games/pass.svg", // BF6 icon
};

function groupPriceList(priceList) {
  const bf6 = [];
  priceList.forEach((item) => {
    if (typeof item === "string") {
      const [label, price, hot] = item.split("|");
      bf6.push({ label, price: Number(price), hot: hot === "true" });
    } else if (item.label && item.price) {
      bf6.push(item);
    }
  });
  return [
    {
      title: "Steam | Epic Games | EA Games",
      categoryIcon: categoryIcons["BF6"],
      items: bf6,
    },
  ];
}

const infoSections = [
  {
    title: "How to Buy",
    content: (
      <ul className="list-disc pl-5 text-base mb-4">
        <li>Select your desired BF6 package above.</li>
        <li>Choose quantity and proceed to payment.</li>
        <li>Receive your items instantly after successful payment.</li>
      </ul>
    ),
  },
];

export default function Battlefield6() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [battlefield, setBattlefield] = useState<any>(null);
  const [priceList, setPriceList] = useState<any[]>([]);
  const [similar, setSimilar] = useState<any[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Use image from subscriptions array
  const battlefieldProduct = pcGames.find((p) => p.title === "Battlefield 6");
  const infoImage = battlefieldProduct?.image;

  useEffect(() => {
    async function fetchProduct() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env
          .VITE_APPWRITE_COLLECTION_PC_GAMES_ID;
        const response = await databases.listDocuments(
          databaseId,
          collectionId
        );
        const products = response.documents;

        const bf6Game = products.find((g) => g.title?.toLowerCase() === "battlefield 6");
        setBattlefield(bf6Game);

        if (bf6Game && Array.isArray(bf6Game.priceList))
          setPriceList(groupPriceList(bf6Game.priceList));

        setSimilar(pcGames.filter((g) => g.title !== "BF6").slice(0, 4));
      } catch {
        setBattlefield(null);
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
      title="Battlefield 6"
      image={battlefieldProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
