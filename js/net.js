// Network layer. v1 ships LocalNet: no server, "regulars" are NPCs that stand where
// real players will appear later. To add multiplayer, write SupabaseNet or
// CloudflareNet with the same five methods and swap it in at the bottom.
//
//   connect(player)            -> join (player = { id, name, look })
//   setPresence(area, placeId) -> tell others where you are standing
//   onPresence(cb)             -> cb(list of { id, name, color, area, place, npc })
//   sendChat(text)             -> post to the chat for your current area
//   onChat(cb)                 -> cb({ name, text, area, mine })
//
// Supabase: Realtime "presence" + "broadcast" on a channel per area does all five.
// Cloudflare: one Durable Object per area holding a WebSocket room does the same.
// Money and rent should then be checked on the server (see README: shared economy).
(function () {
  const D = NYC.DATA;

  function LocalNet() {
    let me = null, area = 'home', presenceCbs = [], chatCbs = [], timer = null;

    function others() {
      return D.regulars
        .filter(r => D.places[r.place].area === area)
        .map((r, i) => ({ id: 'npc' + i, name: r.name, color: r.color, area, place: r.place, npc: true }));
    }
    const pushPresence = () => presenceCbs.forEach(cb => cb(others()));

    return {
      kind: 'local',
      connect(player) {
        me = player;
        clearInterval(timer);
        timer = setInterval(() => {
          if (Math.random() < 0.5) return;
          const here = others().filter(o => D.chatter[o.name]);
          if (!here.length) return;
          const who = here[Math.floor(Math.random() * here.length)];
          const lines = D.chatter[who.name];
          const text = lines[Math.floor(Math.random() * lines.length)];
          chatCbs.forEach(cb => cb({ name: who.name, text, area, mine: false }));
        }, 9000);
      },
      setPresence(a) { area = a; pushPresence(); },
      onPresence(cb) { presenceCbs.push(cb); },
      sendChat(text) { chatCbs.forEach(cb => cb({ name: me ? me.name : 'You', text, area, mine: true })); },
      onChat(cb) { chatCbs.push(cb); }
    };
  }

  NYC.Net = LocalNet();
})();
