import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import { giftCards } from "@/lib/products";
import GameDetailsLayout from "@/components/custom/GameDetailsLayout";

// Define SelectedItem interface again if needed
interface SelectedItem {
  categoryIdx: number;
  itemIdx: number;
  quantity: number;
}

const categoryIcons = {
  "GameStop Gift Cards (USD)": "/assets/icons/gift-cards/game.svg",
};

const infoSections = [
  {
    title: "How to Redeem GameStop Gift Card",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Visit any GameStop store or go to GameStop.com.</li>
        <li>
          During checkout, select <b>Gift Card</b> as payment method.
        </li>
        <li>Enter your gift card number and PIN if required.</li>
        <li>Complete your purchase with the gift card balance.</li>
        <li>Enjoy your new games and gaming accessories!</li>
      </ol>
    ),
  },
  {
    title: "What You Can Buy",
    content: (
      <ul className="list-disc pl-5 text-base mb-4">
        <li>Latest video games for all consoles</li>
        <li>Gaming accessories and hardware</li>
        <li>Collectibles and merchandise</li>
        <li>Pre-orders for upcoming releases</li>
        <li>Digital game downloads</li>
        <li>Gaming gift cards for other platforms</li>
      </ul>
    ),
  },
];

export default function GameStopGiftCard() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [gsgc, setGsgc] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

    // Use image from subscriptions array
  const gameStopGiftCardProduct = giftCards.find(p => p.title === "GameStop Gift Card");
  const infoImage = gameStopGiftCardProduct?.image;

  useEffect(() => {
    async function fetchGiftCards() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId =
          import.meta.env.VITE_APPWRITE_COLLECTION_GIFT_CARDS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;

        // Find GameStop Gift Card (case-insensitive)
        const gamestopGiftCard = products.find(
          (g) => g.title && g.title.toLowerCase() === "gamestop gift card"
        );
        setGsgc(gamestopGiftCard);

        if (gamestopGiftCard && Array.isArray(gamestopGiftCard.priceList)) {
          // Group into GameStop Gift Cards (USD)
          const cards = [];
          gamestopGiftCard.priceList.forEach((item) => {
            const [label, price, hot] = item.split("|");
            cards.push({ label, price: Number(price), hot: hot === "true" });
          });
          setPriceList([
            {
              title: "GameStop Gift Cards (USD)",
              categoryIcon: categoryIcons["GameStop Gift Cards (USD)"],
              items: cards,
            },
          ]);
        }

        // Get similar products excluding GameStop Gift Card
        setSimilar(
          giftCards.filter((g) => g.title.toLowerCase() !== "gamestop").slice(0, 4)
        );
      } catch (err) {
        setGsgc(null);
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
      title="GameStop"
      image={gameStopGiftCardProduct?.image}
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
