import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/store/provider";

export const metadata: Metadata = {
  title: "Sportsfair",
  description: "বাংলা ভাষায় দ্রুত, নির্ভরযোগ্য এবং আধুনিক স্পোর্টস নিউজ।"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
