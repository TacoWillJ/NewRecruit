// NFLB-L for Space Marines (marine codex review step 3, 2026-10-18). GW's [Legends] marine datasheets that
// are out of step with the 11e Space Marine codex, brought back in step: every stale weapon takes the profile
// of the same weapon on a current (non-Legends) codex unit; the model keeps its own BS/WS. Points stay on GW's
// Legends cost. Used by the Primarch Project card generator now and by the New Recruit spec (step 5).
//
// apply(catalogues) → [{ file, legend, name, unit (patched deep copy), changes: [...] }]

const SM = 'Imperium - Space Marines.json';
const UM = 'Imperium - Ultramarines.json';
const HH = 'Library - Astartes Heresy Legends.json';

// weapon name (as on the Legends datasheet) → how to find the current codex profile:
// [codex weapon name, exact codex characteristics "Range/A/skill/S/AP/D/Keywords" to pick the right variant]
const CODEX = {
  'heavy bolter (vehicle)': ['Heavy Bolter', '36"/3/3+/5/-1/2/Rapid Fire 2, Sustained Hits 1'],
  'twin lascannon': ['Twin lascannon', '48"/1/3+/12/-3/D3+3/Twin-linked'],
  'twin assault cannon': ['Twin assault cannon', '24"/6/3+/6/-2/1/Sustained Hits 1, Twin-linked'],
  'assault cannon': ['Assault Cannon', '24"/6/3+/6/-2/1/Sustained Hits 1'],
  'multi-melta': ['Multi-melta', '18"/2/3+/10/-3/D3+2/Melta 3'],
  'twin multi-melta': ['Twin multi-melta', '18"/2/3+/10/-3/D3+2/Melta 3, Twin-linked'],
  'hurricane bolter': ['Hurricane Bolter', '24"/6/3+/5/-1/1/Rapid Fire 6, Twin-linked'],
  'missile launcher - frag': ['Missile Launcher', '48"/4/4+/4/-1/1/Blast 1, Heavy'],
  'missile launcher - krak': ['Missile Launcher', '48"/1/4+/10/-2/D3+3/'],
  'cyclone missile launcher - frag': ['Cyclone missile launcher', '36"/8/3+/4/-1/1/Blast 2'],
  'cyclone missile launcher - krak': ['Cyclone missile launcher', '36"/2/3+/10/-2/D3+3/'],
  'heavy flamer': ['Heavy Flamer', '12"/3/-/5/-1/1/Blast 2, Torrent'],
  'twin heavy bolter': ['Twin heavy bolter', '36"/3/3+/5/-1/2/Rapid Fire 2, Sustained Hits 1, Twin-linked'],
};
// per Legends weapon name (lower case, no ➤) → CODEX key, plus extra edits
const WEAPONS = {
  'heavy bolter': 'heavy bolter (vehicle)', 'twin lascannon': 'twin lascannon', 'twin assault cannon': 'twin assault cannon',
  'assault cannon': 'assault cannon', 'multi-melta': 'multi-melta', 'twin multi-melta': 'twin multi-melta', 'hurricane bolter': 'hurricane bolter',
  'missile launcher - frag': 'missile launcher - frag', 'missile launcher - krak': 'missile launcher - krak',
  'cyclone missile launcher - frag': 'cyclone missile launcher - frag', 'cyclone missile launcher - krak': 'cyclone missile launcher - krak',
  'heavy flamer': 'heavy flamer', 'twin heavy flamer': 'heavy flamer', 'twin heavy bolter': 'twin heavy bolter',
};
// Astartes bolt round: S4 AP0 → S5 AP-1 (as the codex boltgun / storm bolter / combi-bolter)
const BOLT = /^(centurion bolters|combi-bolter)$/;

const UNITS = [
  [SM, 'Predator Destructor [Legends]'], [SM, 'Predator Annihilator [Legends]'], [SM, 'Razorback [Legends]'],
  [SM, 'Stormraven Gunship [Legends]'], [SM, 'Stormtalon Gunship [Legends]'], [SM, 'Stormhawk Interceptor [Legends]'],
  [SM, 'Dreadnought [Legends]'], [SM, 'Centurion Assault Squad [Legends]'], [SM, 'Centurion Devastator Squad [Legends]'],
  [UM, 'Chaplain Cassius [Legends]'], [HH, 'Relic Contemptor Dreadnought [Legends]'], [HH, 'Deredeo Dreadnought [Legends]'],
];
// non-weapon fixes
const EXTRA = {
  'Chaplain Cassius [Legends]': u => {
    const out = [];
    walk(u, o => {
      if (o.typeName === 'Unit') { const t = o.characteristics.find(c => c.name === 'T'); if (t && t.$text === '4') { t.$text = '5'; out.push('T4 → T5 (power armour, like the codex Chaplain)'); } }
      if (o.typeName === 'Melee Weapons' && /Crozius/i.test(o.name)) { const k = o.characteristics.find(c => c.name === 'Keywords'); if (k && !/Cleave/.test(k.$text)) { k.$text = k.$text ? `${k.$text}, Cleave 1` : 'Cleave 1'; out.push(`${o.name}: + [CLEAVE 1] (codex crozius arcanum)`); } }
    });
    return out;
  },
};

