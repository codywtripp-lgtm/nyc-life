// =====================================================================
// EVERY LINE OF TEXT IN THE GAME LIVES IN THIS FILE.
// To add a joke: find the section, copy a line, change the words.
// {hood} = your neighborhood, {line} = your train, {name} = your name.
// Keep it short, specific and deadpan. Poke at the city, not at people.
// =====================================================================
window.NYC = window.NYC || {};

NYC.DATA = {
  // ---------------------------------------------------------------- backstories
  backgrounds: [
    { id: 'stabilized', name: 'Rent-Stabilized Luck',
      blurb: "Your great-aunt Ruth left you her one-bedroom in Washington Heights. The rent was set when gas cost 89 cents. Your bank account is another story.",
      cash: 180, sanity: 75, cred: 10, apt: 'heights_stab' },
    { id: 'brokerfee', name: 'Broker-Fee Broke',
      blurb: "You paid a broker $4,800 to unlock a door and say 'lots of light.' Nice apartment. Sixty dollars to your name.",
      cash: 60, sanity: 60, cred: 0, apt: 'astoria_2br' },
    { id: 'bus', name: 'Fresh Off the Bus',
      blurb: "One suitcase, one duffel, one dream. Your cousin in Flatbush says you can have the couch 'for a little while.'",
      cash: 420, sanity: 80, cred: 0, apt: 'couch' },
    { id: 'queens', name: 'Queens Born and Raised',
      blurb: "You know which car stops by the exit. Train delays bother you less. You avoid Midtown unless someone pays you.",
      cash: 250, sanity: 70, cred: 20, apt: 'ridgewood_rr', perk: 'trainwise' },
    { id: 'trustfund', name: 'Parents Help a Little',
      blurb: "Your building in Long Island City has a dog spa. You don't have a dog. You do have a fear of being asked what your parents do.",
      cash: 1600, sanity: 55, cred: -10, apt: 'lic_tower', perk: 'parents' },
    { id: 'actor', name: 'Actor, Technically',
      blurb: "Three callbacks, zero roles, one excellent headshot. You live in Bushwick with four roommates and an unshakable belief in yourself.",
      cash: 140, sanity: 85, cred: 5, apt: 'bushwick_rr', perk: 'charm' }
  ],

  // The one-liner people screenshot: "You're a ___ with ___."
  hook: {
    who: ['a Midwest transplant', 'a Long Island escapee', 'a third-generation Queens kid', 'a recent grad with a tote bag', 'a former theater kid', 'a Jersey commuter who finally moved in', 'a Florida transplant', 'a Staten Island kid who finally left'],
    with: ['a sourdough starter named Gary', 'strong opinions about bagels', 'a MetroCard from 2014 for emergencies', 'a bike that has been stolen twice', 'a five-year plan written on a napkin', 'a podcast nobody listens to', 'one good jacket', 'a plant that is mostly dead']
  },

  // ---------------------------------------------------------------- apartments (rent is per week)
  apartments: {
    couch:        { name: "Cousin's couch", hood: 'Flatbush', boro: 'Brooklyn', line: '2 train', rent: 0, rest: 45, vibe: -4, commute: 1, roommates: 4,
                    note: 'Free. The kids wake you at 6am to show you a rock.' },
    heights_stab: { name: 'Rent-stabilized 1BR', hood: 'Washington Heights', boro: 'Manhattan', line: 'A train', rent: 160, rest: 70, vibe: 2, commute: 1, roommates: 0,
                    note: 'Prewar. The radiator has two settings: off and sauna.', stabilized: true, rare: true },
    astoria_2br:  { name: '2BR with one roommate', hood: 'Astoria', boro: 'Queens', line: 'N train', rent: 300, rest: 70, vibe: 2, commute: 1, roommates: 1,
                    note: 'Your roommate labels their oat milk with initials and a date.' },
    ridgewood_rr: { name: 'Railroad apartment', hood: 'Ridgewood', boro: 'Queens', line: 'M train', rent: 260, rest: 62, vibe: 1, commute: 2, roommates: 1,
                    note: "To reach the bathroom you walk through Kevin's room. Kevin is always home." },
    bushwick_rr:  { name: 'Loft share, 4 roommates', hood: 'Bushwick', boro: 'Brooklyn', line: 'L train', rent: 210, rest: 55, vibe: 0, commute: 1, roommates: 4,
                    note: 'Three of the roommates are DJs. The shower curtain cost a dollar.' },
    greenpoint_ferret: { name: 'Sublet with a ferret', hood: 'Greenpoint', boro: 'Brooklyn', line: 'G train', rent: 190, rest: 60, vibe: 1, commute: 2, roommates: 0, ferret: true,
                    note: 'Comes with a ferret named Doug. Doug is not optional.' },
    ev_shoebox:   { name: 'Studio, shower in the kitchen', hood: 'East Village', boro: 'Manhattan', line: 'L train', rent: 520, rest: 62, vibe: 3, commute: 1, roommates: 0,
                    note: 'You can make toast mid-shampoo.' },
    lic_tower:    { name: 'Glass tower 1BR', hood: 'Long Island City', boro: 'Queens', line: '7 train', rent: 790, rest: 90, vibe: 3, commute: 1, roommates: 0,
                    note: 'Doorman, rooftop, a gym nobody uses, walls you can hear a sneeze through.' },
    bedstuy_brn:  { name: 'Brownstone garden unit', hood: 'Bed-Stuy', boro: 'Brooklyn', line: 'C train', rent: 430, rest: 78, vibe: 4, commute: 1, roommates: 0,
                    note: 'Has a backyard. The backyard has a raccoon with seniority.' },
    ues_walkup:   { name: '5th-floor walk-up', hood: 'Upper East Side', boro: 'Manhattan', line: 'Q train', rent: 380, rest: 66, vibe: 1, commute: 1, roommates: 1,
                    note: 'By March you will have calves like a mail carrier.' }
  },

  // ---------------------------------------------------------------- bills (paid with rent every Sunday)
  bills: [
    { name: 'Phone bill', amt: 45 },
    { name: 'Electric (you used the AC once)', amt: 22 },
    { name: 'A streaming app you forgot about', amt: 16 },
    { name: 'Student loan', amt: 60 }
  ],

  // ---------------------------------------------------------------- jobs
  jobs: [
    { id: 'dog', title: 'Dog walker', place: 'park', hours: 3, pay: [45, 70], energy: 10, sanity: 3, req: 0, gig: true, promo: 'Pack Leader',
      lines: ['A doodle named Waffles dragged you across Broadway.', 'Six dogs, one leash tangle, zero witnesses.', 'A tiny dog in a raincoat looked at you like you were late.'] },
    { id: 'barista', title: 'Barista', place: 'coffee', hours: 6, pay: [80, 125], energy: 20, sanity: -4, req: 0, promo: 'Head Barista',
      lines: ['Someone asked for an oat cortado, extra hot, but not too hot.', 'A regular tipped you with a compliment and no money.', 'You drew a leaf in the foam. It looked like a lung.'] },
    { id: 'delivery', title: 'Delivery rider', place: 'dispatch', hours: 5, pay: [45, 150], energy: 30, sanity: -5, req: 0, gig: true, promo: 'Top Rider',
      lines: ['You climbed a sixth-floor walk-up for a $1 tip.', 'It rained. Tips doubled. So did your regret.', 'The customer said "leave it outside" from inside the open door.'] },
    { id: 'cook', title: 'Brunch line cook', place: 'brunch', hours: 8, pay: [125, 150], energy: 30, sanity: -5, req: 8, promo: 'Sous Chef',
      lines: ['You poached 140 eggs. You see them when you close your eyes.', 'A table sent back avocado toast for being too green.', 'Chef threw a ladle. Not at you. Near you.'] },
    { id: 'assistant', title: 'Office assistant', place: 'office', hours: 8, pay: [140, 160], energy: 15, sanity: -9, req: 12, promo: 'Coordinator',
      lines: ["You were cc'd on 200 emails and understood four.", 'There was a meeting to plan a meeting.', 'Someone microwaved fish. The 14th floor is at war.'] },
    { id: 'startup', title: 'Growth lead at a startup', place: 'cowork', hours: 9, pay: [190, 230], energy: 25, sanity: -8, req: 25, promo: 'VP of Vibes', risky: true,
      lines: ['The founder said "we\'re like a bank, but fun."', 'The kombucha tap broke. Morale is low.', 'You pivoted twice before lunch.'] }
  ],

  // ---------------------------------------------------------------- areas + places
  // Map coordinates are in a 360 x 520 viewBox.
  areas: {
    home:     { subway: 'home_sub', ground: '#e9dfcf', places: ['home_apt', 'bodega', 'laundry', 'home_sub', 'slice', 'park', 'stoop', 'hydrant'] },
    midtown:  { name: 'Midtown', boro: 'Manhattan', subway: 'mid_sub', ground: '#dcdcd6', places: ['office', 'cowork', 'staffing', 'mid_sub', 'plaza', 'cart', 'dispatch'] },
    downtown: { name: 'Downtown', boro: 'Manhattan', subway: 'down_sub', ground: '#e6dbd2', places: ['coffee', 'brunch', 'thrift', 'down_sub', 'bar', 'comedy', 'pier'] }
  },

  // fx keys: cash, energy, full (food), sanity, cred, hours.  once: true = once a day.
  // recap: short phrase for the end-of-day card ("Today: ...").
  places: {
    // -- your block
    home_apt: { area: 'home', name: 'Your place', kind: 'brick', x: 18, y: 26, w: 96, h: 170, color: '#b5523b', sign: 'HOME',
      actions: [
        { id: 'sleep', label: 'Go to sleep', special: 'sleep', hint: 'Ends the day' },
        { id: 'nap', label: 'Nap', hours: 2, fx: { energy: 20 }, recap: 'took a nap',
          say: ['You napped through two sirens and a car alarm.', 'You woke up not knowing what year it was.'] },
        { id: 'cook', label: 'Make pasta, again', hours: 1, fx: { cash: -4, full: 35 }, recap: 'made pasta (again)',
          say: ['Pasta with butter. Dinner of a person with a plan.', 'You added an egg. Restaurant quality, basically.'] },
        { id: 'hunt', label: 'Look at apartment listings', hours: 1, special: 'hunt', hint: 'Find a new place' },
        { id: 'doom', label: 'Scroll in bed', hours: 1, fx: { energy: 5, sanity: -4 }, recap: 'lost an hour to your phone',
          say: ["You read a stranger's entire divorce in the comments.", 'You watched a 40-minute video about a bridge in Ohio.'] }
      ] },
    bodega: { area: 'home', name: 'Bodega', kind: 'shop', x: 134, y: 96, w: 92, h: 100, color: '#3f6f8f', awning: '#f2c12e', sign: 'DELI 24HR',
      actions: [
        { id: 'bec', label: 'Egg and cheese on a roll', hours: 0.5, fx: { cash: -5, full: 30, sanity: 2 }, count: 'bodega', npc: 'rafi', recap: 'got an egg and cheese',
          say: ['Salt, pepper, ketchup. Wrapped in foil like a gift.', 'Rafi asks "salt pepper ketchup?" before you open your mouth.'] },
        { id: 'chopped', label: 'Chopped cheese', hours: 0.5, fx: { cash: -8, full: 50, sanity: 3 }, count: 'bodega', npc: 'rafi', recap: 'ate a chopped cheese',
          say: ['Made on a flat-top that has been seasoned since 1998.', 'Rafi cut it on the diagonal for you. That means something.'] },
        { id: 'coffee', label: 'Bodega coffee, light and sweet', hours: 0.25, fx: { cash: -2, energy: 15 }, recap: 'had a bodega coffee',
          say: ['It tastes like the paper cup it came in. Perfect.'] },
        { id: 'cat', label: 'Pet Mango, the bodega cat', hours: 0.25, fx: { sanity: 6 }, once: true, count: 'cats', special: 'cat', recap: 'saw Mango' },
        { id: 'tab', label: 'Ask Rafi to put it on your tab', hours: 0.5, fx: { full: 30 }, special: 'tab', hint: 'Pay $5 later' },
        { id: 'scratch', label: 'Scratch-off ticket', hours: 0.25, special: 'scratch', fx: { cash: -2 } }
      ] },
    laundry: { area: 'home', name: 'Laundromat', kind: 'shop', x: 248, y: 96, w: 94, h: 100, color: '#6d8fa6', awning: '#d9e7ef', sign: 'WASH & FOLD',
      actions: [
        { id: 'wash', label: 'Do laundry', hours: 2, fx: { cash: -9, sanity: 6 }, special: 'laundry', recap: 'did laundry like an adult',
          say: ['A stranger took your clothes out of the dryer and folded them. Wrong, but kindly.', 'Someone took your stuff out of the dryer early. You saw them. They saw you.'] },
        { id: 'wf', label: 'Drop off for wash and fold', hours: 0.25, fx: { cash: -22, sanity: 4 }, special: 'laundry', recap: 'paid for wash and fold',
          say: ['It came back smelling like lavender and someone else\'s socks.'] }
      ] },
    home_sub: { area: 'home', name: 'Subway', kind: 'subway', x: 168, y: 232, w: 40, h: 36 },
    slice: { area: 'home', name: 'Pizza', kind: 'shop', x: 18, y: 292, w: 96, h: 92, color: '#9b2d2d', awning: '#2f8a4f', sign: '$1.50 SLICE',
      actions: [
        { id: 'slice', label: 'Plain slice', hours: 0.25, fx: { cash: -1.5, full: 20 }, count: 'slices', recap: 'folded a slice',
          say: ['You folded it. The guy behind the counter nodded.', 'The paper plate is see-through in under a minute.'] },
        { id: 'two', label: 'Two slices and a can of soda', hours: 0.5, fx: { cash: -4.5, full: 45, sanity: 2 }, count: 'slices2', recap: 'had two slices and a soda',
          say: ['Dinner for under five dollars. You feel like a genius.'] }
      ] },
    park: { area: 'home', name: 'Park', kind: 'park', x: 136, y: 292, w: 206, h: 148,
      actions: [
        { id: 'bench', label: 'Sit on a bench', hours: 1, fx: { energy: 10, sanity: 5 }, recap: 'sat in the park',
          say: ['A pigeon sat next to you like a coworker on break.', 'Two old men argued about chess. Nobody won.'] },
        { id: 'run', label: 'Go for a run', hours: 1, fx: { energy: -12, sanity: 9, full: -10 }, recap: 'went for a run',
          say: ['One lap. You told people it was a 5K.', 'A man doing tai chi outran you.'] }
      ] },
    stoop: { area: 'home', name: 'Stoop', kind: 'stoop', x: 18, y: 404, w: 96, h: 60,
      actions: [
        { id: 'stoop', label: 'Sit on the stoop', hours: 1, fx: { sanity: 6 }, recap: 'sat on the stoop',
          say: ['A man walked by with a parrot on his shoulder. Nobody looked twice.', 'An ice cream truck played its song in a minor key.'] }
      ] },
    hydrant: { area: 'home', name: 'Hydrant', kind: 'hydrant', x: 262, y: 454, w: 26, h: 34, actions: [] },

    // -- midtown
    office: { area: 'midtown', name: 'Office tower', kind: 'glass', x: 18, y: 18, w: 96, h: 200, color: '#6f8fb0',
      actions: [ { id: 'lobby', label: 'Use the lobby bathroom like you work here', hours: 0.25, fx: { sanity: 3 }, recap: 'used a marble bathroom',
        say: ['Marble. Silence. Somebody\'s cologne. You walk out a little taller.'] } ] },
    cowork: { area: 'midtown', name: 'Coworking space', kind: 'glass', x: 132, y: 58, w: 96, h: 160, color: '#7a9a8a', sign: 'HIVE',
      actions: [ { id: 'free', label: 'Take a free coffee', hours: 0.5, fx: { energy: 12, sanity: -1 }, recap: 'stole a coworking coffee',
        say: ['You held your phone to your ear and walked past the front desk.'] } ] },
    staffing: { area: 'midtown', name: 'Staffing agency', kind: 'shop', x: 246, y: 98, w: 96, h: 120, color: '#8a7a6a', awning: '#2b4a6f', sign: 'JOBS NOW',
      actions: [ { id: 'jobs', label: 'Look for work', hours: 1, special: 'jobs', hint: 'See open jobs' } ] },
    mid_sub: { area: 'midtown', name: 'Subway', kind: 'subway', x: 168, y: 232, w: 40, h: 36 },
    plaza: { area: 'midtown', name: 'Plaza', kind: 'plaza', x: 18, y: 290, w: 220, h: 108,
      actions: [
        { id: 'gawk', label: 'Stop and look up', hours: 0.5, fx: { sanity: -3, cred: -2 }, recap: 'got walked into by four people',
          say: ['Four people walked into you. One said "come on" without breaking stride.'] },
        { id: 'busk', label: 'Sing for change', hours: 2, special: 'busk' }
      ] },
    cart: { area: 'midtown', name: 'Halal cart', kind: 'cart', x: 262, y: 304, w: 70, h: 60,
      actions: [ { id: 'platter', label: 'Chicken over rice', hours: 0.5, fx: { cash: -10, full: 60, sanity: 3 }, count: 'carts', recap: 'had chicken over rice',
        say: ['White sauce, hot sauce, a little more white sauce.', 'The guy said "careful, the red is hot." He was right.'] } ] },
    dispatch: { area: 'midtown', name: 'Delivery hub', kind: 'shop', x: 18, y: 416, w: 120, h: 80, color: '#55606a', awning: '#e0662e', sign: 'DISPATCH',
      actions: [ { id: 'charge', label: 'Charge your phone at the outlet', hours: 0.5, fx: { sanity: 2 },
        say: ['47 percent. You can survive anything on 47 percent.'] } ] },

    // -- downtown
    coffee: { area: 'downtown', name: 'Coffee bar', kind: 'shop', x: 18, y: 86, w: 96, h: 112, color: '#3e3a36', awning: '#c9b28f', sign: 'SINGLE ORIGIN',
      actions: [ { id: 'latte', label: 'Oat latte', hours: 0.5, fx: { cash: -7.5, energy: 18, cred: 1 }, recap: 'paid $7.50 for a latte',
        say: ['$7.50. It is a $3 coffee wearing a nice coat.'] } ] },
    brunch: { area: 'downtown', name: 'Brunch spot', kind: 'shop', x: 132, y: 76, w: 96, h: 122, color: '#e7b9a6', awning: '#4d7a5c', sign: 'BRUNCH',
      actions: [ { id: 'brunch', label: 'Bottomless brunch', hours: 2.5, fx: { cash: -48, full: 40, sanity: 16, energy: -15, cred: 3 }, count: 'brunches', recap: 'did bottomless brunch',
        say: ['You photographed the eggs before you ate them.', 'The next table said "synergy" and meant it.'] } ] },
    thrift: { area: 'downtown', name: 'Vintage store', kind: 'shop', x: 246, y: 96, w: 96, h: 102, color: '#6e4f7a', awning: '#f0a1c2', sign: 'VINTAGE',
      actions: [ { id: 'jacket', label: 'Buy a "vintage" jacket', hours: 1, fx: { cash: -45, cred: 6, sanity: 4 }, once: true, sticker: 'jacket', recap: 'bought a jacket that smells like 1994',
        say: ['It smells like 1994. Three people ask where you got it.'] } ] },
    down_sub: { area: 'downtown', name: 'Subway', kind: 'subway', x: 168, y: 232, w: 40, h: 36 },
    bar: { area: 'downtown', name: 'Dive bar', kind: 'shop', x: 18, y: 290, w: 96, h: 100, color: '#2c2a3a', awning: '#b23a48', sign: 'BAR',
      actions: [ { id: 'hh', label: 'Happy hour', hours: 2, special: 'bar', fx: { cash: -16, sanity: 7, energy: -10 }, recap: 'went to happy hour' } ] },
    comedy: { area: 'downtown', name: 'Comedy basement', kind: 'shop', x: 132, y: 290, w: 96, h: 100, color: '#40313a', awning: '#f2c12e', sign: 'COMEDY',
      actions: [
        { id: 'show', label: 'Watch a show', hours: 2, fx: { cash: -15, sanity: 15 }, recap: 'saw a comedy show', count: 'shows',
          say: ['A comic did ten minutes on the G train. The room wept.'] },
        { id: 'open', label: 'Do the open mic', hours: 2, special: 'openmic', fx: { cash: -5 }, recap: 'did an open mic' }
      ] },
    pier: { area: 'downtown', name: 'Pier', kind: 'pier', x: 246, y: 300, w: 96, h: 150,
      actions: [ { id: 'sunset', label: 'Watch the sunset', hours: 1, fx: { sanity: 12 }, once: true, sticker: 'sunset', recap: 'watched the sun go down behind Jersey',
        say: ['The sun went down behind Jersey. Even Jersey looked good.'] } ] }
  },

  // ---------------------------------------------------------------- the cast
  // Talk once a day. Each talk shows the next line; the last line earns their sticker.
  npcs: {
    walt: { name: 'Walt', place: 'hydrant', color: '#7a5b3c', talk: 'Talk to Walt',
      lines: [
        'An older man is yelling at the fire hydrant. "You know what you did," he tells it.',
        'Walt again. "Forty years I\'ve lived on this block. Forty years this hydrant has been against me."',
        'Walt shows you a photo of the hydrant from 1987. It looks the same. "Smug," he says.',
        'Walt says the hydrant soaked his good suit in the summer of \'93. He has not forgiven it.',
        'Walt brought two coffees. One is for you. "The hydrant gets nothing," he says.',
        'Walt nods at the hydrant. "We\'re working on it." He shakes your hand. You have a friend on the block.'
      ], sticker: 'walt' },
    dolores: { name: 'Dolores', place: 'stoop', color: '#c45c8a', talk: 'Talk to Dolores from 2A',
      lines: [
        'Dolores from 2A looks you over. "You\'re the new one. Don\'t use the washer in the basement. It eats socks."',
        'Dolores tells you the building was a speakeasy in 1928. She tells you this like she was there.',
        'Dolores knows who in the building is getting divorced. She tells you. It\'s a lot.',
        '"The super is a good man and a terrible super," Dolores says. "Both things are true."',
        'Dolores gives you a key on a shoelace. "In case you lock yourself out. You will." You are in.'
      ], sticker: 'dolores' },
    jordan: { name: 'Jordan', place: 'brunch', color: '#3b8f8a', talk: 'Talk to Jordan (waiter)',
      lines: [
        'Your waiter, Jordan, says he is "mostly an actor." He refills your water like it\'s a monologue.',
        'Jordan had a callback for a cereal commercial. He did the crunch for you. It was very good.',
        'Jordan did not get the cereal commercial. "They went a different direction. Toward a guy who can eat."',
        'Jordan booked an off-off-Broadway play in a basement in Chelsea. It is about grief and also clowns.',
        'You saw Jordan\'s play. Eleven people were there. You clapped the loudest. He hugged you after.'
      ], sticker: 'jordan' }
  },
  rafi: { // the bodega guy: remembers you by how often you come in
    name: 'Rafi',
    regular: 5,
    regularLine: 'You walk in and Rafi is already cracking two eggs. "The usual." You are a regular.',
    usual: ['"The usual," Rafi says, not a question.', 'Rafi slides it over before you reach the counter.', 'Rafi asks how your mom is. He has never met your mom.'],
    tabNo: 'Rafi shakes his head. "Tab is for regulars, my friend."',
    tabYes: 'Rafi waves it off. "Pay me tomorrow." You will remember this forever.',
    tabPaid: 'You paid Rafi back the $5. He pretended he forgot.'
  },
  mango: { // the bodega cat ignores you, until it doesn't
    after: 6,
    ignore: ['Mango looks at you, then at the wall. The wall wins.', 'Mango is asleep on the bread. You buy a different bread.', 'Mango lets you pet her once, then walks away to think about it.', 'Mango yawns in your direction. Progress?', 'Mango sits on the newspaper you were about to buy.'],
    finally: 'Mango jumps on the counter, headbutts your hand and purrs. Rafi stares. "She doesn\'t do that."',
    friend: ['Mango meets you at the door.', 'Mango sits on your foot until you leave.', 'Mango brings you a bottle cap. A gift.']
  },

  // ---------------------------------------------------------------- random events
  // where: subway | street | night.  when(S) = only if true.  tease = cliffhanger at bedtime.
  events: [
    // subway
    { id: 'held', where: 'subway', weight: 5, count: 'delays', recap: 'got held "momentarily" for 25 minutes',
      text: '"We are being held momentarily by the train\'s dispatcher." Momentarily turns into 25 minutes next to a man eating a whole rotisserie chicken.',
      fx: { hours: 0.5, sanity: -5 } },
    { id: 'express', where: 'subway', weight: 2, count: 'delays', recap: 'rode an accidental express',
      text: 'The {line} goes express without telling anyone. You get off two stops past yours and walk back in the wrong shoes.',
      fx: { hours: 0.75, sanity: -4 } },
    { id: 'turnstile', where: 'subway', weight: 2, recap: 'lost $2.90 to a turnstile',
      text: 'The turnstile takes your $2.90, says "ONE MOMENT," and does not turn. The station agent shrugs through two inches of glass.',
      fx: { cash: -2.9, sanity: -3 } },
    { id: 'showtime', where: 'subway', weight: 3,
      text: '"Showtime!" Three teenagers start flipping off the pole. A sneaker passes your nose by an inch.',
      options: [
        { label: 'Tip a dollar', fx: { cash: -1, sanity: 6 }, say: 'They nod at you. Respect, briefly earned.', recap: 'tipped a dance crew' },
        { label: 'Stay very still', fx: { sanity: -2 }, say: 'The sneaker comes back for a second pass. Still missed. Still terrifying.' }
      ] },
    { id: 'emptycar', where: 'subway', weight: 2,
      text: 'Rush hour. Every car is packed except one, which is completely empty.',
      options: [
        { label: 'Get in the empty car', fx: { sanity: -10 }, say: 'It was empty for a reason. You will not speak of it.', sticker: 'emptycar', recap: 'learned why the car was empty' },
        { label: 'Squeeze into a packed one', fx: { sanity: -3 }, say: 'A stranger\'s backpack is now part of your spine.' }
      ] },
    { id: 'mariachi', where: 'subway', weight: 1, sticker: 'mariachi', recap: 'got serenaded by a mariachi band',
      text: 'A mariachi band gets on at the next stop. Full band, giant guitar and all. They play the whole way and the car claps on the last chorus.',
      fx: { sanity: 12 } },
    { id: 'ratbagel', where: 'subway', weight: 3, count: 'rats', sticker: 'ratbagel', recap: 'watched a rat carry a whole bagel',
      text: 'A rat drags an entire everything bagel down the subway stairs. It is having a better week than you.',
      fx: { sanity: 3 } },
    { id: 'seat', where: 'subway', weight: 2,
      text: 'A seat opens up. You and a stranger lock eyes.',
      options: [
        { label: 'Take it', fx: { energy: 6, cred: -1 }, say: 'You sit. They sigh loudly for seven stops.' },
        { label: 'Let them have it', fx: { sanity: 4, cred: 2 }, say: 'They say "God bless." You feel great until Canal Street.' }
      ] },
    { id: 'tourist', where: 'subway', weight: 2,
      text: 'A family in matching windbreakers asks if this train goes to the Statue of Liberty. It does not.',
      options: [
        { label: 'Help them', fx: { hours: 0.5, cred: 3, sanity: 3 }, say: 'You draw them a map on a napkin. You are the city now.', sticker: 'tourist', recap: 'saved a tourist family' },
        { label: '"Yeah, sure"', fx: { cred: -3 }, say: 'They are in the Bronx now. You think about it a lot.' }
      ] },
    { id: 'doors', where: 'subway', weight: 2, recap: 'got a door held by a stranger',
      text: 'You run for the train. A woman holds the doors with one hand and keeps reading her book with the other.',
      fx: { sanity: 5 } },
    { id: 'smooth', where: 'subway', weight: 3,
      text: 'The train pulls in the second you reach the platform. You will tell three people about this today.',
      fx: { sanity: 4 } },

    // street
    { id: 'mattress', where: 'street', weight: 2,
      text: 'A clean-looking mattress leans against a tree with a sign: "FREE. GOOD CONDITION."',
      options: [
        { label: 'Take it home', fx: { sanity: -12 }, say: 'By morning you are itchy. You threw out the mattress and also your sheets and also your sense of trust.', recap: 'took the curb mattress (mistake)' },
        { label: 'Keep walking', fx: { cred: 2 }, say: 'Correct. Never take the curb mattress.' }
      ] },
    { id: 'couch', where: 'street', weight: 1, sticker: 'couch', recap: 'found a perfect couch on the curb',
      text: 'A mid-century couch sits on the curb with a note: "Works great. Moving to Philly." Two strangers help you carry it home without being asked.',
      fx: { sanity: 12 } },
    { id: 'ac', where: 'street', weight: 2,
      text: 'A window AC unit four floors up drips exactly into your eye.',
      fx: { sanity: -3 } },
    { id: 'celeb', where: 'street', weight: 2, sticker: 'celeb', recap: 'stood next to a guy from a TV show',
      text: 'The guy from a show your mom watches is buying seltzer next to you. You both pretend nothing is happening.',
      fx: { sanity: 5 } },
    { id: 'fair', where: 'street', weight: 2,
      text: 'A street fair closed the avenue. The same booths as every street fair: mozzarepa, tube socks, a massage chair.',
      options: [
        { label: 'Buy a mozzarepa ($9)', fx: { cash: -9, full: 25, sanity: 5 }, say: 'Worth it. Always worth it.', recap: 'ate a street fair mozzarepa' },
        { label: 'Push through', fx: { hours: 0.5, sanity: -2 }, say: 'Somehow you bought a pack of tube socks.' }
      ] },
    { id: 'pigeonshop', where: 'street', weight: 2,
      text: 'A pigeon walks into the bodega, looks around, and walks out. It knew what it wanted.',
      fx: { sanity: 2 } },
    { id: 'parking', where: 'street', weight: 1,
      text: 'Alternate side parking. Grown adults sit in double-parked cars for 90 minutes waiting for the street sweeper. You have no car. You have never felt so rich.',
      fx: { sanity: 5 } },
    { id: 'trashbag', where: 'street', weight: 2, count: 'rats',
      text: 'A trash bag on the curb moves on its own. You cross the street. Then you cross it again, to be safe.',
      fx: { sanity: -2 } },
    { id: 'twenty', where: 'street', weight: 1, recap: 'got your $20 back from a stranger',
      text: 'You dropped a twenty. A guy chases you half a block to give it back. "Don\'t tell anybody," he says.',
      fx: { sanity: 7 } },
    { id: 'piano', where: 'street', weight: 1,
      text: 'Three guys are carrying an upright piano up a stoop. One of them is in charge. It is not going well.',
      fx: { sanity: 3 } },
    { id: 'scaffold', where: 'street', weight: 1,
      text: 'Scaffolding went up on your block. It will be there longer than your lease.',
      fx: { sanity: -1 } },

    // night (rolled at bedtime, shown the next morning)
    { id: 'heat', where: 'night', weight: 3, when: S => S.apt !== 'lic_tower',
      tease: 'The apartment is getting cold. Very cold.',
      text: 'The heat is out. It\'s 58 degrees inside. Vic the super says "the boiler guy comes Thursday." He does not say which Thursday.',
      options: [
        { label: 'Call 311', fx: { sanity: 2, cred: 3, energy: -5 }, say: 'You filed a complaint. Somewhere, a radiator clanks in fear.', sticker: 'call311', recap: 'called 311 about the heat' },
        { label: 'Sleep in your coat', fx: { energy: -10, sanity: -5 }, say: 'Coat, hat and one glove. You never found the other glove.' }
      ] },
    { id: 'sauna', where: 'night', weight: 2, when: S => S.apt === 'heights_stab' || S.apt === 'ues_walkup',
      text: 'Now the radiator works. It is 91 degrees. You sleep with the window open in November.',
      fx: { energy: -5, sanity: -2 } },
    { id: 'bowling', where: 'night', weight: 3,
      tease: 'Something heavy is rolling across the ceiling.',
      text: 'The guy in 4B is either bowling or moving a piano. At 2am. He does this every night.',
      options: [
        { label: 'Bang on the ceiling with a broom', fx: { sanity: 3, energy: -3 }, say: 'He bangs back. You have a nemesis now.', sticker: 'nemesis', recap: 'declared war on 4B' },
        { label: 'Earplugs', fx: { energy: -4 }, say: 'You can still hear it. You can feel it in your teeth.' }
      ] },
    { id: 'leftovers', where: 'night', weight: 3, when: S => NYC.DATA.apartments[S.apt].roommates > 0,
      tease: 'Your roommate is being very quiet in the kitchen.',
      text: 'A roommate ate your clearly labeled leftovers and left a note: "sorry lol."',
      options: [
        { label: 'Write a passive-aggressive note', fx: { sanity: 3 }, say: 'Your note has a footnote. You won.' },
        { label: 'Let it go', fx: { sanity: -3, cred: 1 }, say: 'You let it go. On the outside.' }
      ] },
    { id: 'hike', where: 'night', weight: 2, when: S => S.day > 8 && !NYC.DATA.apartments[S.apt].stabilized && S.apt !== 'couch',
      tease: 'Your landlord slipped a note under the door. You\'ll read it in the morning.',
      text: 'The note says rent goes up $25 a week. Under "reason" it says: "market."',
      fx: { rentHike: 25, sanity: -8 }, recap: 'got a rent hike that just said "market"' },
    { id: 'buyout', where: 'night', weight: 1, when: S => NYC.DATA.apartments[S.apt].stabilized, sticker: 'buyout',
      tease: 'Your landlord slipped a note under the door. You\'ll read it in the morning.',
      text: 'The landlord offers you $5,000 to give up your rent-stabilized lease. You laugh so hard the radiator clanks along.',
      fx: { sanity: 8, cred: 4 }, recap: 'laughed off a buyout offer' },
    { id: 'gerald', where: 'night', weight: 2, count: 'rats', sticker: 'gerald',
      text: 'A mouse runs across the kitchen floor. You name him Gerald. Gerald lives here now.',
      fx: { sanity: -1 }, recap: 'met Gerald the mouse' },
    { id: 'rock', where: 'night', weight: 4, when: S => S.apt === 'couch',
      text: 'Your cousin\'s kids wake you at 6am to show you a rock. It is a good rock.',
      fx: { energy: -10, sanity: 3 } },
    { id: 'doug', where: 'night', weight: 4, when: S => NYC.DATA.apartments[S.apt].ferret,
      text: 'Doug the ferret stole one of your socks and hid it somewhere in the walls. You hear him laughing. Ferrets don\'t laugh. Doug does.',
      fx: { sanity: -2 } },
    { id: 'parents', where: 'night', weight: 4, when: S => S.perkParents,
      tease: 'Your phone is buzzing. It says "MOM".',
      text: 'Your parents just want to know what your plan is.',
      options: [
        { label: 'Ask for money', fx: { cash: 200, sanity: -8, cred: -3 }, say: 'They send $200 and a long sigh, which also arrives by text.' },
        { label: 'Say "it\'s going great"', fx: { sanity: -3 }, say: 'It is not going great.' }
      ] },
    { id: 'soup', where: 'night', weight: 6, when: S => S.sanity < 45 && (S.npc.dolores || 0) >= 2,
      text: 'Dolores from 2A knocks with a container of soup. "You looked tired on the stairs," she says, and leaves before you can thank her.',
      fx: { sanity: 12, full: 25 }, sticker: 'soup', recap: 'got soup from Dolores' },
    { id: 'chirp', where: 'night', weight: 2,
      text: 'Something in the apartment chirps every 40 seconds. A dying smoke detector. Or a bird. Or a dying bird.',
      options: [
        { label: 'Search the whole apartment', fx: { energy: -6 }, say: 'It was the carbon monoxide detector behind the fridge. You are a hero.' },
        { label: 'Put a pillow over your head', fx: { energy: -8, sanity: -3 }, say: 'Chirp. Chirp. Chirp. You dream in chirps.' }
      ] },
    { id: 'quiet', where: 'night', weight: 4,
      text: 'A quiet night. One car alarm and one guy yelling "BRIAN" at 2am. Practically the countryside.',
      fx: { energy: 5 } }
  ],

  // ---------------------------------------------------------------- the first 30 seconds
  arrival: {
    text: 'You come up the subway stairs with two suitcases. A woman selling churros watches you drag them up all 31 steps. When you reach the top she says, "Welcome to New York, baby."',
    options: [
      { label: 'Buy a churro ($2)', fx: { cash: -2, full: 15, sanity: 6 }, say: 'Best two dollars you ever spent. She tells you the good bodega is the one on the corner.', sticker: 'churro', recap: 'bought a welcome churro' },
      { label: 'Say "thanks!"', fx: { sanity: 4 }, say: '"Mm-hm," she says. The bodega on the corner glows like a lighthouse.', recap: 'got welcomed to New York' }
    ]
  },

  // ---------------------------------------------------------------- goals
  // Today: a small task. Day 1 and 2 are fixed so new players learn by doing.
  tasks: [
    { id: 'eat', text: 'Get breakfast at the bodega', acts: ['bec', 'chopped', 'tab'], reward: { sanity: 5 } },
    { id: 'work', text: 'Take the train to Midtown and look for work', acts: ['jobs'], reward: { cred: 2 }, needsNoJob: true },
    { id: 'cat', text: 'Say hi to Mango, the bodega cat', acts: ['cat'], reward: { sanity: 4 } },
    { id: 'walt', text: 'Find out why Walt is yelling at the hydrant', acts: ['talk_walt'], reward: { sanity: 4 } },
    { id: 'dolores', text: 'Meet Dolores on the stoop', acts: ['talk_dolores'], reward: { sanity: 4 } },
    { id: 'slice', text: 'Fold a dollar slice', acts: ['slice', 'two'], reward: { sanity: 3 } },
    { id: 'shift', text: 'Work a shift', acts: ['work'], reward: { cred: 2 }, needsJob: true },
    { id: 'laundry', text: 'Do laundry before you run out of socks', acts: ['wash', 'wf'], reward: { sanity: 4 } },
    { id: 'sunset', text: 'Watch the sunset from the pier', acts: ['sunset'], reward: { sanity: 4 } },
    { id: 'cart', text: 'Get chicken over rice from the cart', acts: ['platter'], reward: { sanity: 3 } },
    { id: 'jordan', text: 'Ask Jordan at the brunch spot how the audition went', acts: ['talk_jordan'], reward: { sanity: 4 } }
  ],
  // This week: rent plus one personal goal.
  weekGoals: [
    { id: 'slices', text: 'Eat 6 dollar slices', count: 'slices', n: 6, reward: { cred: 4 } },
    { id: 'show', text: 'See a comedy show', count: 'shows', n: 1, reward: { cred: 4 } },
    { id: 'bodega', text: 'Go to the bodega 5 times', count: 'bodega', n: 5, reward: { cred: 4 } },
    { id: 'shifts', text: 'Work 4 shifts', count: 'shifts', n: 4, reward: { cred: 4 } },
    { id: 'friends', text: 'Talk to your neighbors 3 times', count: 'talks', n: 3, reward: { cred: 4 } }
  ],
  // The long run: how New York you are, by stickers collected.
  ranks: [
    { n: 0, name: 'Tourist' }, { n: 3, name: 'Transplant' }, { n: 7, name: 'Local' }, { n: 11, name: 'Regular' }, { n: 15, name: 'Real New Yorker' }
  ],

  // ---------------------------------------------------------------- sticker book ("NYC bingo")
  stickers: {
    churro:   { name: 'Welcome churro', hint: 'Say yes on day one' },
    regular:  { name: 'The usual', hint: 'Keep going to the bodega' },
    mango:    { name: 'Mango approves', hint: 'Be patient with the cat' },
    walt:     { name: 'Hydrant diplomacy', hint: 'Hear out the man on the corner' },
    dolores:  { name: 'Spare key', hint: 'Sit with the woman from 2A' },
    jordan:   { name: 'Front row', hint: 'Support the arts (the waiter)' },
    soup:     { name: 'Soup from 2A', hint: 'Have a rough week, have a friend' },
    ratbagel: { name: 'Bagel rat', hint: 'Ride the train enough' },
    mariachi: { name: 'Mariachi express', hint: 'Rare, on the train' },
    emptycar: { name: 'The empty car', hint: 'Make a bad decision' },
    tourist:  { name: 'Unofficial guide', hint: 'Be nice underground' },
    couch:    { name: 'Curb score', hint: 'Rare, on the street' },
    celeb:    { name: 'Played it cool', hint: 'Seltzer aisle, rare' },
    nemesis:  { name: 'Nemesis in 4B', hint: 'Fight back at 2am' },
    call311:  { name: 'Called 311', hint: 'When the heat goes out' },
    gerald:   { name: 'Gerald', hint: 'A small roommate' },
    buyout:   { name: 'Not leaving', hint: 'Only rent-stabilized tenants' },
    jacket:   { name: '1994 jacket', hint: 'Downtown, vintage' },
    sunset:   { name: 'Jersey looked good', hint: 'The pier at the right time' },
    promoted: { name: 'Moving up', hint: 'Keep showing up to work' },
    killed:   { name: 'Killed it', hint: 'The open mic, if you dare' },
    pigeon:   { name: 'Pigeon whisperer', hint: 'Tap things on the map' },
    rentday:  { name: 'Made rent', hint: 'Survive a Sunday' },
    scratch:  { name: 'Bodega jackpot', hint: 'Very lucky' }
  },

  // ---------------------------------------------------------------- billboards (fictional; future sponsor slots)
  billboards: [
    { text: 'GOTHAM PICKLE CO.', sub: 'brined since probably', color: '#2f6b3a' },
    { text: 'YOUR AD HERE', sub: 'seen by every player in Midtown', color: '#b23a48' },
    { text: 'SLEEP IS A SCAM', sub: 'a new energy drink', color: '#2b4a6f' }
  ],

  // ---------------------------------------------------------------- people on the map (computer characters, clearly labeled)
  regulars: [
    { name: 'Rafi', place: 'bodega', color: '#5b8c5a' },
    { name: 'Walt', place: 'hydrant', color: '#7a5b3c' },
    { name: 'Dolores', place: 'stoop', color: '#c45c8a' },
    { name: 'Tina', place: 'park', color: '#c4895b' },
    { name: 'Finance guy', place: 'office', color: '#3b6fb5' },
    { name: 'Sax guy', place: 'plaza', color: '#d0a030' },
    { name: 'Jordan', place: 'brunch', color: '#3b8f8a' },
    { name: 'Bartender', place: 'bar', color: '#4a4a7a' }
  ],
  // Block chat lines (spoken by the characters above).
  chatter: {
    Rafi: ['egg sandwich special till 11. no I will not explain what makes it special', 'Mango is on the register again. use exact change'],
    Walt: ['the hydrant knows what it did', 'anybody seen a guy with a wrench near the hydrant. asking for a reason'],
    Dolores: ['whoever is leaving pizza boxes in the recycling with pizza still in them. I know who you are', 'the super says Thursday. I have heard Thursday since 2009'],
    Tina: ['six dogs, one leash, zero problems. ok one problem'],
    'Finance guy': ['does anyone know a good place for lunch that\'s also a vibe'],
    'Sax guy': ['taking requests. not that one'],
    Jordan: ['callback tomorrow!! send vibes', 'if you come to brunch ask for my section, I will give you extra potatoes and nothing else'],
    Bartender: ['happy hour is 4 to 7. "happy" is a strong word']
  },

  // ---------------------------------------------------------------- interface text
  text: {
    tagline: 'Make it in New York. Or at least make rent.',
    nameLabel: 'Your name',
    reroll: 'Reroll backstory',
    rerollLate: 'Reroll (the city doesn\'t do refunds)',
    start: 'Move to New York',
    hookPrefix: "You're ",
    lookLabels: { skin: 'Skin', hair: 'Hair', hairColor: 'Hair color', shirt: 'Shirt', extra: 'Signature item' },
    hairNames: { short: 'Short', long: 'Long', curly: 'Curly', bun: 'Bun', none: 'None' },
    extraNames: { none: 'Nothing', beanie: 'Red beanie', headphones: 'Big headphones', tote: 'Bodega-cat tote' },
    randomLook: 'Random look',
    backstory: 'Your backstory',
    goalsToday: 'Today',
    goalsWeek: 'This week',
    stickerBook: 'Sticker book',
    yesterdayTitle: '{day} recap',
    nextMorning: 'Next morning',
    soundOn: 'Sound on',
    soundOff: 'Sound off',
    firstTip: 'Tap the glowing place on the map.',
    morningLines: [
      'A garbage truck sang you the song of its people at 6am.',
      'The radiator clanked you awake like an alarm clock from 1930.',
      'Sun came through the airshaft for nine glorious minutes.',
      'Pigeons on the windowsill. They were here first.',
      'You woke up before your alarm and lay there out of spite.'
    ],
    tiredMorning: 'You slept, technically.',
    burnout: 'You hit empty. Tomorrow you will not get out of bed until 8pm. You will watch an entire season of a baking show. It will help.',
    burnoutRecap: 'burned out and lost a day in bed',
    parentsVenmo: 'Your parents sent $250 with the memo "for groceries (real ones)."',
    lightsOutHome: 'You fell asleep with your shoes on.',
    lightsOutBlock: 'You fell asleep on the stoop. Dolores put a blanket on you. Weird, but nice.',
    lightsOutAway: 'You fell asleep on the train and woke up at the last stop. It took two hours to get home.',
    walked: 'No money for the fare. You walked. Your calves will remember this.',
    missedShift: 'You skipped work today. Strike {n} of 3.',
    fired: 'You missed 3 shifts. You\'re fired.',
    socks: 'Out of clean socks. You turned a pair inside out.',
    startupFolded: 'Your startup ran out of money. Everyone got a hoodie.',
    evicted: 'Evicted. Your cousin says the couch is "always there for you." It sounds like a threat.',
    jobNo: ['They\'ll "keep your resume on file." The file is a recycling bin.', 'They hired someone with five years of experience for an entry-level job.', 'They asked where you see yourself in five years. You said "alive."'],
    jobNotYet: 'Not enough cred yet. Get some: help a tourist, try the open mic, wear a vintage jacket.',
    scratchBig: 'YOU WON $500. Rafi says this happened once before, in 2009.',
    scratchSmall: 'Won $20. You spent it in your head immediately.',
    scratchEven: 'Won $2. You broke even. Gambling is easy.',
    scratchNo: ['Nothing. Mango watched you lose.', 'Nothing. You scratched it with a key and now the key is sad.', 'So close. It was not close.'],
    buskBig: 'A crowd of tourists stops for you. {pay}. One filmed it. You might be famous in Ohio.',
    buskSmall: 'Mostly coins and one subway token from 1995. {pay}.',
    buskNone: 'Nothing. The sax guy across the plaza is your rival now.',
    barNetwork: 'You met a woman who "knows a guy" at the staffing agency. +5 cred.',
    barRounds: 'You agreed to "one more." It was three more.',
    barPlain: ['The jukebox played the same song four times. Nobody stopped it.', 'You told a stranger your rent. They told you theirs. They won.'],
    micGood: 'Your bit about your landlord killed. A guy in the back said "you should do this for real."',
    micBad: 'You bombed. One guy laughed, but it was at his phone.',
    promoted: 'You got promoted to {promo}. Pay goes up 18%.',
    hired: 'You got the job: {title}. Your shifts are at the {place}.',
    moved: 'You moved to {hood}. {note}',
    rentPaid: 'Rent day: paid {amt}.',
    rentShort: 'Rent day: you came up {amt} short.',
    rentHalf: 'You moved in mid-week, so the first rent is half.',
    weekPaid: 'Rent paid. You live here another week.',
    weekShort: 'You came up short. The landlord gave you a look through the peephole.',
    weekEvicted: 'Evicted. Back to the couch.',
    pigeons: ['The pigeons scatter, then land in the exact same spot.', 'One pigeon refuses to move. Respect.', 'The pigeons regroup. They\'re planning something.'],
    taskDone: 'Done: {task}',
    weekGoalDone: 'Week goal done: {goal}',
    newSticker: 'New sticker: {name}',
    newRank: 'You\'re now a {rank}.',
    shareSaved: 'Saved the picture. Post it anywhere.',
    chatNote: 'Block chat. Everyone here for now is a computer character from your neighborhood. Real players show up here when multiplayer is on.',
    shareFooter: 'Play free: NYC Life, in your browser',
    recapEmpty: 'stared at the ceiling',
    tomorrow: 'Tomorrow'
  }
};
