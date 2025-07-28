import { useState } from "react";
import { giftCards } from "@/lib/producs";
import GiftCardDetailsLayout from "@/components/GiftCardDetailsLayout";

const priceList = [
  {
    title: "Steam Wallet Codes (USD)",
    categoryIcon: "/assets/icons/steam-card.svg",
    items: [
      { label: "Steam Wallet - $1.10", price: 140 },
      { label: "Steam Wallet - $1.75", price: 220 },
      { label: "Steam Wallet - $2.25", price: 300 },
      { label: "Steam Wallet - $3.60", price: 450 },
      { label: "Steam Wallet - $4.50", price: 580 },
      { label: "Steam Wallet - $5.50", price: 700 },
      { label: "Steam Wallet - $11.50", price: 1420 },
      { label: "Steam Wallet - $23.25", price: 2860 },
      { label: "Steam Wallet - $46.50", price: 5700 },
      { label: "Steam Wallet - $100.00", price: 12250 },
    ],
  },
];

const infoSections = [
  {
    title: "How to Redeem Steam Wallet Code",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Login to your Steam account.</li>
        <li>
          Go to <b>Games</b> &gt; <b>Redeem a Steam Wallet Code</b>.
        </li>
        <li>
          Enter your code and click <b>Continue</b>.
        </li>
        <li>Enjoy your new Steam balance!</li>
      </ol>
    ),
  },
];


export default function SteamWallet() {
  const [selected, setSelected] = useState<{
    categoryIdx: number;
    itemIdx: number;
  } | null>(null);
  const sw = giftCards.find((g) => g.title === "Steam Wallet");
  const [quantity, setQuantity] = useState(1);
    const similar = giftCards
      .filter((g) => g.title !== "Steam Wallet")
      .slice(0, 4);
  
  return (
    <GiftCardDetailsLayout
      title="Steam Wallet"     
      image={sw?.image || ""}
      priceList={priceList}
      infoSections={infoSections}
      quantity={quantity}
      setQuantity={setQuantity}
      similarProducts={similar}
      selected={selected}
      setSelected={setSelected}
    />
  );
}
