// app/api/instances/route.ts
import { NextResponse } from "next/server";

const BASE_API_URL =
  "https://api.omnistrate.cloud/2022-09-01-00/resource-instance/sp-JvkxkPhinN/falkordb/v1/prod/falkordb-free-customer-hosted/falkordb-free-falkordb-customer-hosted-model-omnistrate-multi-tenancy/free";

export const GET = async (request: Request) => {
  try {
    const jwtToken = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!jwtToken) {
      return NextResponse.json({ message: "Missing authentication token, reauthenticate." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get("subscriptionId");
    const instanceId = searchParams.get("instanceId");

    if (!subscriptionId) {
      return NextResponse.json({ message: "Missing subscription ID." }, { status: 400 });
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
    if (instanceId) {
      return NextResponse.json(data, { status: 200 });
    }

    return NextResponse.json({ ids: data.ids }, { status: 200 });
  } catch (error) {
    console.error("Error fetching instances:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
};

export const POST = async (request: Request) => {
  try {
    const jwtToken = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!jwtToken) {
      return NextResponse.json({ message: "Missing authentication token." }, { status: 401 });
    }

    const { subscriptionId, instanceData } = await request.json();

    if (!subscriptionId || !instanceData) {
      return NextResponse.json({ message: "Missing parameters." }, { status: 400 });
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
    console.error("Error creating instance:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
};
