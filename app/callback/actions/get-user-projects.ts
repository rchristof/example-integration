// app/callback/actions/get-user-projects.ts

export async function getUserProjects(token: string, teamId?: string) {
    try {
      const url = new URL("https://api.vercel.com/v9/projects");
      if (teamId) url.searchParams.append("teamId", teamId);
  
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error(`Erro ao buscar projetos: ${response.statusText}`);
      }
  
      const data = await response.json();
      return data.projects || []; // Retorna a lista de projetos
    } catch (error) {
      console.error("Erro ao obter lista de projetos:", error);
      throw error;
    }
  }
  