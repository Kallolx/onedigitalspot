import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import GameDetailsLayout from "@/components/custom/GameDetailsLayout";
import { subscriptions } from "@/lib/products";

const infoSections = [
  {
    title: "About HBO Max Subscription",
    content: (
      <div className="text-base">
        <p className="mb-2">
          HBO Max gives you access to the best HBO originals, blockbuster movies, 
          and exclusive series. Stream anytime with a single subscription.
        </p>
        <ul className="list-disc pl-5">
          <li>
            <b>Exclusive Originals:</b> Popular shows like House of the Dragon, The Last of Us, and more.
          </li>
          <li>
            <b>Blockbuster Movies:</b> Watch the latest movies shortly after theatrical release.
          </li>
          <li>
            <b>Multiple Profiles:</b> Create up to 5 personalized profiles.
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Select your HBO Max subscription plan.</li>
        <li>Provide your HBO account email for activation.</li>
        <li>Complete the secure payment process.</li>
        <li>Receive confirmation and login details via email.</li>
        <li>Start streaming HBO originals and exclusive content instantly.</li>
      </ol>
    ),
  },
  {
    title: "Features Included",
    content: (
      <ul className="list-disc pl-5 text-base mb-4">
        <li><strong>Ad-Free Streaming:</strong> Enjoy content without interruptions.</li>
        <li><strong>HD & 4K Quality:</strong> High definition streaming available.</li>
        <li><strong>Download & Watch Offline:</strong> Save shows and movies to watch later.</li>
        <li><strong>Multiple Devices:</strong> Stream on smart TVs, mobile, tablets, and more.</li>
        <li><strong>Parental Controls:</strong> Manage what kids can watch safely.</li>
      </ul>
    ),
  },
];

export default function HBOMaxSubscription() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [hbo, setHbo] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Use image from subscriptions array
  const hboProduct = subscriptions.find(p => p.title === "HBO Max");
  const infoImage = hboProduct?.image;

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_SUBSCRIPTIONS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        const hboProduct = products.find(
          (g) => g.title && g.title.toLowerCase() === "hbo max"
        );
        setHbo(hboProduct);

        if (hboProduct && Array.isArray(hboProduct.priceList)) {
          const items = hboProduct.priceList.map((item) => {
            const [label, price, hot] = item.split("|");
            return { label, price: Number(price), hot: hot === "true" };
          });
          setPriceList([
            {
              title: "HBO Max Subscription",
              categoryIcon: "/assets/icons/subscriptions/hbo.svg", // Replace with your HBO icon path
              items,
            },
          ]);
        }

        setSimilar(
          subscriptions.filter((g) => g.title.toLowerCase() !== "hbo max").slice(0, 4)
        );
      } catch (err) {
        setHbo(null);
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
      title="HBO Max"
      image={hboProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
