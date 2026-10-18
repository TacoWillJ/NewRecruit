// NFLB overlay for Imperium - Adeptus Custodes (Custodes codex review, 2026-10-18). Merged inline.
//   • Valerian [NFLB-L]: GW's Valerian [Legends] datasheet (already on the codex rules), points only 120 → 195
//     (the codex Shield-Captain, same statline, went 110 → 180). Replaces the official Legends entry.
//   • Constantin Valdor / Jenetia Krole [NFLB]: HH3e heroes with no 40k datasheet, from the Primarch Project cards
//     (Workspace\generate_custodes_cards.js → export_v2_cards_json.js → nflb-src/data/custodes-hb-cards.json),
//     anchored to Trajann Valoris / the Knight-Centura.
const fs = require('fs');
const path = require('path');
const cards = require('./data/custodes-hb-cards.json');
const { unitsFromCards, resolveLeaders } = require('../tools/nflb-cards');

const FILE = 'Imperium - Adeptus Custodes.json';
const SHOW_LEGENDS = '9ed-cbf4-bfe5-90bf';
const VALERIAN_PTS = 195;

module.exports = {
  faction: FILE,
  factionLibrary: FILE,
  inline: true,

  build(b) {
    const upstream = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '.upstream', FILE), 'utf8')).catalogue;

    // --- Valerian [NFLB-L]
    const legend = upstream.sharedSelectionEntries.find(e => e.name === 'Valerian [Legends]');
    if (!legend) throw new Error('Valerian [Legends] not found upstream');
    const gwPts = (legend.costs.find(c => c.typeId === b.PTS) || {}).value;
    const val = b.cloneEntry(legend, 'nl:Valerian [Legends]', {
      name: 'Valerian [NFLB-L]',
      dropModifier: m => JSON.stringify(m.conditions || []).includes(SHOW_LEGENDS),
    });
    val.costs = val.costs.map(c => (c.typeId === b.PTS ? { ...c, value: VALERIAN_PTS } : c));
    val.profiles = [...(val.profiles || []), b.ability('nl:Valerian [Legends]', 'NFLB-L Rebalance',
      `GW's Valerian [Legends] datasheet already uses the 11e Adeptus Custodes codex rules, but his points stayed at ${gwPts} while the Shield-Captain (same 8" T7 2+ W8 statline) went 110 -> 180. Points only: ${gwPts} -> ${VALERIAN_PTS} (Shield-Captain 180 x his 10e premium 120/110). Replaces the official Legends entry.`)];

    // --- Valdor / Krole [NFLB]
    // faction army rules are linked by the official target ids (their names end in words ruleLinks reads as parameters)
    const officialRule = name => {
      const l = upstream.sharedSelectionEntries.flatMap(e => e.infoLinks || []).find(x => x.type === 'rule' && x.name === name);
      if (!l) throw new Error(`no official unit links "${name}"`);
      return l.targetId;
    };
    const ARMY = {
      'hh-constantin-valdor': ["Martial Ka'tah", 'Aegis of the Emperor', 'Feel No Pain 5+*'],
      'hh-jenetia-krole': ['Daughters of the Abyss', 'Feel No Pain 3+*'],
    };
    const FACTION = { 'hh-constantin-valdor': 'Faction: Adeptus Custodes', 'hh-jenetia-krole': 'Faction: Anathema Psykana' };
    const hb = unitsFromCards(b, cards, {
      prefix: 'cuhb', skipAbility: /^Faction/i,
      keywords: c => ({ kws: [], faction: [FACTION[c.slug]] }),
    });
    hb.forEach((u, i) => {
      const slug = cards[i].slug;
      u.infoLinks = [...(u.infoLinks || []), ...ARMY[slug].map(n => ({ name: n, id: b.id(`cuhb:${slug}:${n}`), hidden: false, targetId: officialRule(n), type: 'rule' }))];
    });
    resolveLeaders(b, hb);

    return {
      rootUnits: [val, ...hb],
      injections: [{ file: FILE, entryName: 'Valerian [Legends]', modifier: { field: 'hidden', type: 'set', value: true, comment: 'NFLB-L replacement' } }],
    };
  },
};
