import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import GameDetailsLayout from "@/components/custom/GameDetailsLayout";
import { subscriptions } from "@/lib/products";

const infoSections = [
  {
    title: "About Spotify Premium Subscription",
    content: (
      <div className="text-base">
        <p className="mb-2">
          Spotify Premium gives you unlimited access to millions of songs,
          podcasts, and playlists — all without ads. Choose the plan that
          suits you best: Individual, Duo, Family, or Student.
        </p>
        <ul className="list-disc pl-5">
          <li>
            <b>Individual:</b> One account, ad-free music, offline downloads.
          </li>
          <li>
            <b>Duo:</b> Two Premium accounts for couples living together.
          </li>
          <li>
            <b>Family:</b> Up to 6 Premium accounts with parental controls.
          </li>
          <li>
            <b>Student:</b> Discounted Premium for eligible students.
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Select your Spotify Premium plan (Individual, Duo, Family, or Student).</li>
        <li>Provide your Spotify account email for activation.</li>
        <li>Complete payment securely.</li>
        <li>Receive confirmation and enjoy ad-free music instantly.</li>
        <li>Listen on mobile, desktop, smart TVs, or connected speakers.</li>
      </ol>
    ),
  },
  {
    title: "Benefits Included",
    content: (
      <ul className="list-disc pl-5 text-base mb-4">
        <li><strong>Ad-Free Music:</strong> No interruptions between songs.</li>
        <li><strong>Offline Downloads:</strong> Save tracks and playlists for offline listening.</li>
        <li><strong>Unlimited Skips:</strong> Skip tracks freely on any device.</li>
        <li><strong>High-Quality Audio:</strong> Stream at up to 320 kbps.</li>
        <li><strong>Cross-Platform:</strong> Access on phone, desktop, car, TV, and smart devices.</li>
        <li><strong>Podcasts & Audiobooks:</strong> Explore more than just music.</li>
      </ul>
    ),
  },
];

export default function SpotifySubscription() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [spotify, setSpotify] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Use image from subscriptions array
  const spotifyProduct = subscriptions.find(p => p.title === "Spotify Premium");
  const infoImage = spotifyProduct?.image;

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_SUBSCRIPTIONS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        const spotifyProduct = products.find(
          (g) => g.title && g.title.toLowerCase() === "spotify premium"
        );
        setSpotify(spotifyProduct);

        if (spotifyProduct && Array.isArray(spotifyProduct.priceList)) {
          const items = spotifyProduct.priceList.map((item) => {
            const [label, price, hot] = item.split("|");
            return { label, price: Number(price), hot: hot === "true" };
          });
          setPriceList([
            {
              title: "Spotify Subscription",
              categoryIcon: "/assets/icons/subscriptions/spotify.svg", // replace with your icon path
              items,
            },
          ]);
        }

        setSimilar(
          subscriptions.filter((g) => g.title.toLowerCase() !== "spotify").slice(0, 4)
        );
      } catch (err) {
        setSpotify(null);
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
      title="Spotify"
      image={spotifyProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
