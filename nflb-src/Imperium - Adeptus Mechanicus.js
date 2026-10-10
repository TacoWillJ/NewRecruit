// NFLB overlay for Imperium - Adeptus Mechanicus: Horus Heresy Mechanicum (incl. Dark
// Mechanicum) + Legio Cybernetica battle robots, plus the Taghmata Omnissiah and Dark
// Mechanicum detachments. Source: Primarch Project\Workspace\homebrew_cp_11e\source\
// _reference-*.html, parsed by Workspace\export_ref_cards_json.js into data/admech-cards.json.
//
// Gating (user decision 2026-10-10): Horus Heresy units only appear with one of the two
// Mechanicum detachments; Heterodox-locked units only with Dark Mechanicum. The four
// battle robots are ordinary 40k units and always available. Units GW already covers
// (Termite, Decimator, Blood Slaughterer, Brass Scorpion, Kytan, Tarantula) are not built:
// the official Legends entries are linked in instead.

const cards = require('./data/admech-cards.json');
const LEGENDS_LIB = 'Library - Astartes Heresy Legends';

// Model structure for every unit that is not a single model
const COMP = {
  'arcuitor-magisterium': { models: [['Magister', 1, 1, 'all'], ['Arcuitor', 4, 4, 'all']] },
  'arlatax-battle-automata': { models: [['Arlatax', 3, 3, 'all']], extra: ['Arlatax', 2, 75] },
  'bonepicker-host': { models: [['Bonepicker', 10, 20, 'all']], ptsAbove: [10, 110] },
  'castellax-battle-automata': { models: [['Castellax', 3, 3, 'all']], extra: ['Castellax', 2, 60] },
  'castellax-destructor-automata': { models: [['Castellax', 3, 3, 'all']], extra: ['Castellax', 2, 75] },
  'castellax-infernus-maniple': { models: [['Castellax', 3, 3, 'all']], extra: ['Castellax', 2, 65] },
  'domitar-battle-automata': { models: [['Domitar', 3, 3, 'all']], extra: ['Domitar', 2, 65] },
  'echidnax-servo-maniple': { models: [['Echidnax', 6, 12, 'all']], ptsAbove: [6, 125] },
  'krios-battle-tank': { models: [['Krios Battle Tank', 1, 1, 'all']], extra: ['Krios Battle Tank', 2, 145] },
  'krios-venator': { models: [['Krios Venator', 1, 1, 'all']], extra: ['Krios Venator', 2, 165] },
  'myrmidon-destructor-host': {
    models: [['Destructor Prime', 1, 1, ['Power Weapon']]],
    pick: [{ owner: 'Destructor Prime', name: 'Heavy weapon', from: ['Conversion Beamer', 'Plasma Fusil', 'Twin Volkite Calivers'] },
      { owner: 'Destructor Prime', name: 'Graviton Imploder', from: ['Graviton Imploder'], min: 0 }],
    perWeapon: { name: 'Destructor', count: 4, from: ['Conversion Beamer', 'Plasma Fusil', 'Twin Volkite Calivers'], also: ['Power Weapon'] },
  },
  'myrmidon-secutor-host': { models: [['Secutor Prime', 1, 1, ["Prime's Power Maul"]], ['Secutor', 4, 4, ['Power Axe']]] },
  'scyllax-guardian-automata': { models: [['Sub-Construct Alpha', 1, 1, ['Bolt Caster', "Alpha's Mass-Driver Fist"]], ['Scyllax', 4, 4, ['Bolt Caster', 'Power Blade']]], extra: ['Scyllax', 5, 18] },
  'skitarii-battle-pilgrym-corpus': { models: [['Pilgrym Sub-Lead', 1, 1, ["Sub-Lead's Plasma Pistol", 'Pilgrym Staff']], ['Pilgrym', 9, 9, ["Pilgrym's Lasgun", 'Pilgrym Staff']]] },
  'tech-thrall-covenant': { models: [['Thrall Overseer', 1, 1, ["Overseer's Subjugator Staff (Ranged)", 'Subjugator Staff']], ['Thrall', 19, 19, ['Las-Lock', 'Close Combat Weapon']]] },
  'tech-thrall-defence-covenant': { models: [['Garrison Overseer', 1, 1, 'all'], ['Defence Thrall', 9, 9, 'all']] },
  'thallax-cohort': {
    models: [['Thallarch', 1, 1, ['Lightning Gun', 'Power Fist']], ['Thallax', 4, 4, ['Lightning Gun', 'Power Fist']]],
    swap: { owner: 'Thallax', max: 2, name: 'Thallax w/ heavy weapon', from: ['Photon Thruster', 'Multi-melta', 'Plasma Fusil'], also: ['Power Fist'] },
    extra: ['Thallax', 4, 18],
  },
  'thanatar-siege-automata': { perWeapon: { name: 'Thanatar', count: [1, 2], from: ['Hellex Plasma Mortar', 'Sollex-Pattern Heavy Lascannon Array', 'Graviton Ram Battery'], also: ['Twin Mauler Bolt Cannon', 'Siege Fists'], ptsEach: 285 } },
  'ursarax-cohort': { models: [['Ursarch', 1, 1, ["Ursarch's Power Maul"]], ['Ursarax', 4, 4, ['Lightning Claws (Paired)']]] },
  'vorax-attack-automata': { models: [['Sub-Construct Alpha', 1, 1, 'all'], ['Vorax', 2, 2, 'all']], extra: ['Vorax', 3, 45] },
  'vultarax-stratos-automata': { models: [['Vultarax', 1, 1, 'all']], extra: ['Vultarax', 2, 110] },
};

