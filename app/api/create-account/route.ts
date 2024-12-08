// app/api/create-account/route.ts

import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  try {
    const { email, legalCompanyName, name, password } = await request.json();

    const apikey = process.env.ADMIN_BEARER;

    if (!apikey) {
      console.error("Error: API key not found.");
      return NextResponse.json({ message: "API key not found." }, { status: 500 });
    }

    const response = await fetch(
      "https://api.omnistrate.cloud/2022-09-01-00/customer-user-signup",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apikey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          legalCompanyName,
          name,
          password,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error creating account in external API:", errorData);
      return NextResponse.json(
        { message: errorData.message || "Error creating account." },
        { status: response.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully. Check your email for confirmation.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { message: "Internal server error.", error: error.message },
      { status: 500 }
    );
  }
};