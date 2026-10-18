// NFLB-L Space Marine units for one catalogue (marine codex review, 2026-10-18). The patches come from
// tools/marine-nl.js — the same definition the Primarch Project cards are built from — applied to the pristine
// upstream copies in .upstream, then cloned with fresh ids. Each replaces the official [Legends] entry.
const fs = require('fs');
const path = require('path');
const nl = require('./marine-nl');

const SHOW_LEGENDS = '9ed-cbf4-bfe5-90bf';
const CACHE = path.join(__dirname, '..', '.upstream');

module.exports = function marineNL(b, file) {
  const cats = {};
  for (const f of nl.FILES) cats[f] = JSON.parse(fs.readFileSync(path.join(CACHE, f), 'utf8')).catalogue;
  const units = [], injections = [];
  for (const r of nl.apply(cats).filter(x => x.file === file)) {
    const u = b.cloneEntry(r.unit, `nl:${r.legend}`, {
      name: r.name,
      dropModifier: m => JSON.stringify(m.conditions || []).includes(SHOW_LEGENDS),
    });
    u.profiles = [...(u.profiles || []), b.ability(`nl:${r.legend}`, 'NFLB-L Rebalance',
      `GW's ${r.legend} datasheet brought in step with the 11e Space Marine codex: ${r.changes.join('; ')}. Replaces the official Legends entry; points follow GW's Legends points.`)];
    units.push(u);
    injections.push({ file, entryName: r.legend, modifier: { field: 'hidden', type: 'set', value: true, comment: 'NFLB-L replacement' } });
  }
  return { units, injections };
};
