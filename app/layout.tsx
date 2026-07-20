import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Imports Components
import Nav from '../Components/Nav'
import Footer from '../Components/Footer'
import WhatsAppButton from '../Components/WhatsAppButton'; // Import here

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WhiskerFeast | Deliciously Healthy Food for Happy Cats 🐱",
  description: "Give your tiny lion the nutrition they deserve. Explore our grain-free, high-protein wet and dry cat food formulas crafted with real meat to keep your cat thriving at every life stage. Shop our fresh collection today!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Nav />
        {children}
        <Footer />
        {/* Floating safely outside standard layout bounds */}
        <WhatsAppButton />
      </body>
    </html>
  );
}
