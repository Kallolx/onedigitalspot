import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import GameDetailsLayout from "@/components/GameDetailsLayout";
import { productivity } from "@/lib/products";

const infoSections = [
  {
    title: "About Office 365 Subscription",
    content: (
      <div className="text-base">
        <p className="mb-2">
          Access Microsoft Office apps and cloud services with Office 365.
          Includes Word, Excel, PowerPoint, Outlook, and OneDrive storage.
        </p>
        <ul className="list-disc pl-5">
          <li><b>Office Apps:</b> Word, Excel, PowerPoint, Outlook, and more.</li>
          <li><b>Cloud Storage:</b> OneDrive with 1TB storage.</li>
          <li><b>Multi-device Use:</b> Install on PC, Mac, tablets, and phones.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Choose your Office 365 plan.</li>
        <li>Login with your Microsoft account.</li>
        <li>Complete payment securely.</li>
        <li>Start using Microsoft Office apps and services.</li>
      </ol>
    ),
  },
];

export default function Office365Subscription() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [office365, setOffice365] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  // Use image from subscriptions array
  const office365Product = productivity.find(p => p.title === "Office 365");
  const infoImage = office365Product?.image;

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_SUBSCRIPTIONS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        const officeProduct = products.find(
          (g) => g.title && g.title.toLowerCase() === "office 365"
        );
        setOffice365(officeProduct);

        if (officeProduct && Array.isArray(officeProduct.priceList)) {
          const items = officeProduct.priceList.map((item) => {
            const [label, price, hot] = item.split("|");
            return { label, price: Number(price), hot: hot === "true" };
          });
          setPriceList([
            {
              title: "Office 365 Subscription",
              categoryIcon: "/assets/icons/office365.svg",
              items,
            },
          ]);
        }

        setSimilar(
          productivity.filter((g) => g.title.toLowerCase() !== "office 365").slice(0, 4)
        );
      } catch {
        setOffice365(null);
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
      title="Office 365"
      image={office365Product?.image || ""}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
