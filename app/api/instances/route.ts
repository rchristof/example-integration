// app/api/instances/route.ts
import { NextResponse } from "next/server";
import redis from "@/utils/redis";

const BASE_API_URL = "https://api.omnistrate.cloud/2022-09-01-00/resource-instance/sp-JvkxkPhinN/falkordb/v1/prod/falkordb-free-customer-hosted/falkordb-free-falkordb-customer-hosted-model-omnistrate-multi-tenancy/free";

export async function GET(request: Request) {
  try {
    // Recuperar o token de sessão do cookie
    const sessionToken = request.headers.get("cookie")?.split("=")?.[1];
    if (!sessionToken) {
      return NextResponse.json({ message: "Sessão ausente." }, { status: 401 });
    }

    const sessionData = await redis.get(sessionToken);
    if (!sessionData) {
      return NextResponse.json({ message: "Sessão inválida ou expirada." }, { status: 401 });
    }

    const { jwtToken } = JSON.parse(sessionData);

    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get("subscriptionId");
    const instanceId = searchParams.get("instanceId");

    if (!subscriptionId) {
      return NextResponse.json({ message: "ID da assinatura ausente." }, { status: 400 });
    }

    let apiUrl = `${BASE_API_URL}?subscriptionId=${subscriptionId}`;
    if (instanceId) {
      apiUrl = `${BASE_API_URL}/${instanceId}?subscriptionId=${subscriptionId}`;
    }

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Recuperar o token de sessão do cookie
    const sessionToken = request.headers.get("cookie")?.split("=")?.[1];
    if (!sessionToken) {
      return NextResponse.json({ message: "Sessão ausente." }, { status: 401 });
    }

    const sessionData = await redis.get(sessionToken);
    if (!sessionData) {
      return NextResponse.json({ message: "Sessão inválida ou expirada." }, { status: 401 });
    }

    const { jwtToken } = JSON.parse(sessionData);
    const { subscriptionId, instanceData } = await request.json();

    if (!subscriptionId || !instanceData) {
      return NextResponse.json({ message: "Parâmetros ausentes." }, { status: 400 });
    }

    const createInstanceUrl = `${BASE_API_URL}?subscriptionId=${subscriptionId}`;
    const response = await fetch(createInstanceUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(instanceData),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
  }
}
