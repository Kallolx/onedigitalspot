import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import GameDetailsLayout from "@/components/custom/GameDetailsLayout";
import { subscriptions } from "@/lib/products";

const infoSections = [
  {
    title: "About Amazon Prime Subscription",
    content: (
      <div className="text-base">
        <p className="mb-2">
          Get unlimited access to Amazon Prime Video, free shipping, and more benefits with Amazon Prime. 
          Choose between Personal and Family subscriptions to fit your needs.
        </p>
        <ul className="list-disc pl-5">
          <li>
            <b>Personal:</b> Individual account with full Prime benefits including Prime Video, free shipping, and Prime Music.
          </li>
          <li>
            <b>Family:</b> Share Prime benefits with family members. Up to 6 profiles for Prime Video.
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Select your subscription type: Personal or Family.</li>
        <li>Choose your desired duration (1 month, 3 months, 12 months).</li>
        <li>Provide your Amazon account email for account linking.</li>
        <li>Complete payment and follow email instructions.</li>
        <li>Enjoy Prime Video, free shipping, and all Prime benefits!</li>
      </ol>
    ),
  },
  {
    title: "Benefits Included",
    content: (
      <div className="mb-2">
        <p className="mb-2">Your Amazon Prime subscription includes:</p>
        <ul className="list-disc pl-5 text-base mb-4">
          <li><strong>Prime Video:</strong> Unlimited streaming of movies and TV shows</li>
          <li><strong>Free Shipping:</strong> Free 2-day shipping on eligible items</li>
          <li><strong>Prime Music:</strong> Access to 2 million songs ad-free</li>
          <li><strong>Prime Reading:</strong> Free books, magazines, and comics</li>
          <li><strong>Prime Gaming:</strong> Free games and in-game content</li>
          <li><strong>Amazon Photos:</strong> Unlimited photo storage</li>
        </ul>
      </div>
    ),
  },
];

export default function AmazonPrimeSubscription() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [prime, setPrime] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  // Use image from subscriptions array
  const amazonPrimeProduct = subscriptions.find(p => p.title === "Amazon Prime");
  const infoImage = amazonPrimeProduct?.image;

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env
          .VITE_APPWRITE_COLLECTION_SUBSCRIPTIONS_ID;
        const response = await databases.listDocuments(
          databaseId,
          collectionId
        );
        const products = response.documents;
        const amazonPrime = products.find(
          (g) => g.title && g.title.toLowerCase() === "amazon prime"
        );
        setPrime(amazonPrime);
        
        if (amazonPrime && Array.isArray(amazonPrime.priceList)) {
          const items = [];
          amazonPrime.priceList.forEach((item) => {
            const [label, price, hot] = item.split("|");
            items.push({ label, price: Number(price), hot: hot === "true" });
          });
          setPriceList([{
            title: "Amazon Prime Subscription",
            categoryIcon: "/assets/icons/subscriptions/amazon.svg",
            items: items,
          }]);
        }
        
        setSimilar(
          subscriptions.filter((g) => g.title !== "Amazon Prime").slice(0, 4)
        );
      } catch (err) {
        setPrime(null);
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
      title="Amazon Prime"
      image={amazonPrimeProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
