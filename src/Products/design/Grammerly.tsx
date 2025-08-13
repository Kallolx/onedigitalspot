import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import GameDetailsLayout from "@/components/GameDetailsLayout";
import { productivity } from "@/lib/products";

const infoSections = [
  {
    title: "About Grammarly Subscription",
    content: (
      <div className="text-base">
        <p className="mb-2">
          Improve your writing with Grammarly Premium. Get advanced grammar, style, and plagiarism checks.
        </p>
        <ul className="list-disc pl-5">
          <li><b>Grammar & Spelling:</b> Catch complex mistakes and errors.</li>
          <li><b>Style & Clarity:</b> Suggestions to improve tone and clarity.</li>
          <li><b>Plagiarism Checker:</b> Ensure your writing is original.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Choose your Grammarly Premium plan.</li>
        <li>Login with your Grammarly account.</li>
        <li>Complete the payment securely.</li>
        <li>Start improving your writing instantly.</li>
      </ol>
    ),
  },
];

export default function GrammarlySubscription() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [grammarly, setGrammarly] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  // Use image from subscriptions array
  const grammarlyProduct = productivity.find(p => p.title === "Grammarly");
  const infoImage = grammarlyProduct?.image;

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_SUBSCRIPTIONS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        const grammarlyProduct = products.find(
          (g) => g.title && g.title.toLowerCase() === "grammarly"
        );
        setGrammarly(grammarlyProduct);

        if (grammarlyProduct && Array.isArray(grammarlyProduct.priceList)) {
          const items = grammarlyProduct.priceList.map((item) => {
            const [label, price, hot] = item.split("|");
            return { label, price: Number(price), hot: hot === "true" };
          });
          setPriceList([
            {
              title: "Grammarly Premium Subscription",
              categoryIcon: "/assets/icons/design/grammarly.svg",
              items,
            },
          ]);
        }

        setSimilar(
         productivity.filter((g) => g.title.toLowerCase() !== "grammarly").slice(0, 4)
        );
      } catch {
        setGrammarly(null);
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
      title="Grammarly"
      image={grammarlyProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
