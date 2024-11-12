// app/components/CallbackHandler.tsx

"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { exchangeCodeForAccessToken } from "../actions/exchange-code-for-access-token";

export default function CallbackHandler() {
  const searchParams = useSearchParams();
  const { setAccessToken, setTeamId, setCode, setUserInfo } = useAuth();
  const code = searchParams?.get("code") || null;

  useEffect(() => {
    if (!code) {
      console.error("Código de autorização é nulo");
      return;
    }
    setCode(code);
    const fetchAccessToken = async () => {
      const result = await exchangeCodeForAccessToken(code);
      setAccessToken(result.access_token);
      setTeamId(result.team_id);
      fetchUserInfo(result.access_token);
    };
    const fetchUserInfo = async (token: string) => {
      try {
        const response = await fetch("https://api.vercel.com/v2/user", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setUserInfo(data.user);
      } catch (error) {
        console.error("Erro ao buscar informações do usuário:", error);
      }
    };
    fetchAccessToken();
  }, [code, setAccessToken, setTeamId, setCode, setUserInfo]);

  return null;
}
