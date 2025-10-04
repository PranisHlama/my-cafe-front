import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar";
import TokenDebugger from "../components/debug/TokenDebugger";
import RoleSlots from "../components/auth/RoleSlots";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cafe Manager",
  description: "Professional cafe management system",
};

export default function RootLayout({
  children,
  admin,
  cashier,
}: {
  children: React.ReactNode;
  admin?: React.ReactNode;
  cashier?: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-100">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            {children}
            <RoleSlots admin={admin} cashier={cashier} />
          </main>
        </div>
        <TokenDebugger />
      </body>
    </html>
  );
}
