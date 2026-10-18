// NFLB overlay for Imperium - Space Marines: NFLB-L (rebalanced Legends) marine units from tools/marine-nl.js — GW's [Legends]
// datasheets brought in step with the 11e Space Marine codex, plus the homebrew marine characters / Dreadnoughts
// from tools/nflb-marine-hb.js (marine codex review, 2026-10-18). Merged inline.

const marineNL = require('../tools/nflb-marine-nl');
const marineHB = require('../tools/nflb-marine-hb');
const horusHeresy = require('../tools/nflb-hh');

module.exports = {
  faction: 'Imperium - Space Marines.json',
  factionLibrary: 'Imperium - Space Marines.json',
  inline: true,

  build(b) {
    const { units, injections } = marineNL(b, 'Imperium - Space Marines.json');
    // homebrew marine characters / Dreadnoughts from the v2 cards (step 5 batch B1)
    // Horus Heresy Legions (step 5 batch B2): 18 Legion detachments gate their own units + Primarchs
    const hh = horusHeresy(b);
    for (const w of hh.warnings) b.notes.push(`HH: ${w}`);
    const F = 'Imperium - Space Marines.json';
    return {
      rootUnits: [...units, ...marineHB(b, F), ...hh.units],
      injections: [...injections,
        ...hh.detachments.map(d => ({ file: F, groupName: 'Detachment', selectionEntry: d })),
        ...hh.enhGroups.map(g => ({ file: F, groupName: 'Enhancements', selectionEntryGroup: g }))],
    };
  },
};
