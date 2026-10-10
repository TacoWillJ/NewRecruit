// NFLB overlay for Orks — the 24 Sept-2026 codex-refresh cards (15 Legendary Proxy + 9 HB).
// Source: Primarch Project\Workspace\generate_ork_lp_cards_batch{1,2,3}.js, snapshotted into
// data/orks-cards.json. Orks have no separate library catalogue, so this spec is merged
// inline into Orks.json (see sync-upstream.js).

const cards = require('./data/orks-cards.json');

// Units that are more than one model (everything else is a single-model unit)
const MULTI = {
  'Big Gunz': { perModel: true, choose: { name: 'Big Gun', min: 1, max: 3 } }, // priced per model, like Mek Gunz
  'Nobz on Warbikes': { model: 'Nob on Warbike', min: 3, max: 3 },
  'Deffkoptas with Big Shootas': { model: 'Deffkopta', min: 3, max: 3 },
  // priced like its Warbuggies proxy, including Warbuggies' 2-model price
  'Skorchas': { model: 'Skorcha', min: 1, max: 2, tierAt2: true },
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
      // points follow the anchor unit's current Munitorum Field Manual cost (+ the card's offset)
      const pts = d.anchor ? b.trackedPts(d.title, d.anchor, d.points) : d.points;
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
          costs: [{ name: 'pts', typeId: b.PTS, value: pts }], ...common,
          entryLinks: gear.map(w => link(key, w)) };
        if (kws.includes('Epic Hero')) u.constraints = cons(`${key}:roster`, null, 1, 'roster');
      } else if (multi.choose) {
        // each model picks one weapon (Big Gunz): one model entry per weapon, priced per model
        const models = gear.map(w => model(key, `${multi.choose.name} w/ ${w.name}`, { max: multi.choose.max, pts, gear: [link(key + w.name, w)] }));
        u = { name: `${title} [NFLB]`, id: b.id(`unit:${title}`), hidden: false, import: true, type: 'unit',
          costs: [{ name: 'pts', typeId: b.PTS, value: 0 }], ...common,
          selectionEntryGroups: [group(key, `${multi.choose.min}-${multi.choose.max} ${title}`, models, { min: multi.choose.min, max: multi.choose.max, def: models[0] })] };
      } else {
        const m = model(key, multi.model, { min: multi.min, max: multi.max, gear: gear.map(w => link(key + ':m', w)) });
        u = { name: `${title} [NFLB]`, id: b.id(`unit:${title}`), hidden: false, import: true, type: 'unit',
          costs: [{ name: 'pts', typeId: b.PTS, value: pts }], ...common, selectionEntries: [m] };
        if (multi.tierAt2) {
          // the anchor's own "2 models" price (+ the same offset)
          const anchor = b.lib.sharedSelectionEntries.find(e => e.name === d.anchor.name);
          const tier = (anchor.modifiers || []).find(m => m.field === b.PTS && m.type === 'set');
          if (!tier) throw new Error(`${title}: anchor ${d.anchor.name} has no 2-model price`);
          u.modifiers = [{ field: b.PTS, type: 'set', value: tier.value + d.anchor.offset,
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

    // ---------- NFLB-L: rebalanced Legends (user decision 2026-10-10) ----------
    // Older Forge World Legends keep pre-codex weapons. Big Trakk and Kill Tank still carry the old
    // Kannon; their NFLB-L copies use the current codex Kannon (as on the Gargantuan Squiggoth),
    // keeping the crew's BS. They replace the official [Legends] entries, which are hidden.
    const SHOW_LEGENDS = '9ed-cbf4-bfe5-90bf';
    const squig = b.lib.sharedSelectionEntries.find(e => e.name === 'Gargantuan Squiggoth');
    const currentKannon = [];
    (function walk(o) { if (Array.isArray(o)) return o.forEach(walk); if (!o || typeof o !== 'object') return;
      if (o.typeName && /^➤ Kannon - /i.test(o.name || '')) currentKannon.push(o); Object.values(o).forEach(walk); })(squig);
    if (currentKannon.length !== 2) throw new Error('current Kannon profiles not found on Gargantuan Squiggoth');
    const injections = [];
    for (const legend of ['Big Trakk', 'Kill Tank']) {
      const src = b.lib.sharedSelectionEntries.find(e => e.name === `${legend} [Legends]`);
      if (!src) throw new Error(`${legend} [Legends] no longer exists upstream`);
      const u = b.cloneEntry(src, `nl:${legend}`, {
        name: `${legend} [NFLB-L]`,
        inline: l => /^Kannon$/i.test(l.name),
        dropModifier: m => JSON.stringify(m.conditions || []).includes(SHOW_LEGENDS),
      });
      if (!b.patchProfiles(u, /^➤ Kannon - /i, currentKannon)) throw new Error(`${legend}: no Kannon profiles patched`);
      u.profiles = [...(u.profiles || []), ability(`nl:${legend}`, 'NFLB-L Rebalance',
        `GW's ${legend} [Legends] datasheet with its Kannon updated to the current Codex: Orks profile. Replaces the official Legends entry; points follow GW's Legends points.`)];
      units.push(u);
      injections.push({ file: 'Orks.json', entryName: `${legend} [Legends]`,
        modifier: { field: 'hidden', type: 'set', value: true, comment: 'NFLB-L replacement' } });
    }

    // ---------- Kill Team kits brought into 40k (user decision 2026-10-10) ----------
    // Kommandos (KT 2024): Snipa, Slasha and Comms Boys have no 40k option. They are added as model
    // options inside GW's own Kommandos datasheet, copied from its "Kommandos w/ Slugga and choppa"
    // model so they keep the official Kommando statline. (Bomb Squig and Kommando Grot are already
    // covered by GW's 11e Kommandos rules.)
    const kommandos = b.lib.sharedSelectionEntries.find(e => e.name === 'Kommandos');
    const kGroup = (kommandos.selectionEntryGroups || []).find(g => g.name === '9 Kommandos');
    const kBoy = kGroup && kGroup.selectionEntries.find(m => m.name === 'Kommandos w/ Slugga and choppa');
    if (!kBoy) throw new Error('Kommandos model "Kommandos w/ Slugga and choppa" not found upstream');
    const specialist = (name, keep, weapons, extraProfiles = []) => {
      const m = b.cloneEntry(kBoy, `kt:${name}`, { name: `${name} [NFLB]` });
      m.entryLinks = (m.entryLinks || []).filter(l => keep.includes(l.name));
      m.entryLinks.push(...weapons.map(w => link(`kt:${name}`, w)));
      m.constraints = cons(`kt:${name}:max`, null, 1);
      if (extraProfiles.length) m.profiles = [...(m.profiles || []), ...extraProfiles];
      return m;
    };
    const kSpecialists = [
      specialist('Kommando Snipa Boy', ['Choppa'], [W('Scoped big shoota', ['36"', 2, '4+', 5, -1, 2], { keywords: 'Heavy, Precision' })]),
      specialist('Kommando Slasha Boy', [], [W('Twin choppas', ['Melee', 3, '3+', 5, -1, 1], { keywords: 'Twin-linked' }), W('Throwing knives', ['12"', 2, '5+', 4, -1, 1], { keywords: 'Assault' })]),
      specialist('Kommando Comms Boy', ['Slugga', 'Choppa'], [], [ability('kt:comms', 'Comms Boy', 'Each time you target this model\'s unit with a Stratagem, roll one D6: on a 5+, you gain 1CP.')]),
    ];
    for (const m of kSpecialists) injections.push({ file: 'Orks.json', entryName: 'Kommandos', within: '9 Kommandos', selectionEntry: m });

    // Wrecka Krew (KT 2024): Breaka Boyz and Tankbustas fighting as one mob under a Wrecka Boss Nob.
    // Built from copies of GW's own Breaka Boyz unit + Tankbusta models (official stats, weapons,
    // abilities). 9 models = 3/4 of one Breaka Boyz + one Tankbustas unit, so it costs 3/4 of their
    // combined points (rounded to 5) and follows the Field Manual.
    const breaka = b.lib.sharedSelectionEntries.find(e => e.name === 'Breaka Boyz');
    const busta = b.lib.sharedSelectionEntries.find(e => e.name === 'Tankbustas');
    if (!breaka || !busta) throw new Error('Breaka Boyz / Tankbustas not found upstream');
    const wk = b.cloneEntry(breaka, 'kt:wrecka', { name: 'Wrecka Krew [NFLB]' });
    const bGroup = wk.selectionEntryGroups.find(g => /Breaka Boyz/.test(g.name));
    bGroup.name = '4 Breaka Boyz';
    for (const c of bGroup.constraints || []) if (c.field === 'selections') c.value = 4;
    const bBoy = bGroup.selectionEntries.find(m => m.name === 'Breaka Boy');
    for (const c of bBoy.constraints || []) if (c.type === 'min') c.value = 2; else if (c.type === 'max') c.value = 4;
    const nobGroup = wk.selectionEntryGroups.find(g => g.name === 'Nob');
    const nob = nobGroup.selectionEntries.find(m => m.name === 'Nob');
    nob.name = 'Wrecka Boss Nob';
    const tGroupSrc = busta.selectionEntryGroups.find(g => g.name === 'Tankbustas');
    const tGroup = b.cloneEntry(tGroupSrc, 'kt:wrecka:bustas', { name: '4 Tankbustas' });
    for (const c of tGroup.constraints || []) if (c.field === 'selections') c.value = 4;
    const tBoy = tGroup.selectionEntries.find(m => m.name === 'Tankbusta w/ Busta Rokkit Launcha');
    for (const c of tBoy.constraints || []) if (c.type === 'min') c.value = 2; else if (c.type === 'max') c.value = 4;
    wk.selectionEntryGroups.push(tGroup);
    // Tankbustas' own unit ability + keyword travel with their models
    const barrage = (busta.profiles || []).filter(p => p.typeName === 'Abilities');
    wk.profiles = [...(wk.profiles || []), ...barrage.map(p => b.cloneEntry(p, `kt:wrecka:${p.name}`, { name: p.name })),
      ability('kt:wrecka', 'Wrecka Krew', 'This unit counts as both a **^^Breaka Boyz^^** unit and a **^^Tankbustas^^** unit for rules that refer to either.')];
    wk.categoryLinks = [...wk.categoryLinks.filter(c => c.name !== 'Breaka Boyz'), ...catLinks('kt:wrecka', ['Breaka Boyz', 'Tankbustas', 'Wrecka Krew'], null)];
    const wkPts = Math.round((b.officialPts('Breaka Boyz') + b.officialPts('Tankbustas')) * 0.75 / 5) * 5;
    wk.costs = wk.costs.map(c => (c.name === 'pts' ? { ...c, value: wkPts } : c));
    units.push(wk);

    return { rootUnits: units, injections };
  },
};
