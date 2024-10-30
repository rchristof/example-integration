"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function Page() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [legalCompanyName, setLegalCompanyName] = useState("");
  const [isLinking, setIsLinking] = useState(false);

  const handleCreateAccount = async () => {
    const response = await fetch("http://127.0.0.1:5000/customer-user-signup", {
      method: "POST",
      headers: {
        "Authorization": "Bearer <admin bearer>",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        legalCompanyName,
        name,
        password,
      }),
    });

    const data = await response.json();
    console.log("Account created:", data);
  };

  const handleLinkAccount = async () => {
    const response = await fetch("http://127.0.0.1:5000/customer-user-signin", {
      method: "POST",
      headers: {
        "Authorization": "Bearer <admin bearer>",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();
    console.log("Account linked:", data);
  };

  return (
    <div className="space-y-4 text-center">
      <h1 className="text-lg font-medium">Vercel Example Integration</h1>
      <div className="flex justify-center space-x-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => setIsLinking(false)}
        >
          Create New Account
        </button>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={() => setIsLinking(true)}
        >
          Link Existing Account
        </button>
      </div>
      <div className="mt-4">
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
          className="border p-2 rounded w-full mt-2"
        />
        {!isLinking && (
          <>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 rounded w-full mt-2"
            />
            <input
              type="text"
              placeholder="Legal Company Name"
              value={legalCompanyName}
              onChange={(e) => setLegalCompanyName(e.target.value)}
              className="border p-2 rounded w-full mt-2"
            />
          </>
        )}
        <button
          className="bg-purple-500 text-white px-4 py-2 rounded mt-4"
          onClick={isLinking ? handleLinkAccount : handleCreateAccount}
        >
          {isLinking ? "Link Account" : "Create Account"}
        </button>
      </div>
    </div>
  );
}
