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
  "Apple Gift Cards (USD)": "/assets/icons/apple-store.svg",
};

const infoSections = [
  {
    title: "How to Redeem Apple Gift Card",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Open the App Store, iTunes Store, or Apple Books on your device.</li>
        <li>
          Scroll to the bottom and tap <b>Redeem</b>.
        </li>
        <li>Sign in with your Apple ID if prompted.</li>
        <li>Enter your gift card code or use your camera to scan it.</li>
        <li>Tap <b>Redeem</b> to add credit to your Apple account!</li>
      </ol>
    ),
  },
  {
    title: "What You Can Buy",
    content: (
      <ul className="list-disc pl-5 text-base mb-4">
        <li>Apps and games from the App Store</li>
        <li>Music, movies, and TV shows from iTunes</li>
        <li>Books and audiobooks from Apple Books</li>
        <li>iCloud storage subscriptions</li>
        <li>Apple Music and other Apple services</li>
        <li>In-app purchases and premium features</li>
      </ul>
    ),
  },
];

export default function AppleGiftCard() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [apgc, setApgc] = useState(null);
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

        // Find Apple Gift Card (case-insensitive)
        const appleGiftCard = products.find(
          (g) => g.title && g.title.toLowerCase() === "apple gift card"
        );
        setApgc(appleGiftCard);

        if (appleGiftCard && Array.isArray(appleGiftCard.priceList)) {
          // Group into Apple Gift Cards (USD)
          const cards = [];
          appleGiftCard.priceList.forEach((item) => {
            const [label, price, hot] = item.split("|");
            cards.push({ label, price: Number(price), hot: hot === "true" });
          });
          setPriceList([
            {
              title: "Apple Gift Cards (USD)",
              categoryIcon: categoryIcons["Apple Gift Cards (USD)"],
              items: cards,
            },
          ]);
        }

        // Get similar products excluding Apple Gift Card
        setSimilar(
          giftCards.filter((g) => g.title.toLowerCase() !== "apple").slice(0, 4)
        );
      } catch (err) {
        setApgc(null);
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
      title="Apple"
      image={apgc?.image || ""}
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
