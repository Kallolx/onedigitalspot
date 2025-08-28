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
  Diamonds: "/assets/icons/gift-cards/fifa.svg", // FIFA-specific icon
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
      title: "FIFA 25",
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
        <li>Select your desired FIFA 25 Points package above.</li>
        <li>Choose quantity and proceed to payment.</li>
      </ul>
    ),
  },
];

export default function FIFA25() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [fifa25, setFifa25] = useState<any>(null);
  const [priceList, setPriceList] = useState<any[]>([]);
  const [similar, setSimilar] = useState<any[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Use image from subscriptions array
  const fifa25Product = pcGames.find((p) => p.title === "FIFA 25");
  const infoImage = fifa25Product?.image;

  useEffect(() => {
    async function fetchProduct() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId =
          import.meta.env.VITE_APPWRITE_COLLECTION_PC_GAMES_ID;

        // Get all PC games
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;

        // Find FIFA 25 (case-insensitive)
        const fifa25Product = products.find(
          (g) => g.title && g.title.toLowerCase() === "fifa 25"
        );

        setFifa25(fifa25Product);

        // Group priceList
        if (fifa25Product && Array.isArray(fifa25Product.priceList)) {
          setPriceList(groupPriceList(fifa25Product.priceList));
        }

        // Get similar products
        setSimilar(pcGames.filter((g) => g.title !== "FIFA 25").slice(0, 4));
      } catch (err) {
        setFifa25(null);
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
      title="FIFA 25"
      image={fifa25Product?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
