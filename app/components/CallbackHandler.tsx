"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

export default function CallbackHandler() {
  const searchParams = useSearchParams();
  const code = searchParams?.get("code");
  const { setTeamId } = useAuth();

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
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Erro ao trocar código por token de acesso.");
        }

        const data = await response.json();

        if (data.teamId) {
          setTeamId(data.teamId); // Salve o teamId no contexto
        }
      } catch (error) {
        console.error("Erro durante a autenticação:", error);
      }
    };

    handleAuthentication();
  }, [code, setTeamId]);

  return null;
}
