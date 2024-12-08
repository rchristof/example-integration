// app/api/webhook/route.ts
import { NextResponse } from "next/server";
import { db } from "@/utils/firebaseAdmin";

export const POST = async (request: Request) => {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || authHeader !== "Bearer token-secreto") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { instanceId } = body;

    if (!instanceId) {
      return NextResponse.json({ message: "Missing Instance ID." }, { status: 400 });
    }

    // console.log(`Starting automation for the instance: ${instanceId}`);

    const snapshot = await db
      .collection("vercel_tokens")
      .where("__name__", ">=", `${instanceId}:`)
      .where("__name__", "<", `${instanceId}:~`)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ message: "No projects found for this instance." }, { status: 404 });
    }

    const apikey = process.env.ADMIN_BEARER;

    if (!apikey) {
      return NextResponse.json({ message: "API key not found." }, { status: 500 });
    }

    for (const doc of snapshot.docs) {
      const { accessToken, projectId, subscriptionId, teamId } = doc.data();

      // console.log(`Processing project ${projectId} for the instance ${instanceId}`);

      const instanceDetailsResponse = await fetch(
        `https://api.omnistrate.cloud/2022-09-01-00/fleet/service/s-KgFDwg5vBS/environment/se-1iyXYFtYfA/instance/${instanceId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apikey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!instanceDetailsResponse.ok) {
        const errorDetails = await instanceDetailsResponse.json();
        console.error("Error getting instance details:", errorDetails);
        continue;
      }

      const instanceDetails = await instanceDetailsResponse.json();
      
      const dynamicKey = Object.keys(instanceDetails.consumptionResourceInstanceResult.detailedNetworkTopology)[0];
      const falkordbHostname = instanceDetails.consumptionResourceInstanceResult.detailedNetworkTopology[dynamicKey].clusterEndpoint;
      const falkordbPort= String(instanceDetails.consumptionResourceInstanceResult.detailedNetworkTopology[dynamicKey].clusterPorts[0]);
      const falkordbUser = instanceDetails.input_params.falkordbUser;

      if (!falkordbHostname) {
        console.error("FalkorDB user not found in instance details.");
        continue;
      }

      // console.log(`FalkorDB hostname obtained: ${falkordbHostname}`);

      const saveEnvResponse = await fetch("http://localhost:3000/api/save-token-to-env", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          variables: [
            { key: "FALKORDB_USER", value: falkordbUser },
            { key: "FALKORDB_HOSTNAME", value: falkordbHostname },
            { key: "FALKORDB_PORT", value: falkordbPort },
          ],
          projectId,
          teamId,
        }),
      });

      if (!saveEnvResponse.ok) {
        const saveEnvError = await saveEnvResponse.json();
        console.error("Error saving environment variables in Vercel using the internal API:", saveEnvError);
        continue;
      }

      // console.log(`Environment variables successfully saved in the project ${projectId}.`);

      try {
        await db.collection("vercel_tokens").doc(doc.id).delete();
        // console.log(`Document ${doc.id} successfully deleted.`);
      } catch (deleteError) {
        console.error(`Error deleting document ${doc.id}:`, deleteError);
      }
    }

    return NextResponse.json({ message: `Webhook processed successfully for instance ${instanceId}` }, { status: 200 });
  } catch (error) {
    console.error(`Error processing webhook`, error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
};
