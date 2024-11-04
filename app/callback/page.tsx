"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { exchangeCodeForAccessToken } from "~/app/callback/actions/exchange-code-for-access-token";
import { saveTokenToEnv } from "~/app/callback/actions/save-token-to-env";
import { getUserProjects } from "~/app/callback/actions/get-user-projects";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>(""); 
  const [name, setName] = useState<string>(""); 
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [isLogin, setIsLogin] = useState(true);
  const [jwtToken, setJwtToken] = useState<string | null>(null); 
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [projectsDropdownOpen, setProjectsDropdownOpen] = useState(false); // controla o dropdown
  const code = searchParams.get("code");
  const teamId = searchParams.get("teamId");
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
      setUserInfo(data.user);
      setEmail(data.user.email || "");
      console.log("User info fetched successfully:", data.user);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const fetchProjects = async (token: string) => {
    try {
      const projects = await getUserProjects(token, teamId || undefined);
      setProjects(projects);
      console.log("Projects fetched successfully:", projects);
    } catch (error) {
      console.error("Erro ao buscar projetos:", error);
    }
  };

  const handleProjectSelection = (projectId: string) => {
    setSelectedProjects((prevSelected) =>
      prevSelected.includes(projectId)
        ? prevSelected.filter((id) => id !== projectId)
        : [...prevSelected, projectId]
    );
  };

  const handleCreateAccount = async () => {
    if (!userInfo) {
      console.error("User info is null");
      return;
    }

    const response = await fetch("http://127.0.0.1:5000/customer-user-signup", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
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
    console.log("API authentication response:", data);

    if (response.ok) {
      const token = data.jwtToken;
      setJwtToken(token);
      if (token && accessToken) {
        console.log("Fetching projects...");
        await fetchProjects(accessToken); 
      } else {
        console.error("jwtToken or accessToken is missing");
      }
    } else {
      setErrorMessage(data.message);
    }
  };

  const handleLinkAccount = async () => {
    const response = await fetch("http://127.0.0.1:5000/customer-user-signin", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      const token = data.jwtToken;
      setJwtToken(token);
      if (token && accessToken) {
        console.log("Fetching projects...");
        await fetchProjects(accessToken); 
      } else {
        console.error("jwtToken or accessToken is missing");
      }
    } else {
      setErrorMessage(data.message);
    }
  };

  const handleSaveTokenToProjects = async () => {
    if (jwtToken && accessToken) {
      console.log("Saving token to selected projects...");
      for (const projectId of selectedProjects) {
        await saveTokenToEnv(accessToken, jwtToken, projectId, teamId); 
      }
      console.log("Token saved to projects. Redirecting...");
      router.push(`/plans?next=${encodeURIComponent(next || "")}`);
    } else {
      console.error("Error: jwtToken or accessToken is missing");
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
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        {!jwtToken ? (
          <>
            <img src="/falkor_logo.png" alt="Falkor Logo" width={96} height={96} className="mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-center mb-6">{isLogin ? "Login to your account" : "Create your account"}</h2>

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
                      <FaGithub size={24} color="#333" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold text-center mb-6">Select Your Projects</h2>
            <button
              onClick={() => setProjectsDropdownOpen(!projectsDropdownOpen)}
              className="bg-gray-200 text-black w-full flex justify-between items-center p-3 rounded"
            >
              Projects
              {projectsDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            {projectsDropdownOpen && (
              <ul className="space-y-2 mt-2">
                {projects.map((project) => (
                  <li key={project.id} className="flex items-center justify-between border p-3 rounded">
                    <span>{project.name}</span>
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(project.id)}
                      onChange={() => handleProjectSelection(project.id)}
                    />
                  </li>
                ))}
              </ul>
            )}
            <button
              className="bg-black text-white py-2 w-full rounded mt-4"
              onClick={handleSaveTokenToProjects}
            >
              Save and Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
