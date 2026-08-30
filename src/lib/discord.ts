export interface DiscordMemberInfo {
  inGuild: boolean;
  isApplicant: boolean;
  isOfficer: boolean;
  roles: string[];
}

const GUILD_ID = process.env.DISCORD_GUILD_ID || "1369832704102633554";
const OFFICER_ROLE_ID = process.env.DISCORD_OFFICER_ROLE_ID || "1369836381647405067";
const APPLICANT_ROLE_ID = process.env.DISCORD_APPLICANT_ROLE_ID || ""; // If empty, anyone in guild can apply

export async function checkGuildMembershipAndRoles(
  accessToken: string,
  userId: string
): Promise<DiscordMemberInfo> {
  const result: DiscordMemberInfo = {
    inGuild: false,
    isApplicant: false,
    isOfficer: false,
    roles: [],
  };

  try {
    // Method 1: Try using the User's OAuth2 token with guilds.members.read scope
    // This fetches the member object directly. Works if the bot is in the server.
    const userMemberUrl = `https://discord.com/api/v10/users/@me/guilds/${GUILD_ID}/member`;
    const userMemberRes = await fetch(userMemberUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      next: { revalidate: 0 },
    });

    if (userMemberRes.ok) {
      const memberData = await userMemberRes.json();
      result.inGuild = true;
      result.roles = memberData.roles || [];
      result.isOfficer = result.roles.includes(OFFICER_ROLE_ID);
      result.isApplicant = APPLICANT_ROLE_ID 
        ? result.roles.includes(APPLICANT_ROLE_ID) 
        : true;
      return result;
    }
  } catch (err) {
    console.error("Error verifying via User OAuth2 member endpoint:", err);
  }

  // Method 2: Try using the Bot Token to fetch member info
  // This works if the bot is in the server and the bot token is configured.
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (botToken) {
    try {
      const botMemberUrl = `https://discord.com/api/v10/guilds/${GUILD_ID}/members/${userId}`;
      const botMemberRes = await fetch(botMemberUrl, {
        headers: {
          Authorization: `Bot ${botToken}`,
        },
        next: { revalidate: 0 },
      });

      if (botMemberRes.ok) {
        const memberData = await botMemberRes.json();
        result.inGuild = true;
        result.roles = memberData.roles || [];
        result.isOfficer = result.roles.includes(OFFICER_ROLE_ID);
        result.isApplicant = APPLICANT_ROLE_ID 
          ? result.roles.includes(APPLICANT_ROLE_ID) 
          : true;
        return result;
      }
    } catch (err) {
      console.error("Error verifying via Bot Token member endpoint:", err);
    }
  }

  // Method 3: Fallback using the user's /users/@me/guilds list
  // This works even if the bot is NOT in the server, but only checks guild membership.
  // It cannot fetch roles, so we will mark isOfficer as false and isApplicant as true if inGuild (since we can't verify roles).
  try {
    const userGuildsUrl = `https://discord.com/api/v10/users/@me/guilds`;
    const userGuildsRes = await fetch(userGuildsUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      next: { revalidate: 0 },
    });

    if (userGuildsRes.ok) {
      const guilds = await userGuildsRes.json();
      const hasGuild = guilds.some((g: any) => g.id === GUILD_ID);
      if (hasGuild) {
        result.inGuild = true;
        // Since we cannot verify roles because the bot is not in the server,
        // we'll assume they are an applicant if they are in the guild.
        // For officer verification, unfortunately, we must have the bot in the guild to verify the role,
        // but we can check if they are the guild owner or allow fallback if needed.
        result.isApplicant = true;
        result.isOfficer = false; 
      }
    }
  } catch (err) {
    console.error("Error verifying via User guilds list:", err);
  }

  return result;
}
