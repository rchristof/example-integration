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
  
  // Novo estado para gerenciar a confirmação de email
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Armazenar as credenciais usadas no registro para reutilização no login
  const [registrationCredentials, setRegistrationCredentials] = useState<{ email: string; password: string } | null>(null);

  const handleCreateAccount = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const apikey = process.env.NEXT_PUBLIC_ADMIN_BEARER;
      if (!apikey) {
        throw new Error("Chave de API ausente.");
      }

      const response = await fetch("https://api.omnistrate.cloud/2022-09-01-00/customer-user-signup", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apikey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          legalCompanyName: companyName,
          name,
          password,
        }),
      });

      // A API de registro não retorna nada, então evitamos chamar response.json()
      if (response.ok) {
        // Registro bem-sucedido, mas email precisa ser confirmado
        setNeedsEmailConfirmation(true);
        // Armazenar as credenciais para login posterior
        setRegistrationCredentials({ email, password });
      } else {
        // Tenta extrair a mensagem de erro, se disponível
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          // Resposta não é JSON
          throw new Error("Erro ao criar conta.");
        }
        setErrorMessage(errorData.message || "Erro ao criar conta.");
      }
    } catch (error: any) {
      console.error("Erro ao criar conta:", error);
      setErrorMessage(error.message || "Erro ao criar conta.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkAccount = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const apikey = process.env.NEXT_PUBLIC_ADMIN_BEARER;
      if (!apikey) {
        throw new Error("Chave de API ausente.");
      }

      const response = await fetch("https://api.omnistrate.cloud/2022-09-01-00/customer-user-signin", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apikey}`, // Substitua pela chave de API
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      // Tenta analisar a resposta como JSON, mas lida com respostas vazias
      let data: { jwtToken?: string } = {};
      const text = await response.text();
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (jsonError) {
          console.error("Erro ao analisar JSON:", jsonError);
          throw new Error("Resposta da API inválida.");
        }
      }

      if (response.ok) {
        const jwtToken = data.jwtToken;
        if (jwtToken) {
          setJwtToken(jwtToken);
          console.log(jwtToken);
          onNext();
        } else {
          console.error("jwtToken não está presente na resposta da API");
          setErrorMessage("Falha ao obter token de autenticação.");
        }
      } else {
        // Tenta obter a mensagem de erro da resposta
        const apiMessage = data.message || "Erro ao fazer login.";
        setErrorMessage(apiMessage);
      }
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      setErrorMessage(error.message || "Erro ao conectar com a API do Omnistrate.");
    } finally {
      setIsLoading(false);
    }
  };

  // Função para tentar login após confirmação de email
  const handleConfirmEmailAndLogin = async () => {
    // Garantir que as credenciais de registro estão disponíveis
    if (registrationCredentials) {
      setEmail(registrationCredentials.email);
      setPassword(registrationCredentials.password);
      await handleLinkAccount();
    } else {
      setErrorMessage("Credenciais de registro não encontradas. Por favor, faça login manualmente.");
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

      {/* Condicional para exibir a mensagem de confirmação de email */}
      {needsEmailConfirmation ? (
        <div className="text-center">
          <p className="mb-4">
            Um email de confirmação foi enviado para <strong>{email}</strong>. Por favor, confirme seu email para continuar.
          </p>
          <button
            className="bg-black text-white py-2 px-4 rounded"
            onClick={handleConfirmEmailAndLogin}
            disabled={isLoading}
          >
            {isLoading ? "Processando..." : "Já confirmei meu email"}
          </button>
          <p className="mt-4 text-sm">
            Caso não tenha recebido o email, verifique sua caixa de spam ou{" "}
            <a href="#" className="text-blue-500 underline">
              solicite outro
            </a>.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-3 rounded w-full"
              disabled={isLoading && !isLogin}
            />
            {!isLogin && (
              <>
                <input
                  type="text"
                  placeholder="Digite o nome da sua empresa"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="border p-3 rounded w-full"
                  disabled={isLoading}
                />
                <input
                  type="text"
                  placeholder="Digite seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border p-3 rounded w-full"
                  disabled={isLoading}
                />
              </>
            )}
            <input
              type="password"
              placeholder={isLogin ? "Digite sua senha" : "Crie uma senha"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-3 rounded w-full"
              disabled={isLoading && !isLogin}
            />
            {isLogin ? (
              <button
                className="bg-black text-white py-2 w-full rounded"
                onClick={handleLinkAccount}
                disabled={isLoading}
              >
                {isLoading ? "Processando..." : "Login"}
              </button>
            ) : (
              <button
                className="bg-black text-white py-2 w-full rounded"
                onClick={handleCreateAccount}
                disabled={isLoading}
              >
                {isLoading ? "Processando..." : "Inscrever-se"}
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
                <span
                  className="text-blue-500 cursor-pointer"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setErrorMessage(null); // Limpa mensagens de erro ao trocar de modo
                  }}
                >
                  {isLogin ? "Crie uma conta" : "Login"}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
