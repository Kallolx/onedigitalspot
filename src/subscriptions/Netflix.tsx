import { useState, useEffect } from "react";
import { databases } from "@/lib/appwrite";
import SubscriptionsDetailsLayout from "@/components/SubscriptionsDetailsLayout";
import { subscriptions } from "@/lib/products";


const infoSections = [
	{
		title: "About Netflix Subscription",
		content: (
			<div className="text-base">
				<p className="mb-2">
					Enjoy unlimited movies, TV shows, and more on Netflix. Choose between
					Renewable and Non-Renewable subscriptions to fit your needs and budget.
				</p>
				<ul className="list-disc pl-5">
					<li>
						<b>Renewable:</b> Auto-renews every period. You get uninterrupted
						access as long as you keep your subscription active.
					</li>
					<li>
						<b>Non-Renewable:</b> One-time payment for a fixed period. No
						auto-renewal, pay again when it expires.
					</li>
				</ul>
			</div>
		),
	},
	{
		title: "How to Use",
		content: (
			<ol className="list-decimal pl-5 text-base mb-4">
				<li>Select your subscription type: Renewable or Non-Renewable.</li>
				<li>Choose your desired duration (1 month, 3 months, etc.).</li>
				<li>Proceed to payment and follow the instructions sent to your email.</li>
				<li>Enjoy streaming on Netflix!</li>
			</ol>
		),
	},
	{
		title: "Why Choose Us?",
		content: (
			<ul className="list-disc pl-5 text-base mb-4">
				<li>Instant delivery after payment confirmation.</li>
				<li>24/7 customer support for any issues.</li>
				<li>Safe and secure payment methods.</li>
				<li>Best value for your money.</li>
			</ul>
		),
	},
];


export default function NetflixSubscription() {
  const [nf, setNf] = useState(null);
  const [priceList, setPriceList] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
	async function fetchSubscriptions() {
	  try {
		const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
		const collectionId = import.meta.env.VITE_APPWRITE_COLLECTION_SUBSCRIPTIONS_ID;
		const response = await databases.listDocuments(
		  databaseId,
		  collectionId
		);
		const products = response.documents;
		// Find Netflix (case-insensitive)
		const netflix = products.find(
		  (g) => g.title && g.title.toLowerCase() === "netflix subscription"
		);
		setNf(netflix);
		// Group priceList if available
		if (netflix && Array.isArray(netflix.priceList)) {
		  const renewable = [];
		  const nonRenewable = [];
		  netflix.priceList.forEach((item) => {
			const [label, price, hot, type] = item.split("|");
			const obj = { label, price: Number(price), hot: hot === "true" };
			if (type === "personal") {
			  renewable.push(obj);
			} else if (type === "shared") {
			  nonRenewable.push(obj);
			}
		  });
		  setPriceList([
			{
			  title: "Renewable",
			  categoryIcon: "/assets/icons/netflix.svg",
			  items: renewable,
			},
			{
			  title: "Non-Renewable",
			  categoryIcon: "/assets/icons/netflix.svg",
			  items: nonRenewable,
			},
		  ]);
		}
		// Get similar products from static array if available, else from DB
		setSimilar(subscriptions.filter((g) => g.title !== "Netflix").slice(0, 4));
	  } catch (err) {
		setNf(null);
		setPriceList([]);
		setSimilar([]);
	  }
	}
	fetchSubscriptions();
  }, []);

  return (
	<SubscriptionsDetailsLayout
	  title="Netflix Subscription"
	  image={nf?.image || ""}
	  priceList={priceList}
	  infoSections={infoSections}
	  similarProducts={similar}
	  quantity={quantity}
	  setQuantity={setQuantity}
	/>
  );
}
