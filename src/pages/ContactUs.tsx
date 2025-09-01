import React from "react";
import Footer from "@/components/landing/Footer";

// Using small rounded images for each contact card.
// Assumption: these image assets exist under /assets; onError will fallback to placeholder.
const contacts = [
  {
    name: "Email",
    image: "/assets/icons/social/gmail.svg",
    url: "mailto:support@onedigitalspot.com",
    description: "Reach us anytime via email",
  },
  {
    name: "WhatsApp",
    image: "/assets/icons/social/whatsapp.svg",
    url: "https://wa.me/8801234567890",
    description: "Call or message us directly",
  },
  {
    name: "Facebook",
    image: "/assets/icons/social/facebook.svg",
    url: "https://facebook.com/onedigitalspot",
    description: "Follow us & send a message",
  },
  {
    name: "Instagram",
    image: "/assets/icons/social/instagram.svg",
    url: "https://instagram.com/onedigitalspot",
    description: "DM us on Instagram",
  },
  {
    name: "YouTube",
    image: "/assets/icons/subscriptions/youtube.svg",
    url: "https://youtube.com/@onedigitalspot",
    description: "Check our latest videos",
  },
  {
    name: "Twitter",
    image: "/assets/icons/social/x.svg",
    url: "https://twitter.com/onedigitalspot",
    description: "Stay updated on Twitter",
  },
];

const ContactUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="max-w-5xl mx-auto px-4 py-12 flex-1">
        <h1 className="font-pixel text-3xl text-foreground mb-4 text-center">
          Contact Us
        </h1>
        <p className="text-muted-foreground mb-10 text-xl font-anekbangla text-center max-w-2xl mx-auto">
          আমাদের সাপোর্ট ২৪/৭ চালু আপনি যে কোনো সময় আমাদের সাথে যোগাযোগ করতে
          পারেন।
        </p>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {contacts.map((contact, idx) => (
            <a
              key={idx}
              href={contact.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-card p-4 rounded-2xl shadow hover:shadow-lg transition-all border border-border hover:border-primary"
            >
              <div className="flex items-center gap-4">
                <img
                  src={contact.image}
                  alt={contact.name}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "/assets/placeholder.png";
                  }}
                />

                <div className="min-w-0">
                  <h3 className="font-pixel text-lg truncate">
                    {contact.name}
                  </h3>
                  <p className="text-muted-foreground text-sm truncate">
                    {contact.description}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactUs;
