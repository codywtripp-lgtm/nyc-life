# NYC Life

A free browser life sim set in New York City. Make a character, roll a backstory
("Rent-Stabilized Luck", "Broker-Fee Broke", "Fresh Off the Bus"...), get a job,
eat dollar slices, ride the subway, survive rent day every Sunday night, and share
a card of your week.

Plain HTML, CSS and JavaScript. No build step, no accounts, no server needed.
Progress saves in the browser (localStorage).

## Run it

Any static web server works. With Node installed:

```
node serve.js
```

then open http://localhost:8642 (on a phone on the same Wi-Fi, use the computer's IP).

## How it plays

- Three areas on an illustrated map: your block (changes with your apartment),
  Midtown (jobs, halal cart, billboard plaza), Downtown (coffee, brunch, bar,
  comedy, pier). Tap a place, pick an action. The subway moves you between areas.
- Stats: cash, energy, food, sanity, cred. Time passes with every action; sleep at
  home to end the day. Past 2am or out of energy, you pass out wherever you are.
- Jobs at the staffing agency in Midtown. Cred raises your odds. 8 shifts = promotion.
  Miss 3 weekday shifts at a regular job and you're fired (gig jobs have no strikes).
- Apartments: scroll listings at home; moving costs a broker fee + a van.
  Miss rent twice and you're back on your cousin's couch.
- Random events on the train, on the street and at night (heat out, rent hike,
  showtime dancers, the empty subway car...).
- Rent day shows a week summary and a 1080x1350 share image (phone share sheet,
  or download on desktop).

## Code map

| File | What it is |
| --- | --- |
| `js/data.js` | All content: backgrounds, places, actions, jobs, apartments, events, billboards. Add jokes here. |
| `js/engine.js` | Game rules. No DOM, so it can move to a server later. |
| `js/map.js` | Draws each area as SVG (no image files, no logos). |
| `js/avatar.js` | Character look, drawn as SVG and on canvas. |
| `js/share.js` | Week share card. |
| `js/net.js` | Network layer. v1 = `LocalNet` with computer "regulars". |
| `js/ui.js` | Screens, bottom sheet, pop-ups, phone and chat panels. |

## What's next

1. **Publish** on GitHub Pages (free): push this folder to a public repo, turn on
   Pages from the `main` branch. Needs the owner's OK.
2. **Multiplayer** (free tiers): write `SupabaseNet` (Realtime presence + broadcast,
   one channel per area) or `CloudflareNet` (one Durable Object per area) with the
   same five methods as `LocalNet` in `js/net.js`. Other players then show on the
   map and in Block chat.
3. **Shared economy**: once players can trade or compare, move the money rules in
   `engine.js` to the server so nobody can edit their cash in the browser
   (the main exploit risk for this kind of game).
4. **Billboards**: the Midtown plaza boards are data in `js/data.js` (`billboards`),
   ready to rent to real sponsors later.
5. Retention: daily goals, a "years in NYC" streak, seasons (summer heat, holiday
   crowds), more neighborhoods, roommate storylines.
6. Balance: rent-stabilized start is easy on purpose; tune pay and costs after
   real players try it.
