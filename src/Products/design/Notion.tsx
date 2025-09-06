import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import GameDetailsLayout from "@/components/custom/GameDetailsLayout";
import { productivity } from "@/lib/products";
import { Query } from "appwrite";

const infoSections = [
  {
    title: "About Notion Subscription",
    content: (
      <div className="text-base">
        <p className="mb-2">
          Notion is an all-in-one workspace that combines notes, tasks, databases, and collaboration tools for personal and team productivity.
        </p>
        <ul className="list-disc pl-5">
          <li><b>Notes & Docs:</b> Organize your thoughts and documents efficiently.</li>
          <li><b>Databases:</b> Create tables, boards, calendars, and lists.</li>
          <li><b>Collaboration:</b> Work with your team in real-time.</li>
          <li><b>Templates & Integrations:</b> Use prebuilt templates and connect with your favorite apps.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Select your Notion subscription plan.</li>
        <li>Log in with your Notion account.</li>
        <li>Complete payment securely.</li>
        <li>Start organizing your work and collaborating instantly.</li>
      </ol>
    ),
  },
  {
    title: "Features Included",
    content: (
      <div className="mb-2">
        <ul className="list-disc pl-5 text-base mb-4">
          <li><strong>Unlimited Pages:</strong> Create as many notes and documents as needed.</li>
          <li><strong>Team Collaboration:</strong> Share workspaces and collaborate in real-time.</li>
          <li><strong>Advanced Databases:</strong> Track tasks, projects, and knowledge easily.</li>
          <li><strong>Templates & Widgets:</strong> Customize workspace for your workflow.</li>
        </ul>
      </div>
    ),
  },
];

export default function NotionSubscription() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [notion, setNotion] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const notionProduct = productivity.find(p => p.title === "Notion Pro");
  const infoImage = notionProduct?.image;

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_PRODUCTIVITY_ID;
        // fetch all documents from the subscriptions collection (no fixed cap)
        const allDocs: any[] = [];
        let offset = 0;
        const pageSize = 100;
        while (true) {
          const resp = await databases.listDocuments(databaseId, collectionId, [Query.limit(pageSize), Query.offset(offset)]);
          allDocs.push(...resp.documents);
          if ((resp.total && allDocs.length >= resp.total) || resp.documents.length === 0) break;
          offset += pageSize;
        }
        const products = allDocs;
        const n = products.find(
          (g) => g.title && g.title.toLowerCase() === "notion pro"
        );
        setNotion(n);

        if (n && Array.isArray(n.priceList)) {
          const items = n.priceList.map((item) => {
            const [label, price, hot] = item.split("|");
            return { label, price: Number(price), hot: hot === "true" };
          });

          setPriceList([
            {
              title: "Notion Subscription",
              categoryIcon: "/assets/icons/design/notion.svg",
              items,
            },
          ]);
        }

        setSimilar(
          productivity.filter((g) => g.title.toLowerCase() !== "notion").slice(0, 4)
        );
      } catch {
        setNotion(null);
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
      title="Notion Pro"
      image={notionProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
