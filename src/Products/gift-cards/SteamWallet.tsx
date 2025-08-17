import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import { giftCards } from "@/lib/products";
import GameDetailsLayout from "@/components/custom/GameDetailsLayout";

// Define the SelectedItem interface here since it's needed by the component
interface SelectedItem {
  categoryIdx: number;
  itemIdx: number;
  quantity: number;
}

const categoryIcons = {
  "Steam Wallet Codes (USD)": "/assets/icons/gift-cards/steam-card.svg",
};

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
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [sw, setSw] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

      // Use image from subscriptions array
  const steamWalletProduct = giftCards.find(p => p.title === "Steam Wallet");
  const infoImage = steamWalletProduct?.image;

  useEffect(() => {
    async function fetchGiftCards() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env
          .VITE_APPWRITE_COLLECTION_GIFT_CARDS_ID;
        const response = await databases.listDocuments(
          databaseId,
          collectionId
        );
        const products = response.documents;
        // Find Steam Wallet (case-insensitive)
        const steamWallet = products.find(
          (g) => g.title && g.title.toLowerCase() === "steam wallet"
        );
        setSw(steamWallet);
        // Group priceList if available
        if (steamWallet && Array.isArray(steamWallet.priceList)) {
          // Group into Steam Wallet Codes (USD)
          const codes = [];
          steamWallet.priceList.forEach((item) => {
            const [label, price] = item.split("|");
            codes.push({ label, price: Number(price) });
          });
          setPriceList([
            {
              title: "Steam Wallet Codes (USD)",
              categoryIcon: categoryIcons["Steam Wallet Codes (USD)"],
              items: codes,
            },
          ]);
        }
        // Get similar products from static array if available, else from DB
        setSimilar(
          giftCards.filter((g) => g.title !== "Steam Wallet").slice(0, 4)
        );
      } catch (err) {
        setSw(null);
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
      title="Steam Wallet"
      image={steamWalletProduct?.image}
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
