# prompts.md - CatchMyBus

**Student:** Ang Wee Khee · **Course:** MGMT 6110 Human-AI Collaboration · **Problem Set 2** (Individual)

**User sentence:** Template: A [user] opens this screen to [one job], and knows it worked when [what they see].
My wife (Elly) or my friend at home/ office opens this screen to check the bus arrivals near the bus stop of interest also the weather to see if it is raining or the skies are clear, and knows it worked when she is able to see the bus arrives approximately on time based on the information presented by Catch My Bus and the actual weather is what the app is depicting.

**Live link:** 
**Repository:** 
**Builder:** Google AI Studio (Build), personal Google account. Monday 14 - Tuesday 15 September 2026.

> Every prompt I sent, in order, verbatim. One line on what came back, one line on what I changed next and why. Entries were written as I sent each prompt; outcome lines were checked against the code in the repository afterwards, and where the code contradicted what the preview or the assistant told me, I say so.

---

## Prompt 1 - the master prompt (R·G·O·G·C)

```
ROLE: You are a senior front-end developer creating a new Vite + React project for one
person. Build only what is asked for below, and tell me plainly about anything you decide
that I did not specify.
GOAL: Build "Catch My Bus!", a mobile-first web app for my wife, who takes a few regular
buses from four or more regular stops in Singapore (home, office, and others) and checks,
before she leaves home in the morning and before she leaves the office in the evening,
when her buses are coming and what the weather is doing there. Two screens, switched by a
two-tab bar fixed at the bottom of the phone screen (respect the iPhone safe area so the
bar is never hidden behind Safari's own bar). The first time the app opens it asks for her
first name once, remembers it on the phone, and greets her by name and time of day at the
top of both screens ("Good morning, Mei Ling"). No other personalisation.
SCREEN 1 · "Live Bus Arrivals"—a 5-digit bus stop code input with a "Show buses"
button, defaulting to 01039 (Bugis Cube) and remembering the code she last looked at.
On that screen, a panel listing each service with its next two arrivals in minutes,
refreshing every 20 seconds, which matches how often LTA itself updates, showing
"Arriving" under one minute, and showing a plain sentence when a service has no buses
running. Each row has a star button, at least 44px tall; tapping it saves that bus AT
THAT STOP to her favourites and the star fills in; tapping again removes it.
Under the panel, a "Weather" panel showing the two-hour forecast wording and the
period it is valid for, for one of data.gov.sg's 47 forecast areas, chosen from a
dropdown of the 47 area names (default "City" for 01039). Its heading must read
"Forecast for the City area", never "at this stop". Then a "Last updated HH:MM" line.
SCREEN 2 · "My Favourites"—one card per saved stop, COLLAPSED by default, showing one
line: the stop's name, its code, the soonest starred bus and its minutes, and the
one-word weather ("Home · 01039 · next: 7 in 4 min · Showers"). Tapping a card expands
it (one at a time) to show every starred bus at that stop with its next two arrivals,
and the weather panel for the area she chose for that stop. Each card has a rename
control (so she reads "Home" and "Office", not codes), "move up" and "move down"
buttons so she controls the order, and a remove (×) button on each saved bus; removing
the last bus removes the card. This screen also refreshes every 20 seconds while open.
When nothing is saved yet, show this exact sentence:
"[PASTE YOUR NO-FAVOURITES SENTENCE]"
Show EXACTLY these sentences, in words on the screen, in each state—different
sentences, never one spinner:
BUS loading: "[PASTE]" empty: "[PASTE]" refused: "[PASTE]" unreachable: "[PASTE]"
RAIN loading: "[PASTE]" empty: "[PASTE]" refused: "[PASTE]" unreachable: "[PASTE]"
FAVOURITES saved bus not running: "[PASTE]" stop code not found: "[PASTE]"
OUTPUT: For now, feed both screens from PLACEHOLDER data in one module, src/data.js, clearly
marked "// PLACEHOLDER — to be replaced by live data in the next step". Give the
placeholders exactly the shape the live functions will return, so that only this one
file changes later:
getBus(stopCode) → { stopCode, fetchedAt, services: [ { serviceNo, next: [ 4, 11 ] } ] }
where next holds 0, 1 or 2 whole minutes and 0 means "Arriving".
getRain() → { validPeriod, updatedAt, areas: [ { area, forecast, rainExpected } ] }
with all 47 area names, so the dropdown is real.
Include a one-second fake delay so I can see the loading sentences, and let me switch
the placeholder to an empty stop and to a failure with a single flag at the top of
src/data.js so I can see every sentence in item 5 before anything is live.
Her name and her favourites are saved in the browser's localStorage under two keys,
"catchMyBus.name" and "catchMyBus.favourites", the latter an ordered array of
{ stopCode, stopName, area, services: [] }.
Vite + React, plain CSS, no UI library. Everything under src/. Include index.html,
package.json containing "type": "module", and a .gitignore containing .env*.
In the footer, add these two exact lines, which is what the licence asks for:
"Contains information from LTA DataMall Bus Arrival, accessed [DATE], made available
under the terms of the Singapore Open Data Licence version 1.0,
data.gov.sg/open-data-licence."
"Contains information from data.gov.sg Two-hour Weather Forecast, accessed [DATE], made
available under the terms of the Singapore Open Data Licence version 1.0,
data.gov.sg/open-data-licence."
GUARDRAILS: Do not call any external address from browser code in this step—no LTA, no
data.gov.sg, nothing; the data is placeholder only. Never create a variable whose name
starts with VITE_. No new npm packages beyond React and Vite. No database, no login. Do
not use LTA's or data.gov.sg's name or logo in a way that suggests this app is official
or endorsed. Must work in iPhone Safari and Android Chrome at 375px wide with no
horizontal scrolling; body text at least 18px; star, remove and move buttons at least
44px tall, because she often uses this one-handed. Do not add any other numbers, tiles,
maps or charts—only what is listed above. Do not invent bus stop names or a stop-code
lookup; she types the code and names the stop herself. Do not use her name anywhere
except the greeting.
CONTEXT: This will be deployed on Vercel from GitHub. In the next step I will add three
serverless functions at api/ in the project root—api/bus.js, api/rain.js and
api/health.js—and change src/data.js to fetch from /api/bus?BusStopCode=XXXXX and
/api/rain, so route every piece of data through src/data.js and nowhere else.
```

