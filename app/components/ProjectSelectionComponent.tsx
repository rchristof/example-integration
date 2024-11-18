"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

interface ProjectSelectionComponentProps {
  onNext: () => void;
}

export default function ProjectSelectionComponent({
  onNext,
}: ProjectSelectionComponentProps) {
  const { setSelectedProject } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProjectState] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getSessionToken = () =>
    document.cookie.replace(
      /(?:(?:^|.*;\s*)sessionToken\s*\=\s*([^;]*).*$)|^.*$/,
      "$1"
    );

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/projects", {
          method: "GET",
          headers: {
            "x-session-token": getSessionToken(),
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setErrorMessage(data.message || "Erro ao obter projetos.");
          return;
        }

        setProjects(data.projects || []);
      } catch (error) {
        setErrorMessage("Erro ao obter projetos. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleNext = () => {
    if (selectedProject) {
      setSelectedProject(selectedProject);
      onNext();
    } else {
      setErrorMessage("Por favor, selecione um projeto.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-center mb-6">
        Seleção de Projeto
      </h2>
      {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
      {isLoading ? (
        <p>Carregando projetos...</p>
      ) : projects.length > 0 ? (
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="flex items-center">
              <input
                type="radio"
                id={project.id}
                name="project"
                value={project.id}
                checked={selectedProject === project.id}
                onChange={(e) => setSelectedProjectState(e.target.value)}
                className="mr-2"
              />
              <label htmlFor={project.id} className="cursor-pointer">
                {project.name}
              </label>
            </div>
          ))}
        </div>
      ) : (
        <p>Nenhum projeto encontrado.</p>
      )}
      <button
        className="bg-black text-white px-4 py-2 rounded mt-4"
        onClick={handleNext}
        disabled={isLoading || !selectedProject}
      >
        Próximo
      </button>
    </div>
  );
}
