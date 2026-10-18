// NFLB overlay for Imperium - Ultramarines: NFLB-L (rebalanced Legends) marine units from tools/marine-nl.js — GW's [Legends]
// datasheets brought in step with the 11e Space Marine codex (marine codex review, 2026-10-18). Merged inline.

const marineNL = require('../tools/nflb-marine-nl');

module.exports = {
  faction: 'Imperium - Ultramarines.json',
  factionLibrary: 'Imperium - Ultramarines.json',
  inline: true,

  build(b) {
    const { units, injections } = marineNL(b, 'Imperium - Ultramarines.json');
    return { rootUnits: units, injections };
  },
};
