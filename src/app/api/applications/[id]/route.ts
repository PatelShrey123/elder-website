import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sendDiscordDM } from "@/lib/discord";
import { deletePrivateFile } from "@/lib/storage";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).isOfficer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { action, reason } = body; // action is "ACCEPT" or "REJECT"

    if (action !== "ACCEPT" && action !== "REJECT") {
      return NextResponse.json({ error: "Invalid action. Must be ACCEPT or REJECT." }, { status: 400 });
    }

    if (!reason) {
      return NextResponse.json({ error: "A decision reason is required." }, { status: 400 });
    }

    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (application.status !== "PENDING") {
      return NextResponse.json({ error: "This application has already been decided." }, { status: 400 });
    }

    const officer = session.user as any;
    const status = action === "ACCEPT" ? "ACCEPTED" : "REJECTED";

    // Update DB
    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        status,
        decisionReason: reason,
        decidedAt: new Date(),
      },
    });

    // Send Webhook (Webhook #2 - decisions channel)
    const decisionWebhookUrl = process.env.DISCORD_DECISION_WEBHOOK_URL;
    if (decisionWebhookUrl) {
      try {
        const isAccepted = status === "ACCEPTED";
        const title = isAccepted ? "✅ Application Approved!" : "❌ Application Rejected";
        const color = isAccepted ? 0x22c55e : 0xef4444; // Green vs Red

        let content = "";
        let description = "";

        if (isAccepted) {
          content = `<@${application.discordId}> has been accepted!`;
          description = `Congratulations **${application.discordUsername}** (Kirka ID: \`${application.kirkaId}\`)!\n\n` +
            `You have been accepted **FOR TRAINING** in Elder Clan.\n\n` +
            `👉 Please join the training channel here: https://discord.com/channels/1369832704102633554/1511962818558296164\n\n` +
            `**Decision Reason / Notes**:\n${reason}`;
        } else {
          content = `Application from ${application.discordUsername} was rejected.`;
          description = `The application from **${application.discordUsername}** (Kirka ID: \`${application.kirkaId}\`) was rejected.\n\n` +
            `**Rejection Reason**:\n${reason}`;
        }

        const embed = {
          title,
          description,
          color,
          timestamp: new Date().toISOString(),
          footer: { text: "Elder Official Bot" },
        };

        const res = await fetch(decisionWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "Elder Official Bot",
            avatar_url: "https://elderapplication.lovable.app/favicon.ico",
            content,
            embeds: [embed],
          }),
        });

        if (!res.ok) {
          console.error("Failed to send decision webhook:", await res.text());
        }
      } catch (webhookErr) {
        console.error("Error posting to decision webhook:", webhookErr);
      }
    }

    // Send Discord DM using Bot Token (Optional, wrap in try/catch)
    if (process.env.DISCORD_BOT_TOKEN) {
      const isAccepted = status === "ACCEPTED";
      const dmMessage = isAccepted
        ? `Hello! Your application to join **Elder Clan** has been **APPROVED**! 🎉\n\nYou have been accepted **FOR TRAINING**. Please proceed to the training channel here:\nhttps://discord.com/channels/1369832704102633554/1511962818558296164\n\n**Officer Note**: ${reason}`
        : `Hello. We regret to inform you that your application to join **Elder Clan** has been **REJECTED**.\n\n**Reason**: ${reason}`;
      
      await sendDiscordDM(application.discordId, dmMessage);
    }

    return NextResponse.json({ success: true, application: updatedApplication });
  } catch (error) {
    console.error("Error updating application status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE manual cleanup API route (removes DB row + screenshot)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).isOfficer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Delete screenshot from storage
    if (application.screenshotPath) {
      await deletePrivateFile(application.screenshotPath);
    }

    // Delete from DB
    await prisma.application.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Application deleted successfully." });
  } catch (error) {
    console.error("Error deleting application:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
