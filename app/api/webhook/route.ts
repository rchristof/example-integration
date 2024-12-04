import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const secret = process.env.WEBHOOK_SECRET;
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.instanceId || !body.status) {
      return NextResponse.json({ message: "Dados inválidos" }, { status: 400 });
    }

    // Logica para disparar automação
    console.log("Webhook recebido:", body);

    // Por exemplo, armazenar os dados ou disparar outra função
    await processWebhookData(body);

    return NextResponse.json({ message: "Webhook recebido com sucesso" }, { status: 200 });
  } catch (error) {
    console.error("Erro no Webhook:", error);
    return NextResponse.json({ message: "Erro interno no servidor" }, { status: 500 });
  }
}

// Função para processar os dados do webhook
async function processWebhookData(data: any) {
  const { instanceId, status } = data;

  if (status === "DEPLOYED") {
    console.log(`Instância ${instanceId} está pronta. Disparando automação...`);

    // Dispare a automação, como consultar informações e salvar no Firebase
    await triggerAutomation(instanceId);
  } else {
    console.log(`Status da instância ${instanceId}: ${status}`);
  }
}

// Exemplo de automação
async function triggerAutomation(instanceId: string) {
  // Simular uma chamada para buscar informações da instância
  console.log(`Automação: Buscando detalhes da instância ${instanceId}`);

  // Lógica para salvar no Firebase ou outras ações
  // Exemplo:
  // await db.collection("instances").doc(instanceId).set({ status: "ready" });

  console.log("Automação concluída.");
}
