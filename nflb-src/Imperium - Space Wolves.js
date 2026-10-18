// NFLB overlay for Imperium - Space Wolves: homebrew Space Wolves characters from the Primarch Project v2 cards
// (tools/nflb-marine-hb.js, marine codex review step 5, 2026-10-18). Merged inline.

const marineHB = require('../tools/nflb-marine-hb');

module.exports = {
  faction: 'Imperium - Space Wolves.json',
  factionLibrary: 'Imperium - Space Wolves.json',
  inline: true,

  build(b) {
    return { rootUnits: marineHB(b, 'Imperium - Space Wolves.json') };
  },
};
