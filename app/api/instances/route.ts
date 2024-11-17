// app/api/instances/route.ts

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const jwtToken = request.headers.get('Authorization')?.split('Bearer ')[1];

    if (!jwtToken) {
      return NextResponse.json({ message: 'Token de autenticação ausente.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('subscriptionId');
    const instanceId = searchParams.get('instanceId');

    if (!subscriptionId) {
      return NextResponse.json({ message: 'ID da assinatura ausente.' }, { status: 400 });
    }

    let apiUrl = `https://api.omnistrate.cloud/2022-09-01-00/resource-instance/sp-JvkxkPhinN/falkordb/v1/prod/falkordb-free-customer-hosted/falkordb-free-falkordb-customer-hosted-model-omnistrate-multi-tenancy/free`;

    if (instanceId) {
      apiUrl += `/${instanceId}`;
    }

    apiUrl += `?subscriptionId=${subscriptionId}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Erro na rota /api/instances:', error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}
