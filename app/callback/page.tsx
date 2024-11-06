"use client"
// callback/page.tsx

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { exchangeCodeForAccessToken } from "~/app/callback/actions/exchange-code-for-access-token";
import { saveSharedEnvVariable } from "~/app/callback/actions/save-secret";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [isLogin, setIsLogin] = useState(true);
  const [isProjectSelection, setIsProjectSelection] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const code = searchParams?.get("code") || null;
  const next = searchParams?.get("next") || null;
  const [_, exchange] = useTransition();

  useEffect(() => {
    if (!code) {
      console.error("Authorization code is null");
      return;
    }
    exchange(async () => {
      const result = await exchangeCodeForAccessToken(code);
      setAccessToken(result.access_token);
      setTeamId(result.team_id);
      fetchUserInfo(result.access_token);
    });
  }, [code]);

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
      setEmail(data.user.email || "");
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch("https://api.vercel.com/v9/projects", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleCreateAccount = async () => {
    if (!userInfo) {
      console.error("User info is null");
      return;
    }

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
    console.log("Dados retornados pela API de autenticação:", data);

    if (response.ok) {
      const jwtToken = data.jwtToken;
      if (jwtToken && accessToken) {
        setIsProjectSelection(true);
        setJwtToken(jwtToken);
        fetchProjects();
      } else {
        console.error("jwtToken não está presente na resposta da API");
      }
    } else {
      setErrorMessage(data.message);
    }
  };

  const handleLinkAccount = async () => {
    try {
      const adminToken = process.env.BEARER_ADMIN_TOKEN;
      const response = await fetch("https://api.omnistrate.cloud/2022-09-01-00/customer-user-signin", {
        method: "POST",
        headers: {
          Authorization: `Bearer $(adminToken)`, // Token de admin das variaveis de ambiente locais
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
        if (jwtToken && accessToken) {
          setJwtToken(jwtToken);
          setIsProjectSelection(true);
          fetchProjects();
        } else {
          console.error("jwtToken não está presente na resposta da API");
        }
      } else {
        setErrorMessage(data.message);
        console.error("Erro ao fazer login:", data);
      }
    } catch (error) {
      console.error("Erro ao conectar com a API do Omnistrate:", error);
      setErrorMessage("Erro ao conectar com a API do Omnistrate.");
    }
  };

  const handleSaveProjectSelection = async () => {
    if (!selectedProject || !teamId || !accessToken || !jwtToken) {
      console.error("Projeto, teamId, accessToken ou jwtToken não estão disponíveis.");
      return;
    }
    try {
      // await saveSharedEnvVariable(accessToken, jwtToken, teamId);
      router.push(`/plans?next=${encodeURIComponent(next || "")}`);
    } catch (error) {
      console.error("Erro ao salvar o token e projetos:", error);
      setErrorMessage("Erro ao salvar o token e projetos");
    }
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
          border: 0;
          overflow: hidden;
        }
      `}</style>
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
        style={{ minHeight: "550px", width: "450px" }}
      >
        <img src="/falkor_logo.png" alt="Falkor Logo" width={96} height={96} className="mx-auto mb-6" />

        {!isProjectSelection ? (
          <>
            <h2 className="text-2xl font-semibold text-center mb-6">
              {isLogin ? "Login to your account" : "Create your account"}
            </h2>

            {errorMessage && (
              <div className="text-red-500 mb-4">
                <p>{errorMessage}</p>
              </div>
            )}

            <div className="space-y-4">
              <input
                type="email"
                placeholder={isLogin ? "Email" : `Email ${email}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-3 rounded w-full"
              />
              {!isLogin && (
                <>
                  <input
                    type="text"
                    placeholder="Enter your company name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="border p-3 rounded w-full"
                  />
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border p-3 rounded w-full"
                  />
                </>
              )}
              <input
                type="password"
                placeholder={isLogin ? "Enter your password" : "Create a password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-3 rounded w-full"
              />
              {isLogin ? (
                <button
                  className="bg-black text-white py-2 w-full rounded"
                  onClick={handleLinkAccount}
                >
                  Login
                </button>
              ) : (
                <button
                  className="bg-black text-white py-2 w-full rounded"
                  onClick={handleCreateAccount}
                >
                  Sign Up
                </button>
              )}
              <div className="flex justify-between items-center">
                {isLogin && (
                  <a href="#" className="text-sm text-gray-500">Forgot Password</a>
                )}
                <p className="text-sm">
                  {isLogin ? "You’re new in here?" : "Already have an account?"}{" "}
                  <span
                    className="text-blue-500 cursor-pointer"
                    onClick={() => setIsLogin(!isLogin)}
                  >
                    {isLogin ? "Create Account" : "Login"}
                  </span>
                </p>
              </div>

              {isLogin && (
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-500">Or login with</p>
                  <div className="flex justify-center space-x-4 mt-2">
                    <button className="bg-gray-100 p-3 rounded-full">
                      <FcGoogle size={24} />
                    </button>
                    <button className="bg-gray-100 p-3 rounded-full">
                      <FaGithub size={24} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-center mb-6">Select Your Project</h2>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <select
                className="w-full p-3 border rounded bg-white"
                value={selectedProject || ""}
                onChange={(e) => setSelectedProject(e.target.value)}
              >
                <option value="" disabled>Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="bg-black text-white py-2 w-full rounded mt-4"
              onClick={handleSaveProjectSelection}
              disabled={!selectedProject}
            >
              Save and Continue
            </button>
          </>
        )}
      </div>
    </div>
  );
}
