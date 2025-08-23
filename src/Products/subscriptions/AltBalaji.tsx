import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import GameDetailsLayout from "@/components/custom/GameDetailsLayout";
import { subscriptions } from "@/lib/products";

const infoSections = [
  {
    title: "About ALTBalaji Premium Subscription",
    content: (
      <div className="text-base">
        <p className="mb-2">
          Stream exclusive web series, movies, and originals on ALTBalaji Premium. 
          Enjoy unlimited entertainment with new shows added regularly.
        </p>
        <ul className="list-disc pl-5">
          <li><b>Exclusive Originals:</b> Access ALTBalaji originals and popular shows.</li>
          <li><b>High Quality:</b> Watch in HD with smooth playback.</li>
          <li><b>Ad-Free:</b> Zero interruptions for a seamless experience.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Select your ALTBalaji Premium subscription plan.</li>
        <li>Log in with your ALTBalaji account.</li>
        <li>Complete the payment securely.</li>
        <li>Start streaming premium content instantly.</li>
      </ol>
    ),
  },
  {
    title: "Features Included",
    content: (
      <ul className="list-disc pl-5 text-base mb-4">
        <li><strong>Exclusive Web Series:</strong> Popular Indian originals and dramas.</li>
        <li><strong>HD Streaming:</strong> High-quality video playback.</li>
        <li><strong>Ad-Free Viewing:</strong> Watch without any ads.</li>
        <li><strong>Regular Updates:</strong> New shows and movies added frequently.</li>
      </ul>
    ),
  },
];

export default function AltBalajiSubscription() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [altBalaji, setAltBalaji] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Use image from subscriptions array
  const altBalajiProduct = subscriptions.find(p => p.title === "Alt Balaji");
  const infoImage = altBalajiProduct?.image;

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_SUBSCRIPTIONS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        const altBalajiProduct = products.find(
          (g) => g.title && g.title.toLowerCase() === "alt balaji"
        );
        setAltBalaji(altBalajiProduct);

        if (altBalajiProduct && Array.isArray(altBalajiProduct.priceList)) {
          const items = altBalajiProduct.priceList.map((item) => {
            const [label, price, hot] = item.split("|");
            return { label, price: Number(price), hot: hot === "true" };
          });
          setPriceList([
            {
              title: "Alt Balaji Premium Subscription",
              categoryIcon: "/assets/icons/subscriptions/video.svg", // Replace with actual icon path
              items,
            },
          ]);
        }

        setSimilar(
          subscriptions.filter((g) => g.title.toLowerCase() !== "alt balaji premium").slice(0, 4)
        );
      } catch (err) {
        setAltBalaji(null);
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
      title="Alt Balaji Premium"
      image={altBalajiProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
