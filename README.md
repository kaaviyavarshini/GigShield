ParametriCover — Parametric Micro-Insurance Platform
A simple, weekly-premium insurance app built for people who can't afford big annual policies — gig workers, small farmers, and local shop owners. Instead of filing a claim and waiting weeks, payouts happen automatically when a weather event (like heavy rain or a flood) is officially recorded. No paperwork, no adjuster, no waiting.
---
What problem are we solving?
Traditional insurance asks you to pay a large premium once a year, prove your loss after a disaster, and wait months for a payout. That doesn't work for someone earning ₹700/day. ParametriCover flips this — small weekly payments, automatic payouts when a trigger fires.
---
Who is this for?
Ravi — Delivery Driver, Chennai
Ravi loses income on days with heavy rain. He pays ₹35/week for Rain Disruption Cover. If rainfall crosses 50mm in 6 hours at his nearest weather station, ₹250 drops into his UPI wallet automatically — no call needed.
Meenakshi — Farmer, Thanjavur
Meenakshi grows paddy on 1.5 acres. She pays ₹80/week during the 16-week growing season. If rainfall is less than 40% of the historical average by mid-season, she gets a partial payout. No need to prove crop damage.
Arjun — Grocery Shop Owner, Kochi
Arjun's shop sits in a flood-prone area. He pays ₹120/week. If the nearby river gauge crosses 8.2m, he gets ₹15,000 — enough to cover his inventory loss without arguing with an insurance agent.
---
How the weekly premium model works
Premiums are collected every week via UPI AutoPay. The amount is calculated based on:
How often that specific weather event has happened in the user's location over the last 10 years
The payout amount the user picks
How many weeks they want coverage
So someone in a flood-prone area pays more than someone in a low-risk zone. Simple and fair.
---
Parametric triggers — how payouts fire
There are no claims here. The system watches live weather data feeds. When a pre-agreed condition is met, the payout goes out automatically.
Cover	Trigger	Data Source
Rain Disruption	Rainfall > X mm in 6 hours	IMD / Open-Meteo
Drought	Cumulative rain < 40% of 10-year average	IMD / SRRN
Flood	River gauge level > X metres	CWC (Central Water Commission)
Cyclone	Cyclone within 100km, wind > X km/h	IMD Cyclone Track
All data comes from government sources so nobody can manipulate the trigger. If a sensor goes down, the system falls back to satellite data automatically.
---
Why Web and not a native app?
We built this as a web app (works on any phone browser, no download needed) for a few reasons:
Field agents can share a simple link — no need to install anything
Works on low-end Android phones with patchy internet
Instant updates without waiting for app store approvals
A native Android app wrapper is planned for Phase 2 once we've validated the core flow
---
Where AI/ML fits in
Premium pricing — Instead of a flat rate for everyone in a city, a model looks at historical weather data for the user's exact location and gives them a personalised quote. Someone in a low-lying flood zone pays a bit more than someone on higher ground two streets away.
Fraud detection — The app checks that the location a user registers actually matches what satellite imagery shows (e.g., a field that looks like cultivated land, not a car park). It also flags if one agent is enrolling hundreds of people with suspiciously similar details.
Trigger verification — Before releasing a payout, the system cross-checks the weather reading against a second data source to make sure it's not a sensor glitch.
Retention — If someone is about to miss their weekly payment, the app predicts it in advance and sends a reminder so they don't lose their coverage by accident.
---
Tech stack
This is a React web app. Here's what we're using and why:
React + TypeScript — The whole frontend. TypeScript keeps the code clean and catches bugs early.
Vite — Our build tool. Fast and simple.
Tailwind CSS — Styling. Write styles directly in the component without jumping between files.
shadcn/ui + Radix UI — Ready-made accessible UI components (buttons, modals, forms, etc.) that we can customise.
React Router — Handles navigation between pages.
React Hook Form + Zod — Forms and validation. Zod makes sure data is in the right shape before it hits the database.
TanStack Query — Fetches and caches data from the backend. Handles loading/error states cleanly.
React Leaflet + Leaflet — The map component where users pin their farm or property location.
Recharts — Charts for showing premium history and payout timeline on the dashboard.
Framer Motion — Smooth animations for onboarding steps and payout confirmation screens.
Supabase — Our backend. Handles the database (Postgres), user auth (OTP-based, no passwords), file storage for KYC documents, and real-time updates when a trigger fires.
Vitest + Playwright — Unit tests and end-to-end tests.
---
Running the project locally
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
cp .env.example .env   # add your Supabase keys
npm run dev
```
Environment variables you'll need:

VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

---
Development plan
Phase 1 — Get the core flow working: sign up, pick a cover, set up weekly payment, see your active policy.
Phase 2 — Add the ML pricing model, fraud detection, and the agent portal for field-assisted onboarding.
Phase 3 — Multi-language support, IRDAI sandbox filing, and the Android app wrapper.
---
> This project is in active development. Insurance products require regulatory approval before going live.
> **Disclaimer:** ParametriCover is currently in development and operating under IRDAI sandbox provisions. Insurance products are subject to regulatory approval before full commercial launch.
