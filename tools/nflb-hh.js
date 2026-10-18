// Horus Heresy Legions in Space Marines (marine codex review step 5 batch B2, user decision 2026-10-18: "All in Space
// Marines", each Legion gated by its own HH detachment). Sources, all generated from the Primarch Project:
//   data/hh-detachments.json   18 Legion detachments   (Workspace\export_hh_detachments_json.js)
//   data/hh-legion-cards.json  170 Legion units + Primarchs (_reference cards, export_ref_cards_json.js, + legion tag)
//   data/hh-generic-cards.json 37 generic Legiones Astartes units (hh_*_card.html, export_v2_cards_json.js)
// Legion units only appear with their Legion's detachment; generic units with any HH Legion detachment.
const fs = require('fs');
const path = require('path');
const { unitsFromCards, resolveLeaders } = require('./nflb-cards');

const DETS = require('../nflb-src/data/hh-detachments.json');
const LEGION = require('../nflb-src/data/hh-legion-cards.json');
const GENERIC = require('../nflb-src/data/hh-generic-cards.json');
const ENH_PTS = 20; // the detachment pages give no points; GW's own marine enhancements are 10–25

const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const singular = s => s.replace(/ies$/, 'y').replace(/([^s])s$/, '$1');

// ---- squad structure from the card's composition text + "a / b" points ----
function autoComp(c) {
  const pts = String(c.points).match(/\d+/g) || [];
  const full = c.composition.replace(/\s+/g, ' ');
  // "5 or 10 models: 1 Sergeant and 4-9 Legionaries" → read the part after the size phrase for the model names
  const t = full.replace(/^\d+\s*(?:or|to|-|–)\s*\d+\s+models?(?:, [^:]*)?:\s*/i, '');
  let leader = null, model = null, min, max;
  let m;
  // "1 <leader> [(…)] and|+ 4[-9] <models>" — names run to the next comma / full stop / "(" / " in " / " with "
  if ((m = t.match(/^(\d+) ([^,;.(+:\d]+?)(?: \([^)]*\))? (?:\+|and) (\d+)(?:\s*[-–]\s*(\d+))? (.+?)(?=,|\.|;| \(| in | with | all | mounted | carrying |$)/i))) {
    leader = m[1] === '1' ? m[2] : null; model = m[5];
    min = Number(m[1]) + Number(m[3]); max = Number(m[1]) + Number(m[4] || m[3]);
    const alt = t.match(/, or (\d+) [^,;.]+? and (\d+) /);
    if (alt) max = Number(alt[1]) + Number(alt[2]);
  }
  if (min == null && t !== full && (m = full.match(/^(\d+)\s*(?:or|to|-|–)\s*(\d+)\s+models?/i))) { min = Number(m[1]); max = Number(m[2]); }
  if (min == null && (m = full.match(/(\d+)\s*(?:or|to|-|–)\s*(\d+)\s+(?:[A-Z][\w' -]*?\s)?(?:models?|[A-Z]\w+)/))) { min = Number(m[1]); max = Number(m[2]); }
  if (min == null || pts.length < 2) return null;
  const [pMin, pMax] = pts.map(Number);
  const name = model ? model.trim().replace(/\b(Legionaries|Legionary)\b/, 'Legionary') : singular(c.name.replace(/ (Squad|Squadron|Pack|Cohort|Cabal|Retinue|Court|Conclave|Circle|Cadre|Kill Team|Host|Brethren)$/i, ''));
  const rest = leader ? [Math.max(1, min - 1), max - 1] : [min, max];
  const models = [...(leader ? [[leader.trim(), 1, 1, 'all']] : []), [name, rest[0], rest[1], 'all']];
  // per-model pricing (e.g. "1-3 Javelin Speeders" 105 / 315) vs a points step for the bigger squad
  if (min === 1 && Math.abs(pMax - pMin * max) <= 5 && !leader) return { models: [[name, 1, 1, 'all']], extra: [name, max - 1, pMin] };
  return { models, ptsAbove: [min, pMax] };
}

// ---- armour variants (generic HH characters): optional upgrade carrying that armour's statline ----
function addVariants(b, u, c) {
  if (!(c.armourVariants || []).length) return;
  const key = `hhvar:${c.slug}`;
  const entries = c.armourVariants.map(v => {
    const extra = Number((String(v.pts).match(/-?\d+/) || [0])[0]);
    return { name: v.name.replace(/\s*\(default\)\s*/i, ''), id: b.id(`${key}:${v.name}`), hidden: false, import: true, type: 'upgrade',
      costs: [{ name: 'pts', typeId: b.PTS, value: extra }],
      profiles: [b.unitProfile(`${c.name} — ${v.name.replace(/\s*\(default\)\s*/i, '')}`, [v.M, v.T, v.Sv, v.W, c.stats[0].LD, c.stats[0].OC, (String(v.inv).match(/\d\+/) || [''])[0]]),
        ...(v.note ? [b.ability(`${key}:${v.name}`, v.name.replace(/\s*\(default\)\s*/i, ''), v.note)] : [])] };
  });
  const def = entries.find((e, i) => /default/i.test(c.armourVariants[i].name)) || entries[0];
  const g = { name: 'Armour', id: b.id(`${key}:group`), hidden: false, defaultSelectionEntryId: def.id, constraints: b.cons(`${key}:group`, 1, 1), selectionEntries: entries };
  const target = u.type === 'unit' ? (u.selectionEntries || [])[0] : u;
  target.selectionEntryGroups = [...(target.selectionEntryGroups || []), g];
}

module.exports = function horusHeresy(b) {
  const { ability, catLinks, cons } = b;
  const notTaken = id => ({ childId: id, field: 'selections', includeChildForces: true, includeChildSelections: true, scope: 'roster', shared: true, type: 'lessThan', value: 1 });
  const detIds = Object.fromEntries(DETS.map(d => [d.legion, b.id(`hhdet:${slug(d.legion)}`)]));
  const gateLegion = legion => [{ field: 'hidden', type: 'set', value: true, conditions: [notTaken(detIds[legion])] }];
  const gateAny = [{ field: 'hidden', type: 'set', value: true, conditionGroups: [{ type: 'and', conditions: Object.values(detIds).map(notTaken) }] }];

  // ---- units ----
  const comp = {};
  const warnings = [];
  for (const c of [...LEGION, ...GENERIC]) {
    if (!/\//.test(String(c.points))) continue;
    const k = autoComp(c);
    if (k) comp[c.slug] = k; else warnings.push(`${c.name}: squad size not understood ("${c.composition.slice(0, 80)}") — built as one model`);
  }
  // a weapon listed twice under one name with different profiles (e.g. Sergeant's version) keeps both, renamed
  // Core lines may name things that are not core rules in 11e (e.g. "Psyker" is a keyword): keep real rules only
  const known = new Set([...(b.gst.sharedRules || []), ...(b.lib.sharedRules || [])].map(r => r.name.toLowerCase()));
  const isRule = n => known.has(n.toLowerCase()) || known.has(n.replace(/\s+(D\d+(\+\d+)?|\d+\+?|\d+"|[+-]\d+)$/i, '').toLowerCase());
  // FLY and PSYKER are 11e keywords, not rules: a Core line naming them gives the unit that keyword instead
  const AS_KEYWORD = /^(FLY|PSYKER)$/i;
  const keywordFromCore = {};
  const drop = (c, r) => {
    if (AS_KEYWORD.test(r)) (keywordFromCore[c.slug] = keywordFromCore[c.slug] || []).push(r[0].toUpperCase() + r.slice(1).toLowerCase());
    else warnings.push(`${c.name}: "${r}" is not an 11e core rule — left off`);
  };
  const coreFix = c => c.abilities.map(a => {
    // "Core | [DEEP STRIKE] [PSYKER]" bracket form
    if (/^core$/i.test(a.name) && /^\s*\[/.test(a.text)) {
      const list = [...a.text.matchAll(/\[([^\]]+)\]/g)].map(m => m[1]);
      const keep = list.filter(r => isRule(r));
      for (const r of list.filter(r => !keep.includes(r))) drop(c, r);
      return keep.length ? { ...a, text: keep.map(r => `[${r}]`).join(' ') } : null;
    }
    const rules = /^CORE:/i.test(a.name) ? a.name.replace(/^CORE:\s*/i, '').split(/,\s*/) : /\(Core\)$/i.test(a.name) ? [a.name.replace(/\s*\(Core\)$/i, '')] : null;
    if (!rules) return a;
    const keep = rules.filter(r => r && (isRule(r) || /^Leader$/i.test(r)));
    for (const r of rules.filter(r => r && !keep.includes(r))) drop(c, r);
    return keep.length ? { ...a, name: `CORE: ${keep.join(', ')}` } : null;
  }).filter(Boolean);
  const dedupe = c => {
    const seen = {};
    // "IMPERIUM OR CHAOS" (the HH cards' allegiance note) is not a keyword: every unit here is Imperium
    const keywords = c.keywords.split(/,\s*/).filter(k => !/^IMPERIUM OR\b/i.test(k)).join(', ');
    return { ...c, keywords, abilities: coreFix(c), points: String(c.points).match(/\d+/)[0], weapons: c.weapons.map(w => {
      const n = w.name.toLowerCase();
      seen[n] = (seen[n] || 0) + 1;
      return seen[n] > 1 && !/[–-]\s*(standard|supercharge|frag|krak)$/i.test(w.name) ? { ...w, name: `${w.name} (${seen[n]})` } : w;
    }) };
  };
  const faction = ['Faction: Adeptus Astartes', 'Imperium'];
  const kwFn = legion => c => {
    const kw = c.keywords.split(/,\s*/).map(k => k.toLowerCase());
    const extra = ['Horus Heresy', ...(legion ? [legion] : ['Legiones Astartes']), ...(keywordFromCore[c.slug] || [])].filter(k => !kw.includes(k.toLowerCase()));
    return { kws: extra, faction: faction.filter(f => !kw.includes(f.toLowerCase())) };
  };
  const legionUnits = [], genericUnits = [];
  // a name several Legions share ("Inductii Squad") gets its Legion added, so every unit is distinct in the list
  const count = {};
  for (const c of [...LEGION, ...GENERIC]) count[c.name] = (count[c.name] || 0) + 1;
  for (const legion of [...new Set(LEGION.map(c => c.legion))]) {
    const mine = LEGION.filter(c => c.legion === legion).map(dedupe).map(c => (count[c.name] > 1 ? { ...c, name: `${c.name} (${legion})` } : c));
    legionUnits.push(...unitsFromCards(b, mine, { prefix: 'hh', comp, armyRules: [], skipAbility: /^Faction/i, keywords: kwFn(legion), modifiers: () => gateLegion(legion) }));
  }
  genericUnits.push(...unitsFromCards(b, GENERIC.map(dedupe), { prefix: 'hhgen', comp, armyRules: [], skipAbility: /^Faction/i, keywords: kwFn(null), modifiers: () => gateAny }));
  genericUnits.forEach((u, i) => addVariants(b, u, GENERIC[i])); // unitsFromCards keeps the card order
  const units = [...legionUnits, ...genericUnits];

  // army rule link (as official marines)
  const official = b.lib.sharedSelectionEntries.flatMap(e => e.infoLinks || []).find(l => l.type === 'rule' && l.name === 'Combat Doctrines');
  for (const u of units) u.infoLinks = [...(u.infoLinks || []), { name: 'Combat Doctrines', id: b.id(`hh:${u.id}:combat-doctrines`), hidden: false, targetId: official.targetId, type: 'rule' }];

  // leaders: soft — an unresolved leader line keeps its text but gets no attach link
  const extra = {};
  for (const e of b.lib.sharedSelectionEntries.filter(x => x.type === 'unit' || x.type === 'model')) { const n = e.name.replace(/\s*\[Legends\]$/, ''); extra[n] = extra[n] || e; }
  for (const u of units) {
    if (!u.__leader) continue;
    try { resolveLeaders(b, [u, ...units.filter(x => x !== u && !x.__leader)], extra); }
    catch (e) { warnings.push(e.message); delete u.__leader; }
  }

  // ---- detachments + enhancements ----
  const strat = (key, s) => ({ name: `Stratagem: ${s.name} (${s.cp}CP)`, id: b.id(`${key}:strat:${s.name}`), hidden: false,
    description: `${s.type}. **When:** ${s.when} **Target:** ${s.target} **Effect:** ${s.effect}` });
  const detachments = [], enhGroups = [];
  for (const d of DETS) {
    const key = `hhdet:${slug(d.legion)}`, id = detIds[d.legion];
    detachments.push({
      name: `${d.legion} (HH): ${d.name} [NFLB]`, id, hidden: false, import: true, type: 'upgrade',
      categoryLinks: catLinks(key, [d.disposition], null),
      constraints: cons(key, null, 1),
      costs: [{ name: 'pts', typeId: b.PTS, value: 0 }, { name: 'Detachment Points', typeId: b.DP, value: 1 }],
      rules: [
        { name: `${d.armyRule.name} (${d.legion} army rule)`, id: b.id(`${key}:army`), hidden: false, description: d.armyRule.text },
        { name: d.rule.name, id: b.id(`${key}:rule`), hidden: false,
          description: `${d.rule.text}\n\n${d.legion} (HH) units and Primarch can only be included while using this detachment; generic Legiones Astartes (HH) units need any Horus Heresy Legion detachment.` },
        ...d.stratagems.map(s => strat(key, s)),
      ],
    });
    enhGroups.push({
      name: `${d.legion} (HH) Enhancements [NFLB]`, id: b.id(`${key}:enh`), hidden: false, constraints: cons(`${key}:enh`, null, 1),
      modifiers: [{ field: 'hidden', type: 'set', value: true, conditions: [notTaken(id)] }],
      selectionEntries: d.enhancements.map(e => ({
        name: e.name, id: b.id(`${key}:enh:${e.name}`), hidden: false, import: true, type: 'upgrade',
        constraints: [...cons(`${key}:enh:${e.name}`, null, 1), ...cons(`${key}:enh:${e.name}:roster`, null, 1, 'roster')],
        costs: [{ name: 'pts', typeId: b.PTS, value: ENH_PTS }, { name: 'Enhancements', typeId: b.ENH, value: 1 }],
        profiles: [ability(`${key}:enh`, e.name, `${e.restriction ? `${e.restriction}. ` : ''}${e.text}`)],
      })),
    });
  }
  return { units, detachments, enhGroups, warnings };
};
