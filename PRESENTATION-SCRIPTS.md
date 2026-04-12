# FleetMind Presentation Scripts

**Total time: 14 minutes (7 + 7)**

---

## PART 1 — AleMaguz (7 minutes)

### Landing Page + Authentication System

---

**[SLIDE: fleetmind.co landing page — hero section visible]**

> Hey everyone! I'm Ale, and together with Brogevic we built **FleetMind** — an AI-powered fleet management platform designed specifically for the Italian logistics market.

> Let me walk you through what we built, starting from the landing page.

**[Scroll to hero section]**

> FleetMind solves a real problem: small and mid-size transport companies in Italy still plan their routes manually — using Excel, WhatsApp, and phone calls. We're replacing that with an AI agent that handles dispatch automatically, while keeping full regulatory compliance.

> Right here in the hero you can see our key metrics: **89% time saved** on planning, **15-minute setup**, and **100% compliance monitoring** across six different Italian and EU regulations.

**[Point to the trust bar with regulation badges]**

> This bar is important — it shows the regulations we monitor: **EU Regulation 561** for driving hours, **ADR** for hazardous goods, **CQC** for professional driver certificates, **MIT minimum costs**, **LEZ zones**, and the new **DL 73/2025** for load/unload times.

> These aren't just labels — they're actually integrated into the dispatch logic. The AI checks all of them before assigning an order.

**[Scroll to features section]**

> Our main feature is the **AI Dispatch**. It's not a simple optimization algorithm — it's an agentic system powered by Claude Opus that uses tool calling to query routes, check compliance, and build assignments in real time. The user can watch the AI think, step by step.

> On the right you can see the **Compliance engine** — it monitors all driver and vehicle documents, alerts you before anything expires, and blocks unsafe assignments automatically.

> And here's the **MIT tariff calculator** — Italian law sets minimum prices for transport. If a customer offers you a rate below the legal minimum, FleetMind flags it immediately. This protects small carriers from working at a loss.

**[Scroll to ROI calculator]**

> We also built an interactive ROI calculator. You enter your fleet size, daily trips, and how many hours you spend planning — and it shows your monthly savings in real time.

> For example, a company with 15 vehicles doing 8 trips a day saves over **2,000 euros per month** — that's a 14x return on our Professional plan.

**[Scroll to pricing section]**

> Speaking of pricing — we positioned ourselves against Webfleet, which is the market leader. Their Professional plan for 30 vehicles costs **510 to 810 euros per month**. Ours is **149 euros**. That's 3.4 times cheaper, with AI dispatch included.

> Three plans: Starter at 49 euros for small fleets up to 10 vehicles, Professional at 149 — our recommended plan — with Google Maps routing and MIT tariffs, and Business at 299 for larger operations.

> Every plan starts with a **14-day free trial, no credit card required**.

---

**[Navigate to /login]**

> Now let me show you the authentication system.

> We support three login methods. **Google OAuth** — one click and you're in. **Magic link email** — completely passwordless, you just enter your email and click the link. And a **Demo login** — instant access with sample data, no signup needed.

> The demo login is great for investors or curious visitors. One click, and you're inside a fully loaded dashboard with realistic data.

**[Click Google login or show the flow]**

> After first login, new users go through a **3-step onboarding wizard**.

> Step one: enter your company info — name, address. Step two: add your first vehicle — type, capacity, Euro class, ADR certification. Step three: add your first driver — license type, CQC, tachograph card, ADR patentino.

> Every step can be skipped, so you can explore the platform immediately and fill in the details later.

> The auth system uses **NextAuth with JWT strategy**, and we built a multi-tenant architecture — every company sees only their own data, isolated by company ID on every single query.

**[Show the paywall/trial system briefly]**

> After the 14-day trial expires, users see a full-screen paywall with our pricing plans. They can subscribe directly through **Stripe Checkout** — we handle the complete billing lifecycle: trial, subscription, renewal, cancellation.

> And that's the landing page and auth system. Now let me hand it over to Brogevic, who's going to show you the actual product in action.

---

**[END — ~7 minutes]**

---
---

## PART 2 — Brogevic (7 minutes)

### Live Demo — Dashboard, Tracking, Compliance, AI Dispatch

---

**[SCREEN: Dashboard at fleetmind.co — logged in]**

> Thanks Ale. I'm Brogevic, and I'll show you what happens once you're inside FleetMind. I'll use our demo account which has realistic data preloaded.

**[Point to KPI cards]**

