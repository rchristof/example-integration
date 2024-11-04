"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { exchangeCodeForAccessToken } from "~/app/callback/actions/exchange-code-for-access-token";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [createPassword, setCreatePassword] = useState<string>(""); // Novo estado para a senha de criação de conta
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Novo estado para mensagens de erro
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const [_, exchange] = useTransition();

  useEffect(() => {
    if (!code) {
      console.error("Authorization code is null");
      return;
    }
    exchange(async () => {
      const result = await exchangeCodeForAccessToken(code);
      setAccessToken(result.access_token);
      fetchUserInfo(result.access_token);
    });
  }, [code]);

  const fetchUserInfo = async (token: string) => {
    try {
      const response = await fetch("https://api.vercel.com/v2/user", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("Fetched user info:", data.user); // Adiciona um log para verificar os dados do usuário
      setUserInfo(data.user);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const handleCreateAccount = async () => {
    if (!userInfo) {
      console.error("User info is null");
      return;
    }

    console.log("Creating account with user info:", userInfo); // Log dos dados do usuário

    const response = await fetch("http://127.0.0.1:5000/customer-user-signup", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`, // Use o token de acesso do Vercel
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userInfo.email,
        legalCompanyName: userInfo.name, // Ajuste conforme necessário
        name: userInfo.username, // Ajuste conforme necessário
        password: createPassword, // Use a senha inserida pelo usuário
      }),
    });

    const data = await response.json();
    if (response.ok) {
      console.log("Account created successfully:", data);
      router.push(`/plans?next=${encodeURIComponent(next || "")}`); // Redireciona para a página de planos em caso de sucesso
    } else {
      console.error("Account creation failed:", data);
      setErrorMessage(data.message); // Define a mensagem de erro
    }
  };

  const handleLinkAccount = async () => {
    console.log("Linking account with email:", email); // Log do email
    console.log("Linking account with password:", password); // Log da senha

    const response = await fetch("http://127.0.0.1:5000/customer-user-signin", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`, // Use o token de acesso do Vercel
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      console.log("Account linked successfully:", data);
      router.push(`/plans?next=${encodeURIComponent(next || "")}`); // Redireciona para a página de planos em caso de sucesso
    } else {
      console.error("Account linking failed:", data);
      setErrorMessage(data.message); // Define a mensagem de erro
    }
  };

  return (
    <div className="w-full max-w-2xl divide-y">
      <div className="py-4 flex items-center space-x-2 justify-center">
        <h1 className="text-lg font-medium">Vercel Example Integration</h1>
      </div>
      {errorMessage && (
        <div className="py-4 text-red-500">
          <p>{errorMessage}</p>
        </div>
      )}
      <div className="py-4 flex flex-col items-center space-y-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleCreateAccount}
        >
          Create New Account
        </button>
        <input
          type="password"
          placeholder="Create Password"
          value={createPassword}
          onChange={(e) => setCreatePassword(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>
      <div className="py-4 flex flex-col items-center space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={handleLinkAccount}
        >
          Link Existing Account
        </button>
      </div>
    </div>
  );
}