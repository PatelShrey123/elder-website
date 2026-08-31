import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { savePrivateFile } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in via Discord first." }, { status: 401 });
    }

    const user = session.user as any;

    // Check if the user is in guild & is applicant
    if (!user.inGuild) {
      return NextResponse.json({ error: "You must be in the Elder Discord server to apply." }, { status: 403 });
    }

    if (!user.isApplicant) {
      return NextResponse.json({ error: "You must have the Applicant role to apply." }, { status: 403 });
    }

    // Rate Limit Check: Max 2 applications per Discord user per calendar month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyCount = await prisma.application.count({
      where: {
        discordId: user.id,
        createdAt: { gte: startOfMonth },
      },
    });

    if (monthlyCount >= 2) {
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      // Format reset date
      const tryAgainDate = nextMonth.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      return NextResponse.json({
        error: `Monthly Limit Reached. You can submit at most 2 applications per calendar month. You can apply again on ${tryAgainDate}.`,
      }, { status: 429 });
    }

    // Read Multipart FormData
    const formData = await request.formData();
    const kirkaId = formData.get("kirkaId") as string;
    const weeklyXpStr = formData.get("weeklyXp") as string;
    const previousClan = formData.get("previousClan") as string;
    const whyLeft = formData.get("whyLeft") as string;
    const whyJoin = formData.get("whyJoin") as string;
    const file = formData.get("screenshot") as File;

    // Validation
    if (!kirkaId || !weeklyXpStr || !whyJoin || !file) {
      return NextResponse.json({ error: "Required fields are missing." }, { status: 400 });
    }

    const weeklyXp = parseInt(weeklyXpStr, 10);
    if (isNaN(weeklyXp) || weeklyXp < 0) {
      return NextResponse.json({ error: "Weekly XP must be a positive number." }, { status: 400 });
    }

    // Screenshot file validation
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeBytes) {
      return NextResponse.json({ error: "Screenshot file exceeds the 5MB limit." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Uploaded file must be an image." }, { status: 400 });
    }

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadResult = await savePrivateFile(buffer, file.name);

    if (!uploadResult.success) {
      return NextResponse.json({ error: "Failed to upload screenshot to storage." }, { status: 500 });
    }

    // Save Application to DB
    const newApplication = await prisma.application.create({
      data: {
        discordId: user.id,
        discordUsername: user.name || "Unknown",
        discordGlobalName: user.name || null,
        discordAvatar: user.image || null,
        kirkaId,
        weeklyXp,
        previousClan: previousClan || null,
        whyLeft: whyLeft || null,
        whyJoin,
        screenshotPath: uploadResult.fileName,
        status: "PENDING",
      },
    });

    // POST Webhook to Discord (Webhook #1 - applications channel)
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        const dashboardUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/staff`;
        const embed = {
          title: "📂 New Clan Application Received!",
          color: 0xf97316, // Orange color
          timestamp: new Date().toISOString(),
          fields: [
            { name: "Discord Applicant", value: `<@${user.id}> (${user.name})`, inline: true },
            { name: "Kirka.io User ID", value: kirkaId, inline: true },
            { name: "Weekly XP", value: weeklyXp.toLocaleString(), inline: true },
            { name: "Previous Clan", value: previousClan || "None", inline: true },
            { name: "Why they left", value: whyLeft || "N/A" },
            { name: "Why they want to join Elder", value: whyJoin },
          ],
          footer: { text: "Elder Official Bot" },
          description: `Review this application on the [Officer Panel](${dashboardUrl}).`,
        };

        const res = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "Elder Official Bot",
            avatar_url: "https://elderapplication.lovable.app/favicon.ico", // clean fallback avatar
            embeds: [embed],
          }),
        });

        if (!res.ok) {
          console.error("Failed to send new application webhook:", await res.text());
        }
      } catch (webhookErr) {
        console.error("Error posting to new application webhook:", webhookErr);
      }
    }

    return NextResponse.json({ success: true, application: newApplication });
  } catch (error) {
    console.error("Error submitting application:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
