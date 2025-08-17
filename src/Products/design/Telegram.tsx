import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import GameDetailsLayout from "@/components/custom/GameDetailsLayout";
import { productivity } from "@/lib/products";

const infoSections = [
  {
    title: "About Telegram Stars",
    content: (
      <div className="text-base">
        <p className="mb-2">
          Telegram Stars allows you to support your favorite channels and creators on Telegram and get exclusive perks in return.
        </p>
        <ul className="list-disc pl-5">
          <li><b>Support Creators:</b> Contribute to your favorite channels.</li>
          <li><b>Exclusive Badges:</b> Get unique profile badges.</li>
          <li><b>Priority Access:</b> Receive early or exclusive content.</li>
          <li><b>Custom Emoji & Reactions:</b> Enjoy extra chat features.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Subscribe to Telegram Stars in your preferred channel.</li>
        <li>Confirm payment securely.</li>
        <li>Get access to exclusive content, badges, and perks.</li>
        <li>Enjoy enhanced interactions with your favorite creators.</li>
      </ol>
    ),
  },
  {
    title: "Features Included",
    content: (
      <ul className="list-disc pl-5 text-base mb-4">
        <li><b>Support Channels and Creators</b></li>
        <li><b>Exclusive Badges</b></li>
        <li><b>Priority & Early Access</b></li>
        <li><b>Custom Emoji & Reactions</b></li>
        <li><b>Enhanced Chat Experience</b></li>
      </ul>
    ),
  },
];


export default function TelegramStars() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [telegramStars, setTelegramStars] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const telegramStarsProduct = productivity.find(p => p.title === "Telegram Stars");
  const infoImage = telegramStarsProduct?.image;

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_SUBSCRIPTIONS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        const f = products.find(
          (g) => g.title && g.title.toLowerCase() === "telegram stars"
        );
        setTelegramStars(f);

        if (f && Array.isArray(f.priceList)) {
          const items = f.priceList.map((item) => {
            const [label, price, hot] = item.split("|");
            return { label, price: Number(price), hot: hot === "true" };
          });

          setPriceList([
            {
              title: "Figma Subscription",
              categoryIcon: "/assets/icons/tools/figma.svg",
              items,
            },
          ]);
        }

        setSimilar(
          productivity.filter((g) => g.title.toLowerCase() !== "figma").slice(0, 4)
        );
      } catch {
        setTelegramStars(null);
        setPriceList([]);
        setSimilar([]);
      }
    }

    async function checkAuth() {
      try {
        await account.get();
        setIsSignedIn(true);
      } catch {
        setIsSignedIn(false);
      }
    }

    fetchSubscriptions();
    checkAuth();
  }, []);

  return (
    <GameDetailsLayout
      isSignedIn={isSignedIn}
      title="Telegram Stars"
      image={telegramStarsProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
