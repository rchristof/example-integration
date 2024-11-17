// app/components/ProjectSelectionComponent.tsx

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

interface ProjectSelectionComponentProps {
  onNext: () => void;
  onBack: () => void;
  setSelectedProject: (projectId: string) => void;
}

export default function ProjectSelectionComponent({
  onNext,
  onBack,
  setSelectedProject,
}: ProjectSelectionComponentProps) {
  const { accessToken } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        if (!accessToken) {
          throw new Error("Token de acesso ausente.");
        }

        const response = await fetch("/api/projects", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Erro ao buscar projetos.");
        }

        setProjects(data.projects || []);
      } catch (error: any) {
        console.error("Erro ao buscar projetos:", error);
        // Você pode definir uma mensagem de erro no estado, se desejar
      }
    };

    fetchProjects();
  }, [accessToken]);

  const handleNext = () => {
    if (selectedProjectId) {
      setSelectedProject(selectedProjectId);
      onNext();
    } else {
      alert("Por favor, selecione um projeto.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-center mb-6">Selecione Seu Projeto</h2>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        <select
          className="w-full p-3 border rounded bg-white"
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
        >
          <option value="" disabled>
            Selecione um projeto
          </option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>
      <button
        className="bg-black text-white py-2 w-full rounded mt-4"
        onClick={handleNext}
        disabled={!selectedProjectId}
      >
        Salvar e Continuar
      </button>
      <button className="text-gray-500 mt-2" onClick={onBack}>
        Voltar
      </button>
    </div>
  );
}
