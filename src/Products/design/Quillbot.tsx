import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import { Query } from "appwrite";
import GameDetailsLayout from "@/components/custom/GameDetailsLayout";
import { productivity, subscriptions } from "@/lib/products";

const infoSections = [
  {
    title: "About QuillBot Subscription",
    content: (
      <div className="text-base">
        <p className="mb-2">
          QuillBot is an AI-powered writing assistant that helps you paraphrase,
          summarize, and enhance your writing instantly.
        </p>
        <ul className="list-disc pl-5">
          <li>
            <b>Advanced Paraphrasing:</b> Rewrite content accurately and
            creatively.
          </li>
          <li>
            <b>Grammar & Spell Check:</b> Ensure error-free writing.
          </li>
          <li>
            <b>Summarizer Tool:</b> Quickly condense long text into key points.
          </li>
          <li>
            <b>Writing Styles:</b> Adjust tone, formality, and fluency for your
            content.
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Select your QuillBot subscription plan.</li>
        <li>Log in with your QuillBot account.</li>
        <li>Complete payment securely.</li>
        <li>Start enhancing your writing instantly with AI-powered tools.</li>
      </ol>
    ),
  },
  {
    title: "Features Included",
    content: (
      <div className="mb-2">
        <ul className="list-disc pl-5 text-base mb-4">
          <li>
            <strong>Unlimited Paraphrasing:</strong> Rewrite as much content as
            you need.
          </li>
          <li>
            <strong>Grammar & Spell Check:</strong> Correct mistakes
            automatically.
          </li>
          <li>
            <strong>Summarizer:</strong> Condense articles or documents quickly.
          </li>
          <li>
            <strong>Writing Modes:</strong> Adjust tone, fluency, and style for
            your writing.
          </li>
          <li>
            <strong>Extensions & Integrations:</strong> Use QuillBot with Word,
            Chrome, and more.
          </li>
        </ul>
      </div>
    ),
  },
];

export default function QuillBotSubscription() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [quillBot, setQuillBot] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Use image from subscriptions array
  const quillBotProduct = productivity.find((p) => p.title === "Quillbot");
  const infoImage = quillBotProduct?.image;

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env
          .VITE_APPWRITE_COLLECTION_PRODUCTIVITY_ID;
        const response = await databases.listDocuments(
          databaseId,
          collectionId,
          [Query.limit(100)]
        );
        const products = response.documents;
        const qb = products.find(
          (g) => g.title && g.title.toLowerCase() === "quillbot"
        );
        setQuillBot(qb);

        if (qb && Array.isArray(qb.priceList)) {
          const items = qb.priceList.map((item) => {
            const [label, price, hot] = item.split("|");
            return { label, price: Number(price), hot: hot === "true" };
          });

          setPriceList([
            {
              title: "QuillBot Subscription",
              categoryIcon: "/assets/icons/design/quillbot.svg", 
              items,
            },
          ]);
        }

        setSimilar(
          subscriptions
            .filter((g) => g.title.toLowerCase() !== "quillbot")
            .slice(0, 4)
        );
      } catch (err) {
        setQuillBot(null);
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
      title="QuillBot"
      image={quillBotProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
