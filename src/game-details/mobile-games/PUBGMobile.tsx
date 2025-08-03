import { useState } from "react";
import { mobileGames } from "@/lib/products";
import GameDetailsLayout from "@/components/GameDetailsLayout";

// Define the SelectedItem interface here since it's needed by the component
interface SelectedItem {
  categoryIdx: number;
  itemIdx: number;
  quantity: number;
}

const priceList = [
  {
    title: "Passes & Vouchers",
    categoryIcon: "/assets/icons/battle-pass.svg",
    items: [
      { label: "Royale Pass Lv50", price: 740, hot: true },
      { label: "Royale Pass Lv100", price: 1360},
      { label: "Elite Pass Plus", price: 3345},
    ],
  },
  {
    title: "UC Packages",
    categoryIcon: "/assets/icons/uc.svg",
    items: [
      { label: "PUBG 60 UC", price: 125 },
      { label: "PUBG 120 UC", price: 245 },
      { label: "PUBG 180 UC", price: 370 },
      { label: "PUBG 240 UC", price: 490, hot: true },
      { label: "PUBG 325 UC", price: 620 },
      { label: "PUBG 385 UC", price: 740 },
      { label: "PUBG 660 UC", price: 1240 },
      { label: "PUBG 720 UC", price: 1360 },
      { label: "PUBG 985 UC", price: 1860 },
      { label: "PUBG 1800 UC", price: 3099 },
      { label: "PUBG 1920 UC", price: 3345 },
      { label: "PUBG 3850 UC", price: 6200, hot: true },
      { label: "PUBG 8100 UC", price: 12399 },
      { label: "PUBG 16200 UC", price: 24790 },
    ],
  },
];

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
  const pubg = mobileGames.find((g) => g.title === "PUBG Mobile");
  const similar = mobileGames.filter((g) => g.title !== "PUBG Mobile").slice(0, 4);
  const infoImage = "/products/pubg-mobile.png";

  return (
    <GameDetailsLayout
      title="PUBG Mobile"
      image={pubg?.image || ""}
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
