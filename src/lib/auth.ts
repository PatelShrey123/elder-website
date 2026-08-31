import { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { checkGuildMembershipAndRoles } from "./discord";

const cleanEnv = (val?: string) => (val || "").replace(/^["']|["']$/g, "").trim();

const clientId = cleanEnv(process.env.DISCORD_CLIENT_ID);
const clientSecret = cleanEnv(process.env.DISCORD_CLIENT_SECRET);
const nextAuthSecret = cleanEnv(process.env.NEXTAUTH_SECRET) || "elder_clan_default_secret_key_849204810283";

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: clientId || "1513453348462923907",
      clientSecret: clientSecret,
      authorization: {
        params: {
          scope: "identify guilds.members.read",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, account, user }) {
      try {
        if (account) {
          token.accessToken = account.access_token;
          token.userId = account.providerAccountId;
        }

        if (user) {
          token.name = user.name;
          token.picture = user.image;
        }
        
        if (token.accessToken && token.userId) {
          try {
            const verifyInfo = await checkGuildMembershipAndRoles(
              token.accessToken as string,
              token.userId as string
            );
            token.inGuild = verifyInfo.inGuild;
            token.isApplicant = verifyInfo.isApplicant;
            token.isOfficer = verifyInfo.isOfficer;
          } catch (e) {
            console.error("Error in NextAuth JWT guild verification:", e);
            token.inGuild = false;
            token.isApplicant = false;
            token.isOfficer = false;
          }
        }
      } catch (err) {
        console.error("JWT callback general error:", err);
      }
      return token;
    },
    async session({ session, token }) {
      try {
        if (session.user) {
          (session.user as any).id = token.userId || token.sub;
          (session.user as any).accessToken = token.accessToken;
          (session.user as any).inGuild = Boolean(token.inGuild);
          (session.user as any).isApplicant = Boolean(token.isApplicant);
          (session.user as any).isOfficer = Boolean(token.isOfficer);
        }
      } catch (err) {
        console.error("Session callback error:", err);
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  secret: nextAuthSecret,
  debug: true,
};
