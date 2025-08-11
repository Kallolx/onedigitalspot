import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import GameDetailsLayout from "@/components/GameDetailsLayout";
import { subscriptions } from "@/lib/products";

const infoSections = [
  {
    title: "About Apple TV+ Subscription",
    content: (
      <div className="text-base">
        <p className="mb-2">
          Watch Apple Originals and award-winning content on Apple TV+. Enjoy exclusive 
          shows, movies, and documentaries produced by Apple with stunning quality.
        </p>
        <ul className="list-disc pl-5">
          <li>
            <b>Individual:</b> Personal access to all Apple TV+ original content.
          </li>
          <li>
            <b>Family:</b> Share with up to 6 family members with individual profiles.
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Select your subscription type: Individual or Family.</li>
        <li>Choose your desired duration (1 month, 3 months, 12 months).</li>
        <li>Provide your Apple ID for subscription activation.</li>
        <li>Complete payment and get instant access.</li>
        <li>Stream Apple Originals on any compatible device!</li>
      </ol>
    ),
  },
  {
    title: "What's Included",
    content: (
      <div className="mb-2">
        <p className="mb-2">Your Apple TV+ subscription includes:</p>
        <ul className="list-disc pl-5 text-base mb-4">
          <li><strong>Apple Originals:</strong> Exclusive shows, movies, and documentaries</li>
          <li><strong>4K HDR Quality:</strong> Stunning video quality with Dolby Vision</li>
          <li><strong>Dolby Atmos:</strong> Immersive spatial audio experience</li>
          <li><strong>Offline Downloads:</strong> Watch content offline on mobile devices</li>
          <li><strong>Multi-Device:</strong> Stream on iPhone, iPad, Mac, Apple TV, and more</li>
          <li><strong>Ad-Free:</strong> Uninterrupted viewing experience</li>
        </ul>
      </div>
    ),
  },
];

export default function AppleTVSubscription() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [appleTV, setAppleTV] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const infoImage = "/placeholder.svg";

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_SUBSCRIPTIONS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        const tv = products.find((g) => g.title && g.title.toLowerCase() === "apple tv");
        setAppleTV(tv);

        if (tv && Array.isArray(tv.priceList)) {
          const items = tv.priceList.map((item) => {
            const [label, price, hot] = item.split("|");
            return { label, price: Number(price), hot: hot === "true" };
          });

          setPriceList([
            {
              title: "Apple TV+ Subscription",
              categoryIcon: "/assets/icons/apple.svg",
              items,
            },
          ]);
        }

        setSimilar(subscriptions.filter((g) => g.title !== "Apple TV").slice(0, 4));
      } catch (err) {
        setAppleTV(null);
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
      title="Apple TV+"
      image={appleTV?.image || ""}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
