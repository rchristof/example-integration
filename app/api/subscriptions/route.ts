// app/api/subscriptions/route.ts
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  try {
    const jwtToken = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!jwtToken) {
      return NextResponse.json({ message: "Missing authentication token, re-authenticate." }, { status: 401 });
    }

    const response = await fetch("https://api.omnistrate.cloud/2022-09-01-00/subscription", {
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

    return NextResponse.json({ subscriptions: data.subscriptions }, { status: 200 });
  } catch (error) {
    console.error("Error when searching for subscriptions:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
};

export const POST = async (request: Request) => {
  try {
    const jwtToken = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!jwtToken) {
      return NextResponse.json({ message: "Missing authentication token, re-authenticate." }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch("https://api.omnistrate.cloud/2022-09-01-00/subscription", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
};
