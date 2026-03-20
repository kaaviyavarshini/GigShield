 EarnSure — Parametric Income Insurance for Gig Delivery Workers
Parametric income insurance for food delivery workers — built for gig workers on Zomato, Swiggy, Zepto, & Amazon.

What is our project about?

We kept coming back to the same question while reading the problem statement — who actually bears the cost when a city gets rained out?
Not the restaurant. Not Swiggy. Not the customer who orders tomorrow instead of today. It's the delivery partner sitting under a building overhang on his Activa watching his app go silent for three hours, doing the math in his head on what he's going to tell the landlord this month.
That's the gap we're trying to close. Not health insurance, not vehicle repair — just the basic income that disappears when something completely outside the worker's control makes it impossible to work.
We're calling it EarnSure.

Problem Statement:

There are roughly 15 million gig delivery workers in India right now. None of them are employees. They don't have fixed salaries, they don't accrue leave, and when something stops them from working — rain, floods, extreme heat, high pollution, a local curfew — that lost income is just gone. There's no mechanism to get it back.

The existing insurance products in the micro-insurance space cover health, accidents, or vehicle damage. Those are real problems too, but they're different problems. None of them address the scenario where a worker is physically fine, their bike is fine, but they still can't earn anything for an entire day because the city is underwater or the AQI is at 350 and being outdoors is medically dangerous.

To put numbers on it: delivery workers in metros face income swings of 20–30% month-to-month purely because of weather and environmental disruptions. That's not a personal finance problem. That's a structural gap in how we've thought about insurance for this kind of work.

The disruptions we're talking about Heavy rain and flooding, Severe AQI, Extreme heat, Sudden curfews, Platform-level outages.
In every one of these cases, the disruption is external, it's measurable from public data sources, and the worker did nothing wrong. They just got unlucky with timing. EarnSure is designed to partially compensate for that.

Examples-
**Ravi — Zomato partner, Chennai, 24**
Ravi moved from Vellore two years ago and delivers 9 to 8 most days with a break in the afternoon. On a decent day he earns ₹700–900. After fuel and EMI payments on his bike, he sends ₹8,000 home every month and the rest goes to rent and food in the city.

He has no savings buffer. When Chennai had four bad rain days in a row last October, he lost about ₹3,200 total and had to borrow from a colleague. That's who we're building for. Someone where a single bad week genuinely hurts.

Ravi doesn't want to learn how insurance works. He doesn't want to call a helpline. He wants to know that if it rains and he can't work, something shows up in his UPI. That's it.
**Arjun — Amazon Flex partner, Bangalore, 29**

Arjun does Amazon Flex deliveries on weekday mornings before his afternoon shift at a warehouse. He relies on that morning income to cover his phone EMI and daily meals. A heatwave week in April means he physically cannot do outdoor deliveries in the 11 AM to 4 PM window, cutting his daily earnings by half. He needs compensation for that reduced capacity, not just for total inability to work.

## What EarnSure does

The core idea: instead of asking "did you suffer a loss" — which requires paperwork, review, and someone deciding if they believe you — we ask "did this measurable event happen in your zone?" If yes, money moves. Automatically.
This is parametric insurance. The trigger is a number from a public data source — rainfall intensity from IMD and Open-Meteo, AQI reading from WAQI, an official curfew declaration. When that number crosses a threshold we've defined in advance, the claim fires without anyone having to do anything.
The worker gets a push notification and a WhatsApp message: "Heavy rain detected in your zone. ₹250 sent to your UPI." That's the full interaction. They didn't file anything. They didn't call anyone. They just received money.
We're not covering health, accidents, or vehicle damage. Strictly income loss from external, verifiable disruptions. That scope constraint is actually what makes parametric work here — the triggers are clean enough to automate.

## How it works end to end
**Monitoring layer** — runs continuously, checks every 5 minutes:
- Open-Meteo API for live rainfall, temperature, wind speed, and feels-like temperature by city zone
- WAQI API for live AQI readings with health classification labels across city districts
- OpenWeatherMap for 5-day hourly forecast used in advance risk alerts
- IMD and CWC as authoritative government data sources for trigger confirmation

When any feed crosses a predefined threshold, a disruption event is created in the system, timestamped, and tagged to the affected zones. The trigger event is stored permanently in Supabase with the raw data reading, the source, the confidence score, and the exact timestamp — a full audit trail.

