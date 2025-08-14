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
  "UC Packages": "/assets/icons/uc.svg",
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
      title: "Battle Passes", // displayed text
      categoryIcon: categoryIcons["Passes & Vouchers"],
      items: passes,
    },
    {
      title: "BS Packages", // displayed text for UC-type packages
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
          Open Blood Strike Mobile, tap your avatar in the top-left corner. Your Player ID is displayed below your avatar name.
        </p>
      </div>
    ),
  },
];

export default function BloodStrikeMobile() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [playerId, setPlayerId] = useState("");
  const [bloodStrike, setBloodStrike] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const bloodProduct = mobileGames.find((p) => p.title === "Blood Strike");
  const infoImage = bloodProduct?.image;

  useEffect(() => {
    async function fetchProduct() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_MOBILE_GAMES_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;

        const bloodProduct = products.find((g) => g.title && g.title.toLowerCase() === "blood strike");
        setBloodStrike(bloodProduct);

        if (bloodProduct && Array.isArray(bloodProduct.priceList)) {
          setPriceList(groupPriceList(bloodProduct.priceList));
        }

        setSimilar(mobileGames.filter((g) => g.title !== "Blood Strike").slice(0, 4));
      } catch (err) {
        setBloodStrike(null);
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
      title="Blood Strike"
      image={bloodProduct?.image}
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
