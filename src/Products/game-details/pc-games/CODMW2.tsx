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
  Diamonds: "/assets/icons/gift-cards/cod.svg", // COD-specific icon
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
      title: "Call of Duty: Modern Warfare II",
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
        <li>Select your desired Call of Duty: Modern Warfare II Points package above.</li>
        <li>Choose quantity and proceed to payment.</li>
      </ul>
    ),
  },
];

export default function CODMW2() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [codMW2, setCodMW2] = useState<any>(null);
  const [priceList, setPriceList] = useState<any[]>([]);
  const [similar, setSimilar] = useState<any[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Use image from subscriptions array
  const codMW2Product = pcGames.find((p) => p.title === "Call of Duty: Modern Warfare II");
  const infoImage = codMW2Product?.image;

  useEffect(() => {
    async function fetchProduct() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId =
          import.meta.env.VITE_APPWRITE_COLLECTION_PC_GAMES_ID;

        // Get all PC games
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;

        // Find Call of Duty: Modern Warfare II (case-insensitive)
        const codMW2Product = products.find(
          (g) => g.title && g.title.toLowerCase() === "call of duty: modern warfare ii"
        );

        setCodMW2(codMW2Product);

        // Group priceList
        if (codMW2Product && Array.isArray(codMW2Product.priceList)) {
          setPriceList(groupPriceList(codMW2Product.priceList));
        }

        // Get similar products
        setSimilar(pcGames.filter((g) => g.title !== "Call of Duty: Modern Warfare II").slice(0, 4));
      } catch (err) {
        setCodMW2(null);
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
      title="Call of Duty: Modern Warfare II"
      image={codMW2Product?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