**Zone matching** — every worker registered on EarnSure has their primary operating city saved in their profile. When a disruption event fires, it matches against all active policyholders in that city. A rainfall event in Koramangala doesn't affect workers whose registered zone is Whitefield even if they're both in Bangalore.

**Live dashboard** — the admin operations dashboard shows a real-time disruption heatmap of India, with city markers coloured red for triggered zones and blue for clear zones. Claims, fraud scores, and payout status all update live using Supabase Realtime.

**Fraud checks** — before any payout goes out, automated checks run in under 30 seconds. More on this below.

**Payout** — clean claims settle via UPI in under 2 minutes. Workers get a push notification and a WhatsApp message from the EarnSure team number the moment money moves.

## The weekly premium model

We went with weekly pricing and it wasn't just because the brief required it — it's actually the right model for this population. Monthly premiums require a lump sum that's genuinely difficult for someone earning day to day. Weekly aligns with how delivery platforms already pay out, how workers already budget, and it lets workers opt out during weeks they're travelling or not working without penalty.

The base premium is calculated individually for each worker based on three things:

**Location risk** — we maintain historical disruption frequency data by city zone using 10 years of IMD weather records. How often does that zone flood? How bad does it get during monsoon? Workers in historically low-risk zones pay less. Workers in high-risk zones like low-lying coastal areas pay more.

**Predictive weather index** — the ML pricing model pulls a 7-day forecast every Sunday evening and calculates the probability of a trigger-level event occurring in that worker's zone next week. If probability clears 60%, the premium adjusts upward. If it's going to be a clear week, they pay less. This is where AI genuinely earns its place — not just historical averages but a forward-looking weekly adjustment.

**Tenure discount** — workers who've been on the platform for 3 or more months with no fraudulent claims get a progressive discount. Rewards honest long-term users, discourages people from signing up only when rain is already forecast.

Two examples for the same worker:
Ravi, Chennai zone, February clear week, 8 months tenure: base ₹59 minus ₹7 clear forecast minus ₹8 tenure = **₹44 that week**
Same Ravi, monsoon week in October: base ₹59 plus ₹10 trigger probability plus ₹6 zone risk minus ₹8 tenure = **₹67 that week**
Across the year he's probably averaging ₹52–55 per week. Less than a movie ticket.

## The five triggers
These are what actually cause a payout to fire. Designed to be verifiable from public data sources and meaningful in terms of real income impact — there's no point triggering a claim for a 10-minute drizzle that didn't stop anyone working.

**Heavy Rainfall**
Data: Open-Meteo + IMD
Threshold: Rainfall greater than 15mm per hour sustained for 45 or more minutes
Payout: ₹75 per hour of disruption

Below 15mm, rain is uncomfortable but most workers push through — orders still come in, restaurants still operate. Above this, roads in low-lying areas start flooding, visibility drops, and platforms reduce assignments because delivery success rates tank. The 45-minute minimum filters out short intense bursts that resolve on their own.

**High AQI**
Data: WAQI API
Threshold: AQI above 300 (hazardous classification) sustained for 3 or more hours
Payout: ₹60 per hour

Above 300 AQI, the Central Pollution Control Board's own guidelines say prolonged outdoor physical activity is medically inadvisable. Three hours minimum because AQI fluctuates — we want genuine sustained hazardous periods, not a single bad sensor reading. Mainly relevant for Delhi and Hyderabad workers in November through January.

**Extreme Heat**
Data: Open-Meteo feels-like temperature
Threshold: Feels-like above 44°C between 11 AM and 4 PM, for 3 or more continuous hours in that window
Payout: ₹50 per hour

We use feels-like rather than actual temperature because humidity makes a huge difference. 40°C at 70% humidity causes heat stress at the same rate as 48°C dry heat. The lower payout rate reflects that some workers do push through heat — we're compensating for reduced capacity and health risk, not total inability to work.

**High Wind Speed**
Data: Open-Meteo
Threshold: Wind speed above 60 km/h sustained for 30 or more minutes
Payout: ₹65 per hour

Wind above this level makes two-wheeler delivery genuinely dangerous and causes platforms to reduce assignments in coastal and open areas. Relevant during cyclone approach periods and strong monsoon wind events.

**Curfew / Section 144 / Declared Bandh**
Data: Government notification with news signal cross-check
Threshold: Official government order restricting movement in the zone
Payout: ₹85 per hour — highest rate, total income loss, legally mandated

