
import { useState, useEffect } from "react";
import { databases } from "@/lib/appwrite";
import { aiTools } from "@/lib/products";
import AiToolDetailsLayout from "@/components/AiToolDetailsLayout";

const categoryIcons = {
  Shared: "/assets/icons/chatgpt.svg",
  Personal: "/assets/icons/chatgpt.svg",
};

const infoSections = [
  {
    title: "About ChatGPT Pro",
    content: (
      <div className="text-base">
        <p className="mb-2">
          ChatGPT Pro gives you priority access, faster response times, and
          access to the latest features. You can purchase a shared account for
          instant access, or use your own OpenAI account for a personal
          subscription.
        </p>
        <ul className="list-disc pl-5">
          <li>
            Shared Account: We provide login credentials. Use on one device at a
            time.
          </li>
          <li>
            Personal Account: Use your own OpenAI account, or let us create a
            new one for you.
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
        <li>If Personal, select Existing or New account.</li>
        <li>For Existing, provide your OpenAI email and password.</li>
        <li>Proceed to payment and follow instructions sent to your email.</li>
      </ol>
    ),
  },
];


export default function ChatGPT() {
  const [cg, setCg] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function fetchAiTools() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_AI_TOOLS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        // Find ChatGPT Pro (case-insensitive)
        const chatgpt = products.find((g) => g.title && g.title.toLowerCase() === "chatgpt pro");
        setCg(chatgpt);
        // Group priceList if available
        if (chatgpt && Array.isArray(chatgpt.priceList)) {
          // Group into Shared and Personal
          const shared = [];
          const personal = [];
          chatgpt.priceList.forEach((item) => {
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
              title: "ChatGPT Pro Shared Account",
              categoryIcon: categoryIcons.Shared,
              items: shared,
            },
            {
              title: "ChatGPT Pro Personal Account",
              categoryIcon: categoryIcons.Personal,
              items: personal,
            },
          ]);
        }
        // Get similar products from static aiTools array
        setSimilar(aiTools.filter((g) => g.title !== "ChatGPT Pro").slice(0, 4));
      } catch (err) {
        setCg(null);
        setPriceList([]);
        setSimilar([]);
      }
    }
    fetchAiTools();
  }, []);

  return (
    <AiToolDetailsLayout
      title="ChatGPT Pro"
      image={cg?.image || ""}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      quantity={quantity}
      setQuantity={setQuantity}
    />
  );
}
