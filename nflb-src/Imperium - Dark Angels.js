// NFLB overlay for Imperium - Dark Angels: homebrew Dark Angels characters from the Primarch Project v2 cards
// (tools/nflb-marine-hb.js, marine codex review step 5, 2026-10-18). Merged inline.

const marineHB = require('../tools/nflb-marine-hb');

module.exports = {
  faction: 'Imperium - Dark Angels.json',
  factionLibrary: 'Imperium - Dark Angels.json',
  inline: true,

  build(b) {
    return { rootUnits: marineHB(b, 'Imperium - Dark Angels.json') };
  },
};
