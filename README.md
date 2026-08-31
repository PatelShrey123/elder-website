# ⚡ Elder Clan — Ticket Application Website

A full-stack, ticket-based clan recruitment website for the **Elder** clan (`kirka.io`), featuring **Jujutsu Kaisen / Gojo Satoru anime aesthetics**, real-time **Web Audio API synthesizer effects**, and **Discord OAuth2 role-based verification**.

---

## 🌟 Key Features

- **Gojo Satoru & Ryomen Sukuna Cutscenes**:
  - Domain Clash: **Malevolent Shrine (伏魔御廚子) vs Infinite Void (無量空処)**.
  - Gojo levitation (*"Throughout Heaven and Earth, I Alone Am The Honored One"*).
  - **200% Hollow Purple (虚式「茈」)** laser cannon animation with screen-shake and synth audio.
- **Discord OAuth2 Verification**:
  - Automatically queries `GET /users/@me/guilds/{GUILD_ID}/member` via the user's OAuth access token (`identify guilds.members.read`).
  - Protects the `/apply` route for users with the **Applicant Role** (`1501943775021371543`).
  - Protects the `/staff` command panel for users with the **Officer Role** (`1369836381647405067`).
- **Submission Rules & Rate Limiting**:
  - Maximum **2 applications per calendar month** per user.
  - Proof screenshot validation (PNG/JPG, max 5MB).
  - Screenshots stored privately and viewed via HMAC cryptographic signed URLs (5-minute expiration).
- **Dual Discord Webhooks**:
  - **Webhook #1**: Styled embed broadcast to applications channel upon new ticket creation.
  - **Webhook #2**: Decision announcements to decisions channel. Mentions the user `<@discord_id>` with their training link upon approval.
- **Officer HQ (`/staff`) & Auto-Purge**:
  - Officer inspection modal with temporary signed proof URLs.
  - Live 48-hour expiration countdown timers for decided tickets.
  - `/api/cron` cleanup route for automated 48-hour purging.

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/PatelShrey123/elder-website.git
cd elder-website
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your Discord credentials:
```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | SQLite path `file:./dev.db` (or Postgres / Supabase URL) |
| `NEXTAUTH_URL` | `http://localhost:3000` (or your production Vercel domain) |
| `NEXTAUTH_SECRET` | Random 32+ character secret string |
| `DISCORD_CLIENT_ID` | Your Discord App Client ID (`1513453348462923907`) |
| `DISCORD_CLIENT_SECRET` | Your Discord App OAuth2 Client Secret |
| `DISCORD_BOT_TOKEN` | Your Discord Bot Token (optional, for DMs) |
| `DISCORD_GUILD_ID` | Elder Discord Guild ID (`1369832704102633554`) |
| `DISCORD_OFFICER_ROLE_ID` | Officer Role ID (`1369836381647405067`) |
| `DISCORD_APPLICANT_ROLE_ID` | Applicant Role ID (`1501943775021371543`) |
| `DISCORD_WEBHOOK_URL` | Discord webhook for incoming applications |
| `DISCORD_DECISION_WEBHOOK_URL` | Discord webhook for decisions |

### 3. Generate Prisma Database & Seed Trainers
```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploying to Vercel

1. Import the repository `PatelShrey123/elder-website` in [Vercel](https://vercel.com).
2. Set the environment variables in your Vercel Project Settings.
3. In your **Discord Developer Portal** under **OAuth2 > Redirects**, add your Vercel callback URL:
   ```text
   https://your-app.vercel.app/api/auth/callback/discord
   ```
