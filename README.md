# NYC Life

A free browser life sim set in New York City. Make a character, roll a backstory
("Rent-Stabilized Luck", "Broker-Fee Broke", "Fresh Off the Bus"...), get a job,
fold dollar slices, ride the train, make rent every Sunday night, and share a card of
your week.

Plain HTML, CSS and JavaScript. No build step, no accounts. Progress saves in the
browser. Works on a phone.

## Run it

With Node installed:

```
node serve.js
```

Then open http://localhost:8642. On a phone on the same Wi-Fi, use the computer's IP
address instead of localhost.

## Add your own jokes

**Every line of text is in `js/data.js`.** That includes events, places, the cast,
stickers, and interface words. Copy a line, change the words, save, reload.

- Events go in the `events` section. `where` is `subway`, `street` or `night`.
- People are in `npcs`, plus `rafi` and `mango` for the bodega.
- Read each line out loud. Keep the ones that sound like a real New Yorker.

## How it plays

- **Day:** pick things to do on the map. Each costs time, energy, or money and pays
  out money, sanity, cred, or a story. Sleep at home to end the day and get a receipt
  ("Today: lost $2.90 to a turnstile, declared war on 4B").
- **Week:** rent plus bills every Sunday night. A "RENT PAID" stamp and a share card when
  you make it. The couch when you don't.
- **Goals:** a task for today, a personal goal for the week, and a sticker book that
  raises your rank from Tourist to Real New Yorker.
- **People:**
  - Rafi at the bodega learns your order.
  - Mango the cat warms up to you eventually.
  - Walt has a feud with a fire hydrant.
  - Dolores from 2A knows everything.
  - Jordan the waiter is mostly an actor.
- **Tradeoffs:** time runs out, food and energy drain, and the city wears down your
  sanity. Hit zero and you lose a day in bed.

Design choices and their sources are in [docs/design-research.md](docs/design-research.md).
Check balance with `node scripts/sim.js`.

## Code map

| File | What it is |
| --- | --- |
| `js/data.js` | All text and content |
| `js/engine.js` | Game rules, no screen code, so it can move to a server later |
| `js/map.js` | Draws each area as SVG: no image files, no logos |
| `js/avatar.js` | Character look, drawn as SVG and on canvas |
| `js/ui.js` | Screens, pop-ups, feedback (pops, stamps, toasts) |
| `js/audio.js` | Synthesized sounds, mute button |
| `js/share.js` | Week share image (1080x1350) |
| `js/net.js` | Network layer. v1 has computer characters only |
| `js/metrics.js` | On-device counters. Nothing is sent anywhere |
| `scripts/sim.js` | Balance simulation |

Fonts are Bungee (headings) and Rubik (body), from Google Fonts. Self-host them before
launch if we want zero third-party requests.

## Roadmap

1. **Publish** free on GitHub Pages: a public repo with Pages turned on. Needs the owner's OK.
2. **Playtests:** owner plus 3 to 5 friends on phones, watched silently. Fix what confuses
   them first.
3. **Multiplayer** on free tiers: write `SupabaseNet` (Realtime presence and broadcast, one
   channel per area) or `CloudflareNet` (one Durable Object per area). It needs the same
   five methods as `LocalNet` in `js/net.js`. Real players then show on the map and in Block
   chat.
4. **Shared economy:** move money rules from `engine.js` to the server so nobody can edit
   their cash in the browser.
5. **The city in real time:** real NYC weather (rain means no delivery tips, but umbrella
   sellers at the subway) and real seasons and holidays (summer A train with no AC,
   Halloween parade, marathon Sunday). A free daily treat.
6. **More life:**
   - Cast arcs that unlock over weeks: the super, the 4B nemesis, roommates with mystery jobs.
   - More neighborhoods.
   - Apartment items.
   - Skills.
   - A city news ticker, clearly marked as ambient.
   - Seeded leaderboards, clearly marked.
7. **Billboards:** the Midtown plaza boards (`billboards` in `js/data.js`) can be rented to
   sponsors.
8. **Measure:** connect `js/metrics.js` to a cookie-free counter (owner's OK first). Track
   day-1 completion, day-2 and day-7 return, and share use. Then run small A/B tests.
