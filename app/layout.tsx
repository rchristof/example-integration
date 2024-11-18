// app/layout.tsx

import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";

export const metadata = {
  title: "Seu Título de App",
  description: "Sua Descrição de App",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
