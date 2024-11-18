// app/api/instances/route.ts

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// URL base da API para instâncias
const BASE_API_URL = "https://api.omnistrate.cloud/2022-09-01-00/resource-instance/sp-JvkxkPhinN/falkordb/v1/prod/falkordb-free-customer-hosted/falkordb-free-falkordb-customer-hosted-model-omnistrate-multi-tenancy/free";

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const jwtToken = cookieStore.get('jwtToken')?.value;

    if (!jwtToken) {
      return NextResponse.json({ message: 'Token de autenticação ausente.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('subscriptionId');
    const instanceId = searchParams.get('instanceId');

    if (!subscriptionId) {
      return NextResponse.json({ message: 'ID da assinatura ausente.' }, { status: 400 });
    }

    // Construir a URL da API para buscar a instância
    let apiUrl = `${BASE_API_URL}?subscriptionId=${subscriptionId}`;
    if (instanceId) {
      apiUrl = `${BASE_API_URL}/${instanceId}?subscriptionId=${subscriptionId}`;
    }

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`Erro da API: ${response.statusText}`, data);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar instância:', error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
      const cookieStore = cookies();
      const jwtToken = cookieStore.get("jwtToken")?.value;
  
      if (!jwtToken) {
        console.error("Erro: JWT Token ausente.");
        return NextResponse.json({ message: "Token de autenticação ausente." }, { status: 401 });
      }
  
      const requestBody = await request.json();
  
      console.log("Dados recebidos na requisição:", requestBody);
  
      const { subscriptionId, instanceData } = requestBody;
  
      if (!subscriptionId || !instanceData) {
        console.error("Erro: Parâmetros ausentes.", { subscriptionId, instanceData });
        return NextResponse.json({ message: "Parâmetros ausentes." }, { status: 400 });
      }
  
      const createInstanceUrl = `${BASE_API_URL}?subscriptionId=${subscriptionId}`;
  
      console.log("Enviando para a API externa:", createInstanceUrl, instanceData);
  
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
        console.error("Erro na API externa:", data);
        return NextResponse.json(data, { status: response.status });
      }
  
      console.log("Resposta da API externa:", data);
      return NextResponse.json(data, { status: 200 });
    } catch (error) {
      console.error("Erro ao criar instância:", error);
      return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
    }
  }
  
