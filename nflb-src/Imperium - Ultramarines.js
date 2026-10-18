// NFLB overlay for Imperium - Ultramarines: NFLB-L (rebalanced Legends) marine units from tools/marine-nl.js — GW's [Legends]
// datasheets brought in step with the 11e Space Marine codex, plus the homebrew marine characters / Dreadnoughts
// from tools/nflb-marine-hb.js (marine codex review, 2026-10-18). Merged inline.

const marineNL = require('../tools/nflb-marine-nl');
const marineHB = require('../tools/nflb-marine-hb');

module.exports = {
  faction: 'Imperium - Ultramarines.json',
  factionLibrary: 'Imperium - Ultramarines.json',
  inline: true,

  build(b) {
    const { units, injections } = marineNL(b, 'Imperium - Ultramarines.json');
    // homebrew marine characters / Dreadnoughts from the v2 cards (step 5 batch B1)
    return { rootUnits: [...units, ...marineHB(b, 'Imperium - Ultramarines.json')], injections };
  },
};
