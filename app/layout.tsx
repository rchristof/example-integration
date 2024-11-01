import { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vercel Example Integration",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          {children}
        </div>
        <footer className="mt-12 flex items-center justify-center w-full h-24 border-t">
          {/* Removido o texto "Powered by Vercel" e o logotipo */}
        </footer>
      </body>
    </html>
  );
}
