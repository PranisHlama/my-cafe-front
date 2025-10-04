import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar";
import TokenDebugger from "../components/debug/TokenDebugger";
import RoleSlots from "../components/auth/RoleSlots";
import ClientOnly from "../components/ClientOnly";

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
      <body className={inter.className} suppressHydrationWarning={true}>
        <div className="flex h-screen bg-gray-100">
          <ClientOnly
            fallback={
              <div className="flex h-full w-64 flex-col bg-gray-900">
                <div className="flex h-16 items-center justify-center border-b border-gray-800">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-gray-700 rounded"></div>
                    <div className="h-6 w-32 bg-gray-700 rounded"></div>
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-gray-400">Loading...</div>
                </div>
              </div>
            }
          >
            <Sidebar />
          </ClientOnly>
          <main className="flex-1 overflow-auto">
            {children}
            <RoleSlots admin={admin} cashier={cashier} />
          </main>
        </div>
        <ClientOnly>
          <TokenDebugger />
        </ClientOnly>
      </body>
    </html>
  );
}
