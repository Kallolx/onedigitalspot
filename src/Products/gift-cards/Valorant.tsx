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
  "Valorant Gift Cards (USD)": "/assets/icons/gift-cards/valorant.svg",
};

const infoSections = [
  {
    title: "How to Redeem Valorant Gift Card",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Launch Valorant and log into your Riot account.</li>
        <li>
          Click on the <b>Valorant Points (VP)</b> icon in the top right corner.
        </li>
        <li>Select <b>Redeem a Prepaid Card or Code</b>.</li>
        <li>Enter your gift card code and click <b>Submit</b>.</li>
        <li>Your VP will be added to your account instantly!</li>
      </ol>
    ),
  },
  {
    title: "What You Can Buy with VP",
    content: (
      <ul className="list-disc pl-5 text-base mb-4">
        <li>Premium weapon skins and collections</li>
        <li>Agent unlocks and contracts</li>
        <li>Battle Pass and premium tiers</li>
        <li>Gun buddies, player cards, and sprays</li>
        <li>Exclusive store bundles and offers</li>
      </ul>
    ),
  },
];

export default function ValorantGiftCard() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [vgc, setVgc] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

      // Use image from subscriptions array
  const valorantGiftCardProduct = giftCards.find(p => p.title === "Valorant Gift Cards");
  const infoImage = valorantGiftCardProduct?.image;

  useEffect(() => {
    async function fetchGiftCards() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId =
          import.meta.env.VITE_APPWRITE_COLLECTION_GIFT_CARDS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;

        // Find Valorant Gift Card (case-insensitive)
        const valorantGiftCard = products.find(
          (g) => g.title && g.title.toLowerCase() === "valorant gift card"
        );
        setVgc(valorantGiftCard);

        if (valorantGiftCard && Array.isArray(valorantGiftCard.priceList)) {
          // Group into Valorant Gift Cards (USD)
          const cards = [];
          valorantGiftCard.priceList.forEach((item) => {
            const [label, price, hot] = item.split("|");
            cards.push({ label, price: Number(price), hot: hot === "true" });
          });
          setPriceList([
            {
              title: "Valorant Gift Cards (USD)",
              categoryIcon: categoryIcons["Valorant Gift Cards (USD)"],
              items: cards,
            },
          ]);
        }

        // Get similar products excluding Valorant Gift Card
        setSimilar(
          giftCards.filter((g) => g.title.toLowerCase() !== "valorant").slice(0, 4)
        );
      } catch (err) {
        setVgc(null);
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
      title="Valorant"
      image={valorantGiftCardProduct?.image}
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
