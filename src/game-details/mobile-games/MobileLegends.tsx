import { useState } from "react";
import { mobileGames } from "@/lib/producs";
import GameDetailsLayout from "@/components/GameDetailsLayout";

const priceList = [
  {
    title: "Passes & Vouchers",
    categoryIcon: "/src/assets/icons/voucher.svg",
    items: [
      { label: "Weekly Pass", price: 200, hot: true },
      { label: "Twilight Pass", price: 1040 },
    ],
  },
  {
    title: "Diamonds",
    categoryIcon: "/src/assets/icons/diamond.svg",
    items: [
      { label: "165+135 Diamond", price: 305 },
      { label: "275+225 Diamond", price: 490 },
      { label: "11 Diamonds", price: 30 },
      { label: "22 Diamonds", price: 50, hot: true },
      { label: "56 Diamonds", price: 110 },
      { label: "112 Diamonds", price: 220 },
      { label: "223 Diamonds", price: 440 },
      { label: "336 Diamonds", price: 660 },
      { label: "570 Diamonds", price: 1100, hot: true },
      { label: "1163 Diamonds", price: 2205 },
      { label: "2398 Diamonds", price: 4405 },
      { label: "6042 Diamonds", price: 11020 },
    ],
  },
];

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
  const [selected, setSelected] = useState<{ categoryIdx: number; itemIdx: number } | null>(null);
  const [playerId, setPlayerId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const ml = mobileGames.find((g) => g.title === "Mobile Legends");
  const similar = mobileGames
    .filter((g) => g.title !== "Mobile Legends")
    .slice(0, 4);
  const infoImage = "/products/mobile-legends.png";

  return (
    <GameDetailsLayout
      title="Mobile Legends"
      image={ml?.image || ""}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selected={selected}
      setSelected={setSelected as any}
      playerId={playerId}
      setPlayerId={setPlayerId}
      zoneId={zoneId}
      setZoneId={setZoneId}
      quantity={quantity}
      setQuantity={setQuantity}
      infoImage={infoImage}
    />
  );
}
