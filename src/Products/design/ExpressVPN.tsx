import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
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
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        const f = products.find(
          (g) => g.title && g.title.toLowerCase() === "expressvpn"
        );
        setExpressVPN(f);

        if (f && Array.isArray(f.priceList)) {
          const items = f.priceList.map((item) => {
            const [label, price, hot] = item.split("|");
            return { label, price: Number(price), hot: hot === "true" };
          });

          setPriceList([
            {
              title: "Figma Subscription",
              categoryIcon: "/assets/icons/tools/figma.svg",
              items,
            },
          ]);
        }

        setSimilar(
          productivity.filter((g) => g.title.toLowerCase() !== "figma").slice(0, 4)
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
