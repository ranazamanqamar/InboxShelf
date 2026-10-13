import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Instrument_Serif, Space_Grotesk } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const display = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400"],
});

const cta = Space_Grotesk({
  variable: "--font-cta",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "InboxShelf",
    template: "%s · InboxShelf",
  },
  description:
    "Every customer chat and order on one shelf. AI inbox for WhatsApp, Instagram, Messenger, and your site — synced to Google Sheets.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${display.variable} ${cta.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-black font-sans text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}
