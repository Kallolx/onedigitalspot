import SubscriptionsDetailsLayout from "@/components/SubscriptionsDetailsLayout";
import { aiTools, subscriptions } from "@/lib/producs";


const priceList = [
  {
    title: "Renewable",
    categoryIcon: "/assets/icons/netflix.svg",
    items: [
      { label: "1 Screen | 1 Month", price: 420, hot: true },
      { label: "1 Screen | 3 Months", price: 1200 },
      { label: "2 Screen | 1 Months", price: 540 },
      { label: "2 Screen | 3 Months", price: 1700 },
    ],
  },
  {
    title: "Non-Renewable",
    categoryIcon: "/assets/icons/netflix.svg",
    items: [
      { label: "1 Screen | 1 Month", price: 350, hot: true },
      { label: "1 Screen | 3 Months", price: 999 },
      { label: "2 Screen | 1 Months", price: 380 },
      { label: "2 Screen | 3 Months", price: 1100 },
    ],
  },
];

const infoSections = [
  {
    title: "About Netflix Subscription",
    content: (
      <div className="text-base">
        <p className="mb-2">
          Enjoy unlimited movies, TV shows, and more on Netflix. Choose between Renewable and Non-Renewable subscriptions to fit your needs and budget.
        </p>
        <ul className="list-disc pl-5">
          <li>
            <b>Renewable:</b> Auto-renews every period. You get uninterrupted access as long as you keep your subscription active.
          </li>
          <li>
            <b>Non-Renewable:</b> One-time payment for a fixed period. No auto-renewal, pay again when it expires.
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
  const nf = subscriptions.find((g) => g.title === "Netflix");
  const similar = subscriptions.filter((g) => g.title !== "Netflix").slice(0, 4);
  return (
    <SubscriptionsDetailsLayout
      title="Netflix Subscription"
      image={nf?.image || ""}
      priceList={priceList}
      infoSections={infoSections}
      similarProducts={similar}
    />
  );
}
