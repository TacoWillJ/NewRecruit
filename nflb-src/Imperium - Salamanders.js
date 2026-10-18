// NFLB overlay for Imperium - Salamanders: homebrew Salamanders characters from the Primarch Project v2 cards
// (tools/nflb-marine-hb.js, marine codex review step 5, 2026-10-18). Merged inline.

const marineHB = require('../tools/nflb-marine-hb');

module.exports = {
  faction: 'Imperium - Salamanders.json',
  factionLibrary: 'Imperium - Salamanders.json',
  inline: true,

  build(b) {
    return { rootUnits: marineHB(b, 'Imperium - Salamanders.json') };
  },
};
