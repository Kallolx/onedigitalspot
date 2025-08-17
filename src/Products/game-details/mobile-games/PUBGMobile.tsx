import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import { mobileGames } from "@/lib/products";
import GameDetailsLayout from "@/components/custom/GameDetailsLayout";

// Define the SelectedItem interface here since it's needed by the component
interface SelectedItem {
  categoryIdx: number;
  itemIdx: number;
  quantity: number;
}

const categoryIcons = {
  "Passes & Vouchers": "/assets/icons/battle-pass.svg",
  "UC Packages": "/assets/icons/uc.svg",
};

function groupPriceList(priceList) {
  const passes = [];
  const uc = [];
  priceList.forEach((item) => {
    // Support both string and object formats
    if (typeof item === "string") {
      const [label, price, hot, type] = item.split("|");
      const obj = { label, price: Number(price), hot: hot === "true" };
      if (type === "pass") {
        passes.push(obj);
      } else if (type === "uc") {
        uc.push(obj);
      }
    } else if (typeof item === "object" && item.label && item.price) {
      // fallback for object format
      if (item.label.toLowerCase().includes("pass")) {
        passes.push(item);
      } else {
        uc.push(item);
      }
    }
  });
  return [
    {
      title: "Battle Passes",
      categoryIcon: categoryIcons["Passes & Vouchers"],
      items: passes,
    },
    {
      title: "UC Packages",
      categoryIcon: categoryIcons["UC Packages"],
      items: uc,
    },
  ];
}

const infoSections = [
  {
    title: "How to Buy",
    content: (
      <ul className="list-disc pl-5 text-base mb-4">
        <li>Select your desired UC or pass package above.</li>
        <li>Enter your Player ID.</li>
        <li>Choose quantity and proceed to payment.</li>
      </ul>
    ),
  },
  {
    title: "How to Find Player ID",
    content: (
      <div className="mb-2">
        <p className="mb-2">
          Open PUBG Mobile, tap your avatar in the top-right corner. Your Player ID is displayed below your avatar name.
        </p>
      </div>
    ),
  },
];

export default function PUBGMobile() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [playerId, setPlayerId] = useState("");
  const [pubg, setPubg] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  // Use image from subscriptions array
  const pubgProduct = mobileGames.find(
    (p) => p.title === "PUBG Mobile"
  );
  const infoImage = pubgProduct?.image;

  useEffect(() => {
    async function fetchProduct() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_MOBILE_GAMES_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        // Find PUBG Mobile (case-insensitive)
        const pubgProduct = products.find((g) => g.title && g.title.toLowerCase() === "pubg mobile");
        setPubg(pubgProduct);
        // Group priceList
        if (pubgProduct && Array.isArray(pubgProduct.priceList)) {
          setPriceList(groupPriceList(pubgProduct.priceList));
        }
        // Get similar products
        setSimilar(mobileGames.filter((g) => g.title !== "PUBG Mobile").slice(0, 4));
      } catch (err) {
        setPubg(null);
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
      title="PUBG Mobile"
      image={pubgProduct?.image}
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
