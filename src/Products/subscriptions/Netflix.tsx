import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import { subscriptions } from "@/lib/products";
import GameDetailsLayout from "@/components/custom/GameDetailsLayout";

const infoSections = [
  {
    title: "About Netflix Subscription",
    content: (
      <div className="text-base">
        <p className="mb-2">
          Enjoy unlimited movies, TV shows, and more on Netflix. Choose between
          Renewable and Non-Renewable subscriptions to fit your needs and
          budget.
        </p>
        <ul className="list-disc pl-5">
          <li>
            <b>Renewable:</b> Auto-renews every period. You get uninterrupted
            access as long as you keep your subscription active.
          </li>
          <li>
            <b>Non-Renewable:</b> One-time payment for a fixed period. No
            auto-renewal, pay again when it expires.
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Select your subscription type: Renewable or Non-Renewable.</li>
        <li>Choose your desired duration (1 month, 3 months, etc.).</li>
        <li>
          For personal subscription, provide your account details if needed.
        </li>
        <li>
          Proceed to payment and follow the instructions sent to your email.
        </li>
        <li>Enjoy streaming on Netflix!</li>
      </ol>
    ),
  },
  {
    title: "Account Information",
    content: (
      <div className="mb-2">
        <p className="mb-2">
          Fill in the required information based on your subscription type:
        </p>
        <ul className="list-disc pl-5 text-base mb-4">
          <li>
            <strong>Account Email:</strong> Your Netflix account email (for
            existing accounts)
          </li>
          <li>
            <strong>Account Recovery:</strong> Backup email for account recovery
            (optional)
          </li>
          <li>
            For shared accounts, we'll provide login credentials after purchase
          </li>
          <li>
            For renewable subscriptions, we'll set up auto-renewal for your
            account
          </li>
        </ul>
      </div>
    ),
  },
];

export default function NetflixSubscription() {
  type SelectedItem = {
    categoryIdx: number;
    itemIdx: number;
    quantity: number;
  };
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  // Use image from subscriptions array
  const netflixProduct = subscriptions.find((p) => p.title === "Netflix");

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
        // Find Netflix (case-insensitive)
        const netflix = products.find(
          (g) => g.title && g.title.toLowerCase() === "netflix"
        );

        // Group priceList if available - map to shared/personal format
        if (netflix && Array.isArray(netflix.priceList)) {
          const renewable = [];
          const nonRenewable = [];
          netflix.priceList.forEach((item) => {
            const [label, price, hot, type] = item.split("|");
            const obj = { label, price: Number(price), hot: hot === "true" };
            if (type === "personal") {
              renewable.push(obj);
            } else if (type === "shared") {
              nonRenewable.push(obj);
            }
          });
          setPriceList([
            {
              title: "Netflix Subscription Personal Account",
              categoryIcon: "/assets/icons/subscriptions/netflix.svg",
              items: renewable,
            },
            {
              title: "Netflix Subscription Shared Account",
              categoryIcon: "/assets/icons/subscriptions/netflix.svg",
              items: nonRenewable,
            },
          ]);
        }
        // Get similar products from static array if available, else from DB
        setSimilar(
          subscriptions.filter((g) => g.title !== "Netflix").slice(0, 4)
        );
      } catch (err) {
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
      title="Netflix"
      image={netflixProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
    />
  );
}
