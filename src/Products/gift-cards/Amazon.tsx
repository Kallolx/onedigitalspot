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
  "Amazon Gift Cards (USD)": "/assets/icons/gift-cards/amazon.svg",
};

const infoSections = [
  {
    title: "How to Redeem Amazon Gift Card",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Go to amazon.com and sign in to your account.</li>
        <li>
          Click on <b>Account & Lists</b> and select <b>Gift cards</b>.
        </li>
        <li>Click <b>Redeem a Gift Card</b>.</li>
        <li>Enter your gift card code and click <b>Apply to your balance</b>.</li>
        <li>Start shopping with your Amazon balance!</li>
      </ol>
    ),
  },
  {
    title: "What You Can Buy",
    content: (
      <ul className="list-disc pl-5 text-base mb-4">
        <li>Millions of products on Amazon</li>
        <li>Digital content like Kindle books and movies</li>
        <li>Amazon Prime subscriptions</li>
        <li>Amazon Web Services</li>
        <li>Third-party seller products</li>
      </ul>
    ),
  },
];

export default function AmazonGiftCard() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [agc, setAgc] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

    // Use image from subscriptions array
    const amazonGiftCardProduct = giftCards.find(p => p.title === "Amazon Gift Cards");
    const infoImage = amazonGiftCardProduct?.image;

  useEffect(() => {
    async function fetchGiftCards() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId =
          import.meta.env.VITE_APPWRITE_COLLECTION_GIFT_CARDS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;

        // Find Amazon Gift Card (case-insensitive)
        const amazonGiftCard = products.find(
          (g) => g.title && g.title.toLowerCase() === "amazon gift cards"
        );
        setAgc(amazonGiftCard);

        if (amazonGiftCard && Array.isArray(amazonGiftCard.priceList)) {
          // Group into Amazon Gift Cards (USD)
          const cards = [];
          amazonGiftCard.priceList.forEach((item) => {
            const [label, price, hot] = item.split("|");
            cards.push({ label, price: Number(price), hot: hot === "true" });
          });
          setPriceList([
            {
              title: "Amazon Gift Cards (USD)",
              categoryIcon: categoryIcons["Amazon Gift Cards (USD)"],
              items: cards,
            },
          ]);
        }

        // Get similar products excluding Amazon Gift Card
        setSimilar(
          giftCards.filter((g) => g.title.toLowerCase() !== "amazon").slice(0, 4)
        );
      } catch (err) {
        setAgc(null);
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
      title="Amazon"
      image={amazonGiftCardProduct?.image}
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
