import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import GameDetailsLayout from "@/components/custom/GameDetailsLayout";
import { productivity } from "@/lib/products";

const infoSections = [
  {
    title: "About Duolingo Plus Subscription",
    content: (
      <div className="text-base">
        <p className="mb-2">
          Learn languages faster and without ads with Duolingo Plus. Get unlimited hearts, offline access, and progress tracking across devices.
        </p>
        <ul className="list-disc pl-5">
          <li><b>Ad-Free Learning:</b> Study uninterrupted with no ads.</li>
          <li><b>Unlimited Hearts:</b> Practice without worrying about mistakes.</li>
          <li><b>Offline Mode:</b> Download lessons and learn anywhere.</li>
          <li><b>Progress Tracking:</b> Sync your progress across devices.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Select your Duolingo Plus subscription plan.</li>
        <li>Log in with your Duolingo account.</li>
        <li>Complete payment securely.</li>
        <li>Enjoy ad-free, offline language learning immediately.</li>
      </ol>
    ),
  },
  {
    title: "Features Included",
    content: (
      <div className="mb-2">
        <ul className="list-disc pl-5 text-base mb-4">
          <li><strong>Unlimited Hearts:</strong> No limits on practice attempts.</li>
          <li><strong>Ad-Free Experience:</strong> Focus fully on learning.</li>
          <li><strong>Offline Access:</strong> Download lessons for offline use.</li>
          <li><strong>Progress Sync:</strong> Use Duolingo on all your devices seamlessly.</li>
          <li><strong>Bonus Skills:</strong> Access exclusive lessons and practice modules.</li>
        </ul>
      </div>
    ),
  },
];

export default function DuolingoSubscription() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [duolingo, setDuolingo] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  // Use image from subscriptions array
  const duolingoProduct = productivity.find(p => p.title === "Duolingo Plus");
  const infoImage = duolingoProduct?.image;

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_SUBSCRIPTIONS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        const duo = products.find(
          (g) => g.title && g.title.toLowerCase() === "duolingo plus"
        );
        setDuolingo(duo);

        if (duo && Array.isArray(duo.priceList)) {
          const items = duo.priceList.map((item) => {
            const [label, price, hot] = item.split("|");
            return { label, price: Number(price), hot: hot === "true" };
          });

          setPriceList([
            {
              title: "Duolingo Plus Subscription",
              categoryIcon: "/assets/icons/design/duolingo.svg", // update with icon path
              items,
            },
          ]);
        }

        setSimilar(
          productivity.filter((g) => g.title.toLowerCase() !== "duolingo plus").slice(0, 4)
        );
      } catch (err) {
        setDuolingo(null);
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
      title="Duolingo Plus"
      image={duolingoProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
