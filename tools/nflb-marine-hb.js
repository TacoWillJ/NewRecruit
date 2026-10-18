// Homebrew Space Marine characters / Dreadnoughts (marine codex review step 5 batch B1, 2026-10-18): the Primarch
// Project v2 cards (Forge World heroes, Rogue Trader Dreadnoughts, chapter homebrew), parsed by
// Workspace\export_v2_cards_json.js into nflb-src/data/marine-hb-cards.json. Cards for a chapter with its own
// catalogue (Ultramarines, Salamanders, Blood Angels, Dark Angels, Space Wolves) go there; the rest in Space Marines.
const fs = require('fs');
const path = require('path');
const cards = require('../nflb-src/data/marine-hb-cards.json');
const { unitsFromCards, resolveLeaders } = require('./nflb-cards');

const CHAPTER = { 'Imperium - Ultramarines.json': 'Ultramarines', 'Imperium - Salamanders.json': 'Salamanders',
  'Imperium - Blood Angels.json': 'Blood Angels', 'Imperium - Dark Angels.json': 'Dark Angels', 'Imperium - Space Wolves.json': 'Space Wolves' };
const chapterOf = c => Object.values(CHAPTER).find(ch => c.factionLine.split(/\s*•\s*/).includes(ch));

// multi-model units and weapon choices the cards describe in prose
const LONE_WOLF_MELEE = ['Power weapon', 'Frost axe / Frost sword', 'Wolf claws (paired)', 'Power fist', 'Thunder hammer'];
const COMP = {
  'svangir-ulfgir': { models: [['Svangir', 1, 1, 'all'], ['Ulfgir', 1, 1, 'all']] },
  'lone-wolf-power-armour': { models: [['Lone Wolf', 1, 1, []]], pick: [
    { owner: 'Lone Wolf', name: 'Ranged weapon', from: ['Bolt pistol', 'Plasma pistol', 'Combi-weapon'] },
    { owner: 'Lone Wolf', name: 'Melee weapon', from: ['Chainsword', ...LONE_WOLF_MELEE] }] },
  'lone-wolf-terminator-armour': { models: [['Lone Wolf', 1, 1, []]], pick: [
    { owner: 'Lone Wolf', name: 'Ranged weapon', from: ['Storm bolter', 'Combi-weapon'] },
    { owner: 'Lone Wolf', name: 'Melee weapon', from: [...LONE_WOLF_MELEE, 'Chainfist'] }] },
};

module.exports = function marineHB(b, file) {
  const chapter = CHAPTER[file];
  const mine = cards.filter(c => (chapterOf(c) || null) === (chapter || null)).map(c => {
    // a Leader line that also carries a bonus: keep the leader targets clean, the bonus becomes its own ability
    const lead = c.abilities.find(a => /^Leader$/i.test(a.name) && /attached to a unit of ([^.]+)\.\s*(.+)/i.test(a.text));
    if (!lead) return c;
    const [, target, bonus] = lead.text.match(/attached to a unit of ([^.]+)\.\s*(.+)/i);
    return { ...c, abilities: c.abilities.flatMap(a => (a !== lead ? [a] : [
      { name: 'Leader', text: `This model can be attached to the following unit: ${target}.` },
      { name: `Leading ${target}`, text: bonus }])) };
  });
  if (!mine.length) return [];
  const faction = ['Faction: Adeptus Astartes', 'Imperium', ...(chapter ? [`Faction: ${chapter}`] : [])];
  const units = unitsFromCards(b, mine, {
    prefix: 'smhb', comp: COMP, armyRules: [], skipAbility: /^Faction/i,
    // cards that already print IMPERIUM etc. must not get the same category twice; named heroes are Epic Heroes
    // (one per army, no Enhancements) like GW's named characters — Lone Wolf is the one generic character here
    keywords: c => {
      const kw = c.keywords.split(/,\s*/);
      const epic = kw.includes('CHARACTER') && !kw.includes('EPIC HERO') && !/^lone-wolf/.test(c.slug);
      return { kws: epic ? ['Epic Hero'] : [], faction: faction.filter(f => !kw.some(k => k.toLowerCase() === f.toLowerCase())) };
    },
  });
  // army rule: the same "Combat Doctrines" rule link official marine units carry (its name has no parameter, so it is
  // linked by the official target id rather than through ruleLinks)
  const official = b.lib.sharedSelectionEntries.flatMap(e => e.infoLinks || []).find(l => l.type === 'rule' && l.name === 'Combat Doctrines');
  if (!official) throw new Error(`${file}: no official unit links Combat Doctrines`);
  for (const u of units) u.infoLinks = [...(u.infoLinks || []), { name: 'Combat Doctrines', id: b.id(`smhb:${u.id}:combat-doctrines`), hidden: false, targetId: official.targetId, type: 'rule' }];
  // leader targets can be official units from the Space Marines catalogue (imported by every chapter) or Agents of the
  // Imperium (Damned Legionnaires); cards write them loosely ("Hellblasters", "Sternguard Veterans")
  const extra = {};
  for (const f of ['Imperium - Space Marines.json', 'Imperium - Agents of the Imperium.json']) {
    const c = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '.upstream', f), 'utf8')).catalogue;
    for (const e of c.sharedSelectionEntries.filter(x => x.type === 'unit' || x.type === 'model')) {
      const n = e.name.replace(/\s*\[Legends\]$/, ''), short = n.replace(/ Squad$/, '');
      for (const k of [n, short, `${short}s`]) if (!(k in extra)) extra[k] = e;
    }
  }
  resolveLeaders(b, units, extra);
  return units;
};
