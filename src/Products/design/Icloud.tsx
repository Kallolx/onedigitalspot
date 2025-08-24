import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import { Query } from "appwrite";
import GameDetailsLayout from "@/components/custom/GameDetailsLayout";
import { productivity } from "@/lib/products";

const infoSections = [
  {
    title: "About iCloud+ Subscription",
    content: (
      <div className="text-base">
        <p className="mb-2">
          iCloud+ gives you secure cloud storage and advanced privacy features to protect your data across all Apple devices.
        </p>
        <ul className="list-disc pl-5">
          <li><b>Extra Storage:</b> Store files, photos, and backups safely in the cloud.</li>
          <li><b>iCloud Private Relay:</b> Browse securely and privately online.</li>
          <li><b>Hide My Email:</b> Protect your email address with unique aliases.</li>
          <li><b>Family Sharing:</b> Share storage and features with family members.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Select your iCloud+ subscription plan.</li>
        <li>Log in with your Apple ID.</li>
        <li>Complete payment securely.</li>
        <li>Start storing data and using privacy features immediately.</li>
      </ol>
    ),
  },
  {
    title: "Features Included",
    content: (
      <div className="mb-2">
        <ul className="list-disc pl-5 text-base mb-4">
          <li><strong>Secure Cloud Storage:</strong> Backup photos, files, and devices safely.</li>
          <li><strong>iCloud Private Relay:</strong> Protect your online activity.</li>
          <li><strong>Hide My Email:</strong> Create anonymous email addresses for privacy.</li>
          <li><strong>Family Sharing:</strong> Share storage and features with family members.</li>
        </ul>
      </div>
    ),
  },
];

export default function iCloudPlusSubscription() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [icloud, setIcloud] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const icloudProduct = productivity.find(p => p.title === "iCloud+");
  const infoImage = icloudProduct?.image;

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_SUBSCRIPTIONS_ID;
        // Fetch all documents by paging until we have collected response.total
        const pageSize = 100;
        let offset = 0;
        let allDocs = [];

        while (true) {
          const resp = await databases.listDocuments(databaseId, collectionId, [
            Query.limit(pageSize),
            Query.offset(offset),
          ]);
          const docs = resp.documents || [];
          allDocs = allDocs.concat(docs);
          offset += pageSize;

          if (!resp.total || allDocs.length >= resp.total) break;
          if (docs.length === 0) break;
        }

        const products = allDocs;
        const ic = products.find(
          (g) => g.title && g.title.toLowerCase() === "icloud+"
        );
        setIcloud(ic);

        if (ic && Array.isArray(ic.priceList)) {
          const items = ic.priceList.map((item) => {
            // support both string-format entries "label|price|hot" and structured objects
            if (typeof item === "string") {
              const [label, price, hot] = item.split("|");
              return { label: label ?? "", price: Number(price ?? 0), hot: String(hot) === "true" };
            }

            if (item && typeof item === "object") {
              return {
                label: item.label ?? item.title ?? "",
                price: Number(item.price ?? item.amount ?? 0),
                hot: Boolean(item.popular || item.hot),
              };
            }

            return { label: String(item), price: 0, hot: false };
          });

          setPriceList([
            {
              title: "iCloud+ Subscription",
              categoryIcon: "/assets/icons/subscriptions/apple.svg",
              items,
            },
          ]);
        }

        setSimilar(
          productivity.filter((g) => g.title.toLowerCase() !== "icloud+").slice(0, 4)
        );
      } catch {
        setIcloud(null);
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
      title="iCloud+"
      image={icloudProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
