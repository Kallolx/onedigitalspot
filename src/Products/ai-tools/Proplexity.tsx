import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import { aiTools } from "@/lib/products";
import GameDetailsLayout from "@/components/custom/GameDetailsLayout";

const categoryIcons = {
  Shared: "/assets/icons/ai-tools/perplexity.svg", 
  Personal: "/assets/icons/ai-tools/perplexity.svg",
};

const infoSections = [
  {
    title: "About Perplexity AI Pro",
    content: (
      <div className="text-base">
        <p className="mb-2">
          Perplexity AI Pro provides enhanced AI search capabilities, priority access,
          faster responses, and advanced research tools. You can choose between
          a shared account for instant access or a personal subscription for your own account.
        </p>
        <ul className="list-disc pl-5">
          <li>
            <strong>Shared Account:</strong> We provide login credentials. Use on one device at a time.
          </li>
          <li>
            <strong>Personal Account:</strong> Use your own Perplexity AI account, or let us create one for you.
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Choose your purchase type: Shared or Personal.</li>
        <li>If Personal account, select Existing or New account type.</li>
        <li>For Existing accounts, provide your Perplexity AI email in Account Email field.</li>
        <li>For password recovery, enter your email in Account Recovery field.</li>
        <li>Proceed to payment and follow instructions sent to your email.</li>
      </ol>
    ),
  },
  {
    title: "Account Information",
    content: (
      <div className="mb-2">
        <p className="mb-2">
          Fill in the required account information based on your purchase type:
        </p>
        <ul className="list-disc pl-5 text-base mb-4">
          <li><strong>Account Email:</strong> Your Perplexity AI account email (for existing accounts)</li>
          <li><strong>Account Recovery:</strong> Backup email for account recovery (optional)</li>
          <li>For shared accounts, we'll provide login credentials after purchase</li>
          <li>For new personal accounts, we'll create one using your provided email</li>
        </ul>
      </div>
    ),
  },
];

export default function PerplexityAI() {
  type SelectedItem = { categoryIdx: number; itemIdx: number; quantity: number };
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [playerId, setPlayerId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [perplexity, setPerplexity] = useState<any>(null);
  const [priceList, setPriceList] = useState<any[]>([]);
  const [similar, setSimilar] = useState<any[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  // Use image from subscriptions array
  const perplexityProduct = aiTools.find(p => p.title === "Perplexity Premium");
  const infoImage = perplexityProduct?.image;

  useEffect(() => {
    async function fetchAiTools() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_AI_TOOLS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        const perplexityProduct = products.find(
          (g) => g.title && g.title.toLowerCase() === "perplexity premium"
        );
        setPerplexity(perplexityProduct);

        if (perplexityProduct && Array.isArray(perplexityProduct.priceList)) {
          const shared: any[] = [];
          const personal: any[] = [];
          perplexityProduct.priceList.forEach((item) => {
            const [label, price, hot, type] = item.split("|");
            const obj = { label, price: Number(price), hot: hot === "true" };
            if (type === "shared") {
              shared.push(obj);
            } else if (type === "personal") {
              personal.push(obj);
            }
          });
          setPriceList([
            {
              title: "Perplexity AI Pro Shared Account",
              categoryIcon: categoryIcons.Shared,
              items: shared,
            },
            {
              title: "Perplexity AI Pro Personal Account",
              categoryIcon: categoryIcons.Personal,
              items: personal,
            },
          ]);
        }

        setSimilar(aiTools.filter((g) => g.title !== "Perplexity AI Pro").slice(0, 4));
      } catch (err) {
        setPerplexity(null);
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

    fetchAiTools();
    checkAuth();
  }, []);

  return (
    <GameDetailsLayout
      isSignedIn={isSignedIn}
      title="Perplexity AI Pro"
      image={perplexityProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
  selectedItems={selectedItems}
  setSelectedItems={setSelectedItems}
    />
  );
}
