import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const settings = await prisma.systemSettings.findUnique({
      where: { id: "config" },
    });

    if (!settings) {
      return NextResponse.json({ error: "Settings not found" }, { status: 404 });
    }

    // Count accepted applications
    const acceptedCount = await prisma.application.count({
      where: { status: "ACCEPTED" },
    });

    const parsedTrainers = JSON.parse(settings.trainers || "[]");
    const slotsRemaining = Math.max(0, settings.slotsLimit - acceptedCount);

    return NextResponse.json({
      slotsLimit: settings.slotsLimit,
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

    const updatedSettings = await prisma.systemSettings.upsert({
      where: { id: "config" },
      update: {
        slotsLimit,
        trainers: JSON.stringify(trainers),
      },
      create: {
        id: "config",
        slotsLimit,
        trainers: JSON.stringify(trainers),
      },
    });

    return NextResponse.json({
      success: true,
      settings: {
        slotsLimit: updatedSettings.slotsLimit,
        trainers: JSON.parse(updatedSettings.trainers),
      },
    });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