When the government declares Section 144 or an official bandh, a delivery partner legally cannot be on the road. Cleanest trigger, nothing to dispute. The high payout rate reflects that the income loss is total and completely externally imposed.

## What the claim experience looks like
Walk through from Ravi's perspective, real scenario:
It's 2:50 PM on a Wednesday in October. Ravi is somewhere in T Nagar, Chennai. It has been raining since 2 PM and his app has gone quiet. He hasn't thought about EarnSure — he's just annoyed and waiting under a building overhang.

**3:30 PM** — The monitoring service flags that rainfall in the T Nagar zone has hit 15mm per hour and has been there for 45 minutes. Disruption event created, timestamped 3:30 PM. All active policyholders in T Nagar are queued for claim initiation.
**3:30–3:31 PM** — Automated fraud checks run for Ravi
**3:31 PM** — Payout initiated. Push notification arrives:

*"Heavy rain in your zone — your coverage kicked in. ₹75 is on its way to your UPI."*

WhatsApp message from EarnSure:

*"Hi Ravi 👋 Heavy rain detected in T Nagar (16.2mm). Your EarnSure cover has activated. ₹75 is being transferred to your UPI now. Policy #ES-2026-0041. Stay safe— EarnSure Team"*

Ravi didn't do a single thing. He just got a notification and a WhatsApp.

**3:31 PM – 5:45 PM** — Rain continues. System keeps tracking. Total qualifying time: 2.5 hours. Total payout: ₹187.

**That evening** — Summary notification: "Today's rain event — 2.5 hours. ₹187 sent to UPI. Weekly policy still active."

No form. No call. No claim number to track.

## Fraud detection
The basic checks that run on every claim:

**GPS and zone consistency** — worker's registered city zone must match the triggered zone. Workers whose declared city has no history of the trigger type are flagged at onboarding.

**Claim frequency outliers** — rolling 8-week claim-to-premium ratio tracked per worker. Statistical outliers relative to their peer group in the same zone are flagged and their fraud score is elevated.

**Simultaneous claim clustering** — if an unusual number of claims fire simultaneously in a zone, significantly above the historical norm for that zone and trigger type, that's a coordination signal. Real rain events show claim arrivals spread out naturally over time. Coordinated fraud shows a spike within seconds of trigger detection.

**Fraud score badge on every claim** — the admin dashboard displays a colour-coded fraud confidence score on every claim row. Green (0.00–0.29) means low risk and auto-approve. Amber (0.30–0.59) means soft review. Red (0.60–1.00) means hard review with a human investigator. The score is visible alongside the worker name, city, trigger type, and payout amount on the insurer operations dashboard.

## Adversarial defense and anti-spoofing

We thought seriously about what differentiates a real delivery partner caught in a storm from someone trying to fake their way into a payout. The answer is that a person actually out in the rain has a dozen things happening simultaneously that a person on their couch doesn't. Our defense checks as many of those signals as possible so that faking all of them simultaneously requires actually being in the location you claim.

**Individual claim signals**

Motion fingerprint — a delivery partner riding through a flooded street has a specific motion pattern from a two-wheeler on bad roads. A person at home has near-zero or slow domestic movement. We run accelerometer data through a binary classifier trained on road-motion versus indoor-stationary patterns. GPS spoofing apps override the location signal. They don't simulate the physics of riding through rain on potholed roads.

Platform activity in the claim window — if you're actually out in a storm, your delivery app shows some activity. Someone GPS-spoofed into the storm zone from home has zero platform activity. We cross-reference this against the claim window.

Cell tower triangulation versus GPS — GPS can be faked by an app. Cell tower triangulation is determined by actual physical proximity to towers and requires hardware-level manipulation to fake. We compare network-reported location against GPS-reported location. A mismatch larger than 3km is a hard fraud signal.

Delivery history in the claimed zone — workers build a geographic footprint over time. If someone has registered T Nagar as their primary zone but their history shows 90% of completed orders in a different area, something doesn't add up.

Claim timing relative to trigger onset — real workers get caught in disruptions. Fraud ring members hear about an active trigger via messaging groups and fake their location into the zone after the fact. This creates a cluster of workers "appearing" in the zone after the trigger fired, not before. We detect this timing pattern.

**Population-level ring detection**

When a real disruption hits, workers file claims in a natural spread-out distribution over time. A fraud ring coordinated via a messaging group gets the signal at roughly the same time and fires claims within seconds of each other. We measure claim arrival rate in real time and compare against historical norms for that zone and trigger type. A spike more than 3 standard deviations above expected triggers Ring Alert Mode.
In Ring Alert Mode we run a connectivity analysis on the flagged claimants.

