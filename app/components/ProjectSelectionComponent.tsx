// app/components/ProjectSelectionComponent.tsx
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
  const { setSelectedProject, teamId } = useAuth(); // Obtém o teamId do contexto
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProjectState] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // const saveAccessToken = async (projectId: string) => {
  //   try {
  //     const accessToken = sessionStorage.getItem("access_token"); 

  //     if (!teamId || !accessToken) {
  //       throw new Error("TeamId ou accessToken ausente.");
  //     }

  //     const response = await fetch("/api/save-vercel-token", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         teamId,
  //         projectId,
  //         accessToken,
  //       }),
  //     });

  //     if (!response.ok) {
  //       const data = await response.json();
  //       throw new Error(data.message || "Erro ao salvar o token.");
  //     }

  //     console.log("Token salvo com sucesso no Firebase.");
  //   } catch (error: any) {
  //     setErrorMessage(error.message || "Erro ao salvar o token.");
  //   }
  // };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);

        const accessToken = sessionStorage.getItem("access_token");
        if (!accessToken || !teamId) {
          throw new Error("Token de acesso ou TeamId ausente.");
        }

        const response = await fetch("/api/projects", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "x-team-id": teamId,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Erro ao obter projetos.");
        }

        setProjects(data.projects || []);
      } catch (error: any) {
        setErrorMessage(error.message || "Erro ao obter projetos. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [teamId]);

  const handleNext = async () => {
    if (selectedProject) {
      try {
        // console.log("Projeto selecionado:", selectedProject);
        setSelectedProject(selectedProject);

        // await saveAccessToken(selectedProject); // Salva o accessToken no Firebase após seleção do projeto

        onNext();
      } catch (error) {
        setErrorMessage("Error saving token. Try again.");
      }
    } else {
      setErrorMessage("Please select a project.");
    }
  };

  return (
    <MainImageLayout
      pageTitle="Project Selection"
      orgName="FalkorDB"
      orgLogoURL="/assets/images/falkor_logo.png"
    >
      <div>
        <h2 className="text-2xl font-semibold text-center mb-6">Project Selection</h2>
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
          <p className="text-center">Nenhum projeto encontrado</p>
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
