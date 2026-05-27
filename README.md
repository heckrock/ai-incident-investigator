# AI Incident Investigator

Enterprise-grade AI-powered incident analysis dashboard built with Next.js 15, Tailwind CSS, and shadcn/ui.

## Features

- **Dark SRE dashboard** — Modern, responsive single-page interface
- **AI analysis** — OpenAI-powered structured post-incident reports
- **Six report sections** — Executive Summary, Root Cause, Timeline, Impact, Remediation, Prevention Recommendations
- **Sample incident** — Realistic SEV-1 payment API outage data
- **Jira integration** — Pull incident tickets and troubleshooting thread comments
- **Grafana integration** — Query Loki logs and Tempo traces for the incident time window

## Quick Start

```bash
cd ai-incident-investigator
npm install
cp .env.example .env.local
# Add your OPENAI_API_KEY to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for incident analysis |
| `JIRA_BASE_URL` | No | Default Jira Cloud URL (can override in UI) |
| `JIRA_EMAIL` | No | Atlassian account email |
| `JIRA_API_TOKEN` | No | Atlassian API token |
| `GRAFANA_URL` | No | Grafana instance URL |
| `GRAFANA_API_KEY` | No | Grafana service account token |

Credentials can be set server-side in `.env.local` or entered in the UI per request.

## Usage

1. Paste incident logs or click **Load example**
2. Optionally expand **Data source integrations** to enable Jira and/or Grafana
3. Click **Analyze Incident**
4. Review the structured report cards

## Deploy to Render

This repo includes a `render.yaml` blueprint for one-click deployment.

### 1. Push the code to GitHub

From the project directory:

```bash
git init
git add .
git commit -m "Initial commit: AI Incident Investigator"
gh repo create ai-incident-investigator --private --source=. --push
```

Or create a repo manually on GitHub and push:

```bash
git remote add origin https://github.com/YOUR_USER/ai-incident-investigator.git
git branch -M main
git push -u origin main
```

### 2. Create the Render service

**Option A — Blueprint (recommended)**

1. Go to [dashboard.render.com/blueprints](https://dashboard.render.com/blueprints)
2. Click **New Blueprint Instance**
3. Connect your GitHub account and select the `ai-incident-investigator` repo
4. Render reads `render.yaml` and creates the web service automatically
5. When prompted, enter `OPENAI_API_KEY` (required)
6. Click **Apply**

**Option B — Manual web service**

1. Go to [dashboard.render.com](https://dashboard.render.com) → **New +** → **Web Service**
2. Connect the GitHub repo
3. Use these settings:

| Setting | Value |
|---------|-------|
| Runtime | Node |
| Build Command | `npm install && npm run build` |
| Start Command | `npm run start` |
| Health Check Path | `/` |

### 3. Set environment variables

In Render → your service → **Environment**, add:

| Variable | Required | Notes |
|----------|----------|-------|
| `OPENAI_API_KEY` | Yes | Your OpenAI API key |
| `JIRA_BASE_URL` | No | Optional server-side default |
| `JIRA_EMAIL` | No | Optional server-side default |
| `JIRA_API_TOKEN` | No | Optional server-side default |
| `GRAFANA_URL` | No | Optional server-side default |
| `GRAFANA_API_KEY` | No | Optional server-side default |

Render sets `PORT` and `NODE_ENV=production` automatically.

### 4. Deploy

Render builds and deploys on every push to `main`. Your app will be live at:

`https://ai-incident-investigator.onrender.com` (or your custom domain)

### Render notes

- **Plan:** Node web services require a paid plan (Starter ~$7/mo). The free tier only supports static sites.
- **Cold starts:** On Starter, the service may sleep after inactivity; first request can take 30–60s.
- **AI timeouts:** Incident analysis can take 15–30 seconds. If you see 502 errors, upgrade to a plan with longer request timeouts or retry.
- **Secrets:** Never commit `.env.local`. Use Render environment variables only.

## Tech Stack

- Next.js 15 (App Router)
- React 19
- Tailwind CSS v4
- shadcn/ui (Radix primitives)
- OpenAI SDK
- Lucide icons
