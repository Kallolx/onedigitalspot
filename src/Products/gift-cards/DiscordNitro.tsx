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
  "Discord Nitro": "/assets/icons/discord.svg",
};

const infoSections = [
  {
    title: "How to Redeem Discord Nitro",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Open Discord and log into your account.</li>
        <li>
          Click on the <b>Settings</b> gear icon in the bottom left.
        </li>
        <li>Navigate to <b>Gift Inventory</b> in the left sidebar.</li>
        <li>Click <b>Redeem</b> and enter your Nitro gift code.</li>
        <li>Enjoy your Discord Nitro benefits!</li>
      </ol>
    ),
  },
  {
    title: "Discord Nitro Benefits",
    content: (
      <ul className="list-disc pl-5 text-base mb-4">
        <li>Higher quality screen sharing and video calls</li>
        <li>Custom Discord Tag and animated avatar</li>
        <li>Larger file upload limit (100MB)</li>
        <li>Access to exclusive stickers and emojis</li>
        <li>Server boosting perks</li>
        <li>HD video streaming</li>
      </ul>
    ),
  },
];

export default function DiscordNitro() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [discord, setDiscord] = useState(null);
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

        // Find Discord Nitro (case-insensitive)
        const discordNitro = products.find(
          (g) => g.title && g.title.toLowerCase() === "discord nitro"
        );
        setDiscord(discordNitro);

        if (discordNitro && Array.isArray(discordNitro.priceList)) {
          // Group into Discord Nitro
          const cards = [];
          discordNitro.priceList.forEach((item) => {
            const [label, price, hot] = item.split("|");
            cards.push({ label, price: Number(price), hot: hot === "true" });
          });
          setPriceList([
            {
              title: "Discord Nitro",
              categoryIcon: categoryIcons["Discord Nitro"],
              items: cards,
            },
          ]);
        }

        // Get similar products excluding Discord Nitro
        setSimilar(
          giftCards.filter((g) => g.title.toLowerCase() !== "discord").slice(0, 4)
        );
      } catch (err) {
        setDiscord(null);
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
      title="Discord Nitro"
      image={discord?.image || ""}
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
