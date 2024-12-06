// app/contexts/AuthContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextProps {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  selectedProject: string | null;
  setSelectedProject: (value: string | null) => void;
  subscriptionId: string | null;
  setSubscriptionId: (value: string | null) => void;
  teamId: string | null;
  setTeamId: (value: string | null) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        selectedProject,
        setSelectedProject,
        subscriptionId,
        setSubscriptionId,
        teamId,
        setTeamId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
