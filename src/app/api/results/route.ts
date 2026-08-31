import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const applications = await db.getApplications();

    // Filter to only decided applications (ACCEPTED or REJECTED)
    const decided = applications
      .filter((app: any) => app.status === "ACCEPTED" || app.status === "REJECTED")
      .map((app: any) => ({
        id: app.id,
        discordUsername: app.discordUsername,
        discordGlobalName: app.discordGlobalName,
        discordAvatar: app.discordAvatar,
        kirkaId: app.kirkaId,
        weeklyXp: app.weeklyXp,
        status: app.status,
        decisionReason: app.decisionReason,
        decidedAt: app.decidedAt,
      }));

    return NextResponse.json({
      success: true,
      results: decided,
      applications: decided,
    });
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
