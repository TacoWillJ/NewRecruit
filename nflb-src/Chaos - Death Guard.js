// NFLB overlay for Chaos - Death Guard: Gellerpox Infected [NFLB-L] (see tools/nflb-gellerpox.js).
// Death Guard have no separate library catalogue, so this is merged inline.

const gellerpox = require('../tools/nflb-gellerpox');

module.exports = {
  faction: 'Chaos - Death Guard.json',
  factionLibrary: 'Chaos - Death Guard.json',
  inline: true,

  build(b) {
    const g = gellerpox(b, 'Chaos - Death Guard.json');
    return { rootUnits: [g.unit], injections: [g.hideOfficial] };
  },
};