**How we handle flagged claims without punishing honest workers**
- Fraud score below 0.30 — auto-approve, payout in under 2 minutes, no friction
- Fraud score 0.30–0.60 — soft review, resolved in under 2 hours, worker notified with "we're checking a few things"
- Fraud score above 0.60 — hard review, human investigator, resolved in under 4 hours, worker gets ₹25 credit if claim is legitimate
- Ring Alert Mode — zone-wide pause, batch review within 4 hours, all legitimate claimants paid plus ₹50 credit for the delay

The ₹50 credit isn't charity. It's acknowledgment that our fraud system caused a real worker real inconvenience.

**Dynamic premium calculation — XGBoost regression**

The weekly premium adjustment uses an XGBoost model trained on 10 years of historical weather data from IMD public datasets, historical AQI readings from OpenAQ archives, and seasonal disruption frequency compiled from public records. The model outputs a risk score per zone per week that feeds into the premium adjustment. The alternative — using historical averages — would be fine but it wouldn't respond to a forecast bad week. The ML model gives us a forward-looking adjustment that a lookup table can't. When you type your city into the EarnSure onboarding screen and get a premium quote, that number is a live model inference, not a static lookup.

**Fraud scoring — Isolation Forest**

We use an Isolation Forest algorithm for the individual fraud scorer. It's well-suited here because we have many more normal claims than fraudulent ones, and Isolation Forest is specifically designed for that imbalance — it learns what normal looks like and flags things that are statistically isolated from that normal. The fraud confidence score displayed as a colour-coded badge on every claim in the admin dashboard is a direct output of this model.

**Trigger verification — data quality cross-check**

Before every payout, the system scores the incoming weather reading for reliability — checking sensor health, station uptime, and data recency. It then cross-checks the point observation against gridded satellite data from ERA5 reanalysis. A lightweight regression model flags outlier readings that deviate significantly from neighbouring stations, which could indicate a faulty sensor rather than a genuine weather event. If the primary IMD data is flagged as unreliable, the system automatically falls back to the satellite data source before proceeding.

**Churn prediction — logistic regression**

A model monitors weekly payment behaviour and flags workers who show early signs of lapsing — irregular payment timing, reduced app activity, or a recent streak of no-trigger weeks. When a worker is identified as at risk, the platform automatically sends a WhatsApp reminder 48 hours before their next payment is due, keeping coverage continuous for workers who would otherwise lose protection without realising it.

Why web & not mobile?

For the actual product, delivery partners already have multiple apps running. Getting someone to install a dedicated new app is a real friction point. A Progressive Web App they can access from a WhatsApp link that works on any Android phone, loads on 2G or 3G, and can be added to the home screen gets around that.

The worker-facing UI is mobile-first throughout. The admin and insurer operations dashboard is optimised for desktop, giving the operations team a full real-time view of live triggers, the India disruption heatmap, claims, fraud scores, and the live payout counter simultaneously.

## Tech stack

| Layer | What we're using | Why |
|---|---|---|
| Frontend | React 18 + TypeScript | Type-safe, component model works well for the dual dashboard |
| Styling | Tailwind CSS + shadcn/ui | Utility-first, accessible components, fast to build |
| Build tool | Vite | Fast hot reload, clean production builds |
| Routing | React Router v6 | Page navigation between worker and admin views |
| Forms | React Hook Form + Zod | Schema-validated forms, no invalid data reaches the database |
| Data fetching | TanStack Query v5 | Caching, background refresh, loading states |
| Maps | React Leaflet + Leaflet | Live disruption heatmap showing India city zones |
| Charts | Recharts | Premium history, payout timeline, fraud score trends |
| Animations | Framer Motion | City switch transitions, payout confirmation animations |
| Database | Supabase (PostgreSQL) | Managed Postgres, row-level security, real-time subscriptions |
| Auth | Supabase Auth | OTP-based mobile auth, no passwords required |
| Realtime | Supabase Realtime | Live dashboard updates when trigger events fire |
| Weather | Open-Meteo API | Free, no key needed, live rain, temperature, wind |
| AQI | WAQI API | Clean AQI score and health labels for all major Indian cities |
| Forecast | OpenWeatherMap | 5-day hourly forecast for advance risk alerts |
| Notifications | WhatsApp via Twilio | Payout notifications sent directly to worker's WhatsApp |
| Testing | Vitest + Playwright | Unit and end-to-end tests |

