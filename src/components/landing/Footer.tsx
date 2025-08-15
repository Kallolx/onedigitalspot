import React from "react";

const Footer: React.FC = () => {
  const socials = [
    { name: "Facebook", icon: "📘", href: "#" },
    { name: "Twitter", icon: "🐦", href: "#" },
    { name: "Email", icon: "✉️", href: "mailto:info@onedigitalspot.com" },
  ];

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
    { name: "Upay", src: "/assets/icons/upay.png" },
    { name: "Rocket", src: "/assets/icons/rocket.png" },
  ];

  return (
    <footer className=" mt-8 text-foreground">
      {/* ── Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-10 py-12">
          {/* Column 1 – Brand */}
          <div className="md:col-span-1 flex flex-col gap-5 items-center text-center md:items-start md:text-left">
            <div className="flex items-center gap-3">
              <img
                src="/assets/logo-2.svg"
                alt="OneDigitalSpot"
                className="max-w-[180px] w-full h-auto object-contain"
              />
            </div>
            <p className="text-slate-400 mt-0">
              Bangladesh’s #1 trusted digital goods platform. Fast, secure, and
              always here for you.
            </p>
          </div>

          {/* Column 2 – Company */}
          <div className="md:col-start-2 flex flex-col gap-2 items-center text-center md:items-start md:text-left">
            <h3 className="text-lg font-semibold mb-2">Company</h3>
            <ul className="space-y-2">
              {company.map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-white transition"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 – Support */}
          <div className="flex flex-col gap-2 items-center text-center md:items-start md:text-left">
            <h3 className="text-lg font-semibold mb-2">Support</h3>
            <ul className="space-y-2">
              {support.map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-white transition"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 – Download */}
          <div className="md:col-start-4 flex flex-col gap-2 items-center text-center md:items-start md:text-left">
            <h3 className="text-lg font-semibold mb-5">Download App</h3>
            <div className="flex flex-col gap-4">
              <a href="#">
                <img
                  src="/assets/icons/google-badge.svg"
                  alt="Google Play"
                  className="h-14 object-contain"
                />
              </a>
              <a href="#">
                <img
                  src="/assets/icons/apple-badge.svg"
                  alt="App Store"
                  className="h-14 object-contain"
                />
              </a>
            </div>
          </div>
        </div>

        {/* ── Divider */}
        <hr className="border-slate-700" />

        {/* ── Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-8">
          <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start w-full sm:w-auto">
            {payments.map((p) => (
              <img
                key={p.name}
                src={p.src}
                alt={p.name}
                className="h-8 object-contain opacity-60 hover:opacity-100 transition"
              />
            ))}
          </div>

          <div className="text-sm text-slate-500 flex items-center gap-2 sm:justify-end w-full sm:w-auto">
            <span>
              &copy; {new Date().getFullYear()} OneDigitalSpot. All rights
              reserved.
            </span>
            <span className="hidden sm:inline">•</span>
            <a href="#" className="hover:text-white transition">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