> This is the dashboard. At the top we have four KPI cards: **pending orders** waiting to be dispatched, **available drivers** out of total, **planned kilometers**, and **estimated fuel cost** for all active and planned trips.

**[Point to the Fleet Map]**

> But the star of the dashboard is this — the **Fleet Map**. It shows the real-time position of every driver, with blue glowing dots for drivers in transit and gray dots for drivers in standby.

> These markers — the **P** circles are pickup points, the **A** squares are delivery points. You can see the route lines connecting them. This refreshes automatically every 10 seconds.

> The data comes from our **live tracking system** — let me show you how that works.

---

**[Open /track/[driverId] in a new tab — or show the driver page first]**

> Each driver gets a **shareable tracking link**. On the drivers page, there's a copy button — one click and you have the URL.

> This opens a minimal, mobile-first page. The driver opens it on their phone, taps **"Start Tracking"**, and their GPS position is streamed to our server using the browser's native geolocation API.

> No app to install. No Play Store. Just a link. The dispatcher sees the position update in real time on the dashboard map.

> You can also share this link with a customer or warehouse — they can track the delivery without logging in.

---

**[Navigate to /compliance]**

> Now, compliance. This is where FleetMind really differentiates from generic fleet tools.

> The first tab shows **document alerts**. Every driver license, CQC certificate, tachograph card, ADR patentino, vehicle inspection, insurance — all monitored with countdown timers.

> Red means expired or overdue — these **block the AI dispatch** from assigning that driver. Yellow means expiring within 30 days. Blue is informational.

**[Click the MIT tab]**

> Second tab: the **MIT minimum cost calculator**. Italian law requires that transport tariffs cover at least the minimum operating cost.

> You enter the vehicle weight and distance — let's say 18 tons, 450 kilometers — and it shows you the minimum, average, and maximum cost per the official MIT tables.

> If you enter a customer's proposed rate, it tells you if it's **compliant or below the legal floor**. This is huge for small carriers who often accept rates below cost without knowing it.

**[Click the regulatory calendar tab]**

> Third tab: the **2026 regulatory calendar**. New tachograph requirements in July, automatic emergency braking rules, Euro 5 diesel bans in northern Italy from October. All with urgency indicators and direct links to the official regulations.

---

**[Navigate to /dispatch]**

> And now, the main event — the **AI Dispatch**.

> I have some pending orders here. Let me hit **"Pianifica con AI"** and watch what happens.

**[Click the dispatch button — SSE stream starts]**

> The system first runs a **deterministic pre-filter**. It checks every possible combination of order, driver, and vehicle against hard constraints: weight capacity, license type, ADR requirements, refrigeration needs, driving hours.

> Invalid combinations are eliminated instantly — no need to waste AI tokens on impossible assignments.

> Now watch the log — Claude is working in real time. You can see each **tool call**: it's querying route distances, checking LEZ zone access, calculating MIT minimum tariffs.

> This is a real **agentic loop** — Claude decides what to do next based on the results of each tool call. It's not a single prompt-and-response. It's multi-turn reasoning with six different tools available.

**[Wait for assignments to appear]**

> Here are the results. Each **Assignment Card** shows the driver, vehicle, and order — with a **compliance scorecard out of 7**.

> Green means perfect score — all checks passed. Yellow means some warnings but still valid. Red means blocked — a critical check failed, like weight or ADR, and the assignment cannot be approved.

> You can expand each card to see the individual checks: weight utilization, volume, driving hours, ADR, license type, LEZ zones, and MIT tariff compliance.

> The AI also provides a **written motivation** in Italian — explaining why it chose this specific driver and vehicle for this order.

**[Click "Approva Piano"]**

> One click — **all valid assignments become trips**. Drivers are marked as in transit, vehicles as in use, orders as assigned. Everything updates atomically in a single database transaction.

> And that's FleetMind. An AI-powered logistics platform that handles dispatch, compliance, tracking, and regulatory monitoring — all in one place, built for the Italian market.

> Questions?

---

**[END — ~7 minutes]**

---

## Quick Tips

- **Practice each script 3 times** — that's enough to memorize the flow
- **Don't read** — use the screen as your teleprompter, point at things
- **If something breaks during demo** — say "This is a live product, things happen" and move on
- **Key phrases to nail:**
  - "Agentic AI with tool use" (not "chatbot" or "AI prompt")
  - "Multi-turn reasoning" (shows technical depth)
  - "Regulatory compliance baked into the dispatch logic" (not an afterthought)
  - "No app to install — just a link" (for tracking)
  - "3.4x cheaper than Webfleet" (competitive positioning)