**What came back:** I have built Catch My Bus!, a mobile-first web app designed for everyday use in Singapore.
Decisions Made for Unspecified Items
As requested, here are the decisions made for items not explicitly specified in the prompt:
The Exact Sentences Selected for State Words (Item 5):
BUS Loading: "Checking for arriving buses..."
BUS Empty: "No bus services are currently operating from this stop."
BUS Refused: "Unable to retrieve bus arrivals: service request was not accepted."
BUS Unreachable: "Unable to reach bus arrival servers. Please check your connection."
RAIN Loading: "Checking the latest weather forecast..."
RAIN Empty: "No forecast data is currently available for this area."
RAIN Refused: "Unable to retrieve weather forecast: request was not accepted."
RAIN Unreachable: "Unable to reach weather forecast servers. Please check your connection."
FAVOURITES Saved Bus Not Running: "This bus is not currently in service."
FAVOURITES Stop Code Not Found: "This bus stop code could not be found."
FAVOURITES Empty State (No Favourites Saved Yet): "No favourite bus stops saved yet. Tap the star on any bus arrival in Live Bus Arrivals to add it here."
Time of Day Greetings:
Morning (before 12:00 PM): "Good morning, [Name]"
Afternoon (12:00 PM to 5:59 PM): "Good afternoon, [Name]"
Evening (6:00 PM onwards): "Good evening, [Name]"
Collapsed Summary When Bus is Arriving in 0 Minutes:
Rendered as ${stopName} · ${stopCode} · next: ${serviceNo} Arriving · ${weatherWord} (e.g. Home · 01039 · next: 7 Arriving · Showers).
License Footer Access Date:
Formatted to the local access date in Singapore (e.g., 14 September 2026).
What Was Built
First-Time Name Prompt & Persistent Storage:
Asks for her first name once on initial launch in a clean modal.
Stored under localStorage key catchMyBus.name.
Her name appears strictly in the greeting at the top of both screens and nowhere else.
Screen 1 · Live Bus Arrivals:
Numeric 5-digit bus stop code input with Show buses button, defaulting to 01039 and remembering the last-searched code in localStorage.
Live arrivals list displaying each service number and the next two arrivals in whole minutes (Arriving when < 1 minute).
Star button (at least 48px × 48px touch target) on each service row: fills in (★) when saved to favourites and removes (☆) on toggle.
Weather panel below with the mandatory heading "Forecast for the [Area] area" (never "at this stop"), valid 2-hour period, wording, and "Last updated HH:MM". Includes a dropdown of all 47 official NEA / data.gov.sg areas (defaulting to City for 01039).
Automatically refreshes every 20 seconds.
Screen 2 · My Favourites:
One card per saved stop, collapsed by default, displaying the required single summary line (e.g., Home · 01039 · next: 7 in 4 min · Showers).
Expanding a card (accordion style, one at a time) reveals:
Inline stop rename control to name stops "Home", "Office", etc.
▲ Up and ▼ Down reorder buttons (at least 44px tall) to adjust card order.
Every starred bus at that stop with its next two arrivals and a dedicated × remove button (at least 44px tall); removing the last bus removes the card.
Stop-specific weather panel for the area selected for that stop.
Refreshes every 20 seconds while open.
Shows the exact empty sentence when no favourites exist.
Persistent storage under localStorage key catchMyBus.favourites.
Data Layer (src/data.js):
Marked // PLACEHOLDER — to be replaced by live data in the next step.
Implements getBus(stopCode) and getRain() adhering to the exact contracts required for future /api/bus and /api/rain routes.
Includes a 1-second delay so loading sentences are clearly readable.
Configured with SIMULATION_FLAG right at the top ('normal', 'empty', 'refused', 'unreachable', 'not_running', 'not_found'), accompanied by an unobtrusive test bar for instant visual verification.
Mobile Ergonomics & Compliance:
Viewport configured with viewport-fit=cover.
Bottom tab bar fixed with padding-bottom: max(16px, env(safe-area-inset-bottom, 16px)) for iPhone Safari.
Minimum body font size of 18px and touch targets of 44px+ for one-handed thumb navigation at 375px+ screen widths with zero horizontal scrolling.
Exact Singapore Open Data Licence attribution lines in the footer..

**What I changed next and why:** xxxx
