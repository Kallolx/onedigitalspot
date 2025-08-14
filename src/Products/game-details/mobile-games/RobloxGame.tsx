import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import { mobileGames } from "@/lib/products";
import GameDetailsLayout from "@/components/GameDetailsLayout";

interface SelectedItem {
  categoryIdx: number;
  itemIdx: number;
  quantity: number;
}

const categoryIcons = {
  "Robux Packages": "/assets/icons/robux.svg",
};

function groupPriceList(priceList) {
  const robux = [];
  priceList.forEach((item) => {
    if (typeof item === "string") {
      const [label, price, hot] = item.split("|");
      robux.push({ label, price: Number(price), hot: hot === "true" });
    } else if (item.label && item.price) {
      robux.push(item);
    }
  });
  return [
    { title: "Robux Packages", categoryIcon: categoryIcons["Robux Packages"], items: robux },
  ];
}

const infoSections = [
  {
    title: "How to Buy",
    content: (
      <ul className="list-disc pl-5 text-base mb-4">
        <li>Select your desired Robux package above.</li>
        <li>Enter your Roblox username.</li>
        <li>Choose quantity and proceed to payment.</li>
      </ul>
    ),
  },
  {
    title: "How to Find Roblox Username",
    content: <p>Open Roblox, tap your avatar. Your username is shown at the top of the screen.</p>,
  },
];

export default function Roblox() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [username, setUsername] = useState("");
  const [game, setGame] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const product = mobileGames.find((p) => p.title === "Roblox");
  const infoImage = product?.image;

  useEffect(() => {
    async function fetchProduct() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_MOBILE_GAMES_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;

        const robloxGame = products.find((g) => g.title?.toLowerCase() === "roblox");
        setGame(robloxGame);

        if (robloxGame && Array.isArray(robloxGame.priceList)) setPriceList(groupPriceList(robloxGame.priceList));

        setSimilar(mobileGames.filter((g) => g.title !== "Roblox").slice(0, 4));
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
      title="Roblox"
      image={product?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      playerId={username}
      setPlayerId={setUsername}
      infoImage={infoImage}
    />
  );
}
