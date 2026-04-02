# Parametric income insurance for food delivery workers — built for Guidewire DEVTrails 2026

**Persona:** Food delivery partners (Zomato / Swiggy) Phase 1 submission — March 2026

---

## What's this about
We kept coming back to the same question while reading the problem statement — who actually bears the cost when a city gets rained out?

Not the restaurant. Not Swiggy. Not the customer who orders tomorrow instead of today. It's the delivery partner sitting under a bridge on his Activa watching his app go silent for three hours, doing the math in his head on what he's going to tell the landlord this month.

That's the gap we're trying to close. Not health insurance, not vehicle repair — just the basic income that disappears when something completely outside the worker's control makes it impossible to work.

We're calling it **GigShield**.

---

## Table of Contents
- [The actual problem](#the-actual-problem)
- [Who we're building for](#who-were-building-for)
- [What GigShield does](#what-gigshield-does)
- [How it works end to end](#how-it-works-end-to-end)
- [The weekly premium model](#the-weekly-premium-model)
- [The five triggers](#the-five-triggers)
- [What the claim experience looks like](#what-the-claim-experience-looks-like)
- [Fraud detection](#fraud-detection)
- [Adversarial Defense & Anti-Spoofing Strategy](#adversarial-defense--anti-spoofing-strategy)
- [Where AI and ML actually fit in](#where-ai-and-ml-actually-fit-in)
- [Why web, not mobile](#why-web-not-mobile)
- [Tech stack](#tech-stack)
- [How the app flows](#how-the-app-flows)
- [What we're building when](#what-were-building-when)
- [Why we think this holds up](#why-we-think-this-holds-up)
- [Repo structure](#repo-structure)

---

## The actual problem
There are roughly 5 million food delivery workers in India right now. None of them are employees. They don't have fixed salaries, they don't accrue leave, and when something stops them from working — rain, floods, a local strike, a platform outage — that lost income is just gone. There's no mechanism to get it back.

The existing insurance products in the micro-insurance space all cover health, accidents, or vehicle damage. Those are real problems too, but they're different problems. None of them address the scenario where a worker is physically fine, their bike is fine, but they still can't earn anything for an entire day because the city is underwater or the AQI is at 350 and being outdoors is medically dangerous.

To put numbers on it: delivery workers in metros face income swings of 20–30% month-to-month purely because of weather and environmental disruptions. That's not a personal finance problem. That's a structural gap in how we've thought about insurance for this kind of work.

The disruptions we're talking about:

- **Heavy rain and flooding** — roads close, restaurants stop accepting, the platform quietly stops assigning orders in affected zones
- **Severe AQI** — Delhi in November, AQI above 300, working outdoors is a health hazard
- **Extreme heat** — anything above 44°C feels-like in the peak afternoon hours
- **Sudden curfews or bandhs** — the worker has no warning and zero recourse
- **Platform-level outages** — the app just stops assigning orders, not because of weather, because of a server issue, and the worker still loses the hours

In every one of these cases, the disruption is external, it's measurable from public data sources, and the worker did nothing wrong. They just got unlucky with timing. GigShield is designed to partially compensate for that.

---

## Who we're building for

### Arjun — Swiggy partner, Bengaluru, 26
Arjun's been on the platform for about 22 months. He moved from Davangere and works 9 to 8 most days — a few hours in the morning, break in the afternoon, then the dinner rush. On a decent day he earns ₹700–900. After fuel and loan payments on his Activa (₹4,200/month), he's sending ₹8,000 home every month and the rest goes to rent and food.

He has no savings buffer. When Bengaluru had four bad rain days in a row last September, he lost about ₹2,800 total and had to borrow ₹1,500 from a colleague. That's who we're building for. Someone who a single bad week genuinely hurts.

Arjun doesn't want to learn how insurance works. He doesn't want to call a helpline. He wants to know that if it rains and he can't work, something shows up in his UPI. That's it.

### Fatima — Swiggy partner, Hyderabad, 31
Fatima works deliveries evenings and weekends alongside her job at a salon. Around 20–25 hours a week, bringing in ₹8,000–10,000/month from the platform. That money mostly goes toward her daughter's school fees.

Her situation is different from Arjun's in one important way — she's part-time, so each disruption hits a larger percentage of her delivery income even if the absolute number is smaller. A bad monsoon weekend can be 30% of her monthly delivery earnings gone. She also wouldn't describe herself as someone who's comfortable with financial products, which is why the zero-interaction claim experience matters a lot for this persona.

---

## What GigShield does
The core idea: instead of asking "did you suffer a loss" (which requires paperwork, review, and someone deciding if they believe you), we ask "did this measurable event happen in your zone?" If yes, money moves. Automatically.

This is parametric insurance. The trigger is a number from a public data source — rainfall intensity, AQI reading, an official curfew declaration. When that number crosses a threshold we've defined in advance, the claim fires without anyone having to do anything.

The worker gets a push notification: "Heavy rain detected in your zone. ₹75 sent to your UPI." That's the full interaction. They didn't file anything. They didn't call anyone. They just received money.

We're not covering health, accidents, or vehicle damage. Strictly income loss from external, verifiable disruptions. That scope constraint is actually what makes parametric work here — the triggers are clean enough to automate.

---

## How it works end to end
**Monitoring layer** — runs continuously, checks every 5 minutes:
- OpenWeatherMap API for rainfall intensity and temperature by pin-code zone
- OpenAQ / WAQI for AQI readings across city districts
- Simulated government alert feed for curfews and Section 144 orders
- Mock Swiggy/Zomato platform health API for delivery assignment failure rates

When any feed crosses a predefined threshold, a disruption event is created in the system, timestamped, and tagged to the affected zones.

**Zone matching** — every worker registered on GigShield has 2–3 primary operating zones saved in their profile. When a disruption event fires, we match it against all active policyholders in that zone. A rainfall event in Koramangala doesn't affect workers whose registered zone is Whitefield, even if they're both in Bengaluru.

**Fraud checks** — before any payout goes out, a set of automated checks run in under 30 seconds. More on this in the fraud section below, and in the anti-spoofing section added in response to the Phase 1 market crash scenario.

**Payout** — clean claims settle via UPI in under 2 minutes. Workers watch the status update in real time in the app.

---

## The weekly premium model
We went with weekly pricing and it wasn't just because the brief required it — it's actually the right model for this population. Monthly premiums require a lump sum that's genuinely difficult for someone earning day-to-day. Weekly aligns with how delivery platforms already pay out, how workers already budget, and it lets workers opt out during weeks they're travelling or not working without penalty.

Three tiers:

| Tier | Weekly premium | Max payout per event | Max events per week |
|---|---|---|---|
| Basic | ₹39 | ₹300 | 1 |
| Standard | ₹59 | ₹600 | 2 |
| Premium | ₹89 | ₹1,000 | 3 |

Most workers will land on Standard. It covers the most common scenario — one major disruption per week — without being expensive.

The base premium isn't fixed. Every Sunday evening before the new week starts, we recalculate based on three factors:

1. **Zone risk score** — we maintain historical disruption frequency data by zone. How often does Dharavi flood? How bad does Andheri East get during monsoon? Workers in historically low-risk zones pay up to ₹15 less. Workers in high-risk zones pay at or slightly above the base rate.
2. **Predictive weather index** — the ML model pulls a 7-day forecast on Sunday evening and runs it through a probability calculation: what's the likelihood of a trigger-level event occurring in this worker's zone next week? If the probability clears 60%, the premium adjusts upward. If it's going to be a clear week in February, they pay less. This is the part where AI genuinely earns its place — not just historical data but a forward-looking adjustment.
3. **Tenure discount** — workers who've been on the platform for 3+ months with no fraudulent claims get a progressive discount, up to ₹8/week after 6 months. Rewards honest long-term users, discourages people from signing up only when rain is forecast.

Two examples, same worker:
- Arjun, Standard tier, Koramangala zone, February clear week, 22 months tenure: ₹59 − ₹4 (zone) − ₹7 (clear forecast) − ₹8 (tenure) = **₹40 that week**
- Same Arjun, monsoon week in August: ₹59 + ₹6 (monsoon zone risk) + ₹10 (>60% trigger probability) − ₹8 (tenure) = **₹67 that week**

Across the year he's probably averaging ₹52–55/week. Less than a movie ticket.

---

## The five triggers
These are what actually cause a claim to fire. We designed them to be both verifiable from public data sources and actually meaningful in terms of income impact — there's no point triggering a claim for a 10-minute drizzle that didn't stop anyone from working.

### Heavy rainfall
- **Data**: OpenWeatherMap API
- **Threshold**: >15mm/hour sustained for 45+ minutes
- **Payout rate**: ₹75/hour of disruption
- **Why 15mm?** Below this, rain is uncomfortable but most workers push through — orders still come in, restaurants still operate. Above this, roads in low-lying areas start flooding, visibility drops, and platforms reduce order assignments because delivery success rates tank. 15mm is roughly the point where working becomes both physically difficult and financially pointless because the orders aren't coming anyway.
- **Why 45 minutes minimum?** Indian monsoons throw out short intense bursts all the time. A 15-minute downpour resolves on its own and doesn't cause meaningful income loss. 45 minutes of sustained heavy rain is a different situation — that's when workers give up and wait it out.

### AQI spike
- **Data**: OpenAQ / WAQI API
- **Threshold**: AQI >300 (hazardous classification), sustained for 3+ hours
- **Payout rate**: ₹60/hour
- Above 300 AQI, the Central Pollution Control Board's own guidelines say prolonged outdoor physical activity is medically inadvisable. Three hours minimum because AQI fluctuates — we want to catch genuine sustained hazardous periods, not a single bad sensor reading. Mainly relevant for Delhi/NCR workers in November–January.

### Extreme heat
- **Data**: OpenWeatherMap feels-like temperature
- **Threshold**: Feels-like >44°C between 11 AM and 4 PM, for 3+ continuous hours in that window
- **Payout rate**: ₹50/hour (partial — workers may still work but at reduced capacity)
- We use feels-like rather than actual temperature because humidity makes a huge difference. 40°C at 70% humidity feels like 50°C and causes heat stress at the same rate. The lower payout rate reflects that some workers do still push through heat — we're compensating for reduced capacity and risk, not total inability to work.

### Platform downtime
- **Data**: Simulated platform health API (mocked for prototype)
- **Threshold**: Order assignment failure rate >80% in a zone for 30+ continuous minutes
- **Verification**: Worker must have been logged in as "online" during the outage
- **Payout rate**: ₹80/hour
- This one is different from the others because the disruption is created by the platform itself. Worker is logged in, ready to work, earning nothing because the app isn't assigning orders. That's the clearest income loss case — they did everything right. In a real deployment this needs a proper API partnership with Swiggy/Zomato. For the prototype we simulate platform health data.

### Curfew / Section 144 / declared bandh
- **Data**: Government notification mock + news signal cross-check
- **Threshold**: Official government order restricting movement in the zone
- **Payout rate**: ₹85/hour (highest rate — total income loss, legally mandated)
- When the government declares Section 144 or an official bandh, a delivery partner legally cannot be on the road. Cleanest trigger, nothing to dispute. The high payout rate reflects that the income loss is total and completely externally imposed.

---

## What the claim experience looks like
Walk through from Arjun's perspective, real scenario:

It's 2:50 PM on a Wednesday in July. Arjun is somewhere in Koramangala, it's been raining since 2 PM and his app has gone quiet. He hasn't thought about GigShield — he's just annoyed and waiting under a building overhang.

**3:30 PM** — Our monitoring service flags that rainfall in the Koramangala zone has hit 15mm/hour and has been there for 45 minutes. Disruption event created, timestamped 3:30 PM. All active Standard and Premium policyholders in Koramangala are queued for claim initiation.

**3:30–3:31 PM** — Automated checks run for Arjun:
- GPS puts him in Koramangala ✓
- Platform activity shows he was online at 2:45 PM ✓
- Last claim was 3 weeks ago ✓
- No unusual spike of simultaneous claims in the zone ✓
- Motion data shows stationary-but-road-consistent vibration, not indoor-flat ✓
All clear. Claim auto-approved.

**3:31 PM** — Payout initiated. Push notification:
*"Heavy rain in your zone — your coverage kicked in. ₹75 is on its way to your UPI."*

Arjun didn't do a single thing. He just got a notification.

**3:31 PM – 5:45 PM** — Rain continues. System keeps tracking. Total qualifying time: 2.5 hours. Total payout: ₹187.

**That evening** — Summary notification: *"Today's rain event — 2.5 hours. ₹187 sent to UPI. Weekly policy still active."*

That's it. One notification in the afternoon. Money in his account. No form, no call, no claim number to track.

### What happens when a claim gets flagged
Flagged claims get a different notification — worded so it doesn't feel like an accusation:
*"Weather event detected in your zone. We're checking a few things before processing — usually takes under 2 hours. Your coverage is active."*

No demands for proof. No call to make. The review happens on our side. If the claim is legitimate (which most soft-flagged claims will be), it pays out exactly like a normal claim, just delayed. Workers who get repeatedly flagged and repeatedly cleared are not penalized — the system accumulates history about their genuine patterns and adjusts.

---

## Fraud detection
The basic checks that run on every claim:
- **GPS consistency** — worker's last platform-reported location should match the triggered zone. Sudden impossible location jumps get flagged.
- **Zone history vs registration** — workers who claim to operate in a high-disruption zone but have no actual delivery history there get flagged at onboarding. Real workers work where they say they work.
- **Claim frequency outliers** — rolling 8-week claim-to-premium ratio tracked per worker. Statistical outliers relative to their peer group in the same zone get flagged and their premium adjusts on renewal.
- **Simultaneous claim clustering** — if an unusual number of claims fire simultaneously in a zone (significantly above the historical norm), that's a coordination signal. Real rain events show claim arrivals spread out. Coordinated fraud shows a spike within seconds of trigger detection.

---

## Adversarial Defense & Anti-Spoofing Strategy
**Why this section exists:** During Phase 1, we received a threat update from the competition organizers describing a confirmed attack — a 500-person syndicate using GPS spoofing apps to fake their location into active weather-alert zones, draining a competing platform's liquidity pool. We reviewed our architecture against this specific attack and updated accordingly.

The honest realization when we read that threat report: a system that only checks GPS coordinates isn't a fraud detection system. It's a payout system with a single lock on the front door. Anyone with a free spoofing app from the Play Store can walk right through it.

So we thought about what actually differentiates a real delivery partner caught in a storm from someone sitting at home running a spoofing app. The answer is that spoofing fakes one signal — location — but it can't fake an entire behavioral profile. A person actually out in the rain has a dozen things happening simultaneously that a person on their couch doesn't. Our defense is to check as many of those things as possible.

### 1. How we tell apart a real stranded worker from a spoofer
We run six independent signals at claim time. No single one is a verdict — each contributes to a confidence score. The idea is that it becomes increasingly hard to fake all six simultaneously without actually being in the location you claim.

**Accelerometer / motion fingerprint**
A delivery partner riding through a flooded street has a specific motion pattern — the irregular vibration of a two-wheeler on bad roads, stops and starts at traffic lights, the occasional pothole. A person on their couch has near-zero motion or slow domestic movement patterns.
We request accelerometer access during onboarding (framed honestly as "helps confirm you're on the road when a claim fires"). We run it through a binary classifier trained on road-motion vs indoor-stationary patterns. GPS spoofing apps override the location signal. They don't simulate the physics of riding through rain on potholed roads.

**Platform activity in the claim window**
If you're actually out in a storm, your platform app is showing some activity — an order accepted, navigation running, a delivery attempted or cancelled. Any of this shows engagement with the delivery system.
Someone at home, GPS-spoofed into the storm zone, has zero platform activity. No orders. No navigation. Nothing. We cross-reference platform API data against the claim window. Silence during a claimed disruption is a strong fraud signal.

**Cell tower triangulation vs GPS**
GPS can be faked by an app. Cell tower triangulation — your phone's location estimated from which towers it's connected to — is determined by actual physical proximity to towers and requires hardware-level manipulation to fake. That's a much higher bar than installing a spoofing app.
We pull the network-reported location (coarser than GPS, typically ±1–3 km accuracy) and compare it to the GPS-reported location. For a real worker in Koramangala, these should roughly agree. If the GPS says Koramangala but the cell tower data places the device in Whitefield, 12 km away, that's not noise. That's a spoofer failing to fake the hardware layer.

**Delivery history in the claimed zone**
Workers build up a geographic footprint over time — their completed deliveries cluster around their real operating areas. If someone has registered Dharavi as their primary zone but their delivery history shows 90% of completed orders in Bandra over 6 months, something doesn't add up.
We check for any completed deliveries in the claimed zone in the 48 hours before the disruption. A worker with no delivery history in their claimed zone is flagged.

**Claim timing relative to trigger onset**
Real workers get caught in disruptions — they were already out when conditions deteriorated. Fraud ring members, coordinated via Telegram, hear about an active trigger and then fake their location into the zone after the fact. This creates a pattern: a cluster of workers "appearing" in the zone after the trigger fired, not before. Legitimate users were already there when it crossed the threshold.

**IP address and device consistency**
GPS spoofing often involves VPN or proxy software running alongside the location faker, creating an IP-location mismatch. And if a group of people are running this scheme together from the same flat, multiple devices on the same home network create a shared IP cluster that's a hard fraud signal.

### 2. What data we use to catch a coordinated ring specifically
Individual fraud is one problem. A 500-person syndicate is a different problem — you can't just check individuals, you have to look at the population of claims.

**Temporal clustering**
When a real disruption hits, workers file claims in a natural spread-out distribution over time — some were already in the zone, some moved into it, some notice the notification later. Arrival times are organic and staggered.
A fraud ring coordinated via Telegram gets the signal at roughly the same time and fires claims within seconds of each other. We measure claim arrival rate in real time and compare against the historical normal for that zone and trigger type. If we see a spike more than 3 standard deviations above expected, that's Ring Alert Mode.

**Social graph connectivity**
Fraud rings are social structures. The people in a Telegram group didn't find each other randomly — they referred each other to the platform, they work in overlapping zones, and they've probably tested the system together before scaling up. GigShield tracks referral relationships and claim co-occurrence (workers who have both filed during the same events repeatedly).
When Ring Alert Mode triggers, we run a connectivity analysis on the flagged claimants. If a large portion of them are directly connected — referred by the same few people, concentrated in a tight sub-zone, claiming together across multiple events — that's coordination, not coincidence. This doesn't auto-reject anyone, but it tells us exactly which cluster to investigate first.

**Zone claim rate vs disruption severity**
If a weather event is rated "moderate" by our data sources (barely crossed the threshold, lasted 50 minutes) but the claim rate in the affected zone is 80% of all registered workers — something is off. Claim rates should be proportional to disruption severity. A mismatch between what the weather data says happened and how many people are claiming it happened is itself a population-level fraud signal.

### 3. How we handle flagged claims without punishing honest workers
This is where most fraud systems fail — they get so focused on stopping bad actors that they treat everyone like a suspect. For a product promising "instant payout when something goes wrong," a wrongly delayed or rejected claim is a fundamental product failure.

Our rule going in: the system never accuses a worker. It only asks for time.

**Tier 1 — Auto-approve (fraud score below 0.30)**
Estimated 85–90% of claims in steady state. All six signals look clean. Payout fires in under 2 minutes. Notification: *"Heavy rain in your zone — ₹75 sent to your UPI."* No friction.

**Tier 2 — Soft review (fraud score 0.30–0.60)**
One or two signals are ambiguous — maybe motion data was flat because the worker was sheltering and genuinely not moving, or platform activity was low because the storm had already dried up all the orders. These are probably legitimate claims that we couldn't verify cleanly.
Notification: *"Weather event in your zone — we're checking a few things before processing. Usually under 2 hours. Your coverage is active."*
We don't ask them to do anything. No photos, no screenshots, no calls. Review happens on our side. Most Tier 2 cases get approved. Workers who are repeatedly flagged in Tier 2 and repeatedly cleared are not penalized — their profile improves as we accumulate real history.

**Tier 3 — Hard review (fraud score above 0.60)**
Multiple strong red flags — GPS/tower mismatch, zero platform activity, no delivery history in the claimed zone, suspicious timing. A human reviewer on the insurer dashboard investigates within 4 hours.
Notification: *"We're reviewing your claim before processing — our team will update you within 4 hours."*
If cleared: paid immediately plus ₹25 for the inconvenience. If fraud confirmed: claim rejected, fraud score permanently elevated, repeated offenses lead to policy termination.

**What happens during a Ring Alert**
When population-level clustering detects a coordinated spike, we pause auto-payouts for the entire affected zone — including workers who are completely legitimate. This is the hardest UX situation we face because honest people get caught in it.

Our protocol when Ring Alert fires:
1. Immediate notification to all affected workers: *"We've noticed unusual claim activity in your zone and are reviewing together. Your coverage is active."*
2. Guaranteed resolution within 4 hours
3. All legitimate claims paid once cleared, plus ₹50 added for the delay
4. Follow-up when resolved: *"Your claim has been reviewed and approved. ₹X + ₹50 credit sent to your UPI."*

The ₹50 credit isn't charity. It's acknowledgment that our fraud system caused a real worker real inconvenience. We think that's the right way to build trust with people who have every reason to be skeptical of a financial product.

**Claim flow reference:**
```text
Claim fires
    |
    v
Six signals verified in parallel (<30 seconds)
    |
    v
Individual fraud score calculated (0 to 1)
    |
    +-- below 0.30 -----> Auto-approve, payout <2 min
    |
    +-- 0.30 to 0.60 ---> Soft review, resolve <2 hours
    |                     +₹25 credit if delayed
    |
    +-- above 0.60 -----> Hard review, human investigator
                          resolve <4 hours, +₹25 credit if legit

Parallel → Population-level ring detection
    |
    Claim arrival rate >3 std dev above zone norm?
    |
    +-- No  --> Individual scoring continues normally
    |
    +-- Yes --> Ring Alert Mode
                Zone-wide pause
                Social graph analysis on flagged cluster
                Batch review within 4 hours
                All legitimate claimants paid + ₹50 credit
```

---

## Where AI and ML actually fit in
We want to be honest here — we're not using AI/ML everywhere because it sounds good on paper. We're using it in three places where it genuinely adds something over simple rules.

**Dynamic premium calculation — XGBoost regression**
The weekly premium adjustment uses an XGBoost model trained on 3 years of historical weather data (IMD public datasets), historical AQI readings from OpenAQ archives, and historical disruption frequency compiled from public records. We're generating synthetic worker earnings data for training since real platform data isn't accessible.
The model outputs a risk score per zone per week that feeds into the premium adjustment. The alternative — just using historical averages — would be fine, but it wouldn't respond to a forecast bad week. The ML model gives us a forward-looking adjustment that a lookup table can't.

**Fraud scoring — Isolation Forest**
We're using an Isolation Forest algorithm for the individual fraud scorer. It's well-suited here because we have many more normal claims than fraudulent ones, and Isolation Forest is specifically designed for that imbalance — it learns what "normal" looks like and flags things that are statistically isolated from that normal. We train it on synthetic claim data covering both legitimate usage and the fraud vectors described above. In production it'd retrain monthly as real data accumulates.

**Conversational onboarding — Claude API**
Rather than making workers fill out an 8-field form, onboarding is a short conversation:
*"Which platform do you deliver for?"* -> *"swiggy"*
*"Which areas do you mostly work in?"* -> *"koramangala, hsr, sometimes jayanagar"*

The Claude API extracts structured data (platform, zones, working hours, language preference) from this conversation and builds the worker profile automatically. Faster than a form, and it works in Hindi, Kannada, Tamil, and Telugu without us having to build separate language models — which matters for actually reaching the workers we're trying to help.

---

## Why web, not mobile
Two reasons and we thought about it seriously.

**For the hackathon**: a web app is easier to judge. Judges can open a link. No APKs, no TestFlight, no device compatibility issues.

**For the actual product**: delivery partners already have multiple apps running. Getting someone to install a dedicated new app is a real friction point. A Progressive Web App they can add to their home screen from a link — that works offline for core functions like checking coverage status and viewing payout history — gets around that. One codebase. Works on any Android. Looks and behaves like a native app.

The UI is mobile-first throughout — large touch targets, high contrast, readable in direct sunlight, usable one-handed while waiting for rain to stop.

---

## Tech stack
| Layer | What we're using | Why |
|---|---|---|
| **Frontend** | React 18 + Tailwind CSS | Component model works well for the dual dashboard, fast to build |
| **Backend API** | Node.js + Express | JavaScript across the stack, straightforward to maintain |
| **Database** | PostgreSQL | Insurance records are structured and relational |
| **ML service** | Python + FastAPI + XGBoost + scikit-learn | Separate microservice so the model updates independently |
| **AI / onboarding**| Claude API (claude-sonnet-4-6) | Conversational onboarding, multilingual support |
| **Weather** | OpenWeatherMap API (free tier) | Covers all major Indian metros, reliable |
| **AQI** | OpenAQ + WAQI | Free, granular, good India coverage |
| **Platform mock** | Custom Node.js mock service | Simulates Swiggy/Zomato health API for prototype |
| **Payments** | Razorpay test mode | Realistic UPI payout simulation |
| **Auth** | Firebase Auth | Phone OTP is the right auth method for this user base |
| **Hosting** | Vercel + Railway | Free tiers, fast deploys, enough for the prototype |

---

## How the app flows
**Worker onboarding — target under 3 minutes:**
1. Phone number → OTP via Firebase
2. Conversational setup via Claude API
   - Platform (Swiggy / Zomato / both)
   - Primary zones (2–3 areas)
   - Typical working hours
   - UPI ID for payouts
3. AI builds risk profile → premium quoted
4. Worker picks tier (Basic / Standard / Premium)
5. Pays first week via Razorpay
6. Policy active from next Monday 00:00

**During the week:**
- Trigger monitor runs every 5 minutes
- Disruption detected → zone match → fraud checks
  - Clean: payout <2 min, push notification sent
  - Flagged: queued for review, worker notified with timeline

**Sunday evening:**
- ML model recalculates premium for next week
- Worker gets forecast summary + next week's premium
- Confirms renewal or opts out — no penalty either way

**Insurer / admin dashboard:**
- **Live view:**
  - Active policies by city
  - Disruption map with active triggers highlighted
  - Claims in flight — auto-approved, in-review, flagged
  - Today's payout exposure
- **Analytics:**
  - Loss ratio by zone, trigger type, time period
  - Fraud queue with risk scores, cluster flags, social graph data
  - Predictive panel — 7-day forward claim volume by city
  - Worker cohort data — retention, claim frequency, churn signals

## What we're building when

**Phase 1 — Weeks 1–2 (now)**
- [x] Problem research and persona definition
- [x] Weekly premium model designed
- [x] Parametric trigger logic and thresholds defined
- [x] Fraud detection approach designed
- [x] Anti-spoofing strategy added in response to Phase 1 market crash event (March 19)
- [x] Tech stack decided
- [x] GitHub repo structured
- [x] Database schema / ERD
- [x] Figma wireframes — worker app + admin dashboard
- [x] Project scaffolding — React frontend + Express backend
- [x] Deliverable: This README + GitHub repo + 2-min video

**Phase 2 — Weeks 3–4**
- [ ] Worker registration with conversational onboarding (Claude API)
- [ ] Dynamic weekly premium calculation live
- [ ] OpenWeatherMap and OpenAQ trigger integrations
- [ ] Platform downtime and curfew triggers (mocked)
- [ ] Auto-claim pipeline — trigger → zone match → fraud check → payout
- [ ] Basic fraud scoring (GPS + duplicate detection)
- [ ] Razorpay test mode UPI payouts
- [ ] Push notifications for workers
- [ ] Deliverable: Executable demo + 2-min demo video

**Phase 3 — Weeks 5–6**
- [ ] Full Isolation Forest fraud scorer deployed
- [ ] Anti-spoofing signals fully integrated (accelerometer, cell tower, social graph)
- [ ] Worker dashboard — payout history, coverage status, weekly summaries
- [ ] Insurer dashboard — loss ratios, fraud queue, predictive panel
- [ ] Disruption simulation mode for demo
- [ ] Hindi + one regional language support
- [ ] Pitch deck PDF
- [ ] 5-min final demo video
- [ ] Deliverable: Full submission package — code + video + deck

---

## Why we think this holds up
The gap we're addressing isn't unsolved because it's technically hard. It's unsolved because every existing insurance product was designed for people with stable incomes, paper documentation, and the time and patience to fight with a claims department. That describes almost nobody in the gig economy.

Parametric works here for a specific reason worth spelling out: the triggers are external and publicly verifiable. Nobody needs to argue about whether it rained. Nobody needs to prove they were in the zone. Either the API data says it happened or it doesn't. That collapses the claims process from an adjudication problem — subjective, disputable, slow — into a logistics problem — objective, automatable, fast.

Weekly pricing isn't just a constraint we're designing around. It's genuinely the right commercial model. A worker who's having a bad month can opt out for a week and opt back in. No cancellation fees. No annual commitment. That's what financial products in this space need to look like if they're going to reach the people who actually need them.

And the anti-spoofing layer matters for a reason beyond just fraud prevention: if the liquidity pool gets drained by a coordinated ring attack, the platform fails and every legitimate worker on it loses the safety net they paid for. Getting fraud defense right isn't a feature. It's the thing that keeps the whole system honest.

---

## Repo structure
```text
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
```
