"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import MainImageLayout from "../components/NonDashboardComponents/Layout/MainImageLayout";
import Select from "../components/NonDashboardComponents/FormElementsV2/Select";
import MenuItem from "../components/NonDashboardComponents/FormElementsV2/MenuItem";
import SubmitButton from "../components/NonDashboardComponents/FormElementsV2/SubmitButton";

interface ProjectSelectionComponentProps {
  onNext: () => void;
}

export default function ProjectSelectionComponent({
  onNext,
}: ProjectSelectionComponentProps) {
  const { setSelectedProject } = useAuth(); // Método do contexto
  console.log("setSelectedProject", setSelectedProject);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProjectState] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Obtém o token de sessão para as chamadas de API
  const getSessionToken = () =>
    document.cookie.replace(
      /(?:(?:^|.*;\s*)sessionToken\s*\=\s*([^;]*).*$)|^.*$/,
      "$1"
    );

  // Busca os projetos disponíveis ao carregar o componente
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
          throw new Error(data.message || "Erro ao obter projetos.");
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

  // Manipula a navegação para o próximo passo
  const handleNext = () => {
    if (selectedProject) {
      console.log("Projeto selecionado:", selectedProject);
      setSelectedProject(selectedProject); // Salva no contexto global
      onNext(); // Navega para o próximo passo
    } else {
      setErrorMessage("Por favor, selecione um projeto.");
    }
  };

  return (
    <MainImageLayout
      pageTitle="Seleção de Projeto"
      orgName="FalkorDB"
      orgLogoURL="/assets/images/falkor_logo.png"
    >
      <div>
        <h2 className="text-2xl font-semibold text-center mb-6">
          Project Selection
        </h2>
        {errorMessage && (
          <p className="text-red-500 mb-4 text-center">{errorMessage}</p>
        )}
        {isLoading ? (
          <p className="text-center">Loading projects...</p>
        ) : projects.length > 0 ? (
          <Select
            value={selectedProject}
            onChange={(e) => setSelectedProjectState(e.target.value)}
            fullWidth
            displayEmpty
            renderValue={(selected) =>
              selected ? projects.find((p) => p.id === selected)?.name : "Selecione um projeto"
            }
          >
            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
        ) : (
          <p className="text-center">Nenhum projeto encontrado.</p>
        )}
        <SubmitButton
          onClick={handleNext}
          disabled={isLoading || !selectedProject}
          sx={{ marginTop: "24px" }}
        >
          Próximo
        </SubmitButton>
      </div>
    </MainImageLayout>
  );
}
