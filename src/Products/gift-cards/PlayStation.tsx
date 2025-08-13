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
  "PlayStation Gift Cards (USD)": "/assets/icons/gift-cards/playstation.svg",
};

const infoSections = [
  {
    title: "How to Redeem PlayStation Gift Card",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Sign in to your PlayStation Network account.</li>
        <li>
          Go to <b>PlayStation Store</b> and select <b>Redeem Codes</b>.
        </li>
        <li>Enter your 12-digit gift card code carefully.</li>
        <li>Click <b>Continue</b> to add funds to your PlayStation wallet.</li>
        <li>Start purchasing games, DLCs, and other content!</li>
      </ol>
    ),
  },
  {
    title: "What You Can Buy",
    content: (
      <ul className="list-disc pl-5 text-base mb-4">
        <li>Latest PlayStation games and exclusives</li>
        <li>DLCs and expansion packs</li>
        <li>PlayStation Plus subscriptions</li>
        <li>Movies, TV shows, and digital content</li>
        <li>In-game currencies and items</li>
      </ul>
    ),
  },
];

export default function PlayStationGiftCard() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [psgc, setPsgc] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

      // Use image from subscriptions array
  const playStationProduct = giftCards.find(p => p.title === "PlayStation");
  const infoImage = playStationProduct?.image;

  useEffect(() => {
    async function fetchGiftCards() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId =
          import.meta.env.VITE_APPWRITE_COLLECTION_GIFT_CARDS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;

        // Find PlayStation Gift Card (case-insensitive)
        const playStationGiftCard = products.find(
          (g) => g.title && g.title.toLowerCase() === "playstation gift card"
        );
        setPsgc(playStationGiftCard);

        if (playStationGiftCard && Array.isArray(playStationGiftCard.priceList)) {
          // Group into PlayStation Gift Cards (USD)
          const cards = [];
          playStationGiftCard.priceList.forEach((item) => {
            const [label, price, hot] = item.split("|");
            cards.push({ label, price: Number(price), hot: hot === "true" });
          });
          setPriceList([
            {
              title: "PlayStation Gift Cards (USD)",
              categoryIcon: categoryIcons["PlayStation Gift Cards (USD)"],
              items: cards,
            },
          ]);
        }

        // Get similar products excluding PlayStation Gift Card
        setSimilar(
          giftCards.filter((g) => g.title.toLowerCase() !== "playstation").slice(0, 4)
        );
      } catch (err) {
        setPsgc(null);
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
      title="PlayStation"
      image={playStationProduct?.image}
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
