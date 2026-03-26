import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuitSim — Know When You Can Quit Your Job",
  description:
    "Stop guessing. QuitSim runs Monte Carlo simulations on your real finances to give you a confidence score, freedom date, and stress-tested runway. 100% private, on-device.",
  metadataBase: new URL("https://quitsim.it.com"),
  openGraph: {
    title: "QuitSim — Know When You Can Quit Your Job",
    description:
      "Stop guessing. Get your quit confidence score with real math, not gut feelings. 100% private, on-device.",
    url: "https://quitsim.it.com",
    siteName: "QuitSim",
    type: "website",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "QuitSim — Know When You Can Quit Your Job",
    description:
      "Stop guessing. Get your quit confidence score with real math, not gut feelings.",
    images: ["/opengraph-image.png"],
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0C0A09",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Analytics — replace with your Plausible/Fathom/Umami script */}
        {/* <script defer data-domain="quitsim.it.com" src="https://plausible.io/js/script.js" /> */}
      </head>
      <body>{children}</body>
    </html>
  );
}
