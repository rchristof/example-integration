// app/components/CallbackHandler.tsx
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
        console.error("Missing authorization code, action not permitted.");
        return;
      }

      try {
        const response = await fetch("/api/exchange-code-for-access-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          throw new Error("Error when exchanging code for access token.");
        }

        const data = await response.json();
        // console.log("Successful authentication with the API:", data);

        // Armazenar o accessToken no sessionStorage
        if (data.accessToken) {
          sessionStorage.setItem("access_token", data.accessToken);
        }

        if (data.teamId) {
          setTeamId(data.teamId);
        }
      } catch (error) {
        console.error("Error during authentication:", error);
      }
    };

    handleAuthentication();
  }, [code, setTeamId]);

  return null;
}
