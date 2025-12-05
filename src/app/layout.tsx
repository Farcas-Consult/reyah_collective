import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { LocalizationProvider } from "@/context/LocalizationContext";

export const metadata: Metadata = {
  title: "Reyah Collective - Premium E-Commerce",
  description: "Discover curated collections at Reyah Collective",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
      >
        <AuthProvider>
          <LocalizationProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </LocalizationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
