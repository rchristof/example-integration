// app/components/LoginComponent.tsx

"use client";

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

interface LoginComponentProps {
  onNext: () => void;
}

export default function LoginComponent({ onNext }: LoginComponentProps) {
  const { accessToken, userInfo, setJwtToken } = useAuth();
  const [email, setEmail] = useState(userInfo?.email || "");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [name, setName] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCreateAccount = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/customer-user-signup", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          legalCompanyName: companyName,
          name,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const jwtToken = data.jwtToken;
        if (jwtToken) {
          setJwtToken(jwtToken);
          onNext();
        } else {
          console.error("jwtToken não está presente na resposta da API");
        }
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      console.error("Erro ao criar conta:", error);
      setErrorMessage("Erro ao criar conta.");
    }
  };

  const handleLinkAccount = async () => {
    try {
      const apikey = process.env.NEXT_PUBLIC_ADMIN_BEARER;
      console.log(apikey);
      const response = await fetch("https://api.omnistrate.cloud/2022-09-01-00/customer-user-signin", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apikey}`, // Substitua pela sua chave de API
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        const jwtToken = data.jwtToken;
        if (jwtToken) {
          setJwtToken(jwtToken);
          onNext();
        } else {
          console.error("jwtToken não está presente na resposta da API");
        }
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      setErrorMessage("Erro ao conectar com a API do Omnistrate.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-center mb-6">
        {isLogin ? "Faça login na sua conta" : "Crie sua conta"}
      </h2>

      {errorMessage && (
        <div className="text-red-500 mb-4">
          <p>{errorMessage}</p>
        </div>
      )}

      <div className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-3 rounded w-full"
        />
        {!isLogin && (
          <>
            <input
              type="text"
              placeholder="Digite o nome da sua empresa"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="border p-3 rounded w-full"
            />
            <input
              type="text"
              placeholder="Digite seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-3 rounded w-full"
            />
          </>
        )}
        <input
          type="password"
          placeholder={isLogin ? "Digite sua senha" : "Crie uma senha"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-3 rounded w-full"
        />
        {isLogin ? (
          <button className="bg-black text-white py-2 w-full rounded" onClick={handleLinkAccount}>
            Login
          </button>
        ) : (
          <button className="bg-black text-white py-2 w-full rounded" onClick={handleCreateAccount}>
            Inscrever-se
          </button>
        )}
        <div className="flex justify-between items-center">
          {isLogin && (
            <a href="#" className="text-sm text-gray-500">
              Esqueceu a senha
            </a>
          )}
          <p className="text-sm">
            {isLogin ? "Novo por aqui?" : "Já tem uma conta?"}{" "}
            <span className="text-blue-500 cursor-pointer" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Crie uma conta" : "Login"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
