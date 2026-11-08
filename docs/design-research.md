# Design research: why NYC Life works the way it does

Each principle below names its source, what the source actually says, and where it
shows up in the game. **Research** means a published study or framework I looked up
on 2026-11-08. **Expert practice** means a well-known talk or book from game developers.
**Judgment** means my call with no study behind it; real playtests should overrule it.

## 1. Motivation: competence, autonomy, relatedness (Research)

**Source:** Ryan, Rigby & Przybylski (2006), "The Motivational Pull of Video Games: A
Self-Determination Theory Approach," *Motivation and Emotion* 30(4), 347-363,
doi:10.1007/s11031-006-9051-8. In four studies, players' sense of autonomy and competence
predicted enjoyment and wanting to play again. In the online-game study, relatedness also
predicted enjoyment and future play on its own. ([Rochester PDF](https://www.rochester.edu/warner/lida/wp-content/uploads/2022/11/02bfe513dd59366750000000.pdf))

| Need | Where it is in the game |
| --- | --- |
| Competence (clear feedback, fair challenge) | Number pops on every action, cash counter, stat bars flash, today's task is ticked off, "RENT PAID" stamp, rank bar in the phone panel |
| Autonomy (real choices, many ways to play) | Six backstories, three areas, free choice of what to do each day, event choices with tradeoffs, gig jobs vs regular jobs, apartment hunting |
| Relatedness (people who remember you) | Recurring cast: Rafi knows your order after 5 visits and later lets you run a tab; Mango the cat ignores you until visit 6; Walt, Dolores and Jordan each have a 5-6 step story; Dolores brings soup when you're struggling. Later: real players in Block chat |

## 2. Challenge that grows with skill: flow (Research, with a caveat)

**Source:** Csikszentmihalyi, *Flow* (1990), applied to games by Sweetser & Wyeth (2005),
"GameFlow," *ACM Computers in Entertainment*: challenge should match skill and rise as the
player improves, with clear goals and feedback. I checked these through secondary
citations, not the original texts. A 2016 study in *Motivation and Emotion* found that a
perfect match is not best, and brief slight overload may help.

**In the game:**
- Week 1 rent is half ("you moved in mid-week"), so week 1 is never a wall.
- Bills (phone, electric, loan) start in week 1. Rent hikes can't happen before day 9.
- Three goal scales: today's task (small), this week (rent plus one personal goal), the
  long run (stickers raise your rank from Tourist to Real New Yorker).
- **Measured, not guessed:** `node scripts/sim.js` plays 4 weeks, 40 times for each
  backstory and play style. Current medians:
  - "Balanced" (work weekdays, one treat a day) survives every backstory.
  - The broker-fee start is tight: 9 of 40 runs get evicted, which is intended as hard mode.
  - Working every day makes money but lands on a burnout day.
  - Working 3 days a week gets you evicted onto the couch.
  - The glass-tower start drains your savings unless you move. That's the story of that
    backstory.

## 3. Real tradeoffs, not bars that only go up (Judgment, informed by 1-2)

Every stat can go down. Time is limited: about 16 to 18 hours a day. Food and energy
drain while time passes, and sanity drops a little each night.

- If sanity runs out, you lose the next day in bed (burnout).
- Grinding pays rent but costs sanity.
- Fun costs money.
- Moving costs a broker fee.
- Missing 3 weekday shifts gets you fired.
- Missing rent twice puts you on your cousin's couch.

## 4. Rewards for delight, not compulsion (Research)

**Source:** Zagal, Björk & Lewis (2013), "Dark Patterns in the Design of Games,"
*Foundations of Digital Games* 2013, 39-46: patterns designers use on purpose that work
against players' interests. ([Chalmers record](https://research.chalmers.se/en/publication/177148))

**Rules for this game:**
- Random good surprises: the mariachi band, the curb couch, a lottery win.
- No energy timers that block play, no paid anything, no countdowns, no streaks that
  punish you for missing a day, no guilt messages.
- You can play as long as you like. A day ends when you choose to sleep.
- The sticker book is something to complete. Missing a day costs nothing.

## 5. Cliffhangers (Research says: weaker than its reputation)

The famous "Zeigarnik effect" (we remember unfinished tasks better) did **not** hold up in
a 2025 meta-analysis: Ghibellini & Meier, "Interruption, recall and resumption: a
meta-analysis of the Zeigarnik and Ovsiankina effects," doi:10.1057/s41599-025-05000-w.
The same paper did find a general tendency to **resume** interrupted tasks (the Ovsiankina
effect).

**In the game:** night events are teased on the end-of-day receipt ("Your landlord
slipped a note under the door. You'll read it in the morning.") and resolved when you
continue. That should lead to resuming play, but it's a light touch, and we should
measure it rather than assume it.

## 6. Feedback on every action: game feel and "juice" (Expert practice)

**Sources:**
- Jonasson & Purho, "Juice It or Lose It" (2012 talk; GDC Vault lists it, other sources
  say Nordic Game). Lots of output for little input: motion, squash and stretch,
  particles, sound. ([GDC Vault](https://gdcvault.com/play/1016487/Juice-It-or-Lose))
- Swink, *Game Feel* (2008/09): real-time response plus polish.
- Counterpoint: Kelly, "Don't Juice It or Lose It" (GDC Europe 2014). Too much juice can
  bury the content. ([GDC Vault](https://gdcvault.com/play/1020861/Don-t-Juice-It-or))

**In the game:**
- Buttons press down.
- Places squash when tapped.
- Your character walks between places.
- Money and stat numbers float up.
- The cash counter counts up or shakes.
- Stat bars flash.
- Stickers spin in.
- A rubber "RENT PAID" stamp.
- Pigeons peck and scatter when tapped.
- Synthesized sounds: tap, coin, subway door chime, stamp. Mute button. Phone buzz on Android.
- Reduced-motion settings are respected.

Because of the counterpoint, the writing stays the center of the game and the juice is
short.

## 7. Structure in MDA terms (Research framework)

**Source:** Hunicke, LeBlanc & Zubek (2004), "MDA: A Formal Approach to Game Design and
Game Research," AAAI Workshop on Challenges in Game AI. ([PDF](https://users.cs.northwestern.edu/~hunicke/MDA.pdf))

| Mechanic | Dynamic it creates | Aesthetic it serves |
| --- | --- | --- |
| Weekly rent and bills | Budgeting, weighing work against fun | Challenge |
| Random events with choices | Stories you didn't plan | Narrative, Discovery |
| Recurring cast with memory | Coming back to see what Walt says next | Fellowship (relatedness), Narrative |
| Sticker book and ranks | Exploring places and choices | Discovery, Expression |
| Backstories, look, hook line | Identity you want to show | Expression |
| Share card | Comparing weeks with friends | Fellowship |
| Juice and sound | Satisfying taps | Sensation |

## 8. Teach by doing; a moment in the first 30 seconds (Expert practice and judgment)

There are no tutorial screens. Character creation fits on one screen, with the start
button above the look options. Then:
1. A funny choice right away (the churro woman at the top of the subway stairs).
2. One glowing place on the map ("Today: get breakfast at the bodega").
3. Day 2's task sends you to find work.

**Judgment** (I did not look up a study): lots of text up front loses new players.
Measure it with `day1_done` and first-session length.

## 9. Humor that pokes without hurting (Research)

**Source:** McGraw & Warren (2010), "Benign Violations: Making Immoral Behavior Funny,"
*Psychological Science* 21(8), 1141-1149. Things are funny when something is wrong but
also harmless. That happens when there's another norm that makes it OK, when we don't care
much about the broken norm, or when there's psychological distance.

**Check for every line in `js/data.js`:** the violation is the city or a situation
(landlords, the train, the radiator), and the person on the receiving end is fine or in on
the joke. The writing is specific (real neighborhoods, train lines, prices) and avoids
filler.

There are kindness beats too:
- A stranger returns your $20.
- Dolores brings soup.
- Someone holds the train doors.
- Strangers help carry the curb couch.

## 10. Evidence loop (plan)

`js/metrics.js` counts these on the device only: no cookies, no IDs, nothing sent
anywhere in v1.
- session starts
- first-session length
- `day1_done`
- `return_d1` and `return_d7`
- `week_done`
- `share_open` and `share_done`

To collect real numbers, set `NYC.Metrics.sink` to post counts to a cookie-free counter,
for example a Cloudflare Worker. That needs the owner's OK.

**Next tests:**
1. **Playtests:** the owner plus 3 to 5 friends on their phones. Watch silently and write
   down every pause, misread, or "what do I do?". This is worth more than any of the above.
2. **Small A/B tests once there's traffic:** the arrival event vs a plain start (`day1_done`),
   and half rent in week 1 vs full rent (`return_d1`).
