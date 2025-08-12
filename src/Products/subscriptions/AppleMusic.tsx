import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import GameDetailsLayout from "@/components/GameDetailsLayout";
import { subscriptions } from "@/lib/products";

const infoSections = [
  {
    title: "About Apple Music Subscription",
    content: (
      <div className="text-base">
        <p className="mb-2">
          Stream over 100 million songs with Apple Music. Enjoy high-quality audio, 
          exclusive content, and seamless integration across all Apple devices.
        </p>
        <ul className="list-disc pl-5">
          <li>
            <b>Individual:</b> Personal account with full Apple Music access and features.
          </li>
          <li>
            <b>Family:</b> Share with up to 6 family members with separate libraries and recommendations.
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
        <li>Provide your Apple ID for account activation.</li>
        <li>Complete payment and receive activation instructions.</li>
        <li>Start streaming millions of songs instantly!</li>
      </ol>
    ),
  },
  {
    title: "Features Included",
    content: (
      <div className="mb-2">
        <p className="mb-2">Your Apple Music subscription includes:</p>
        <ul className="list-disc pl-5 text-base mb-4">
          <li><strong>100M+ Songs:</strong> Access to the entire Apple Music catalog</li>
          <li><strong>Lossless Audio:</strong> High-quality audio up to 24-bit/192kHz</li>
          <li><strong>Spatial Audio:</strong> Immersive sound with Dolby Atmos</li>
          <li><strong>Offline Downloads:</strong> Listen without internet connection</li>
          <li><strong>Apple Music Radio:</strong> Live and on-demand radio shows</li>
          <li><strong>Exclusive Content:</strong> Artist interviews and exclusive releases</li>
        </ul>
      </div>
    ),
  },
];

export default function AppleMusicSubscription() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [appleMusic, setAppleMusic] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  // Use image from subscriptions array
  const appleMusicProduct = subscriptions.find(p => p.title === "Apple Music");
  const infoImage = appleMusicProduct?.image;

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_SUBSCRIPTIONS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        const appleMusic = products.find(
          (g) => g.title && g.title.toLowerCase() === "apple music"
        );
        setAppleMusic(appleMusic);

        if (appleMusic && Array.isArray(appleMusic.priceList)) {
          const items = [];
          appleMusic.priceList.forEach((item) => {
            const [label, price, hot, type] = item.split("|");
            items.push({ label, price: Number(price), hot: hot === "true" });
          });
          setPriceList([
            {
              title: "Apple Music Subscription",
              categoryIcon: "/assets/icons/apple.svg",
              items: items,
            },
          ]);
        }

        setSimilar(
          subscriptions.filter((g) => g.title !== "Apple Music").slice(0, 4)
        );
      } catch (err) {
        setAppleMusic(null);
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
      title="Apple Music"
      image={appleMusicProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
