import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import { mobileGames } from "@/lib/products";
import GameDetailsLayout from "@/components/GameDetailsLayout";

// Define the SelectedItem interface here since it's needed by the component
interface SelectedItem {
  categoryIdx: number;
  itemIdx: number;
  quantity: number;
}

const categoryIcons = {
  "Passes & Vouchers": "/assets/icons/voucher.svg",
  Diamonds: "/assets/icons/diamond.svg",
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
        <li>Select your desired diamond package above.</li>
        <li>Enter your Player ID and Zone ID.</li>
        <li>Choose quantity and proceed to payment.</li>
      </ul>
    ),
  },
  {
    title: "How to Find Player ID & Zone ID",
    content: (
      <div className="mb-2">
        <p className="mb-2">
          Go to your profile in Mobile Legends. Your Player ID and Zone ID are
          shown under your avatar.
        </p>
        <ul className="list-disc pl-5 text-base mb-4">
          <li>Use your account to login the game.</li>
          <li>Click on your avatar in the top-left corner.</li>
          <li>
            Your MLBB User ID and Zone ID will be displayed.(e.g. User
            ID=“12345678”, ZoneID=“1234”)
          </li>
        </ul>
      </div>
    ),
  },
];

export default function MobileLegends() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [playerId, setPlayerId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [ml, setMl] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false); // <-- Add this state

  // Use image from subscriptions array
  const mobileLegendsProduct = mobileGames.find(
    (p) => p.title === "Mobile Legends"
  );
  const infoImage = mobileLegendsProduct?.image;

  useEffect(() => {
    async function fetchProduct() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env
          .VITE_APPWRITE_COLLECTION_MOBILE_GAMES_ID;
        // Get all mobile games
        const response = await databases.listDocuments(
          databaseId,
          collectionId
        );
        const products = response.documents;
        // Find Mobile Legends (case-insensitive)
        const mlProduct = products.find(
          (g) => g.title && g.title.toLowerCase() === "mobile legends"
        );
        setMl(mlProduct);
        // Group priceList
        if (mlProduct && Array.isArray(mlProduct.priceList)) {
          setPriceList(groupPriceList(mlProduct.priceList));
        }
        // Get similar products
        setSimilar(
          mobileGames.filter((g) => g.title !== "Mobile Legends").slice(0, 4)
        );
      } catch (err) {
        setMl(null);
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
      title="Mobile Legends"
      image={mobileLegendsProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      playerId={playerId}
      setPlayerId={setPlayerId}
      zoneId={zoneId}
      setZoneId={setZoneId}
      infoImage={infoImage}
    />
  );
}
