// app/contexts/AuthContext.tsx

"use client";

import React, { createContext, useState, useContext } from "react";

interface AuthContextType {
  accessToken: string | null;
  teamId: string | null;
  code: string | null;
  jwtToken: string | null;
  userInfo: any;
  setAccessToken: (token: string | null) => void;
  setTeamId: (id: string | null) => void;
  setCode: (code: string | null) => void;
  setJwtToken: (token: string | null) => void;
  setUserInfo: (info: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        teamId,
        code,
        jwtToken,
        userInfo,
        setAccessToken,
        setTeamId,
        setCode,
        setJwtToken,
        setUserInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
