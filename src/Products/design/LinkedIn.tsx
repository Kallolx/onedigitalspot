import { useState, useEffect } from "react";
import { databases, account } from "@/lib/appwrite";
import GameDetailsLayout from "@/components/GameDetailsLayout";
import { productivity } from "@/lib/products";

const infoSections = [
  {
    title: "About LinkedIn Premium Subscription",
    content: (
      <div className="text-base">
        <p className="mb-2">
          Boost your professional profile with LinkedIn Premium.
          Get insights, InMail messages, and access to exclusive learning content.
        </p>
        <ul className="list-disc pl-5">
          <li><b>InMail Messages:</b> Contact recruiters and prospects directly.</li>
          <li><b>Profile Insights:</b> See who viewed your profile.</li>
          <li><b>Learning Courses:</b> Access LinkedIn Learning content.</li>
        </ul>
      </div>
    ),
  },
  {
    title: "How to Use",
    content: (
      <ol className="list-decimal pl-5 text-base mb-4">
        <li>Select your LinkedIn Premium plan.</li>
        <li>Login with your LinkedIn account.</li>
        <li>Complete payment securely.</li>
        <li>Start growing your professional network.</li>
      </ol>
    ),
  },
];

export default function LinkedInSubscription() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [linkedin, setLinkedin] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  // Use image from subscriptions array
  const linkedinProduct = productivity.find(p => p.title === "LinkedIn Premium");
  const infoImage = linkedinProduct?.image;

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
        const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_SUBSCRIPTIONS_ID;
        const response = await databases.listDocuments(databaseId, collectionId);
        const products = response.documents;
        const linkedinProduct = products.find(
          (g) => g.title && g.title.toLowerCase() === "linkedin premium"
        );
        setLinkedin(linkedinProduct);

        if (linkedinProduct && Array.isArray(linkedinProduct.priceList)) {
          const items = linkedinProduct.priceList.map((item) => {
            const [label, price, hot] = item.split("|");
            return { label, price: Number(price), hot: hot === "true" };
          });
          setPriceList([
            {
              title: "LinkedIn Premium Subscription",
              categoryIcon: "/assets/icons/design/linkedin.svg",
              items,
            },
          ]);
        }

        setSimilar(
          productivity.filter((g) => g.title.toLowerCase() !== "linkedin").slice(0, 4)
        );
      } catch {
        setLinkedin(null);
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
      title="LinkedIn Premium"
      image={linkedinProduct?.image}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
      selectedItems={selectedItems}
      setSelectedItems={setSelectedItems}
      infoImage={infoImage}
    />
  );
}
