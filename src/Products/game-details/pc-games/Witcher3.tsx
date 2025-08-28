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
  Diamonds: "/assets/icons/gift-cards/witcher.svg", // Witcher-specific icon
};

function groupPriceList(priceList: string[]) {
  const diamonds: any[] = [];
  priceList.forEach((item) => {
    const [label, price, hot, type] = item.split("|");
    const obj = { label, price: Number(price), hot: hot === "true" };
    if (type === "diamond") {
      diamonds.push(obj);
    }
  });
  return [
    {
      title: "The Witcher 3: Wild Hunt",
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
        <li>Select your desired The Witcher 3: Wild Hunt Points package above.</li>
        <li>Choose quantity and proceed to payment.</li>
      </ul>
    ),
  },
];

export default function Witcher3() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [witcher3, setWitcher3] = useState<any>(null);
  const [priceList, setPriceList] = useState<any[]>([]);
  const [similar, setSimilar] = useState<any[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Use image from subscriptions array
  const witcher3Product = pcGames.find((p) => p.title === "The Witcher 3: Wild Hunt");
  const infoImage = witcher3Product?.image;

  useEffect(() => {
    async function fetchProduct() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId =
          import.meta.env.VITE_APPWRITE_COLLECTION_PC_GAMES_ID;

        // Get all PC games
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;

        // Find The Witcher 3: Wild Hunt (case-insensitive)
        const witcher3Product = products.find(
          (g) => g.title && g.title.toLowerCase() === "the witcher 3: wild hunt"
        );

        setWitcher3(witcher3Product);

        // Group priceList
        if (witcher3Product && Array.isArray(witcher3Product.priceList)) {
          setPriceList(groupPriceList(witcher3Product.priceList));
        }

        // Get similar products
        setSimilar(pcGames.filter((g) => g.title !== "The Witcher 3: Wild Hunt").slice(0, 4));
      } catch (err) {
        setWitcher3(null);
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
      title="The Witcher 3: Wild Hunt"
      image={witcher3Product?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
