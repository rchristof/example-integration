// // app/api/create-instance/route.ts

// import { NextResponse } from 'next/server';

// export async function POST(request: Request) {
//   try {
//     const { subscriptionId, instanceData } = await request.json();

//     const jwtToken = request.headers.get('Authorization')?.split('Bearer ')[1];

//     if (!jwtToken) {
//       return NextResponse.json({ message: 'Token de autenticação ausente.' }, { status: 401 });
//     }

//     if (!subscriptionId || !instanceData) {
//       return NextResponse.json({ message: 'Parâmetros ausentes.' }, { status: 400 });
//     }

//     // Construir a URL correta para criar a instância, incluindo subscriptionId como query parameter
//     const createInstanceUrl = `https://api.omnistrate.cloud/2022-09-01-00/resource-instance/sp-JvkxkPhinN/falkordb/v1/prod/falkordb-free-customer-hosted/falkordb-free-falkordb-customer-hosted-model-omnistrate-multi-tenancy/free?subscriptionId=${subscriptionId}`;

//     // Fazer a chamada para criar a instância
//     const response = await fetch(createInstanceUrl, {
//       method: 'POST',
//       headers: {
//         Authorization: `Bearer ${jwtToken}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(instanceData),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       return NextResponse.json(data, { status: response.status });
//     }

//     return NextResponse.json(data, { status: 200 });
//   } catch (error) {
//     console.error('Erro na rota /api/create-instance:', error);
//     return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
//   }
// }
