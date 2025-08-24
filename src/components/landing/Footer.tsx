import React from "react";

const Footer: React.FC = () => {
  const company = ["About Us", "Careers", "Blog", "Contact"];
  const support = [
    "Help Center",
    "How to Buy",
    "Refund Policy",
    "Terms of Service",
  ];
  const payments = [
    { name: "Visa", src: "/assets/icons/visa.svg" },
    { name: "Mastercard", src: "/assets/icons/master.svg" },
    { name: "bKash", src: "/assets/icons/bKash.svg" },
    { name: "Nagad", src: "/assets/icons/nagad.svg" },
    { name: "Rocket", src: "/assets/icons/rocket.png" },
  ];

  return (
    <footer className="text-foreground">
      {/* ── Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-6 py-8">
          {/* Logo at top center */}
          <img
            src="/assets/logo-av.avif"
            alt="OneDigitalSpot"
            className="max-w-[180px] w-full h-auto object-contain mx-auto"
          />
          {/* Description centered */}
          <p className="text-muted-foreground font-anekbangla text-xl md:text-2xl mt-0 max-w-lg sm:max-w-lg text-center">
            আপনার সব ধরনের ডিজিটাল প্রোডাক্ট এবং সেবার সহজ সমাধান। আমরা দ্রুত
            ডেলিভারি, নিরাপদ লেনদেন এবং ঝামেলামুক্ত অভিজ্ঞতার মাধ্যমে আপনাকে
            ডিজিটাল সেবা দেওয়ার জন্য কাজ করি
          </p>
          {/* Social media icons centered under description */}
          <div className="flex gap-4 justify-center">
            <a
              href="https://facebook.com/onedigitalspot"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/assets/facebook.svg"
                alt="Facebook"
                className="w-12 h-12 hover:opacity-80 transition"
              />
            </a>
            <a
              href="https://instagram.com/onedigitalspot"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/assets/instagram.svg"
                alt="Instagram"
                className="w-12 h-12 hover:opacity-80 transition"
              />
            </a>
            <a
              href="https://tiktok.com/onedigitalspot"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/assets/tiktok.svg"
                alt="TikTok"
                className="w-12 h-12 hover:opacity-80 transition"
              />
            </a>
            <a href="https://wa.me/8801234567890">
              <img
                src="/assets/whatsapp.svg"
                alt="WhatsApp"
                className="w-12 h-12 hover:opacity-80 transition"
              />
            </a>
            {/* Add more socials as needed */}
          </div>
          {/* Download badges under social icons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <a href="#">
              <img
                src="/assets/icons/others/google-badge.svg"
                alt="Google Play"
                className="h-14 object-contain"
              />
            </a>
            <a href="#">
              <img
                src="/assets/icons/others/apple-badge.svg"
                alt="App Store"
                className="h-14 object-contain"
              />
            </a>
          </div>
            {/* Quick links under badges */}
            <div className="flex flex-col-3 gap-2 text-center sm:text-left text-sm text-foreground">
              <a href="/contact-us" className="hover:underline hover:text-secondary  ">Contact Us</a>
              <a href="/refund-policy" className="hover:underline hover:text-secondary ">Refund Policy</a>
              <a href="/product-delivery" className="hover:underline hover:text-secondary ">Product Delivery</a>
            </div>
        </div>

        {/* ── Divider */}
        <hr className="border-slate-700" />

        {/* ── Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-6">
          {/* Left: Developed by Kallol */}
          <div className="w-full sm:w-auto flex justify-center sm:justify-start mb-2 sm:mb-0">
            <span className="text-sm text-slate-500">
              Developed by{" "}|{" "}
              <a
                href="https://kallol.me"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary underline hover:text-foreground"
              >
                Kamrul Hasan
              </a>
            </span>
          </div>

          {/* Center: Payment icons */}
          <div className="w-full sm:w-auto flex items-center gap-3 flex-wrap justify-center">
            {payments.map((p) => (
              <img
                key={p.name}
                src={p.src}
                alt={p.name}
                className="h-8 object-contain opacity-60 hover:opacity-100 transition"
              />
            ))}
          </div>

          {/* Right: Copyright & Privacy */}
          <div className="w-full sm:w-auto text-sm text-slate-500 flex items-center gap-2 justify-center sm:justify-end">
            <span>
              &copy; {new Date().getFullYear()} OneDigitalSpot. All rights
              reserved.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
