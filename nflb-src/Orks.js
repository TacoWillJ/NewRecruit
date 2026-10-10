// NFLB overlay for Orks — the 24 Sept-2026 codex-refresh cards (15 Legendary Proxy + 9 HB).
// Source: Primarch Project\Workspace\generate_ork_lp_cards_batch{1,2,3}.js, snapshotted into
// data/orks-cards.json. Orks have no separate library catalogue, so this spec is merged
// inline into Orks.json (see sync-upstream.js).

const cards = require('./data/orks-cards.json');

// Units that are more than one model (everything else is a single-model unit)
const MULTI = {
  'Big Gunz': { perModelPts: 55, choose: { name: 'Big Gun', min: 1, max: 3 } },
  'Nobz on Warbikes': { model: 'Nob on Warbike', min: 3, max: 3 },
  'Deffkoptas with Big Shootas': { model: 'Deffkopta', min: 3, max: 3 },
  // priced like its Warbuggies proxy: 70 for one, 130 for two
  'Skorchas': { model: 'Skorcha', min: 1, max: 2, ptsAt2: 130 },
};
const PRIMARY = ['Epic Hero', 'Character', 'Battleline', 'Monster', 'Vehicle', 'Mounted', 'Infantry'];
const amp = s => String(s).replace(/&bull;/g, '•').replace(/&amp;/g, '&');

module.exports = {
  faction: 'Orks.json',
  factionLibrary: 'Orks.json',
  inline: true,

  build(b) {
    const { weapon: W, link, choice, model, group, ability, transport, catLinks, ruleLinks, leadAssociation, cons } = b;
    const units = [];
    const leaders = [];

    for (const { batch, data: d } of cards) {
      const title = d.title;
      const key = `ork:${title}`;
      const multi = MULTI[title];

      // ---- weapons (rows "Name — Profile" are one multi-profile weapon) ----
      const weapons = new Map();
      for (const [rows, melee] of [[d.ranged || [], false], [d.melee || [], true]]) {
        for (const r of rows) {
          const [base, suffix] = r.name.split(/\s+—\s+/);
          if (!weapons.has(base)) weapons.set(base, { melee, profiles: [] });
          const w = weapons.get(base);
          if (w.profiles.some(p => p.suffix === (suffix || null))) continue; // duplicate row (e.g. 2 klaws)
          w.profiles.push({ suffix: suffix || null, stats: [r.range, r.a, r.bs, r.s, r.ap, r.d], kw: (r.kw || []).join(', ') });
        }
      }
      const gear = [...weapons].map(([name, w]) => {
        const stats = w.profiles.length === 1 && !w.profiles[0].suffix ? w.profiles[0].stats : Object.fromEntries(w.profiles.map(p => [p.suffix.toLowerCase(), p.stats]));
        const kw = w.profiles.length === 1 ? w.profiles[0].kw : w.profiles.map(p => p.kw);
        return W(name, stats, { keywords: kw, melee: w.melee, matchOfficial: true });
      });

      // ---- abilities / rules ----
      const rules = ['Waaagh!'];
      const profiles = [];
      let leaderText = null;
      for (const a of d.abilities) {
        if (a.name === 'Core') rules.push(...a.desc.split(/,\s*/));
        else if (/^Faction/.test(a.name)) continue; // army rule linked below
        else if (a.name === 'Leader') { leaderText = a.desc; rules.push('Leader'); profiles.push(ability(key, 'Leader', a.desc)); }
        else profiles.push(ability(key, a.name, amp(a.desc)));
      }
      const cap = (d.composition.match(/Transport capacity of [^.]*(\([^)]*\))?[^.]*\./) || [])[0];
      if (cap) profiles.push(transport(key, cap.replace(/^Transport capacity of /, 'This model has a transport capacity of ')));
      if (batch === '1' || batch === '2') {
        profiles.push(ability(key, 'Legendary Proxy', `GW's Legendary Proxies list has this unit count as ${d.proxyOf}. NFLB keeps it as its own datasheet, anchored to that unit's current 11th edition rules, until GW reinstates it.`));
      }

      // ---- keywords ----
      const kws = amp(d.keywords).split(/\s*•\s*/).map(k => (k === 'Orks' ? 'Faction: Orks' : k));
      const primary = PRIMARY.find(p => kws.includes(p)) || kws[0];
      const stats = [d.stats.M, d.stats.T, d.stats.SV, d.stats.W, d.stats.LD, d.stats.OC, d.insv || ''];

      const common = {
        categoryLinks: catLinks(key, kws, primary),
        infoLinks: ruleLinks(key, rules),
        profiles: [b.unitProfile(title, stats), ...profiles],
      };

      let u;
      if (!multi) {
        u = { name: `${title} [NFLB]`, id: b.id(`unit:${title}`), hidden: false, import: true, type: 'model',
          costs: [{ name: 'pts', typeId: b.PTS, value: d.points }], ...common,
          entryLinks: gear.map(w => link(key, w)) };
        if (kws.includes('Epic Hero')) u.constraints = cons(`${key}:roster`, null, 1, 'roster');
      } else if (multi.choose) {
        // each model picks one weapon (Big Gunz): one model entry per weapon, priced per model
        const models = gear.map(w => model(key, `${multi.choose.name} w/ ${w.name}`, { max: multi.choose.max, pts: multi.perModelPts, gear: [link(key + w.name, w)] }));
        u = { name: `${title} [NFLB]`, id: b.id(`unit:${title}`), hidden: false, import: true, type: 'unit',
          costs: [{ name: 'pts', typeId: b.PTS, value: 0 }], ...common,
          selectionEntryGroups: [group(key, `${multi.choose.min}-${multi.choose.max} ${title}`, models, { min: multi.choose.min, max: multi.choose.max, def: models[0] })] };
      } else {
        const m = model(key, multi.model, { min: multi.min, max: multi.max, gear: gear.map(w => link(key + ':m', w)) });
        u = { name: `${title} [NFLB]`, id: b.id(`unit:${title}`), hidden: false, import: true, type: 'unit',
          costs: [{ name: 'pts', typeId: b.PTS, value: d.points }], ...common, selectionEntries: [m] };
        if (multi.ptsAt2) {
          u.modifiers = [{ field: b.PTS, type: 'set', value: multi.ptsAt2,
            conditions: [{ childId: 'model', field: 'selections', includeChildSelections: true, scope: 'self', shared: true, type: 'atLeast', value: 2 }] }];
        }
      }
      units.push(u);
      if (leaderText) leaders.push([u, key, leaderText]);
    }

    // Leader targets: official units by name (incl. "[Legends]"), or NFLB units built above
    for (const [u, key, text] of leaders) {
      const names = text.replace(/.*following units?:\s*/i, '').replace(/\.$/, '').split(/,\s*/);
      const targets = names.map(n => units.find(x => x.name === `${n} [NFLB]`) || n);
      u.associations = [leadAssociation(key, targets)];
    }

    return { rootUnits: units };
  },
};
