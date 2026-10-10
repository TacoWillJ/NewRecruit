// Turn parsed 11e reference cards (Primarch Workspace\export_ref_cards_json.js output) into
// BSData units. Shared by the card-based specs (Adeptus Mechanicus, Adepta Sororitas, ...).

const PRIMARY = ['Epic Hero', 'Character', 'Battleline', 'Monster', 'Vehicle', 'Mounted', 'Infantry'];
const title = s => s.toLowerCase().replace(/(^|[\s(\-'/])([a-z])/g, (m, a, b) => a + b.toUpperCase());
const cleanWeapon = n => n.replace(/\s*\((?:[^)]*\bonly|hull|built-in|defensive|calix|cynis|x\d)\)\s*$/i, '').trim();
const isKeywordLine = t => /^(\[[^\]]+\]\s*)+$/.test(t);

/**
 * opts:
 *   prefix        id key prefix, e.g. 'admech' (never change it: ids are derived from it)
 *   comp          { slug: composition } for multi-model units (see Adeptus Mechanicus spec)
 *   armyRules     rule names every unit links (e.g. ['Doctrina Imperatives'])
 *   skipAbility   regex of card ability names to drop (army-rule paraphrases etc.)
 *   keywords(c)   -> { kws: [...extra keywords], faction: [...faction categories] }
 *   modifiers(c)  -> extra unit modifiers (e.g. detachment gating)
 *   overrides     { slug: { 'Ability name': 'new text' | null } } 11e rewording; null drops it
 *   extraRules    { slug: ['Firing Deck 10', ...] } rules to link in addition to the card's
 */
function unitsFromCards(b, cards, opts) {
  const { weapon: W, link, model, group, choice, ability, unitProfile, catLinks, ruleLinks, cons, shrinkFor } = b;
  const { prefix, comp: COMP = {}, armyRules = [], skipAbility = /^$/, keywords = () => ({ kws: [], faction: [] }), modifiers = () => [], overrides = {} } = opts;
  const units = [];

  for (const c of cards) {
    const key = `${prefix}:${c.slug}`;
    const over = overrides[c.slug] || {};

    // weapons (+ keyword lines "Name | [KW] [KW]")
    const kwFor = name => {
      const a = c.abilities.find(x => isKeywordLine(x.text) && cleanWeapon(name).toLowerCase().startsWith(cleanWeapon(x.name).toLowerCase().replace(/\s*\(.*$/, '')));
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
    const rules = [...armyRules];
    const profiles = [];
    let leaderText = null;
    const seen = new Set();
    for (const a of c.abilities) {
      if (isKeywordLine(a.text)) { // weapon keyword line, or "Core | [DEADLY DEMISE D3]"
        if (/^core$/i.test(a.name)) rules.push(...[...a.text.matchAll(/\[([^\]]+)\]/g)].map(m => title(m[1])).filter(r => !/^(Fly|Jump Pack)$/.test(r)));
        continue;
      }
      if (skipAbility.test(a.name)) continue;
      if (/^Leader \(Core\)$/i.test(a.name)) { rules.push('Leader'); continue; }
      if (/^CORE:/i.test(a.name)) { rules.push(...a.name.replace(/^CORE:\s*/i, '').split(/,\s*/).map(title)); continue; }
      if (/^leader$/i.test(a.name)) {
        if (/attached to (a|the|one)/i.test(a.text)) { leaderText = a.text; if (!rules.includes('Leader')) rules.push('Leader'); }
        else if (!seen.has('leader-note')) { seen.add('leader-note'); profiles.push(ability(key, 'Leader', a.text)); }
        continue;
      }
      if (/^Scouts \d+"$|^Stealth$/i.test(a.name)) { rules.push(a.name); continue; }
      if (seen.has(a.name)) continue;
      seen.add(a.name);
      const text = a.name in over ? over[a.name] : a.text;
      if (text === null) continue;
      profiles.push(ability(key, a.name, text));
    }

    rules.push(...(opts.extraRules?.[c.slug] || []));

    // keywords
    const extra = keywords(c);
    const kws = [...c.keywords.split(/,\s*/).map(title).filter(Boolean), ...extra.kws];
    const primary = PRIMARY.find(p => kws.includes(p)) || kws[0];
    const pts = parseInt(c.points, 10);
    const statProfiles = c.stats.map(st => unitProfile(st.model || c.name, [st.M, st.T, st.Sv, st.W, st.LD, st.OC, c.invuln || '']));

    const base = { name: `${c.name} [NFLB]`, id: b.id(`unit:${c.slug}`), hidden: false, import: true,
      categoryLinks: catLinks(key, [...kws, ...extra.faction], primary),
      infoLinks: ruleLinks(key, [...new Set(rules)]),
      modifiers: modifiers(c),
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
  return units;
}

/**
 * Turn each unit's card Leader text ("a Castellax, Domitar, ... or Myrmidon unit" /
 * "one of the following units: Battle Sisters Squad, ...") into an association + Leader profile.
 * Tokens match, in order: an official unit of exactly that name (incl. "[Legends]"),
 * NFLB units by name or keyword, and any `extra` official entries by partial name.
 */
function resolveLeaders(b, units, extra = {}) {
  for (const u of units) {
    const text = u.__leader;
    delete u.__leader;
    if (!text) continue;
    const list = text.replace(/\(.*?\)/g, '').replace(/.*attached to (?:one of the following units:\s*|a |the following units?:\s*)/i, '').replace(/\s*units?\.?\s*$/i, '');
    const tokens = list.split(/,\s*|\s+or\s+/).map(t => t.replace(/^(or|any other|a|an)\s+/i, '').trim()).filter(Boolean);
    const targets = new Set();
    for (const t of tokens) {
      const tl = t.toLowerCase().replace(/[.]/g, '').trim().replace(/\s+units?$/, '');
      const official = b.lib.sharedSelectionEntries.find(e => e.name.toLowerCase() === tl || e.name.toLowerCase() === `${tl} [legends]`);
      if (official) { targets.add(official); continue; }
      for (const x of units) {
        const nm = x.name.toLowerCase();
        const cats = (x.categoryLinks || []).map(l => l.name.toLowerCase());
        if (x !== u && !cats.includes('character') && (nm.includes(tl) || cats.includes(tl))) targets.add(x);
      }
      const ex = Object.entries(extra).find(([n]) => n.toLowerCase().includes(tl));
      if (ex) targets.add(ex[1]);
      // GW sometimes splits a unit ("Scourges" -> "Scourges with Heavy Weapons" / "... with Shardcarbines")
      if (![...targets].some(x => x.name.toLowerCase().includes(tl))) {
        for (const e of b.lib.sharedSelectionEntries) if (e.type !== 'upgrade' && e.name.toLowerCase().startsWith(`${tl} with `)) targets.add(e);
      }
    }
    if (!targets.size) throw new Error(`${u.name}: no leader targets resolved from "${text}"`);
    u.associations = [b.leadAssociation(`lead:${u.id}`, [...targets])];
    u.profiles.splice(u.profiles.findIndex(p => p.typeName !== 'Unit'), 0,
      b.ability(`lead:${u.id}`, 'Leader', `This model can be attached to the following units: ${[...targets].map(x => `**^^${x.name.replace(/ \[NFLB\]$/, '')}^^**`).join(', ')}`));
  }
  return units;
}

module.exports = { unitsFromCards, resolveLeaders, cleanWeapon, title };
