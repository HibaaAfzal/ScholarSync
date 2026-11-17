# ScholarSync — Local Setup Guide (VS Code)

ScholarSync is a fullstack Next.js 16 + TypeScript + Prisma (SQLite) + Tailwind CSS + shadcn/ui web app with a GLM-powered AI chatbot. This guide walks you through running it on your own computer in VS Code.

---

## 1. Prerequisites

Install these once on your computer:

| Tool | Version | Why | Download |
|------|---------|-----|----------|
| **Node.js** | 18.x or newer (20.x recommended) | Runs the Next.js dev server | https://nodejs.org/ |
| **Bun** (optional, faster) | latest | Alternative runtime / package manager | https://bun.sh/ |
| **Git** | any recent | Optional, for version control | https://git-scm.com/ |
| **VS Code** | latest | Code editor | https://code.visualstudio.com/ |

Verify in a terminal:
```bash
node --version    # should print v18.x or v20.x
npm --version
```

> If you install **Bun**, replace every `npm` below with `bun` and every `npx` with `bunx`. Bun is faster and the sandbox this project was built in uses it.

---

## 2. Get the project files

Download **`ScholarSync.zip`** from the chat (same place you got this README) and unzip it into a clean folder, e.g.:

```
C:\Projects\ScholarSync\        (Windows)
~/Projects/ScholarSync/         (macOS / Linux)
```

After unzipping, the folder should contain:
```
ScholarSync/
├── package.json
├── prisma/schema.prisma
├── .env
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── components.json
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── api/
│   │       ├── auth/{login,logout,me}/route.ts
│   │       ├── scholarships/...
│   │       ├── teachers/route.ts
│   │       ├── messages/route.ts
│   │       └── chat/route.ts
│   ├── components/
│   │   ├── ui/          (shadcn components)
│   │   └── scholarsync/ (AppShell, Mascot, LoginScreen, etc.)
│   └── lib/
│       ├── auth.ts
│       ├── db.ts
│       ├── types.ts
│       └── utils.ts
├── scripts/
│   └── seed.ts
└── public/
```

---

## 3. Open the project in VS Code

1. Open VS Code.
2. **File → Open Folder…** (Windows/Linux) or **File → Open…** (macOS) and select the unzipped `ScholarSync` folder.
3. Open the integrated terminal: **Terminal → New Terminal** (or press `` Ctrl+` ``).

All commands below run inside this VS Code terminal.

> Recommended VS Code extensions: **ESLint**, **Tailwind CSS IntelliSense**, **PostCSS Language Support**, **Prisma**.

---

## 4. Install dependencies

In the VS Code terminal:

```bash
npm install
```

This installs Next.js, React, Prisma, Tailwind, shadcn/ui, z-ai-web-dev-sdk, framer-motion, lucide-react and all other packages from `package.json`. It may take 1–3 minutes.

> If you get peer-dependency errors, run: `npm install --legacy-peer-deps`

---

## 5. Set up the database

The project uses **SQLite** via Prisma. The database file (`dev.db`) is created locally — no external database server needed.

### 5a. Check your `.env` file

Open `.env` in VS Code. It should look like:

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="any-random-string-here-for-dev"
```

> The version inside the zip uses a sandbox path — replace it with the relative path above so it works on your machine.

The `AUTH_SECRET` is used to sign login session cookies. For a real deployment, use a long random string.

### 5b. Push the Prisma schema and generate the client

```bash
npx prisma db push --accept-data-loss
```

This creates the SQLite database file with all tables (User, Scholarship, Message, UserScholarshipStatus).

### 5c. Seed the demo data

```bash
npx tsx scripts/seed.ts
```

> If `tsx` is not installed: `npm install -D tsx`

This creates 1 admin, 2 students, 3 teachers, and 12 sample scholarships. After seeding you will see the demo credentials printed in the terminal.

---

## 6. Run the dev server

```bash
npm run dev
```

You should see something like:

```
▲ Next.js 16.x
- Local:   http://localhost:3000
✓ Ready in 1200ms
```

Open **http://localhost:3000** in your browser.

> In VS Code you can also use the **Run → Start Debugging** menu after `npm run dev` is running if you want breakpoints.

---

## 7. Log in with demo credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@scholarsync.edu` | `admin123` |
| **Student** | `hiba@scholarsync.edu` | `student123` |
| **Student** | `bisma@scholarsync.edu` | `student123` |
| **Teacher** | `aleena@hitms.edu.pk` | `teacher123` |
| **Teacher** | `khan@hitms.edu.pk` | `teacher123` |
| **Teacher** | `rashid@hitms.edu.pk` | `teacher123` |

On the login page, click a "Quick demo login" card to auto-fill the form.

---

## 8. About the AI Chatbot (ScholarBot)

The AI chat widget uses the **`z-ai-web-dev-sdk`** package which calls Z.ai's GLM model. Behavior on your local machine depends on how the SDK is configured:

- **If the SDK works as-is on your machine** (it may already handle auth internally), the chatbot will respond normally.
- **If you see errors** like `401 Unauthorized` or `API key required` when sending a chat message:
  1. Sign up for a Z.ai API key at https://z.ai/ (or https://chat.z.ai/)
  2. Create a `.env.local` file in the project root with: `ZAI_API_KEY=your-key-here`
  3. Restart `npm run dev`

If you do not have a Z.ai API key, the chat widget will still open and the `/api/chat` route has a built-in fallback message so it never crashes — it just tells the user to try again later.

### Replace with OpenAI / another LLM (optional)

Open `src/app/api/chat/route.ts` and replace the body of the `POST` function with any LLM client (OpenAI, Anthropic, Ollama, etc.). The rest of the app stays the same.

---

## 9. Common issues & fixes

| Problem | Fix |
|---------|-----|
| `prisma: command not found` | Run `npx prisma db push` instead of `prisma db push` |
| `Cannot find module '@prisma/client'` | Run `npx prisma generate` |
| Blank page at `localhost:3000` | Check the terminal for compile errors; check `.env` exists |
| Login fails with "Email ya password ghalat hai" | You probably skipped seeding — re-run `npx tsx scripts/seed.ts` |
| Port 3000 already in use | Run `npm run dev -- -p 3001` then open `http://localhost:3001` |
| Tailwind styles missing | Stop the server, delete `.next/` folder, restart `npm run dev` |
| Chatbot always returns the fallback message | See section 8 above — you need a Z.ai API key |

---

## 10. Useful npm scripts

```bash
npm run dev        # start dev server (http://localhost:3000)
npm run build      # production build
npm run start      # run the production build
npm run lint       # ESLint check
npm run db:push    # apply schema changes to SQLite
npm run db:reset   # wipe DB and re-apply schema (then re-seed)
```

---

## 11. Next steps / customization

- **Add more scholarships**: log in as admin → Admin Dashboard → fill the form.
- **Add more teachers**: directly insert into the DB via a Prisma script, or extend the admin dashboard with a teacher form.
- **Enable student signup**: build a `/api/auth/register` route that creates a `User` with role `STUDENT`.
- **Email real teachers**: integrate Resend / Nodemailer in the `/api/messages` POST handler.
- **Production deploy**: deploy to Vercel (https://vercel.com/) — set `DATABASE_URL` and `AUTH_SECRET` as environment variables. Switch SQLite to Postgres in `prisma/schema.prisma` for production.

---

Built for **HITMS — Software Engineering CCP** project.
ScholarSync team: Hiba Afzal (24BSSW084) & Bisma Ellahi (24BSSW058). Instructor: Miss Aleena.
