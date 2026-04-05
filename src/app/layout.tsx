import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/ThemeContext";
import { AuthProvider } from "@/lib/AuthContext";
import PromoBanner from "@/components/PromoBanner";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Ergo — Watson-Glaser Preparation",
  description: "1,500+ Watson-Glaser style questions. Practice, learn, and master critical thinking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>
            <PromoBanner />
            <div className="grain">
              {children}
            </div>
          <Analytics />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}