## How the app flows

**Worker onboarding — target under 60 seconds:**
1. Phone number → OTP via Supabase Auth
2. Select your city and primary delivery zone
3. Choose your cover (Basic / Standard / Premium)
4. Set up UPI AutoPay for weekly deduction
5. Policy active immediately

**During the week:**
- Trigger monitor checks live weather feeds every 5 minutes
- Disruption detected → zone match → automated fraud checks
- Clean claim: payout in under 2 minutes, push notification + WhatsApp sent
- Flagged claim: queued for review, worker notified with estimated timeline

**Sunday evening:**
- ML model recalculates premium for next week based on 7-day forecast
- Worker gets forecast summary + next week's premium preview
- Confirms renewal or opts out — no penalty either way

**Admin / insurer dashboard:**
- Live payout counter showing total paid out, workers covered, and active triggers right now
- India disruption heatmap with city markers coloured by trigger status
- Claims table with fraud score badges, payout amounts, and status for every claim
- Payout explainer card showing exactly what data triggered the most recent payout
- 24h rain watch and AQI monitor updating as the selected city changes
- Verified trigger events log with full audit trail

## What we're building when

**Phase 1 — Weeks 1–2 (now)**
- Problem research and persona definition
- Weekly premium model designed
- Parametric trigger logic and thresholds defined
- Fraud detection approach designed including anti-spoofing strategy
- Tech stack decided and project scaffolded
- Database schema set up in Supabase
- Admin dashboard with live weather, AQI, forecast, heatmap, and claims table
- Live trigger feed monitoring 10 Indian cities in real time
- WhatsApp payout notification on trigger fire

**Phase 2 — Weeks 3–4**
- Worker registration and onboarding flow
- Dynamic weekly premium calculator live
- Full trigger pipeline — event → zone match → fraud check → UPI payout
- Isolation Forest fraud scorer deployed
- Anti-spoofing signals integrated — motion, platform activity, cell tower cross-check
- Razorpay UPI AutoPay for weekly premium collection
- Worker dashboard — payout history, coverage status, weekly summaries

Deliverable: Executable end-to-end demo

**Phase 3 — Weeks 5–6**
- Full ML pricing model trained on IMD historical data
- Churn prediction model and automated WhatsApp retention nudges
- Hindi and Tamil language support
- Policy certificate PDF download
- Android TWA wrapper
- Pitch deck

## Why we think this holds up
The gap we're addressing isn't unsolved because it's technically hard. It's unsolved because every existing insurance product was designed for people with stable incomes, paper documentation, and the time and patience to fight with a claims department. That describes almost nobody in the gig economy.
Parametric works here for a specific reason worth spelling out: the triggers are external and publicly verifiable. Nobody needs to argue about whether it rained. Nobody needs to prove they were in the zone. Either the Open-Meteo data says it happened or it doesn't. That collapses the claims process from an adjudication problem — subjective, disputable, slow — into a logistics problem — objective, automatable, fast.
Weekly pricing isn't just a constraint we're designing around. It's genuinely the right commercial model. A worker who's having a bad month can skip a week and opt back in. No cancellation fees. No annual commitment. That's what financial products in this space need to look like if they're going to reach the people who actually need them.
There are over 15 million gig delivery workers in India. None of them have income protection against weather. The total addressable weekly premium market runs into the hundreds of crores — and it's completely untapped by traditional insurers because the individual ticket size is too small for them to bother with.
We built the infrastructure to make ₹35 per week viable at scale. That's the bet.

## Repo structure
text
gigshield/
├── client/                  # React PWA
│   └── src/
│       ├── components/
│       ├── pages/           # Worker app + admin dashboard
│       └── services/        # API client, auth helpers
├── server/                  # Express backend
│   ├── routes/              # Policy, claims, payouts, auth
│   ├── services/            # Trigger monitor, Razorpay, notifications
│   └── models/              # Postgres schema and queries
├── ml-service/              # Python FastAPI
│   ├── models/              # XGBoost premium model + Isolation Forest fraud scorer
│   ├── training/            # Training scripts, synthetic data generation
│   └── api/                 # Model endpoints
├── mocks/                   # Platform API mock, government alert mock
├── docs/                    # Architecture diagrams, API docs
└── README.md
