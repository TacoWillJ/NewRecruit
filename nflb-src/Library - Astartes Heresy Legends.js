// NFLB overlay for Library - Astartes Heresy Legends: NFLB-L (rebalanced Legends) marine units from tools/marine-nl.js — GW's [Legends]
// datasheets brought in step with the 11e Space Marine codex (marine codex review, 2026-10-18). Merged inline.

const marineNL = require('../tools/nflb-marine-nl');

module.exports = {
  faction: 'Library - Astartes Heresy Legends.json',
  factionLibrary: 'Library - Astartes Heresy Legends.json',
  inline: true,

  build(b) {
    const { units, injections } = marineNL(b, 'Library - Astartes Heresy Legends.json');
    return { rootUnits: units, injections };
  },
};
