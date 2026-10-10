// Builder helpers for NFLB overlay catalogues.
// Specs in nflb-src/ call these to produce BSData-JSON. Everything is resolved
// against the CURRENT upstream files at build time, so official weapons/rules/
// categories are linked by id rather than copied.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PTS = '51b2-306e-1021-d207';
const DP = '82ae-1066-5107-6ae0';
const ENH = 'f759-1bc4-cb3a-f0d2';

function createBuilder({ root, catalogueName, factionLibrary }) {
  const readCat = f => {
    const o = JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
    return o.catalogue || o.gameSystem;
  };
  const gstFile = fs.readdirSync(root).find(f => f.endsWith('.json') && !f.startsWith('NFLB - ') &&
    JSON.parse(fs.readFileSync(path.join(root, f), 'utf8')).gameSystem);
  const gst = readCat(gstFile);
  const lib = readCat(factionLibrary);
  // inline specs merge into this same file: ignore our own previous output when looking things up
  for (const k of ['sharedSelectionEntries', 'sharedSelectionEntryGroups', 'categoryEntries', 'entryLinks']) {
    if (lib[k]) lib[k] = lib[k].filter(x => !String(x.id).startsWith('nflb-'));
  }

  const usedIds = new Set();
  const id = key => {
    const h = 'nflb-' + crypto.createHash('sha1').update(catalogueName + '|' + key).digest('hex').slice(0, 12);
    if (usedIds.has(h)) throw new Error(`Duplicate id key: ${key}`);
    usedIds.add(h);
    return h;
  };

  // ---------- lookups ----------
  const ptype = name => {
    const t = [...gst.profileTypes, ...(lib.profileTypes || [])].find(p => p.name === name);
    if (!t) throw new Error(`No profile type ${name}`);
    const ch = {};
    for (const c of t.characteristicTypes) ch[c.name] = c.id;
    return { id: t.id, name: t.name, ch };
  };
  const UNIT = ptype('Unit'), RANGED = ptype('Ranged Weapons'), MELEE = ptype('Melee Weapons'), ABIL = ptype('Abilities');
  const ORDERS = (lib.profileTypes || []).some(p => p.name === 'Orders') ? ptype('Orders') : null;

  const ownCategories = [];
  const category = name => {
    const c = [...gst.categoryEntries, ...(lib.categoryEntries || []), ...ownCategories].find(x => x.name.toLowerCase() === name.toLowerCase());
    if (c) return c;
    const nc = { name, id: id('cat:' + name), hidden: false };
    ownCategories.push(nc);
    return nc;
  };
  const rule = name => {
    const r = [...(gst.sharedRules || []), ...(lib.sharedRules || []), ...(lib.rules || [])].find(x => x.name.toLowerCase() === name.toLowerCase());
    if (!r) throw new Error(`No shared rule named ${name}`);
    return r;
  };
  const ruleLinksFor = (keywords, key) => {
    const out = [];
    for (const kw of keywords.split(',').map(s => s.trim()).filter(Boolean)) {
      const base = kw.replace(/\s*[\d+D-]+\+?$/, '').replace(/-.*$/, '').replace(/^Anti$/, 'Anti').trim();
      const r = [...(gst.sharedRules || [])].find(x => x.name.toLowerCase() === base.toLowerCase());
      if (r && !out.some(o => o.targetId === r.id)) out.push({ name: r.name, id: id(`${key}:rl:${r.name}`), hidden: false, targetId: r.id, type: 'rule' });
    }
    return out;
  };

  // ---------- profiles ----------
  const unitProfile = (name, [M, T, Sv, W, LD, OC, InSv = '']) => ({
    name, id: id(`unitprof:${name}`), hidden: false, typeId: UNIT.id, typeName: 'Unit',
    characteristics: Object.entries({ M, T, Sv, W, LD, OC, InSv }).map(([k, v]) => ({ name: k, typeId: UNIT.ch[k], $text: String(v) })),
  });
  const ability = (key, name, text) => ({
    name, id: id(`abil:${key}:${name}`), hidden: false, typeId: ABIL.id, typeName: 'Abilities',
    characteristics: [{ name: 'Description', typeId: ABIL.ch.Description, $text: text }],
  });

  // 11e Officer datasheets carry an "Orders" profile saying how many Orders they issue
  const orders = (key, text) => {
    if (!ORDERS) throw new Error('No Orders profile type in faction library');
    return { name: 'Orders', id: id(`orders:${key}`), hidden: false, typeId: ORDERS.id, typeName: 'Orders',
      characteristics: [{ name: 'Orders', typeId: ORDERS.ch.Orders, $text: text }] };
  };

  const TRANSPORT = ptype('Transport');
  const transport = (key, text) => ({ name: 'Transport', id: id(`transport:${key}`), hidden: false, typeId: TRANSPORT.id, typeName: 'Transport',
    characteristics: [{ name: 'Capacity', typeId: TRANSPORT.ch.Capacity, $text: text }] });

  // ---------- weapons ----------
  // stats: [range, A, BS/WS, S, AP, D]; profiles: { suffix: stats } for multi-profile weapons
  const sharedEntries = [];
  const weaponCache = new Map();
  const sameStats = (p, stats) => {
    const t = p.typeId === MELEE.id ? MELEE : RANGED;
    const skill = t === MELEE ? 'WS' : 'BS';
    const get = n => (p.characteristics.find(c => c.name === n) || {}).$text;
    const want = stats.map(String);
    return [get('Range'), get('A'), get(skill), get('S'), get('AP'), get('D')].every((v, i) => v === want[i]);
  };
  const officialByName = name => lib.sharedSelectionEntries.filter(e => e.name.toLowerCase() === name.toLowerCase() && (e.profiles || []).length);
  const officialKeywords = name => {
    const o = officialByName(name)[0];
    return o ? o.profiles.map(p => (p.characteristics.find(c => c.name === 'Keywords') || {}).$text || '') : [];
  };

  // matchOfficial: link the official entry when name + stats match even if keywords were given
  function weapon(name, stats, { keywords, melee, matchOfficial } = {}) {
    const multi = !Array.isArray(stats);
    const variants = multi ? Object.entries(stats) : [[null, stats]];
    const cacheKey = name + JSON.stringify(stats) + (keywords || '');
    if (weaponCache.has(cacheKey)) return weaponCache.get(cacheKey);

    let result;
    if (!keywords || matchOfficial) {
      const match = officialByName(name).find(e => e.profiles.length === variants.length &&
        variants.every(([, s], i) => sameStats(e.profiles[i], s)));
      if (match) result = { targetId: match.id, name: match.name, official: true };
    }
    if (!result) {
      const isMelee = melee ?? variants[0][1][0] === 'Melee';
      const T = isMelee ? MELEE : RANGED;
      const skill = isMelee ? 'WS' : 'BS';
      const offKw = officialKeywords(name);
      const eid = id(`weapon:${cacheKey}`);
      const kwFor = i => (keywords !== undefined ? (Array.isArray(keywords) ? keywords[i] : keywords) : (offKw[i] ?? offKw[0] ?? '')) || '';
      const profiles = variants.map(([suffix, s], i) => ({
        name: suffix ? `➤ ${name} - ${suffix}` : name, id: id(`weapon:${cacheKey}:p${i}`), hidden: false,
        typeId: T.id, typeName: T.name,
        characteristics: [['Range', s[0]], ['A', s[1]], [skill, s[2]], ['S', s[3]], ['AP', s[4]], ['D', s[5]], ['Keywords', kwFor(i)]]
          .map(([k, v]) => ({ name: k, typeId: T.ch[k], $text: String(v) })),
      }));
      const allKw = variants.map((_, i) => kwFor(i)).join(', ');
      const entry = { name, id: eid, hidden: false, import: true, type: 'upgrade', profiles };
      const links = ruleLinksFor(allKw, eid);
      if (links.length) entry.infoLinks = links;
      sharedEntries.push(entry);
      result = { targetId: eid, name, official: false };
    }
    weaponCache.set(cacheKey, result);
    return result;
  }

  // ---------- structure ----------
  const cons = (key, min, max, scope = 'parent') => {
    // roster-wide limits must also count copies nested inside other units/forces
    const deep = scope === 'roster' ? { includeChildSelections: true, includeChildForces: true } : {};
    const out = [];
    if (min != null) out.push({ id: id(`${key}:min`), field: 'selections', scope, shared: true, type: 'min', value: min, ...deep });
    if (max != null) out.push({ id: id(`${key}:max`), field: 'selections', scope, shared: true, type: 'max', value: max, ...deep });
    return out;
  };
  // link to a weapon/entry (w = result of weapon() or {targetId,name})
  const link = (key, w, { min = 1, max = 1, type = 'selectionEntry' } = {}) => ({
    name: w.name, id: id(`${key}:link:${w.name}`), hidden: false, import: true, targetId: w.targetId, type,
    ...(min != null || max != null ? { constraints: cons(`${key}:link:${w.name}`, min, max) } : {}),
  });
  // choose exactly one of several weapons; first is default
  const choice = (key, name, weapons, { min = 1, max = 1 } = {}) => {
    const gkey = `${key}:choice:${name}`;
    const links = weapons.map(w => link(gkey, w, { min: null, max: null }));
    return { name, id: id(gkey), hidden: false, defaultSelectionEntryId: links[0].id, constraints: cons(gkey, min, max), entryLinks: links };
  };
  const upgrade = (key, name, { profiles, pts = 0 } = {}) => ({
    name, id: id(`upg:${key}:${name}`), hidden: false, import: true, type: 'upgrade',
    ...(profiles ? { profiles } : {}), costs: [{ name: 'pts', typeId: PTS, value: pts }],
  });
  // model: { name, min, max, gear: [entryLink...], groups: [group...], entries: [selectionEntry...], pts }
  const model = (key, name, { min, max, gear = [], groups = [], entries = [], pts = 0, extra = {} } = {}) => {
    const mkey = `${key}:model:${name}`;
    const m = { name, id: id(mkey), hidden: false, import: true, type: 'model', constraints: cons(mkey, min, max),
      costs: [{ name: 'pts', typeId: PTS, value: pts }], ...extra };
    if (gear.length) m.entryLinks = gear;
    if (groups.length) m.selectionEntryGroups = groups;
    if (entries.length) m.selectionEntries = entries;
    return m;
  };
  const group = (key, name, children, { min, max, def } = {}) => {
    const gkey = `${key}:group:${name}`;
    const g = { name, id: id(gkey), hidden: false, constraints: cons(gkey, min, max) };
    const ents = children.filter(c => c.type === 'model' || c.type === 'upgrade');
    const links = children.filter(c => c.targetId);
    const groups = children.filter(c => !c.type && !c.targetId);
    if (ents.length) g.selectionEntries = ents;
    if (links.length) g.entryLinks = links;
    if (groups.length) g.selectionEntryGroups = groups;
    if (def) g.defaultSelectionEntryId = def.id;
    return g;
  };
  // Lower a model's min/max constraints by `per` for every selection of each listed sibling.
  const shrinkFor = (target, siblings) => {
    target.modifiers = target.modifiers || [];
    for (const c of target.constraints) {
      for (const [sib, per] of siblings) {
        target.modifiers.push({ field: c.id, type: 'decrement', value: per,
          repeats: [{ childId: sib.id, field: 'selections', scope: 'parent', shared: true, repeats: 1, roundUp: false, value: 1 }] });
      }
    }
    return target;
  };
  const catLinks = (key, names, primary) => names.map(n => {
    const c = category(n);
    return { name: c.name, id: id(`${key}:cl:${c.name}`), hidden: false, primary: n === primary, targetId: c.id };
  });
  // support: true = 11e Support unit (can join a bodyguard that already has a Leader)
  const leadAssociation = (key, unitNames, { support = false } = {}) => ({
    name: support ? 'Supporting' : 'Leading', id: id(`${key}:assoc`), action: 'group', childId: 'unit', childName: 'unit',
    includeChildSelections: true, label: support ? 'Supported by' : 'Leader', max: 1, min: 0, scope: 'force',
    conditionGroups: [{ type: 'or', conditions: unitNames.map(n => {
      // a name = official unit (looked up upstream); an object = an NFLB unit built in this spec
      const u = typeof n === 'string' ? lib.sharedSelectionEntries.find(e => e.name === n) || lib.sharedSelectionEntries.find(e => e.name === `${n} [Legends]`) : n;
      if (!u) throw new Error(`Leader target not found upstream: ${n}`);
      return { childId: u.id, childName: u.name, field: 'selections', scope: 'self', shared: true, type: 'instanceOf', value: 1 };
    }) }],
  });
  // "Deadly Demise D3" style names link the base rule and append the value, as BSData does
  const ruleLinks = (key, names) => names.map(n => {
    let r, value;
    try { r = rule(n); } catch (e) {
      const m = n.match(/^(.*?)\s+(\S+)$/);
      if (!m) throw e;
      r = rule(m[1]); value = m[2];
    }
    const l = { name: r.name, id: id(`${key}:rule:${n}`), hidden: false, targetId: r.id, type: 'rule' };
    if (value) l.modifiers = [{ field: 'name', type: 'append', value }];
    return l;
  });
  // Link to an upstream shared group (preferred) or entry by name, e.g. 'Warlord', 'Enhancements'
  const sharedLink = (key, targetName) => {
    const g = (lib.sharedSelectionEntryGroups || []).find(x => x.name === targetName);
    const e = g || lib.sharedSelectionEntries.find(x => x.name === targetName);
    if (!e) throw new Error(`Shared entry not found upstream: ${targetName}`);
    return { name: e.name, id: id(`${key}:shared:${targetName}`), hidden: false, import: true, targetId: e.id, type: g ? 'selectionEntryGroup' : 'selectionEntry' };
  };

  // ---------- points tracking ----------
  // An anchored card costs the anchor unit's CURRENT official points + the offset it was priced at,
  // so it follows every Munitorum Field Manual. Moves are reported so the printed card can be updated.
  const notes = [];
  const officialPts = name => {
    const e = lib.sharedSelectionEntries.find(x => x.name === name);
    if (!e) throw new Error(`Points anchor not found upstream: ${name}`);
    return ((e.costs || []).find(c => c.name === 'pts') || {}).value;
  };
  const trackedPts = (unitName, anchor, printed) => {
    const now = officialPts(anchor.name) + anchor.offset;
    if (now !== printed) notes.push(`POINTS: ${unitName} ${printed} -> ${now} (${anchor.name} now ${officialPts(anchor.name)}, offset ${anchor.offset >= 0 ? '+' : ''}${anchor.offset}) — update its card`);
    return now;
  };

  // ---------- NFLB-L: rebalanced copies of official [Legends] entries ----------
  // Deep-copies an upstream entry with fresh deterministic ids (internal references remapped),
  // inlines shared entries it links to when `inline(link)` says so (so their profiles can be
  // patched), drops the "Show Legends" visibility gate, and renames it.
  const cloneEntry = (src, key, { name, inline = () => false, dropModifier = () => false } = {}) => {
    const idMap = new Map();
    const fresh = old => { if (!idMap.has(old)) idMap.set(old, id(`clone:${key}:${old}:${idMap.size}`)); return idMap.get(old); };
    const copy = o => {
      if (Array.isArray(o)) return o.map(copy);
      if (!o || typeof o !== 'object') return o;
      if (o.targetId && o.type === 'selectionEntry' && inline(o)) {
        const t = lib.sharedSelectionEntries.find(e => e.id === o.targetId);
        if (t) {
          const merged = { ...t, id: o.id, constraints: [...(t.constraints || []), ...(o.constraints || [])], modifiers: [...(t.modifiers || []), ...(o.modifiers || [])] };
          return copy(merged);
        }
      }
      const out = {};
      for (const [k, v] of Object.entries(o)) out[k] = k === 'id' && typeof v === 'string' ? fresh(v) : copy(v);
      return out;
    };
    let c = copy(src);
    const remap = o => {
      if (Array.isArray(o)) return o.forEach(remap);
      if (!o || typeof o !== 'object') return;
      for (const k of ['targetId', 'childId', 'field', 'defaultSelectionEntryId', 'scope']) if (typeof o[k] === 'string' && idMap.has(o[k])) o[k] = idMap.get(o[k]);
      Object.values(o).forEach(remap);
    };
    remap(c);
    c.modifiers = (c.modifiers || []).filter(m => !dropModifier(m));
    c.name = name;
    return c;
  };
  // replace the characteristics of every profile whose name matches, keeping the given ones (e.g. BS)
  const patchProfiles = (entry, nameRe, fromProfiles, keep = ['BS', 'WS']) => {
    let n = 0;
    const walk = o => {
      if (Array.isArray(o)) return o.forEach(walk);
      if (!o || typeof o !== 'object') return;
      if (o.typeName && o.characteristics && nameRe.test(o.name || '')) {
        const suffix = (o.name.match(/-\s*(\w+)$/) || [])[1];
        const src = fromProfiles.find(p => (p.name.match(/-\s*(\w+)$/) || [])[1]?.toLowerCase() === suffix?.toLowerCase());
        if (src) {
          o.characteristics = o.characteristics.map(ch => keep.includes(ch.name) ? ch : { ...ch, $text: (src.characteristics.find(x => x.name === ch.name) || ch).$text });
          n++;
        }
      }
      Object.values(o).forEach(walk);
    };
    walk(entry);
    return n;
  };

  return { cloneEntry, patchProfiles, notes, officialPts, trackedPts, id, lib, gst, PTS, DP, ENH, category, rule, unitProfile, ability, orders, transport, weapon, link, choice, upgrade, model, group,
    shrinkFor, catLinks, leadAssociation, ruleLinks, sharedLink, cons, sharedEntries, ownCategories };
}

module.exports = { createBuilder };
