"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function CallbackHandler() {
  const searchParams = useSearchParams();
  const code = searchParams?.get("code");

  useEffect(() => {
    const handleAuthentication = async () => {
      if (!code) {
        console.error("Código de autorização ausente");
        return;
      }

      try {
        const response = await fetch("/api/exchange-code-for-access-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          throw new Error("Erro ao trocar código por token de acesso.");
        }

        console.log("Autenticação bem-sucedida com a API.");
      } catch (error) {
        console.error("Erro durante a autenticação:", error);
      }
    };

    handleAuthentication();
  }, [code]);

  return null;
}
