import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import GameDetailsLayout from "@/components/custom/GameDetailsLayout";
import { productivity } from "@/lib/products";

const infoSections = [
  {
    title: "About NordVPN Subscription",
    content: (
      <div className="text-base">
        <p className="mb-2">
          NordVPN is a leading VPN service that provides secure, private, and fast internet access from anywhere in the world.
        </p>
        <ul className="list-disc pl-5">
          <li><b>Secure Browsing:</b> Encrypt your internet traffic and protect your privacy.</li>
          <li><b>Global Servers:</b> Access content from multiple countries.</li>
          <li><b>No-Logs Policy:</b> Your activities remain private and anonymous.</li>
          <li><b>Multi-Device Support:</b> Protect up to 6 devices simultaneously.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Choose a NordVPN subscription plan.</li>
        <li>Download the app and log in.</li>
        <li>Connect to a server for secure browsing.</li>
        <li>Enjoy private and fast internet access.</li>
      </ol>
    ),
  },
  {
    title: "Features Included",
    content: (
      <ul className="list-disc pl-5 text-base mb-4">
        <li><b>Secure VPN Servers Worldwide</b></li>
        <li><b>No-Logs Policy</b></li>
        <li><b>High-Speed Connections</b></li>
        <li><b>Supports Multiple Devices</b></li>
        <li><b>CyberSec Protection</b></li>
      </ul>
    ),
  },
];

export default function NordVPN() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [nordVPN, setNordVPN] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const nordVPNProduct = productivity.find(p => p.title === "NordVPN");
  const infoImage = nordVPNProduct?.image;

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_SUBSCRIPTIONS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        const f = products.find(
          (g) => g.title && g.title.toLowerCase() === "nordvpn"
        );
        setNordVPN(f);

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
        setNordVPN(null);
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
      title="NordVPN"
      image={nordVPNProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
