import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sendDiscordDM } from "@/lib/discord";
import { deletePrivateFile } from "@/lib/storage";

const DEFAULT_DECISION_WEBHOOK = "https://discord.com/api/webhooks/1513053814863696036/XxsSO8L-tCBfsC5pYiGJzKS5rK-l4_RCxeQ7iBND0i1nUWhghVYCWoKbhgV53y4stHzo";

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

    const application = await db.getApplicationById(id);

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (application.status !== "PENDING") {
      return NextResponse.json({ error: "This application has already been decided." }, { status: 400 });
    }

    const officer = session.user as any;
    const status = action === "ACCEPT" ? "ACCEPTED" : "REJECTED";

    // Update DB
    const updatedApplication = await db.updateApplicationStatus(id, status, reason);

    // Send Webhook to Results / Decisions Channel
    const decisionWebhookUrl = process.env.DISCORD_DECISION_WEBHOOK_URL || DEFAULT_DECISION_WEBHOOK;
    if (decisionWebhookUrl && decisionWebhookUrl.startsWith("http")) {
      try {
        const isAccepted = status === "ACCEPTED";
        const title = isAccepted
          ? "🎉 Application Approved — Welcome to Elder Clan Training!"
          : "📋 Application Status Update — Elder Clan";
        const color = isAccepted ? 0x22c55e : 0xef4444; // Green vs Red

        let content = `<@${application.discordId}>`;
        let description = "";

        if (isAccepted) {
          description = `Congratulations **${application.discordUsername}** (Kirka ID: \`${application.kirkaId}\`)!\n\n` +
            `Your application to join **Elder Clan** has been **ACCEPTED FOR TRAINING** for the upcoming Clan War roster! ⚔️🔥\n\n` +
            `👉 **Next Step**: Please proceed directly to the training channel:\nhttps://discord.com/channels/1369832704102633554/1511962818558296164\n\n` +
            `📝 **Officer Notes & Instructions**:\n>>> ${reason}\n\n` +
            `🛡️ **Reviewed by Officer**: <@${officer.id}> (${officer.name || "Officer"})`;
        } else {
          description = `Hello **${application.discordUsername}** (Kirka ID: \`${application.kirkaId}\`),\n\n` +
            `Thank you so much for taking the time to apply for **Elder Clan**. We truly appreciate your interest and gameplay dedication!\n\n` +
            `After reviewing your application, trainer match, and stats, we unfortunately cannot offer you a roster spot for this specific Clan War. **Please don't be discouraged!** Keep practicing, grind up your weekly XP, and we warmly invite you to apply again for the next Clan War! ⚔️\n\n` +
            `📝 **Officer Feedback / Reason**:\n>>> ${reason}\n\n` +
            `🛡️ **Reviewed by Officer**: <@${officer.id}> (${officer.name || "Officer"})`;
        }

        const embed = {
          title,
          description,
          color,
          timestamp: new Date().toISOString(),
          footer: {
            text: "Elder Clan Official Recruitment • elderapply.vercel.app",
            icon_url: "https://elderapply.vercel.app/elder-logo.jpg",
          },
        };

        const res = await fetch(decisionWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "Elder Clan Decisions",
            avatar_url: "https://elderapply.vercel.app/elder-logo.jpg",
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

    // Send Discord DM using Bot Token (if configured)
    if (process.env.DISCORD_BOT_TOKEN) {
      const isAccepted = status === "ACCEPTED";
      const dmMessage = isAccepted
        ? `Hello! Your application to join **Elder Clan** has been **APPROVED FOR TRAINING**! 🎉\n\nPlease join the training channel here:\nhttps://discord.com/channels/1369832704102633554/1511962818558296164\n\n**Officer Note**: ${reason}`
        : `Hello. Thank you for applying to **Elder Clan**. Unfortunately your application for this Clan War was not approved. Keep grinding and feel free to apply again for the next war!\n\n**Feedback**: ${reason}`;
      
      await sendDiscordDM(application.discordId, dmMessage);
    }

    return NextResponse.json({ success: true, application: updatedApplication });
  } catch (error) {
    console.error("Error updating application status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE manual cleanup API route
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
    const application = await db.getApplicationById(id);

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (application.screenshotPath) {
      await deletePrivateFile(application.screenshotPath);
    }

    await db.deleteApplicationsByIds([id]);

    return NextResponse.json({ success: true, message: "Application deleted successfully." });
  } catch (error) {
    console.error("Error deleting application:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