const PRIMARY = ['Epic Hero', 'Character', 'Battleline', 'Monster', 'Vehicle', 'Mounted', 'Infantry'];
const CORE_RULE = /^(Deadly Demise|Deep Strike|Scouts|Stealth|Feel No Pain|Infiltrators|Lone Operative|Fights First|Firing Deck|Hover|Leader)/i;
const title = s => s.toLowerCase().replace(/(^|[\s(\-'/])([a-z])/g, (m, a, b) => a + b.toUpperCase());
const cleanWeapon = n => n.replace(/\s*\((?:[^)]*\bonly|hull|built-in|defensive|calix|cynis|x\d)\)\s*$/i, '').trim();

module.exports = {
  faction: 'Imperium - Adeptus Mechanicus.json',
  factionLibrary: 'Imperium - Adeptus Mechanicus.json',
  inline: true,

  build(b) {
    const { weapon: W, link, model, group, choice, ability, unitProfile, catLinks, ruleLinks, leadAssociation, cons, shrinkFor } = b;
    const F = 'Imperium - Adeptus Mechanicus.json';
    const units = [];

    // ---------- detachments first (units are gated on their ids) ----------
    const taghId = b.id('det:taghmata'), darkId = b.id('det:darkmech');
    const notTaken = id => ({ childId: id, field: 'selections', includeChildForces: true, includeChildSelections: true, scope: 'roster', shared: true, type: 'lessThan', value: 1 });
    const gateMods = gate => gate === 'dark' ? [{ field: 'hidden', type: 'set', value: true, conditions: [notTaken(darkId)] }]
      : gate === 'hh' ? [{ field: 'hidden', type: 'set', value: true, conditionGroups: [{ type: 'and', conditions: [notTaken(taghId), notTaken(darkId)] }] }]
      : [];

    // ---------- units from the cards ----------
    for (const c of cards) {
      const key = `admech:${c.slug}`;
      const robot = /^Adeptus Mechanicus/.test(c.factionLine);
      const dark = /Dark Mechanicum|Heterodox/.test(c.factionLine) && !/Loyalist or Heterodox/.test(c.factionLine);
      const gate = robot ? null : dark ? 'dark' : 'hh';

      // weapons (+ keyword lines "Name | [KW] [KW]")
      const kwFor = name => {
        const a = c.abilities.find(x => /^(\[[^\]]+\]\s*)+$/.test(x.text) && cleanWeapon(name).toLowerCase().startsWith(cleanWeapon(x.name).toLowerCase().replace(/\s*\(.*$/, '')));
        return a ? [...a.text.matchAll(/\[([^\]]+)\]/g)].map(m => title(m[1])).join(', ') : '';
      };
      const byName = new Map();
      for (const w of c.weapons) {
        const n = cleanWeapon(w.name);
        const base = n.replace(/\s*[–-]\s*(Standard|Supercharge|Frag|Krak)$/i, '');
        const suffix = (n.match(/[–-]\s*(Standard|Supercharge|Frag|Krak)$/i) || [])[1];
        if (!byName.has(base)) byName.set(base, { melee: w.melee, rows: [] });
        byName.get(base).rows.push({ suffix, stats: [w.range, w.a, w.skill, w.s, w.ap, w.d], kw: kwFor(base) });
      }
      const weapons = new Map([...byName].map(([n, w]) => {
        const stats = w.rows.length === 1 ? w.rows[0].stats : Object.fromEntries(w.rows.map(r => [r.suffix.toLowerCase(), r.stats]));
        return [n.toLowerCase(), W(n, stats, { keywords: w.rows.length === 1 ? w.rows[0].kw : w.rows.map(r => r.kw), melee: w.melee, matchOfficial: true })];
      }));
      const wpn = n => {
        const k = cleanWeapon(n).toLowerCase();
        const hit = weapons.get(k) || [...weapons].find(([wn]) => wn.startsWith(k) || k.startsWith(wn))?.[1];
        if (!hit) throw new Error(`${c.slug}: no weapon "${n}" (have: ${[...weapons.keys()].join(', ')})`);
        return hit;
      };
      const allGear = [...weapons.values()];

      // abilities, rules, leader
      const rules = ['Doctrina Imperatives'];
      const profiles = [];
      let leaderText = null;
      const seen = new Set();
      for (const a of c.abilities) {
        if (/^(\[[^\]]+\]\s*)+$/.test(a.text)) { // weapon keyword line, or "Core | [DEADLY DEMISE D3]"
          if (/^core$/i.test(a.name)) rules.push(...[...a.text.matchAll(/\[([^\]]+)\]/g)].map(m => title(m[1])));
          continue;
        }
        if (/^Doctrina Imperatives$/i.test(a.name)) continue;
        if (/^Leader \(Core\)$/i.test(a.name)) { rules.push('Leader'); continue; }
        if (/^CORE:/i.test(a.name)) { rules.push(...a.name.replace(/^CORE:\s*/i, '').split(/,\s*/).map(title)); continue; }
        if (/^leader$/i.test(a.name)) {
          if (/attached to (a|the)/i.test(a.text)) { leaderText = a.text; if (!rules.includes('Leader')) rules.push('Leader'); }
          else if (!seen.has('leader-note')) { seen.add('leader-note'); profiles.push(ability(key, 'Leader', a.text)); }
          continue;
        }
        if (/^Scouts \d+"$|^Stealth$/i.test(a.name)) { rules.push(a.name); continue; }
        if (seen.has(a.name)) continue;
        seen.add(a.name);
        profiles.push(ability(key, a.name, a.text));
      }

      // keywords
      const kws = c.keywords.split(/,\s*/).map(title).filter(Boolean);
      if (!robot) kws.push('Horus Heresy');
      const fk = ['Faction: Adeptus Mechanicus', dark ? 'Chaos' : 'Imperium'];
      const primary = PRIMARY.find(p => kws.includes(p)) || kws[0];
      const pts = parseInt(c.points, 10);
      const s = c.stats[0];
      const statProfiles = c.stats.map((st, i) => unitProfile(st.model || c.name, [st.M, st.T, st.Sv, st.W, st.LD, st.OC, c.invuln || '']));

      const base = { name: `${c.name} [NFLB]`, id: b.id(`unit:${c.slug}`), hidden: false, import: true,
        categoryLinks: catLinks(key, [...kws, ...fk], primary),
        infoLinks: ruleLinks(key, [...new Set(rules)]),
        modifiers: gateMods(gate),
        profiles: [...statProfiles, ...profiles] };
      const comp = COMP[c.slug];
      let u;
      if (!comp) {
        u = { ...base, type: 'model', costs: [{ name: 'pts', typeId: b.PTS, value: pts }], entryLinks: allGear.map(w => link(key, w)) };
        if (kws.includes('Epic Hero')) u.constraints = cons(`${key}:roster`, null, 1, 'roster');
        if (kws.includes('Character') && !kws.includes('Epic Hero')) u.entryLinks.push(b.sharedLink(key, 'Enhancements'));
      } else {
        const entries = [], groups = [];
        const gearOf = (g, who) => (g === 'all' ? allGear : g.map(wpn)).map(w => link(`${key}:${who}:${w.name}`, w));
        const made = {};
        for (const [name, min, max, g] of comp.models || []) { made[name] = model(key, name, { min, max, gear: gearOf(g, name) }); entries.push(made[name]); }
        if (comp.extra) {
          const [name, n, each] = comp.extra;
          const src = (comp.models || []).find(m => m[0] === name);
          entries.push(model(key, `Additional ${name}`, { max: n, pts: each, gear: gearOf(src ? src[3] : 'all', `extra:${name}`) }));
        }
        for (const p of comp.pick || []) {
          const owner = made[p.owner];
          owner.selectionEntryGroups = [...(owner.selectionEntryGroups || []), choice(`${key}:${p.owner}`, p.name, p.from.map(wpn), { min: p.min ?? 1, max: 1 })];
        }
        if (comp.swap) {
          const sw = comp.swap;
          const swapModels = sw.from.map(n => model(key, `${sw.owner} w/ ${cleanWeapon(n)}`, { max: sw.max, gear: [wpn(n), ...sw.also.map(wpn)].map(w => link(`${key}:${sw.owner}:${n}:${w.name}`, w)) }));
          groups.push(group(key, sw.name, swapModels, { max: sw.max }));
          shrinkFor(made[sw.owner], swapModels.map(m => [m, 1]));
        }
        if (comp.perWeapon) {
          const pw = comp.perWeapon;
          const [min, max] = Array.isArray(pw.count) ? pw.count : [pw.count, pw.count];
          const ms = pw.from.map(n => model(key, `${pw.name} w/ ${cleanWeapon(n)}`, { max, pts: pw.ptsEach || 0, gear: [wpn(n), ...pw.also.map(wpn)].map(w => link(`${key}:${pw.name}:${n}:${w.name}`, w)) }));
          groups.push(group(key, `${pw.name}s`, ms, { min, max, def: ms[0] }));
        }
        u = { ...base, type: 'unit', costs: [{ name: 'pts', typeId: b.PTS, value: comp.perWeapon?.ptsEach ? 0 : pts }] };
        if (entries.length) u.selectionEntries = entries;
        if (groups.length) u.selectionEntryGroups = groups;
        if (comp.ptsAbove) {
          u.modifiers = [...u.modifiers, { field: b.PTS, type: 'set', value: comp.ptsAbove[1],
            conditions: [{ childId: 'model', field: 'selections', includeChildSelections: true, scope: 'self', shared: true, type: 'greaterThan', value: comp.ptsAbove[0] }] }];
        }
      }
      u.__leader = leaderText;
      units.push(u);
    }

    // ---------- leader targets: "a Castellax, Domitar, ... or Myrmidon unit" ----------
    const legendsIds = {};
    const H = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '..', `${LEGENDS_LIB}.json`), 'utf8')).catalogue;
    for (const n of ['Decimator', 'Blood Slaughterer', 'Greater Brass Scorpion', 'Kytan Ravager', 'Tarantula Sentry Battery']) {
      const e = H.sharedSelectionEntries.find(x => x.name === `${n} [Legends]`);
      if (!e) throw new Error(`${n} [Legends] not found in ${LEGENDS_LIB}`);
      legendsIds[n] = e;
    }
    for (const u of units) {
      const text = u.__leader;
      delete u.__leader;
      if (!text) continue;
      const list = text.replace(/\(.*?\)/g, '').replace(/.*attached to (?:a |the following units?:\s*)/i, '').replace(/\s*units?\.?\s*$/i, '');
      const tokens = list.split(/,\s*|\s+or\s+/).map(t => t.replace(/^(or|any other|a|an)\s+/i, '').trim()).filter(Boolean);
      const targets = new Set();
      for (const t of tokens) {
        const tl = t.toLowerCase().replace(/[.]/g, '').trim().replace(/\s+units?$/, '');
        for (const x of units) {
          const nm = x.name.toLowerCase();
          const cats = (x.categoryLinks || []).map(l => l.name.toLowerCase());
          if (x !== u && !cats.includes('character') && (nm.includes(tl) || cats.includes(tl))) targets.add(x);
        }
        const leg = Object.entries(legendsIds).find(([n]) => n.toLowerCase().includes(tl));
        if (leg) targets.add(leg[1]);
      }
      if (!targets.size) throw new Error(`${u.name}: no leader targets resolved from "${text}"`);
      u.associations = [leadAssociation(`lead:${u.id}`, [...targets])];
      u.profiles.splice(u.profiles.findIndex(p => p.typeName !== 'Unit'), 0,
        ability(`lead:${u.id}`, 'Leader', `This model can be attached to the following units: ${[...targets].map(x => `**^^${x.name.replace(/ \[NFLB\]$/, '')}^^**`).join(', ')}`));
    }

    // ---------- detachments ----------
    const strat = (det, n, cp, type, when, target, effect) => ({ name: `Stratagem: ${n} (${cp}CP)`, id: b.id(`${det}:strat:${n}`), hidden: false,
      description: `${type}. **When:** ${when} **Target:** ${target} **Effect:** ${effect}` });
    const enh = (det, name, pts, text) => ({
      name, id: b.id(`${det}:enh:${name}`), hidden: false, import: true, type: 'upgrade',
      constraints: [...cons(`${det}:enh:${name}`, null, 1), ...cons(`${det}:enh:${name}:roster`, null, 1, 'roster')],
      costs: [{ name: 'pts', typeId: b.PTS, value: pts }, { name: 'Enhancements', typeId: b.ENH, value: 1 }],
      profiles: [ability(`${det}:enh`, name, `**^^Character^^** model only. ${text}`)],
    });
    const enhGroup = (det, detId, name, list) => ({
      name, id: b.id(`${det}:enhgroup`), hidden: false, constraints: cons(`${det}:enhgroup`, null, 1),
      modifiers: [{ field: 'hidden', type: 'set', value: true, conditions: [notTaken(detId)] }],
      selectionEntries: list,
    });
    const detachment = (det, id, name, disposition, rule, strats) => ({
      name, id, hidden: false, import: true, type: 'upgrade',
      categoryLinks: catLinks(det, [disposition], null),
      constraints: cons(det, null, 1),
      costs: [{ name: 'pts', typeId: b.PTS, value: 0 }, { name: 'Detachment Points', typeId: b.DP, value: 1 }],
      rules: [rule, ...strats],
    });

    const tagh = detachment('taghmata', taghId, 'Taghmata Omnissiah [NFLB]', 'Take and Hold',
      { name: 'Sacred Algorithms', id: b.id('taghmata:rule'), hidden: false, description: 'Each time a friendly **^^Horus Heresy^^** unit makes an attack while it is within 12" of a friendly **^^Tech-Priest^^** model, that attack has the **[LETHAL HITS]** ability.\n\nHorus Heresy Mechanicum units can only be included in your army while you are using this detachment or the Dark Mechanicum detachment (Heterodox-locked units: Dark Mechanicum only).' },
      [
        strat('taghmata', 'Pre-calculated Strike', 1, 'Battle Tactic', 'Your Shooting phase, just after a friendly **^^Adeptus Mechanicus^^** unit is selected to shoot.', 'That unit.', 'Until the end of the phase, each time a model in that unit makes a ranged attack that targets the closest eligible target, add 1 to the Wound roll.'),
        strat('taghmata', 'Adsecularis Discipline', 1, 'Battle Tactic', 'Your Command phase, after the Battle-shock step.', 'One friendly **^^Adeptus Mechanicus^^** unit.', 'Until the start of your next Command phase, that unit automatically passes Battle-shock tests and models in it add 1 to their Objective Control characteristic.'),
        strat('taghmata', 'Sanctified Auspex', 1, 'Battle Tactic', 'Your Shooting phase, just after a friendly **^^Adeptus Mechanicus^^** unit is selected to shoot.', 'That unit.', 'Until the end of the phase, ranged weapons equipped by models in that unit have the **[IGNORES COVER]** ability, and each time a model in that unit makes an attack, you can re-roll a Hit roll of 1.'),
        strat('taghmata', 'Cybertheurgical Override', 2, 'Strategic Ploy', 'Start of your opponent\'s Charge phase.', 'One friendly **^^Adeptus Mechanicus^^** unit within 12" of a friendly **^^Tech-Priest^^** model.', 'Until the end of the phase, each time that unit is targeted with the Fire Overwatch Stratagem, hits are scored on unmodified Hit rolls of 5+, and each time an enemy model makes an attack that targets that unit, subtract 1 from the Hit roll.'),
        strat('taghmata', 'Sacred Rites of the Forge', 1, 'Battle Tactic', 'Your Command phase.', 'One friendly **^^Adeptus Mechanicus Vehicle^^** or **^^Horus Heresy^^** automata unit.', 'Until the start of your next Command phase, that unit has the Feel No Pain 5+ ability. In addition, one model in that unit regains 1 lost wound, or one destroyed model is returned to that unit with 1 wound remaining.'),
        strat('taghmata', 'Iron Discipline of Mars', 1, 'Epic Deed', 'End of any phase, if a friendly **^^Adeptus Mechanicus^^** unit lost one or more models this phase.', 'That unit.', 'One destroyed model is returned to that unit with 1 wound remaining, set up in unit coherency and not within Engagement Range of any enemy units. You can only use this Stratagem once per battle on each unit.'),
      ]);
    const taghEnh = enhGroup('taghmata', taghId, 'Taghmata Omnissiah Enhancements [NFLB]', [
      enh('taghmata', 'Sacred Hexagrammic Wards', 20, 'The bearer has a 5+ invulnerable save, and a 4+ invulnerable save against attacks with the **[PSYCHIC]** ability.'),
      enh('taghmata', 'Imperative Augmentation', 15, 'Add 1 to the Toughness and Wounds characteristics of the bearer.'),
      enh('taghmata', 'Omnissian Mark', 20, 'Once per battle, in your Command phase, the bearer regains up to D3+3 lost wounds. In addition, while the bearer is on the battlefield, once per battle, you can change your active Doctrina Imperative at the start of any phase.'),
      enh('taghmata', 'Cogitator Mastery', 15, 'While the bearer is on the battlefield, you can re-roll Battle-shock tests taken for friendly **^^Adeptus Mechanicus^^** units within 12" of the bearer.'),
    ]);
    const dark = detachment('darkmech', darkId, 'Dark Mechanicum [NFLB]', 'Purge the Foe',
      { name: 'Heretek Cybertheurgy', id: b.id('darkmech:rule'), hidden: false, description: 'Each time a friendly **^^Horus Heresy^^** unit is selected to shoot or fight, you can invoke Heretek Cybertheurgy. If you do, until the end of the phase, weapons equipped by models in that unit have the **[DEVASTATING WOUNDS]** ability. After that unit has resolved its attacks, roll one D6: on a 1-2, that unit suffers 1 mortal wound.\n\nHeterodox-locked units (Anacharis Scoria, Archmagos Draykavac and the Legends daemon engines) can only be included while using this detachment.' },
      [
        strat('darkmech', 'Warp-tainted Volley', 1, 'Battle Tactic', 'Your Shooting phase, just after a friendly **^^Horus Heresy^^** unit is selected to shoot.', 'That unit.', 'Until the end of the phase, ranged weapons equipped by models in that unit have the **[DEVASTATING WOUNDS]** ability. After that unit has shot, it suffers 1 mortal wound.'),
        strat('darkmech', 'Brass-forged Hunger', 2, 'Battle Tactic', 'Your Fight phase, just after a friendly **^^Daemon^^** unit is selected to fight.', 'That unit.', 'After that unit has fought, it can fight one additional time this phase. After it has done so, it suffers D3 mortal wounds.'),
        strat('darkmech', 'Daemonic Possession', 1, 'Strategic Ploy', 'Your Command phase.', 'One friendly **^^Vehicle^^** or **^^Daemon^^** unit.', 'Until the start of your next Command phase, that unit has the Feel No Pain 5+ ability, automatically passes Battle-shock tests and cannot Fall Back. At the start of your next Command phase, it suffers D3 mortal wounds.'),
      ]);
    const darkEnh = enhGroup('darkmech', darkId, 'Dark Mechanicum Enhancements [NFLB]', [
      enh('darkmech', 'Daemonic Symbiote', 20, 'At the start of your Command phase, the bearer regains up to D3 lost wounds. In addition, melee weapons equipped by the bearer have the **[DEVASTATING WOUNDS]** ability.'),
      enh('darkmech', 'Heretek Augmetics', 15, 'Add 2 to the Attacks characteristic and 1 to the Strength characteristic of melee weapons equipped by the bearer.'),
    ]);

    // ---------- official Legends units linked in (instead of our cards) ----------
    const legendLinks = Object.entries(legendsIds).map(([n, e]) => ({
      name: e.name, id: b.id(`legends:${n}`), hidden: false, import: true, targetId: e.id, type: 'selectionEntry',
      categoryLinks: [{ name: 'Faction: Adeptus Mechanicus', id: b.id(`legends:${n}:faction`), hidden: false, primary: false, targetId: b.category('Faction: Adeptus Mechanicus').id }],
      modifiers: gateMods(n === 'Tarantula Sentry Battery' ? 'hh' : 'dark'),
    }));

    return {
      rootUnits: units,
      injections: [
        { file: F, groupName: 'Detachments', selectionEntry: tagh },
        { file: F, groupName: 'Detachments', selectionEntry: dark },
        { file: F, groupName: 'Enhancements', selectionEntryGroup: taghEnh },
        { file: F, groupName: 'Enhancements', selectionEntryGroup: darkEnh },
        { file: F, catalogueLink: { name: LEGENDS_LIB, id: b.id('legends:catlink'), importRootEntries: false, targetId: H.id, type: 'catalogue' } },
        ...legendLinks.map(l => ({ file: F, entryLink: l })),
      ],
    };
  },
};
