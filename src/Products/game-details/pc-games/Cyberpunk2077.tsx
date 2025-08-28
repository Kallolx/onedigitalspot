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
  Diamonds: "/assets/icons/gift-cards/cyberpunk.svg", // Cyberpunk-specific icon
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
      title: "Cyberpunk 2077",
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
        <li>Select your desired Cyberpunk 2077 Points package above.</li>
        <li>Choose quantity and proceed to payment.</li>
      </ul>
    ),
  },
];

export default function Cyberpunk2077() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [cyberpunk, setCyberpunk] = useState<any>(null);
  const [priceList, setPriceList] = useState<any[]>([]);
  const [similar, setSimilar] = useState<any[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Use image from subscriptions array
  const cyberpunkProduct = pcGames.find((p) => p.title === "Cyberpunk 2077");
  const infoImage = cyberpunkProduct?.image;

  useEffect(() => {
    async function fetchProduct() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId =
          import.meta.env.VITE_APPWRITE_COLLECTION_PC_GAMES_ID;

        // Get all PC games
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;

        // Find Cyberpunk 2077 (case-insensitive)
        const cyberpunkProduct = products.find(
          (g) => g.title && g.title.toLowerCase() === "cyberpunk 2077"
        );

        setCyberpunk(cyberpunkProduct);

        // Group priceList
        if (cyberpunkProduct && Array.isArray(cyberpunkProduct.priceList)) {
          setPriceList(groupPriceList(cyberpunkProduct.priceList));
        }

        // Get similar products
        setSimilar(pcGames.filter((g) => g.title !== "Cyberpunk 2077").slice(0, 4));
      } catch (err) {
        setCyberpunk(null);
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
      title="Cyberpunk 2077"
      image={cyberpunkProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
