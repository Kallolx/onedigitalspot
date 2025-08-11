import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import { giftCards } from "@/lib/products";
import GameDetailsLayout from "@/components/GameDetailsLayout";

// Define SelectedItem interface again if needed
interface SelectedItem {
  categoryIdx: number;
  itemIdx: number;
  quantity: number;
}

const categoryIcons = {
  "Roblox Gift Cards (USD)": "/assets/icons/roblox-banner.svg",
};

const infoSections = [
  {
    title: "How to Redeem Roblox Gift Card",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Go to roblox.com and log into your account.</li>
        <li>
          Click on the <b>Robux</b> icon in the top navigation bar.
        </li>
        <li>Select <b>Redeem Roblox Card</b>.</li>
        <li>Enter your PIN from the gift card and click <b>Redeem</b>.</li>
        <li>Your Robux will be added to your account instantly!</li>
      </ol>
    ),
  },
  {
    title: "What You Can Buy with Robux",
    content: (
      <ul className="list-disc pl-5 text-base mb-4">
        <li>Avatar clothing, accessories, and animations</li>
        <li>Game passes and premium features in games</li>
        <li>Developer products and special items</li>
        <li>Premium membership subscriptions</li>
        <li>Limited edition and exclusive items</li>
        <li>Create and customize your own games</li>
      </ul>
    ),
  },
];

export default function RobloxGiftCard() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [rgc, setRgc] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);

  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    async function fetchGiftCards() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId =
          import.meta.env.VITE_APPWRITE_COLLECTION_GIFT_CARDS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;

        // Find Roblox Gift Card (case-insensitive)
        const robloxGiftCard = products.find(
          (g) => g.title && g.title.toLowerCase() === "roblox gift card"
        );
        setRgc(robloxGiftCard);

        if (robloxGiftCard && Array.isArray(robloxGiftCard.priceList)) {
          // Group into Roblox Gift Cards (USD)
          const cards = [];
          robloxGiftCard.priceList.forEach((item) => {
            const [label, price, hot] = item.split("|");
            cards.push({ label, price: Number(price), hot: hot === "true" });
          });
          setPriceList([
            {
              title: "Roblox Gift Cards (USD)",
              categoryIcon: categoryIcons["Roblox Gift Cards (USD)"],
              items: cards,
            },
          ]);
        }

        // Get similar products excluding Roblox Gift Card
        setSimilar(
          giftCards.filter((g) => g.title.toLowerCase() !== "roblox").slice(0, 4)
        );
      } catch (err) {
        setRgc(null);
        setPriceList([]);
        setSimilar([]);
      }
    }

    async function checkSignIn() {
      try {
        await account.get();
        setIsSignedIn(true);
      } catch {
        setIsSignedIn(false);
      }
    }

    fetchGiftCards();
    checkSignIn();
  }, []);

  return (
    <GameDetailsLayout
      isSignedIn={isSignedIn}
      title="Roblox"
      image={rgc?.image || ""}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      playerId={undefined} // Hide Player ID
      setPlayerId={undefined} // Hide Player ID
      zoneId={undefined} // Hide Zone ID
      setZoneId={undefined}
    />
  );
}
