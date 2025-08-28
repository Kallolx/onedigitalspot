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
  Diamonds: "/assets/icons/gift-cards/assassins-creed.svg", // Assassin's Creed-specific icon
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
      title: "Assassin's Creed Shadows",
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
        <li>Select your desired Assassin's Creed Shadows Points package above.</li>
        <li>Choose quantity and proceed to payment.</li>
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
        const collectionId =
          import.meta.env.VITE_APPWRITE_COLLECTION_PC_GAMES_ID;

        // Get all PC games
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;

        // Find Assassin's Creed Shadows (case-insensitive)
        const assassinsShadowsProduct = products.find(
          (g) => g.title && g.title.toLowerCase() === "assassin's creed shadows"
        );

        setAssassinsShadows(assassinsShadowsProduct);

        // Group priceList
        if (assassinsShadowsProduct && Array.isArray(assassinsShadowsProduct.priceList)) {
          setPriceList(groupPriceList(assassinsShadowsProduct.priceList));
        }

        // Get similar products
        setSimilar(pcGames.filter((g) => g.title !== "Assassin's Creed Shadows").slice(0, 4));
      } catch (err) {
        setAssassinsShadows(null);
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
