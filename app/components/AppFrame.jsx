"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useState, useEffect } from "react";

export default function AppFrame({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  const [showAds, setShowAds] = useState(false);

  // Step 1: Start 60-second timer on mount
  useEffect(() => {
    const adTimer = setTimeout(() => {
      setShowAds(true);
    }, 60000); // 1 minute = 60,000ms

    return () => clearTimeout(adTimer);
  }, []);

  // Step 2: When showAds becomes true, inject all 4 ad scripts directly into DOM
  useEffect(() => {
    if (!showAds || isAdmin) return;

    const injectScript = (src, extraAttrs = {}) => {
      // Prevent duplicate injection
      if (document.querySelector(`script[src="${src}"]`)) return;

      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.referrerPolicy = "no-referrer-when-downgrade";
      Object.entries(extraAttrs).forEach(([key, val]) => {
        s[key] = val;
      });
      document.body.appendChild(s);
    };

    // Ad Script 1 - Revenue CPM Gate (banner/display)
    injectScript(
      "//pl23903697.revenuecpmgate.com/5f/0a/3d/5f0a3dbfe0494732a6f51e9f464470b1.js"
    );

    // Ad Script 2 - Revenue CPM Gate (social bar)
    injectScript(
      "//pl23903471.revenuecpmgate.com/26/ce/da/26ceda18834199e5759604d14f16cf08.js"
    );

    // Ad Script 3 - Great Comfortable (snrxhp)
    injectScript(
      "//greatcomfortable.com/c.D/9J6GbH2L5mlWS/WpQr9yN/T-QM4/MAD-gl0/M/iA0k1WNyDEg_wdOkDRQvzB"
    );

    // Ad Script 4 - Great Comfortable (fajt)
    injectScript(
      "//greatcomfortable.com/c/Dx9.6WbE2r5vl/SmWfQR9SNKT/Q/3AM_z/Qh0JMOC/0/1TNEDucvzlN/D/Qwxn"
    );
  }, [showAds, isAdmin]);

  return (
    <div className="min-h-screen flex flex-col">
      {isAdmin && (
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
        />
      )}
      {!isAdmin && <Navbar />}
      <main className="flex-grow">{children}</main>
      {!isAdmin && <Footer />}

      {/* JSON-LD Schema - always present for SEO, not an ad */}
      {!isAdmin && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "bestprn",
              url: process.env.NEXT_PUBLIC_SITE_URL || "https://bestprn.com",
              description:
                "Free HD adult videos with trending categories and top stars",
              potentialAction: {
                "@type": "SearchAction",
                target: `${process.env.NEXT_PUBLIC_SITE_URL || "https://bestprn.com"
                  }/search?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      )}
    </div>
  );
}
