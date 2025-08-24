import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import { mobileGames } from "@/lib/products";
import GameDetailsLayout from "@/components/custom/GameDetailsLayout";

// Define the SelectedItem interface
interface SelectedItem {
  categoryIdx: number;
  itemIdx: number;
  quantity: number;
}

const categoryIcons = {
  "Passes & Vouchers": "/assets/icons/games/pass.svg",
  "CP Packages": "/assets/icons/games/cod-mobile.svg",
};

function groupPriceList(priceList) {
  const passes = [];
  const uc = [];
  priceList.forEach((item) => {
    if (typeof item === "string") {
      const [label, price, hot, type] = item.split("|");
      const obj = { label, price: Number(price), hot: hot === "true" };
      if (type === "pass") {
        passes.push(obj);
      } else if (type === "uc") {
        uc.push(obj);
      }
    } else if (typeof item === "object" && item.label && item.price) {
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
      title: "CP Packages",
      categoryIcon: categoryIcons["CP Packages"],
      items: uc,
    },
  ];
}

const infoSections = [
  {
    title: "How to Buy",
    content: (
      <ul className="list-disc pl-5 text-base mb-4">
        <li>Select your desired CP or pass package above.</li>
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
          Open Call of Duty Mobile, tap your avatar in the top-left corner. Your Player ID is displayed below your avatar name.
        </p>
      </div>
    ),
  },
];

export default function CODMobile() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [playerId, setPlayerId] = useState("");
  const [cod, setCod] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const codProduct = mobileGames.find((p) => p.title === "Call of Duty Mobile");
  const infoImage = codProduct?.image;

  useEffect(() => {
    async function fetchProduct() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_MOBILE_GAMES_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        // Find Call of Duty Mobile
        const codProduct = products.find((g) => g.title && g.title.toLowerCase() === "call of duty mobile");
        setCod(codProduct);

        if (codProduct && Array.isArray(codProduct.priceList)) {
          setPriceList(groupPriceList(codProduct.priceList));
        }

        setSimilar(mobileGames.filter((g) => g.title !== "Call of Duty Mobile").slice(0, 4));
      } catch (err) {
        setCod(null);
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
      title="Call of Duty Mobile"
      image={codProduct?.image}
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
