import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import GameDetailsLayout from "@/components/GameDetailsLayout";
import { subscriptions } from "@/lib/products";

const infoSections = [
  {
    title: "About Sony Liv Subscription",
    content: (
      <div className="text-base">
        <p className="mb-2">
          Watch live TV, movies, sports, and Sony Liv originals on-demand with Sony Liv.
          Enjoy HD streaming with multi-device support.
        </p>
        <ul className="list-disc pl-5">
          <li><b>Live TV & Sports:</b> Stream your favorite channels and live sports.</li>
          <li><b>Exclusive Originals:</b> Access to Sony Liv original series and movies.</li>
          <li><b>Ad-Free Experience:</b> No interruptions while streaming.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Select the Sony Liv subscription plan that suits you.</li>
        <li>Login with your Sony Liv credentials.</li>
        <li>Complete payment securely.</li>
        <li>Enjoy unlimited streaming on your devices.</li>
      </ol>
    ),
  },
  {
    title: "Features Included",
    content: (
      <ul className="list-disc pl-5 text-base mb-4">
        <li><strong>Live TV Streaming:</strong> Stream channels live in HD.</li>
        <li><strong>Sports Coverage:</strong> Watch live sports and highlights.</li>
        <li><strong>Exclusive Content:</strong> Sony Liv originals and movies.</li>
        <li><strong>Multi-Device Support:</strong> Use Sony Liv on mobile, web, and TV apps.</li>
      </ul>
    ),
  },
];

export default function SonyLivSubscription() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [sonyLiv, setSonyLiv] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const infoImage = "/products/sonyliv.png"; // Replace with actual image path

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_SUBSCRIPTIONS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        const sony = products.find(
          (g) => g.title && g.title.toLowerCase() === "sony liv"
        );
        setSonyLiv(sony);

        if (sony && Array.isArray(sony.priceList)) {
          const items = sony.priceList.map((item) => {
            const [label, price, hot] = item.split("|");
            return { label, price: Number(price), hot: hot === "true" };
          });
          setPriceList([
            {
              title: "Sony Liv Subscription",
              categoryIcon: "/assets/icons/sonyliv.svg", // Replace with actual icon path
              items,
            },
          ]);
        }

        setSimilar(
          subscriptions.filter((g) => g.title.toLowerCase() !== "sony liv").slice(0, 4)
        );
      } catch (err) {
        setSonyLiv(null);
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
      title="Sony Liv"
      image={sonyLiv?.image || ""}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
