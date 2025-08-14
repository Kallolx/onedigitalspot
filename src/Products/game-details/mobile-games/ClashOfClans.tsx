import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import { mobileGames } from "@/lib/products";
import GameDetailsLayout from "@/components/GameDetailsLayout";

// SelectedItem interface
interface SelectedItem {
  categoryIdx: number;
  itemIdx: number;
  quantity: number;
}

const categoryIcons = {
  "Passes & Vouchers": "/assets/icons/battle-pass.svg",
  "Diamonds Packages": "/assets/icons/diamonds.svg", // changed icon
};

function groupPriceList(priceList) {
  const passes = [];
  const diamonds = [];
  priceList.forEach((item) => {
    if (typeof item === "string") {
      const [label, price, hot, type] = item.split("|");
      const obj = { label, price: Number(price), hot: hot === "true" };
      if (type === "pass") {
        passes.push(obj);
      } else if (type === "diamond") {
        diamonds.push(obj); 
      }
    } else if (typeof item === "object" && item.label && item.price) {
      if (item.label.toLowerCase().includes("pass")) {
        passes.push(item);
      } else {
        diamonds.push(item);
      }
    }
  });
  return [
    {
      title: "Battle Passes", // displayed text
      categoryIcon: categoryIcons["Passes & Vouchers"],
      items: passes,
    },
    {
      title: "Diamonds Packages", // displayed text
      categoryIcon: categoryIcons["Diamonds Packages"],
      items: diamonds,
    },
  ];
}

const infoSections = [
  {
    title: "How to Buy",
    content: (
      <ul className="list-disc pl-5 text-base mb-4">
        <li>Select your desired package above.</li>
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
          Open Class of Clans, tap your avatar in the top-left corner. Your Player ID is displayed below your avatar name.
        </p>
      </div>
    ),
  },
];

export default function ClassOfClansMobile() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [playerId, setPlayerId] = useState("");
  const [clans, setClans] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const clanProduct = mobileGames.find((p) => p.title === "Clash of Clans");
  const infoImage = clanProduct?.image;

  useEffect(() => {
    async function fetchProduct() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_MOBILE_GAMES_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;

        const clanProduct = products.find(
          (g) => g.title && g.title.toLowerCase() === "clash of clans"
        );
        setClans(clanProduct);

        if (clanProduct && Array.isArray(clanProduct.priceList)) {
          setPriceList(groupPriceList(clanProduct.priceList));
        }

        setSimilar(mobileGames.filter((g) => g.title !== "Clash of Clans").slice(0, 4));
      } catch (err) {
        setClans(null);
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
      title="Class of Clans"
      image={clanProduct?.image}
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
