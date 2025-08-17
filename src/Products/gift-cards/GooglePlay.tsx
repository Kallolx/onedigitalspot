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
  "Google Play Gift Cards (USD)": "/assets/icons/gift-cards/google-play.svg",
};

const infoSections = [
  {
    title: "How to Redeem Google Play Gift Card",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Open the Google Play Store app on your Android device.</li>
        <li>
          Tap the <b>Menu</b> icon and select <b>Redeem</b>.
        </li>
        <li>Enter your gift card code and tap <b>Redeem</b>.</li>
        <li>Enjoy your Google Play balance!</li>
      </ol>
    ),
  },
];

export default function GooglePlayGiftCard() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [gpgc, setGpgc] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Use image from subscriptions array
  const googlePlayGiftCardProduct = giftCards.find(p => p.title === "Google Play");
  const infoImage = googlePlayGiftCardProduct?.image;

  useEffect(() => {
    async function fetchGiftCards() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId =
          import.meta.env.VITE_APPWRITE_COLLECTION_GIFT_CARDS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;

        // Find Google Play Gift Card (case-insensitive)
        const googlePlayGiftCard = products.find(
          (g) => g.title && g.title.toLowerCase() === "google play"
        );
        setGpgc(googlePlayGiftCard);

        if (googlePlayGiftCard && Array.isArray(googlePlayGiftCard.priceList)) {
          // Group into Google Play Gift Cards (USD)
          const cards = [];
          googlePlayGiftCard.priceList.forEach((item) => {
            const [label, price] = item.split("|");
            cards.push({ label, price: Number(price) });
          });
          setPriceList([
            {
              title: "Google Play Gift Cards (USD)",
              categoryIcon: categoryIcons["Google Play Gift Cards (USD)"],
              items: cards,
            },
          ]);
        }

        // Get similar products excluding Google Play Gift Card
        setSimilar(
          giftCards.filter((g) => g.title.toLowerCase() !== "google play").slice(0, 4)
        );
      } catch (err) {
        setGpgc(null);
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
      title="Google Play"
      image={googlePlayGiftCardProduct?.image}
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
