import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import { Query } from "appwrite";
import GameDetailsLayout from "@/components/custom/GameDetailsLayout";
import { productivity } from "@/lib/products";

const infoSections = [
  {
    title: "About ExpressVPN Subscription",
    content: (
      <div className="text-base">
        <p className="mb-2">
          ExpressVPN is a premium VPN service offering secure, private, and fast internet access for personal and professional use.
        </p>
        <ul className="list-disc pl-5">
          <li><b>Online Privacy:</b> Protect your identity and data online.</li>
          <li><b>Global Servers:</b> Connect to servers worldwide for unrestricted access.</li>
          <li><b>High-Speed Streaming:</b> Enjoy smooth streaming without buffering.</li>
          <li><b>Cross-Platform:</b> Works on computers, mobile devices, and routers.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Subscribe to an ExpressVPN plan.</li>
        <li>Install the app and log in.</li>
        <li>Select a server to connect.</li>
        <li>Browse the internet securely and privately.</li>
      </ol>
    ),
  },
  {
    title: "Features Included",
    content: (
      <ul className="list-disc pl-5 text-base mb-4">
        <li><b>Secure Global Servers</b></li>
        <li><b>High-Speed Connections</b></li>
        <li><b>No-Logs Policy</b></li>
        <li><b>24/7 Customer Support</b></li>
        <li><b>Cross-Platform Compatibility</b></li>
      </ul>
    ),
  },
];

export default function ExpressVPN() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [expressVPN, setExpressVPN] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const expressVPNProduct = productivity.find(p => p.title === "ExpressVPN");
  const infoImage = expressVPNProduct?.image;

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_SUBSCRIPTIONS_ID;

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
        const f = products.find(
          (g) => g.title && g.title.toLowerCase() === "expressvpn"
        );
        setExpressVPN(f);

        if (f && Array.isArray(f.priceList)) {
          const items = f.priceList.map((item) => {
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
              title: "ExpressVPN Subscription",
              categoryIcon: "/assets/icons/design/express.svg",
              items,
            },
          ]);
        }

        setSimilar(
          productivity.filter((g) => g.title.toLowerCase() !== "expressvpn").slice(0, 4)
        );
      } catch {
        setExpressVPN(null);
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
      title="ExpressVPN"
      image={expressVPNProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
