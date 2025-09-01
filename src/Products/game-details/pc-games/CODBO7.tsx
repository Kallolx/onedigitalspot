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
  Diamonds: "/assets/icons/games/bo.svg",
};

function groupPriceList(priceList) {
  const pc: any[] = [];
  priceList.forEach((item) => {
    const [label, price, hot, type] = item.split("|");
    const obj = { label, price: Number(price), hot: hot === "true" };
    if (type === "pc") {
      pc.push(obj);
    }
  });
  return [
    {
      title: "Steam  Epic Games",
      categoryIcon: categoryIcons["Diamonds"],
      items: pc,
    },
  ];
}

const infoSections = [
  {
    title: "How to Buy",
    content: (
      <ul className="list-disc pl-5 text-base mb-4">
        <li>Select your desired COD BO7 package above.</li>
        <li>Choose quantity and proceed to payment.</li>
        <li>Receive your items instantly after successful payment.</li>
      </ul>
    ),
  },
];

export default function CODBO7() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [codBO7, setCodBO7] = useState<any>(null);
  const [priceList, setPriceList] = useState<any[]>([]);
  const [similar, setSimilar] = useState<any[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Use image from pcGames array
  const codBO7Product = pcGames.find((p) => p.title === "Black Ops 7");
  const infoImage = codBO7Product?.image;

  useEffect(() => {
    async function fetchProduct() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_PC_GAMES_ID;

        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;

        // Match COD BO7 product (exact match)
        const codGame = products.find(
          (g) => g.title?.toLowerCase() === "black ops 7"
        );
        setCodBO7(codGame);

        if (codGame && Array.isArray(codGame.priceList)) {
          setPriceList(groupPriceList(codGame.priceList));
        }

        setSimilar(
          pcGames.filter((g) => g.title !== "Black Ops 7").slice(0, 4)
        );
      } catch {
        setCodBO7(null);
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
      title="Call of Duty: Black Ops 7"
      image={codBO7Product?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
