import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import { mobileGames } from "@/lib/products";
import GameDetailsLayout from "@/components/custom/GameDetailsLayout";

interface SelectedItem {
  categoryIdx: number;
  itemIdx: number;
  quantity: number;
}

const categoryIcons = {
  "Passes & Vouchers": "/assets/icons/battle-pass.svg",
  "FIFA Points Packages": "/assets/icons/fifa-points.svg",
};

function groupPriceList(priceList) {
  const passes = [];
  const fifaPoints = [];
  priceList.forEach((item) => {
    if (typeof item === "string") {
      const [label, price, hot, type] = item.split("|");
      const obj = { label, price: Number(price), hot: hot === "true" };
      if (type === "pass") passes.push(obj);
      else fifaPoints.push(obj);
    } else if (item.label && item.price) {
      if (item.label.toLowerCase().includes("pass")) passes.push(item);
      else fifaPoints.push(item);
    }
  });
  return [
    { title: "Battle Passes", categoryIcon: categoryIcons["Passes & Vouchers"], items: passes },
    { title: "FIFA Points Packages", categoryIcon: categoryIcons["FIFA Points Packages"], items: fifaPoints },
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
    content: <p>Open FIFA Mobile, tap your avatar. Your Player ID is shown below your name.</p>,
  },
];

export default function FifaMobile() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [playerId, setPlayerId] = useState("");
  const [game, setGame] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const product = mobileGames.find((p) => p.title === "FIFA Mobile");
  const infoImage = product?.image;

  useEffect(() => {
    async function fetchProduct() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_MOBILE_GAMES_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;

        const fifa = products.find((g) => g.title?.toLowerCase() === "fifa mobile");
        setGame(fifa);

        if (fifa && Array.isArray(fifa.priceList)) setPriceList(groupPriceList(fifa.priceList));

        setSimilar(mobileGames.filter((g) => g.title !== "FIFA Mobile").slice(0, 4));
      } catch {
        setGame(null);
        setPriceList([]);
        setSimilar([]);
      }
    }

    async function checkAuth() {
      try { await account.get(); setIsSignedIn(true); }
      catch { setIsSignedIn(false); }
    }

    fetchProduct();
    checkAuth();
  }, []);

  return (
    <GameDetailsLayout
      isSignedIn={isSignedIn}
      title="FIFA Mobile"
      image={product?.image}
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
