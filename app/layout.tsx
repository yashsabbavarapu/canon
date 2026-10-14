import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Shell } from "@/components/Shell";

export const metadata: Metadata = { title: "Canon", description: "Writing on the GTM engineer craft." };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
