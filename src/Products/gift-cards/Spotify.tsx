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
  "Spotify Gift Cards (USD)": "/assets/icons/subscriptions/spotify.svg",
};

const infoSections = [
  {
    title: "How to Redeem Spotify Gift Card",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Go to spotify.com/redeem and log into your account.</li>
        <li>
          Enter your gift card code in the <b>Gift Card Code</b> field.
        </li>
        <li>Click <b>Redeem</b> to apply the credit to your account.</li>
        <li>Your Spotify Premium subscription will be activated or extended.</li>
        <li>Enjoy ad-free music and premium features!</li>
      </ol>
    ),
  },
  {
    title: "Spotify Premium Benefits",
    content: (
      <ul className="list-disc pl-5 text-base mb-4">
        <li>Ad-free music streaming</li>
        <li>Offline downloads for listening anywhere</li>
        <li>High-quality audio streaming</li>
        <li>Unlimited skips and song selection</li>
        <li>Play any song, any time</li>
        <li>Access to exclusive content and features</li>
      </ul>
    ),
  },
];

export default function SpotifyGiftCard() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [sgc, setSgc] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

      // Use image from subscriptions array
  const spotifyGiftCardProduct = giftCards.find(p => p.title === "Spotify Gift Card");
  const infoImage = spotifyGiftCardProduct?.image;

  useEffect(() => {
    async function fetchGiftCards() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId =
          import.meta.env.VITE_APPWRITE_COLLECTION_GIFT_CARDS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;

        // Find Spotify Gift Card (case-insensitive)
        const spotifyGiftCard = products.find(
          (g) => g.title && g.title.toLowerCase() === "spotify gift card"
        );
        setSgc(spotifyGiftCard);

        if (spotifyGiftCard && Array.isArray(spotifyGiftCard.priceList)) {
          // Group into Spotify Gift Cards (USD)
          const cards = [];
          spotifyGiftCard.priceList.forEach((item) => {
            const [label, price, hot] = item.split("|");
            cards.push({ label, price: Number(price), hot: hot === "true" });
          });
          setPriceList([
            {
              title: "Spotify Gift Cards (USD)",
              categoryIcon: categoryIcons["Spotify Gift Cards (USD)"],
              items: cards,
            },
          ]);
        }

        // Get similar products excluding Spotify Gift Card
        setSimilar(
          giftCards.filter((g) => g.title.toLowerCase() !== "spotify").slice(0, 4)
        );
      } catch (err) {
        setSgc(null);
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
      title="Spotify"
      image={spotifyGiftCardProduct?.image}
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
