// NFLB overlay for Imperium - Space Wolves: homebrew Space Wolves characters from the Primarch Project v2 cards
// (tools/nflb-marine-hb.js, marine codex review step 5, 2026-10-18). Merged inline.
//   • NFLB-L points-only rebalances (2026-10-25), same treatment as Valerian: GW's [Legends] datasheets already use
//     the 11e codex rules (Combat Doctrines), but MFM v1.6 left their points while the matching codex units went up.
//     Each replaces the official Legends entry.
const fs = require('fs');
const path = require('path');
const marineHB = require('../tools/nflb-marine-hb');

const FILE = 'Imperium - Space Wolves.json';
const SHOW_LEGENDS = '9ed-cbf4-bfe5-90bf';
const REBALANCE = [
  { name: 'Logan Grimnar on Stormrider', pts: 270,
    why: gw => `Logan Grimnar (same character on foot) went 100 -> 150 in MFM v1.6. Points only: ${gw} -> 270 (keeps his 10e premium 180/100 over the foot model, x150).` },
  { name: 'Wolf Lord on Thunderwolf', pts: 120,
    why: gw => `Wolf Guard Battle Leader went 65 -> 80 and Thunderwolf Cavalry +15% in MFM v1.6. Points only: ${gw} -> 120.` },
  { name: 'Iron Priest on Thunderwolf', pts: 115,
    why: gw => `Iron Priest (same character on foot) went 50 -> 60 and Thunderwolf Cavalry +15% in MFM v1.6. Points only: ${gw} -> 115.` },
];

module.exports = {
  faction: FILE,
  factionLibrary: FILE,
  inline: true,

  build(b) {
    const upstream = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '.upstream', FILE), 'utf8')).catalogue;
    const nl = REBALANCE.map(({ name, pts, why }) => {
      const legend = upstream.sharedSelectionEntries.find(e => e.name === `${name} [Legends]`);
      if (!legend) throw new Error(`${name} [Legends] not found upstream`);
      const gwPts = (legend.costs.find(c => c.typeId === b.PTS) || {}).value;
      const u = b.cloneEntry(legend, `nl:${name} [Legends]`, {
        name: `${name} [NFLB-L]`,
        dropModifier: m => JSON.stringify(m.conditions || []).includes(SHOW_LEGENDS),
      });
      u.hidden = false; // BSData hard-hides Iron Priest on Thunderwolf [Legends] since db61485 (visible before)
      u.costs = u.costs.map(c => (c.typeId === b.PTS ? { ...c, value: pts } : c));
      u.profiles = [...(u.profiles || []), b.ability(`nl:${name} [Legends]`, 'NFLB-L Rebalance',
        `GW's ${name} [Legends] datasheet already uses the 11e Space Wolves codex rules, but his points stayed at ${gwPts}. ${why(gwPts)} Replaces the official Legends entry.`)];
      return u;
    });

    return {
      rootUnits: [...nl, ...marineHB(b, FILE)],
      injections: REBALANCE.map(({ name }) => ({ file: FILE, entryName: `${name} [Legends]`, modifier: { field: 'hidden', type: 'set', value: true, comment: 'NFLB-L replacement' } })),
    };
  },
};
