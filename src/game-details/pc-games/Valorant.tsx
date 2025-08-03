import { useState } from "react";
import { pcGames } from "@/lib/products";
import GameDetailsLayout from "@/components/GameDetailsLayout"; // <-- Use GameDetailsLayout

// Define the SelectedItem interface here since it's needed by the component
interface SelectedItem {
  categoryIdx: number;
  itemIdx: number;
  quantity: number;
}

const priceList = [
  {
    title: "Valorant Points Packages",
    categoryIcon: "/assets/icons/valorant.svg",
    items: [
      { label: "Valorant 125 VP", price: 150 },
      { label: "Valorant 250 VP", price: 290 },
      { label: "Valorant 420 VP", price: 480 },
      { label: "Valorant 700 VP", price: 790, hot: true },
      { label: "Valorant 1375 VP", price: 1490 },
      { label: "Valorant 2400 VP", price: 2590 },
      { label: "Valorant 4000 VP", price: 4290 },
      { label: "Valorant 8150 VP", price: 8490, hot: true },
    ],
  },
];

const infoSections = [
  {
    title: "How to Buy",
    content: (
      <ul className="list-disc pl-5 text-base mb-4">
        <li>Select your desired Valorant Points package above.</li>
        <li>Enter your Riot ID.</li>
        <li>Choose quantity and proceed to payment.</li>
      </ul>
    ),
  },
  {
    title: "How to Find Riot ID",
    content: (
      <div className="mb-2">
        <p className="mb-2">
          Open Valorant, click on your profile in the top-right corner. Your Riot ID is displayed below your username.
        </p>
      </div>
    ),
  },
];

export default function Valorant() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [riotId, setRiotId] = useState("");
  const valorant = pcGames?.find((g) => g.title === "Valorant");
  const similar = pcGames?.filter((g) => g.title !== "Valorant").slice(0, 4) || [];
  const infoImage = "/products/valorant.png";

  return (
    <GameDetailsLayout
      title="Valorant"
      image={valorant?.image || ""}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      playerId={riotId}
      setPlayerId={setRiotId}
      infoImage={infoImage}
    />
  );
}
