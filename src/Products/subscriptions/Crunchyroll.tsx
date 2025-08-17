import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import GameDetailsLayout from "@/components/custom/GameDetailsLayout";
import { subscriptions } from "@/lib/products";

const infoSections = [
  {
    title: "About Crunchyroll Subscription",
    content: (
      <div className="text-base">
        <p className="mb-2">
          Crunchyroll is the world’s largest anime streaming platform, offering
          thousands of episodes from top anime series, simulcasts, and
          exclusive titles. Whether you’re into classics or the latest
          seasonal releases, Crunchyroll has you covered.
        </p>
        <ul className="list-disc pl-5">
          <li>
            <b>Huge Library:</b> Access to thousands of anime series and movies.
          </li>
          <li>
            <b>Simulcasts:</b> Watch new episodes shortly after they air in Japan.
          </li>
          <li>
            <b>Multiple Plans:</b> Choose Fan, Mega Fan, or Ultimate Fan.
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Select your Crunchyroll subscription plan (Fan, Mega Fan, or Ultimate Fan).</li>
        <li>Provide your Crunchyroll account email for activation.</li>
        <li>Complete the payment process securely.</li>
        <li>Receive confirmation and enjoy instant access to anime streaming.</li>
        <li>Download the Crunchyroll app or watch directly on your browser.</li>
      </ol>
    ),
  },
  {
    title: "Features Included",
    content: (
      <ul className="list-disc pl-5 text-base mb-4">
        <li><strong>Ad-Free Streaming:</strong> Watch anime without interruptions.</li>
        <li><strong>Simulcast Episodes:</strong> New episodes available right after Japan.</li>
        <li><strong>Offline Downloads:</strong> Save episodes to watch later.</li>
        <li><strong>Multiple Devices:</strong> Stream on mobile, desktop, consoles, and smart TVs.</li>
        <li><strong>Exclusive Manga Access:</strong> Read manga directly from Crunchyroll.</li>
      </ul>
    ),
  },
];

export default function CrunchyrollSubscription() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [crunchyroll, setCrunchyroll] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Use image from subscriptions array
  const crunchyrollProduct = subscriptions.find(p => p.title === "Crunchyroll");
  const infoImage = crunchyrollProduct?.image;

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_SUBSCRIPTIONS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        const crunchyrollProduct = products.find(
          (g) => g.title && g.title.toLowerCase() === "crunchyroll"
        );
        setCrunchyroll(crunchyrollProduct);

        if (crunchyrollProduct && Array.isArray(crunchyrollProduct.priceList)) {
          const items = crunchyrollProduct.priceList.map((item) => {
            const [label, price, hot] = item.split("|");
            return { label, price: Number(price), hot: hot === "true" };
          });
          setPriceList([
            {
              title: "Crunchyroll Subscription",
              categoryIcon: "/assets/icons/subscriptions/crunchyroll.svg", // replace with your icon path
              items,
            },
          ]);
        }

        setSimilar(
          subscriptions.filter((g) => g.title.toLowerCase() !== "crunchyroll").slice(0, 4)
        );
      } catch (err) {
        setCrunchyroll(null);
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
      title="Crunchyroll"
      image={crunchyrollProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
