"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";

interface ProjectSelectionComponentProps {
  onNext: () => void;
}

export default function ProjectSelectionComponent({ onNext }: ProjectSelectionComponentProps) {
  const { setSelectedProject } = useAuth(); // Função para salvar o projeto no contexto
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProjectState] = useState<string>(""); // Estado local para o projeto selecionado
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);

        // Chamada à API para buscar projetos
        const response = await fetch("/api/projects", {
          method: "GET",
          credentials: "include", // Inclui cookies na requisição
        });

        if (response.status === 401) {
          // Usuário não autenticado
          console.warn("Usuário não autenticado.");
          setErrorMessage("Por favor, faça login novamente.");
          return;
        }

        const data = await response.json();

        if (response.ok) {
          setProjects(data.projects || []);
        } else {
          setErrorMessage(data.message || "Erro ao obter projetos.");
        }
      } catch (error: any) {
        console.error("Erro ao obter projetos:", error);
        setErrorMessage("Erro ao obter projetos. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleNext = () => {
    if (selectedProject) {
      setSelectedProject(selectedProject); // Salva o projeto selecionado no contexto
      onNext(); // Avança para o próximo passo
    } else {
      setErrorMessage("Por favor, selecione um projeto.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-center mb-6">Seleção de Projeto</h2>
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
                onChange={(e) => setSelectedProjectState(e.target.value)} // Atualiza o estado local
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
