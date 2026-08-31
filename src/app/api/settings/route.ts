import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const settings = await db.getSettings();

    // Count accepted applications
    const acceptedApps = await db.getApplications("ACCEPTED");
    const acceptedCount = acceptedApps.length;

    const parsedTrainers = JSON.parse(settings?.trainers || "[]");
    const slotsLimit = settings?.slotsLimit || 20;
    const slotsRemaining = Math.max(0, slotsLimit - acceptedCount);

    return NextResponse.json({
      slotsLimit,
      slotsRemaining,
      trainers: parsedTrainers,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).isOfficer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { slotsLimit, trainers } = body;

    if (typeof slotsLimit !== "number" || slotsLimit < 0) {
      return NextResponse.json({ error: "Invalid slotsLimit" }, { status: 400 });
    }

    if (!Array.isArray(trainers)) {
      return NextResponse.json({ error: "Invalid trainers list" }, { status: 400 });
    }

    const updatedSettings = await db.upsertSettings(slotsLimit, JSON.stringify(trainers));

    return NextResponse.json({
      success: true,
      settings: {
        slotsLimit: updatedSettings.slotsLimit,
        trainers: typeof updatedSettings.trainers === "string" ? JSON.parse(updatedSettings.trainers) : updatedSettings.trainers,
      },
    });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