function walk(o, fn, seen = new Set()) {
  if (!o || typeof o !== 'object' || seen.has(o)) return; seen.add(o);
  if (Array.isArray(o)) return o.forEach(x => walk(x, fn, seen));
  fn(o);
  Object.values(o).forEach(x => walk(x, fn, seen));
}
const stats = p => p.characteristics.map(c => String(c.$text ?? "").trim()).join("/");

function apply(cats, { inlineLinked = true } = {}) {
  // codex profiles (non-Legends SM units, incl. linked shared entries)
  const sm = cats[SM];
  const smById = new Map([...sm.sharedSelectionEntries, ...(sm.sharedProfiles || [])].map(e => [e.id, e]));
  const codex = [];
  for (const u of sm.sharedSelectionEntries.filter(e => (e.type === 'unit' || e.type === 'model') && !/Legends/.test(e.name))) {
    const seen = new Set();
    (function w(o) { if (!o || typeof o !== 'object' || seen.has(o)) return; seen.add(o); if (Array.isArray(o)) return o.forEach(w);
      if (/Weapons$/.test(o.typeName || '')) codex.push(o);
      if (o.targetId && smById.get(o.targetId) && !/Crusade|Warlord|Enhance/.test(o.name || '')) w(smById.get(o.targetId)); Object.values(o).forEach(w); })(u);
  }
  const findCodex = key => {
    const [name, want] = CODEX[key];
    const base = name.toLowerCase();
    const p = codex.find(x => x.name.replace(/^➤\s*/, '').toLowerCase().replace(/\s*-\s*(frag|krak)$/, '') === base && stats(x) === want);
    if (!p) throw new Error(`NFLB-L: codex profile for ${key} (${want}) not found — the codex changed, re-check marine-nl.js`);
    return p;
  };

  return UNITS.map(([file, legend]) => {
    const c = cats[file];
    const src = c.sharedSelectionEntries.find(e => e.name === legend);
    if (!src) throw new Error(`NFLB-L: ${legend} no longer exists in ${file}`);
    const byId = new Map([...c.sharedSelectionEntries, ...(c.sharedProfiles || [])].map(e => [e.id, e]));
    // deep copy; shared weapon entries the unit links to are copied in, so patching never touches the official ones
    const copy = o => {
      if (Array.isArray(o)) return o.map(copy);
      if (!o || typeof o !== 'object') return o;
      if (inlineLinked && o.targetId && o.type === 'selectionEntry' && byId.get(o.targetId) && !/Crusade|Warlord|Enhance/.test(o.name || '')) {
        const t = byId.get(o.targetId);
        if ((t.profiles || []).some(p => /Weapons$/.test(p.typeName))) return copy({ ...t, id: o.id, constraints: [...(t.constraints || []), ...(o.constraints || [])] });
      }
      const out = {}; for (const [k, v] of Object.entries(o)) out[k] = copy(v); return out;
    };
    const u = copy(src);
    const changes = [];
    walk(u, o => {
      if (!/Weapons$/.test(o.typeName || '') || !o.characteristics) return;
      const n = o.name.replace(/^➤\s*/, '').toLowerCase();
      const ch = k => o.characteristics.find(x => x.name === k);
      const before = stats(o);
      if (BOLT.test(n)) {
        if (ch('S').$text === '4') ch('S').$text = '5';
        if (ch('AP').$text === '0') ch('AP').$text = '-1';
      } else if (WEAPONS[n]) {
        const cp = findCodex(WEAPONS[n]);
        const skill = o.typeName.startsWith('Melee') ? 'WS' : 'BS';
        for (const x of o.characteristics) {
          if (x.name === skill && x.$text !== 'N/A' && x.$text !== '-') continue; // the model keeps its own BS/WS
          const v = cp.characteristics.find(y => y.name === x.name);
          if (v) x.$text = String(v.$text).trim();
        }
        if (/^twin/.test(n) && !/Twin-linked/i.test(ch('Keywords').$text)) ch('Keywords').$text = [ch('Keywords').$text, 'Twin-linked'].filter(Boolean).join(', ');
        if (ch('Keywords')) ch('Keywords').$text = ch('Keywords').$text.split(/,\s*/).filter(k => k && k !== 'Heavy').join(', '); // [HEAVY] is an infantry rule
      }
      const after = stats(o);
      if (after !== before) changes.push(`${o.name.replace(/^➤\s*/, '')}: ${before} → ${after}`);
    });
    if (EXTRA[legend]) changes.push(...EXTRA[legend](u));
    if (!changes.length) throw new Error(`NFLB-L: ${legend} needed no change — drop it from marine-nl.js`);
    return { file, legend, name: legend.replace('[Legends]', '[NFLB-L]'), unit: u, changes: [...new Set(changes)] };
  });
}

module.exports = { apply, UNITS, FILES: [SM, UM, HH] };
