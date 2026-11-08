// All game content lives here: backgrounds, places, jobs, apartments, events.
// Pure data (plus small condition functions) so writers can add jokes without touching the engine.
window.NYC = window.NYC || {};

NYC.DATA = {
  // ---------------------------------------------------------------- backgrounds
  backgrounds: [
    {
      id: 'stabilized', name: 'Rent-Stabilized Luck',
      blurb: "Your great-aunt's prewar one-bedroom passed to you. Rent hasn't moved since a mayor you've never heard of. Cash, though? Not much.",
      cash: 180, sanity: 75, cred: 10, apt: 'heights_stab',
      intro: "You inherited the lease. The radiator clanks like it remembers your great-aunt."
    },
    {
      id: 'brokerfee', name: 'Broker-Fee Broke',
      blurb: "You just paid a broker 15% of a year's rent for opening one door. Nice apartment. Empty wallet.",
      cash: 60, sanity: 60, cred: 0, apt: 'astoria_2br',
      intro: "The broker said 'congrats' and left before you could ask where the fuse box is."
    },
    {
      id: 'bus', name: 'Fresh Off the Bus',
      blurb: "Arrived with one suitcase and big dreams. Sleeping on your cousin's couch until something works out.",
      cash: 420, sanity: 80, cred: 0, apt: 'couch',
      intro: "Your cousin cleared one (1) shelf for you. It's in the bathroom."
    },
    {
      id: 'queens', name: 'Born and Raised in Queens',
      blurb: "You know which car stops at the stairs. Trains delay you less. You do not go to Midtown unless paid.",
      cash: 250, sanity: 70, cred: 20, apt: 'ridgewood_rr', perk: 'trainwise',
      intro: "Your mom already texted asking if you ate."
    },
    {
      id: 'trustfund', name: 'Trust Fund Adjacent',
      blurb: "Your parents 'help a little.' You have money and a deep fear of being found out at parties.",
      cash: 1600, sanity: 55, cred: -10, apt: 'lic_tower', perk: 'parents',
      intro: "Your building has a dog spa. You do not have a dog."
    },
    {
      id: 'dreamer', name: 'Struggling Actor',
      blurb: "Three callbacks, zero roles, one very strong headshot. Four roommates. Endless optimism.",
      cash: 140, sanity: 85, cred: 5, apt: 'bushwick_rr', perk: 'charm',
      intro: "A roommate is practicing a monologue in the shower. It's about you, somehow."
    }
  ],

  // ---------------------------------------------------------------- apartments (rent is per week)
  apartments: {
    couch:        { name: "Cousin's couch", hood: 'Flatbush', boro: 'Brooklyn', rent: 0, rest: 45, vibe: -6, commute: 1, roommates: 4, note: 'Free. Costs you dignity instead.' },
    heights_stab: { name: 'Rent-stabilized 1BR', hood: 'Washington Heights', boro: 'Manhattan', rent: 160, rest: 70, vibe: 2, commute: 1, roommates: 0, note: 'Prewar. Radiator has two settings: off and volcano.', stabilized: true, rare: true },
    astoria_2br:  { name: '2BR with one roommate', hood: 'Astoria', boro: 'Queens', rent: 340, rest: 70, vibe: 2, commute: 1, roommates: 1, note: 'Great Greek food. Roommate labels their oat milk.' },
    ridgewood_rr: { name: 'Railroad apartment', hood: 'Ridgewood', boro: 'Queens', rent: 260, rest: 62, vibe: 1, commute: 2, roommates: 1, note: "You walk through your roommate's room to reach the bathroom." },
    bushwick_rr:  { name: 'Loft share, 4 roommates', hood: 'Bushwick', boro: 'Brooklyn', rent: 210, rest: 55, vibe: -1, commute: 1, roommates: 4, note: "One roommate is a DJ. Every roommate is a DJ, actually." },
    ev_shoebox:   { name: 'Studio (shower in kitchen)', hood: 'East Village', boro: 'Manhattan', rent: 520, rest: 62, vibe: 3, commute: 1, roommates: 0, note: 'You can make toast while you shower. Efficient!' },
    lic_tower:    { name: 'Glass tower 1BR', hood: 'Long Island City', boro: 'Queens', rent: 790, rest: 90, vibe: 4, commute: 1, roommates: 0, note: "Doorman, rooftop, a gym nobody uses. The walls are 2 inches thick." },
    bedstuy_brn:  { name: 'Brownstone garden unit', hood: 'Bed-Stuy', boro: 'Brooklyn', rent: 430, rest: 78, vibe: 4, commute: 1, roommates: 0, note: 'Has a backyard. The backyard has a raccoon. The raccoon has seniority.' },
    ues_walkup:   { name: '5th-floor walk-up', hood: 'Upper East Side', boro: 'Manhattan', rent: 380, rest: 66, vibe: 0, commute: 1, roommates: 1, note: 'Calves of steel by month two. Groceries are a cardio event.' }
  },

  // ---------------------------------------------------------------- jobs
  jobs: [
    { id: 'dog',       title: 'Dog walker',          place: 'park',     hours: 3, pay: [55, 80],   energy: 10, sanity: 4,  req: 0,  gig: true, promo: 'Pack Leader',
      lines: ['A doodle named Brunch pulled you across Avenue of Nothing.', 'You picked up after six dogs. You are a hero no one thanks.', 'A tiny dog in a raincoat judged you.'] },
    { id: 'barista',   title: 'Barista',             place: 'coffee',   hours: 6, pay: [95, 145],  energy: 20, sanity: -3, req: 0,  promo: 'Head Barista',
      lines: ["Someone ordered a 'dry oat cortado, extra hot, not too hot.'", 'A regular tipped you in compliments.', 'You drew a leaf in latte foam. It looked like a lung.'] },
    { id: 'delivery',  title: 'Delivery rider',      place: 'dispatch', hours: 5, pay: [55, 175],  energy: 30, sanity: -4, req: 0,  gig: true, promo: 'Top Rider',
      lines: ['You climbed a 6th-floor walk-up for a $1 tip.', 'Rain. Tips doubled. So did your regret.', 'A customer said "you can leave it outside" from inside the open door.'] },
    { id: 'cook',      title: 'Brunch line cook',    place: 'brunch',   hours: 8, pay: [150, 175], energy: 30, sanity: -4, req: 8,  promo: 'Sous Chef',
      lines: ['You poached 140 eggs. You see them when you close your eyes.', 'A table sent back avocado toast for being "too green."', 'The chef threw a ladle. Not at you. Near you.'] },
    { id: 'assistant', title: 'Office assistant',    place: 'office',   hours: 8, pay: [165, 185], energy: 15, sanity: -9, req: 12, promo: 'Coordinator',
      lines: ['You were cc\'d on 200 emails. You understood four.', 'A meeting about meetings ran long.', 'Someone microwaved fish. The office is at war.'] },
    { id: 'startup',   title: 'Growth lead at a startup', place: 'cowork', hours: 9, pay: [220, 270], energy: 25, sanity: -8, req: 25, promo: 'VP of Vibes', risky: true,
      lines: ['The founder said "we\'re basically like if banks were fun."', 'Kombucha on tap broke. Morale is low.', 'You pivoted twice before lunch.'] }
  ],

  // ---------------------------------------------------------------- areas + places
  // Map coordinates are in a 360 x 520 viewBox. kind controls how the building is drawn.
  areas: {
    home: {
      name: 'Your block', subway: 'home_sub', sky: '#f6d7a7', ground: '#e9dfcf',
      places: ['home_apt', 'bodega', 'laundry', 'home_sub', 'slice', 'park', 'stoop']
    },
    midtown: {
      name: 'Midtown', boro: 'Manhattan', subway: 'mid_sub', sky: '#bcd4ea', ground: '#dcdcd6',
      places: ['office', 'cowork', 'staffing', 'mid_sub', 'plaza', 'cart', 'dispatch']
    },
    downtown: {
      name: 'Downtown', boro: 'Manhattan', subway: 'down_sub', sky: '#f4c3b0', ground: '#e6dbd2',
      places: ['coffee', 'brunch', 'thrift', 'down_sub', 'bar', 'comedy', 'pier']
    }
  },

  places: {
    // -- home block
    home_apt: { area: 'home', name: 'Your place', kind: 'brick', x: 18, y: 26, w: 96, h: 170, color: '#b5523b', sign: 'HOME',
      actions: [
        { id: 'sleep', label: 'Go to sleep', special: 'sleep', hint: 'Ends the day' },
        { id: 'nap', label: 'Nap', hours: 2, fx: { energy: 20 }, say: ['You napped through three sirens and a car alarm. Bliss.'] },
        { id: 'cook', label: 'Cook pasta (again)', hours: 1, fx: { cash: -4, full: 35 }, say: ['Pasta with butter. A classic. A cry for help.', 'You added an egg. Gourmet.'] },
        { id: 'hunt', label: 'Scroll apartment listings', hours: 1, special: 'hunt', hint: 'Find a new place' },
        { id: 'doom', label: 'Doomscroll in bed', hours: 1, fx: { energy: 5, sanity: -4 }, say: ['You learned a stranger\'s whole divorce. You feel worse.', 'You watched a 40-minute video about a bridge.'] }
      ] },
    bodega: { area: 'home', name: 'Corner bodega', kind: 'shop', x: 134, y: 96, w: 92, h: 100, color: '#3f6f8f', awning: '#f2c12e', sign: 'DELI GROCERY 24HR',
      actions: [
        { id: 'bec', label: 'Egg & cheese on a roll', hours: 0.5, fx: { cash: -5, full: 30, sanity: 2 }, count: 'bodega', say: ['The guy remembered your order. You belong here.', 'Salt, pepper, ketchup. Perfection wrapped in foil.'] },
        { id: 'chopped', label: 'Chopped cheese', hours: 0.5, fx: { cash: -8, full: 50, sanity: 3 }, count: 'bodega', say: ['Chopped on the flat-top with the same spatula since 1997. Respect.'] },
        { id: 'coffee', label: 'Bodega coffee', hours: 0.25, fx: { cash: -2, energy: 15 }, say: ['Light and sweet. Tastes like the blue paper cup it came in.'] },
        { id: 'cat', label: 'Say hi to the bodega cat', hours: 0.25, fx: { sanity: 7 }, once: true, count: 'cats', say: ['The cat let you pet it twice, then bit you gently. A blessing.', 'The cat was asleep on the bread. You bought different bread.'] },
        { id: 'scratch', label: 'Scratch-off ticket', hours: 0.25, special: 'scratch', fx: { cash: -2 } }
      ] },
    laundry: { area: 'home', name: 'Laundromat', kind: 'shop', x: 248, y: 96, w: 94, h: 100, color: '#6d8fa6', awning: '#d9e7ef', sign: 'WASH & FOLD',
      actions: [
        { id: 'wash', label: 'Do laundry', hours: 2, fx: { cash: -9, sanity: 6 }, special: 'laundry', say: ['A stranger folded your shirt wrong out of kindness.', 'Someone took your dryer out early. You saw them. They saw you.'] },
        { id: 'wf', label: 'Drop off wash & fold', hours: 0.25, fx: { cash: -22, sanity: 4 }, special: 'laundry', say: ['It came back smelling like a lavender field and a mystery.'] }
      ] },
    home_sub: { area: 'home', name: 'Subway', kind: 'subway', x: 168, y: 232, w: 40, h: 36 },
    slice: { area: 'home', name: '$1.50 slice', kind: 'shop', x: 18, y: 292, w: 96, h: 92, color: '#9b2d2d', awning: '#2f8a4f', sign: 'PIZZA',
      actions: [
        { id: 'slice', label: 'Plain slice', hours: 0.25, fx: { cash: -1.5, full: 20 }, count: 'slices', say: ['Folded it in half like a local.', 'Paper plate already see-through. Perfect.'] },
        { id: 'two', label: 'Two slices + a can', hours: 0.5, fx: { cash: -4.5, full: 45, sanity: 2 }, count: 'slices2', say: ['Dinner of champions. Under five bucks.'] }
      ] },
    park: { area: 'home', name: 'Neighborhood park', kind: 'park', x: 136, y: 292, w: 206, h: 148,
      actions: [
        { id: 'bench', label: 'Sit on a bench', hours: 1, fx: { energy: 10, sanity: 5 }, say: ['A pigeon sat next to you like a coworker.', 'Old men argued about chess and you learned nothing.'] },
        { id: 'run', label: 'Go for a run', hours: 1, fx: { energy: -12, sanity: 9, full: -10 }, say: ['You ran one lap and called it a 5K.'] }
      ] },
    stoop: { area: 'home', name: 'Stoop', kind: 'stoop', x: 18, y: 404, w: 96, h: 60,
      actions: [
        { id: 'stoop', label: 'Sit on the stoop, people-watch', hours: 1, fx: { sanity: 6 }, say: ['A man walked by with a parrot on his shoulder. Normal Tuesday.', 'Your neighbor told you about the building in 1983. All of it.'] }
      ] },

    // -- midtown
    office: { area: 'midtown', name: 'Office tower', kind: 'glass', x: 18, y: 18, w: 96, h: 200, color: '#6f8fb0',
      actions: [ { id: 'lobby', label: 'Use the fancy lobby bathroom', hours: 0.25, fx: { sanity: 3 }, say: ['Marble. Silence. A brief taste of wealth.'] } ] },
    cowork: { area: 'midtown', name: 'Coworking space', kind: 'glass', x: 132, y: 58, w: 96, h: 160, color: '#7a9a8a', sign: 'HUB HIVE',
      actions: [ { id: 'free', label: 'Sneak free coffee', hours: 0.5, fx: { energy: 12, sanity: -1 }, say: ['You pretended to be on a call. Nobody questioned it.'] } ] },
    staffing: { area: 'midtown', name: 'Staffing agency', kind: 'shop', x: 246, y: 98, w: 96, h: 120, color: '#8a7a6a', awning: '#2b4a6f', sign: 'JOBS NOW',
      actions: [ { id: 'jobs', label: 'Look for work', hours: 1, special: 'jobs', hint: 'See open jobs' } ] },
    mid_sub: { area: 'midtown', name: 'Subway', kind: 'subway', x: 168, y: 232, w: 40, h: 36 },
    plaza: { area: 'midtown', name: 'Billboard plaza', kind: 'plaza', x: 18, y: 290, w: 220, h: 108,
      actions: [
        { id: 'gawk', label: 'Stand still and look up', hours: 0.5, fx: { sanity: -3, cred: -2 }, say: ['Four people bumped you. You are now a tourist.'] },
        { id: 'busk', label: 'Busk for change', hours: 2, special: 'busk', say: [] }
      ] },
    cart: { area: 'midtown', name: 'Halal cart', kind: 'cart', x: 262, y: 304, w: 70, h: 60,
      actions: [ { id: 'platter', label: 'Chicken over rice', hours: 0.5, fx: { cash: -10, full: 60, sanity: 3 }, count: 'carts', say: ['White sauce, hot sauce, a little more white sauce. Science.', 'It was 11pm and it was the best meal of your life.'] } ] },
    dispatch: { area: 'midtown', name: 'Delivery hub', kind: 'shop', x: 18, y: 416, w: 120, h: 80, color: '#55606a', awning: '#e0662e', sign: 'DISPATCH',
      actions: [ { id: 'charge', label: 'Charge your phone', hours: 0.5, fx: { sanity: 2 }, say: ['47%. You can survive anything at 47%.'] } ] },

    // -- downtown
    coffee: { area: 'downtown', name: 'Coffee bar', kind: 'shop', x: 18, y: 86, w: 96, h: 112, color: '#3e3a36', awning: '#c9b28f', sign: 'SINGLE ORIGIN',
      actions: [ { id: 'latte', label: 'Oat latte', hours: 0.5, fx: { cash: -7.5, energy: 18, cred: 1 }, say: ['$7.50. Tastes like a $3 coffee wearing a nice coat.'] } ] },
    brunch: { area: 'downtown', name: 'Brunch spot', kind: 'shop', x: 132, y: 76, w: 96, h: 122, color: '#e7b9a6', awning: '#4d7a5c', sign: 'BRUNCH',
      actions: [ { id: 'brunch', label: 'Bottomless brunch', hours: 2.5, fx: { cash: -48, full: 40, sanity: 18, energy: -15, cred: 3 }, count: 'brunches', say: ['You photographed the eggs before eating them. Mandatory.', 'Someone at the next table said "synergy" without irony.'] } ] },
    thrift: { area: 'downtown', name: 'Vintage store', kind: 'shop', x: 246, y: 96, w: 96, h: 102, color: '#6e4f7a', awning: '#f0a1c2', sign: 'VINTAGE',
      actions: [ { id: 'jacket', label: 'Buy a "vintage" jacket', hours: 1, fx: { cash: -45, cred: 6, sanity: 4 }, once: true, say: ['It smells like 1994. People ask where you got it.'] } ] },
    down_sub: { area: 'downtown', name: 'Subway', kind: 'subway', x: 168, y: 232, w: 40, h: 36 },
    bar: { area: 'downtown', name: 'Dive bar', kind: 'shop', x: 18, y: 290, w: 96, h: 100, color: '#2c2a3a', awning: '#b23a48', sign: 'BAR',
      actions: [ { id: 'hh', label: 'Happy hour', hours: 2, special: 'bar', fx: { cash: -16, sanity: 7, energy: -10 } } ] },
    comedy: { area: 'downtown', name: 'Basement comedy', kind: 'shop', x: 132, y: 290, w: 96, h: 100, color: '#40313a', awning: '#f2c12e', sign: 'COMEDY',
      actions: [
        { id: 'show', label: 'Watch a show', hours: 2, fx: { cash: -15, sanity: 15 }, say: ['A comic did 10 minutes on the G train. You felt seen.'] },
        { id: 'open', label: 'Do an open mic', hours: 2, special: 'openmic', fx: { cash: -5 } }
      ] },
    pier: { area: 'downtown', name: 'Pier', kind: 'pier', x: 246, y: 300, w: 96, h: 150,
      actions: [ { id: 'sunset', label: 'Watch the sunset', hours: 1, fx: { sanity: 12 }, once: true, say: ['The skyline went gold. For one minute, rent didn\'t exist.'] } ] }
  },

  // ---------------------------------------------------------------- random events
  // where: subway | street | night. when(S) optional. options: [{label, fx, say}] or fx/say for no-choice.
  events: [
    // subway
    { id: 'held', where: 'subway', weight: 5, text: '"We are being held momentarily by the train\'s dispatcher." The moment lasts 40 minutes.',
      fx: { hours: 1, sanity: -6 }, count: 'delays', moment: 'got held "momentarily" for 40 minutes' },
    { id: 'express', where: 'subway', weight: 2, text: 'Your local train is now running express. You are now in a different borough.',
      fx: { hours: 1, sanity: -4 }, count: 'delays', moment: 'ended up in the wrong borough on an express' },
    { id: 'show', where: 'subway', weight: 3, text: '"WHAT TIME IS IT?" A dance crew starts flipping off the pole inches from your face.',
      options: [
        { label: 'Tip $2', fx: { cash: -2, sanity: 6 }, say: 'They nodded at you. Respect earned.' },
        { label: 'Stare at your phone', fx: { sanity: -2 }, say: 'A sneaker missed your head by an inch. Classic.' }
      ] },
    { id: 'empty', where: 'subway', weight: 2, text: 'Rush hour, packed train... except one totally empty car.',
      options: [
        { label: 'Get in the empty car', fx: { sanity: -10 }, say: 'It was empty for a reason. You will never speak of it.', moment: 'entered the empty car (never again)' },
        { label: 'Squeeze into the packed one', fx: { sanity: -3 }, say: 'Someone\'s backpack is now part of your skeleton.' }
      ] },
    { id: 'rat_stairs', where: 'subway', weight: 3, text: 'A rat carries an entire bagel down the subway stairs. It is having a better week than you.',
      fx: { sanity: 3 }, count: 'rats', moment: 'watched a rat carry a whole bagel down the stairs' },
    { id: 'seat', where: 'subway', weight: 2, text: 'A seat opens up. You and a stranger lock eyes.',
      options: [
        { label: 'Take it', fx: { energy: 6, cred: -1 }, say: 'You sat. They sighed loudly for 7 stops.' },
        { label: 'Offer it to them', fx: { sanity: 4, cred: 2 }, say: 'They said "God bless." You glowed until Canal St.' }
      ] },
    { id: 'smooth', where: 'subway', weight: 4, text: 'The train came right away. Nobody believes you.', fx: { sanity: 4 } },
    { id: 'tourist', where: 'subway', weight: 2, text: 'A family asks if this is the train to Brooklyn. It is extremely not.',
      options: [
        { label: 'Help them', fx: { hours: 0.5, cred: 3, sanity: 2 }, say: 'You drew a map on a napkin. You are the city now.' },
        { label: '"Yeah, sure"', fx: { cred: -3 }, say: 'They are in the Bronx now. You think about it a lot.' }
      ] },

    // street
    { id: 'mattress', where: 'street', weight: 2, text: 'A perfectly good-looking mattress is leaning on the curb.',
      options: [
        { label: 'Take it home', fx: { sanity: -12 }, say: 'Day 2: you are itchy. You threw it out and everything you love.', moment: 'took a curb mattress home (mistake)' },
        { label: 'Walk away', fx: { cred: 2 }, say: 'Correct. Never take the curb mattress.' }
      ] },
    { id: 'ac', where: 'street', weight: 2, text: 'A window AC unit drips directly into your eye from four floors up.', fx: { sanity: -3 } },
    { id: 'celeb', where: 'street', weight: 2, text: 'You saw someone who was maybe on a TV show once. You played it cool. You did not play it cool.',
      fx: { sanity: 5 }, moment: 'saw a maybe-celebrity and did not play it cool' },
    { id: 'fair', where: 'street', weight: 2, text: 'A street fair closed the avenue. Same 12 stands as every street fair.',
      options: [
        { label: 'Buy a corn cake ($9)', fx: { cash: -9, full: 25, sanity: 5 }, say: 'Worth it. Always worth it.' },
        { label: 'Push through', fx: { hours: 0.5, sanity: -2 }, say: 'You bought a sock. Why did you buy a sock?' }
      ] },
    { id: 'pigeon', where: 'street', weight: 2, text: 'A pigeon walked into the bodega, looked around, and walked out. It knew what it wanted.', fx: { sanity: 2 } },
    { id: 'cellar', where: 'street', weight: 1, text: 'You nearly stepped into an open sidewalk cellar door. A man inside waved.', fx: { sanity: -2, cred: 1 } },
    { id: 'steam', where: 'street', weight: 1, text: 'Steam is rising from a manhole like the city is breathing. It smells like soup and pennies.', fx: { sanity: 1 } },
    { id: 'parking', where: 'street', weight: 1, text: 'Alternate side parking. You watch car owners panic. You have no car. You have never felt so rich.', fx: { sanity: 5 } },
    { id: 'rat_trash', where: 'street', weight: 2, text: 'A trash bag on the curb moved on its own. You crossed the street. Twice.', fx: { sanity: -2 }, count: 'rats' },

    // night / at home (rolled when you go to sleep)
    { id: 'heat', where: 'night', weight: 3, when: S => !S.apt.startsWith('lic'), text: 'The heat isn\'t working. It\'s 58° inside. Landlord: "the boiler guy comes Thursday." He did not say which Thursday.',
      options: [
        { label: 'Call 311', fx: { sanity: 2, cred: 3, energy: -5 }, say: 'You filed a complaint. You feel like a real New Yorker now.', moment: 'called 311 about the heat' },
        { label: 'Sleep in your coat', fx: { energy: -10, sanity: -5 }, say: 'You slept in a coat, hat and one glove. Couldn\'t find the other glove.' }
      ] },
    { id: 'volcano', where: 'night', weight: 2, when: S => S.apt === 'heights_stab' || S.apt === 'ues_walkup', text: 'Now the radiator is on. It is 91° in here. You open the window in November.', fx: { energy: -5, sanity: -2 } },
    { id: 'upstairs', where: 'night', weight: 3, text: 'Your upstairs neighbor is either bowling or moving a piano. At 2am. Every night.', fx: { energy: -8, sanity: -4 } },
    { id: 'leftovers', where: 'night', weight: 3, when: S => NYC.DATA.apartments[S.apt].roommates > 0, text: 'A roommate ate your clearly labeled leftovers and left a note: "sorry lol."',
      options: [
        { label: 'Write a passive-aggressive note', fx: { sanity: 3 }, say: 'Your note had a footnote. You won.' },
        { label: 'Let it go', fx: { sanity: -3, cred: 1 }, say: 'You let it go. Outwardly.' }
      ] },
    { id: 'hike', where: 'night', weight: 2, when: S => S.day > 6 && !NYC.DATA.apartments[S.apt].stabilized && S.apt !== 'couch', text: 'A letter under your door: rent goes up next week. Reason given: "market."',
      fx: { rentHike: 25, sanity: -8 }, moment: 'got a rent hike letter that just said "market"' },
    { id: 'stabletter', where: 'night', weight: 1, when: S => NYC.DATA.apartments[S.apt].stabilized, text: 'The landlord slipped a note offering $5,000 to leave your rent-stabilized apartment. You laughed so hard the radiator laughed back.',
      fx: { sanity: 8, cred: 4 }, moment: 'laughed off a buyout offer for a rent-stabilized lease' },
    { id: 'mouse', where: 'night', weight: 2, text: 'A mouse ran across the kitchen. You named him Gerald. Gerald lives here now.', fx: { sanity: -1 }, count: 'rats', moment: 'adopted a kitchen mouse named Gerald (involuntarily)' },
    { id: 'cousin', where: 'night', weight: 4, when: S => S.apt === 'couch', text: 'Your cousin\'s kids woke you at 6am to show you a rock.', fx: { energy: -10, sanity: 2 } },
    { id: 'parents', where: 'night', weight: 4, when: S => S.perkParents, text: 'Your parents called. They "just want to know what your plan is."',
      options: [
        { label: 'Ask for money', fx: { cash: 200, sanity: -8, cred: -3 }, say: 'They sent $200 and a long sigh, which also arrived by text.' },
        { label: 'Say "it\'s going great"', fx: { sanity: -3 }, say: 'It is not going great.' }
      ] },
    { id: 'quiet', where: 'night', weight: 4, text: 'A quiet night. Just one car alarm. Practically the countryside.', fx: { energy: 5 } }
  ],

  // ---------------------------------------------------------------- billboards (future sponsor slots; all fictional for now)
  billboards: [
    { text: 'GOTHAM PICKLE CO.', sub: 'brined since probably', color: '#2f6b3a' },
    { text: 'YOUR AD HERE', sub: 'seen by every player in Midtown', color: '#b23a48' },
    { text: 'SLEEP IS A SCAM', sub: 'a new energy drink', color: '#2b4a6f' }
  ],

  // ---------------------------------------------------------------- NPC regulars (stand-ins until real players can be seen)
  regulars: [
    { name: 'Deli Dave', place: 'bodega', color: '#5b8c5a' },
    { name: 'Marisol', place: 'park', color: '#c45c8a' },
    { name: 'Mr. Okafor', place: 'stoop', color: '#7a5bc4' },
    { name: 'Tina (walks 6 dogs)', place: 'park', color: '#c4895b' },
    { name: 'Finance Bro', place: 'office', color: '#3b6fb5' },
    { name: 'Influencer', place: 'brunch', color: '#e07aa8' },
    { name: 'Saxophone Guy', place: 'plaza', color: '#d0a030' },
    { name: 'Night Owl', place: 'bar', color: '#4a4a7a' }
  ],
  chatter: [
    'anyone know why the train skipped my stop',
    'bodega cat is ON the register today',
    'my landlord said the heat is a "mindset"',
    'brunch line is 45 min, that means it\'s good',
    'saw a guy walking a cat on a leash on the pier',
    'the dollar slice is $1.50 now. we\'re in a crisis',
    'who left a couch on 4th street, asking for a friend',
    'my roommate is "between careers" again',
    'heard there\'s a rent-stabilized listing going around. probably a myth'
  ]
};
