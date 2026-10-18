// NFLB overlay for Imperium - Space Marines: NFLB-L (rebalanced Legends) marine units from tools/marine-nl.js — GW's [Legends]
// datasheets brought in step with the 11e Space Marine codex (marine codex review, 2026-10-18). Merged inline.

const marineNL = require('../tools/nflb-marine-nl');

module.exports = {
  faction: 'Imperium - Space Marines.json',
  factionLibrary: 'Imperium - Space Marines.json',
  inline: true,

  build(b) {
    const { units, injections } = marineNL(b, 'Imperium - Space Marines.json');
    return { rootUnits: units, injections };
  },
};
