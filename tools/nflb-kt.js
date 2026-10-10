// Kill Team kits brought into 40k (user decision 2026-10-10): helpers shared by the faction specs.
// A "specialist" is a copy of one of GW's own model entries inside an official datasheet (so it keeps
// the official statline), with the Kill Team operative's signature weapon / ability, max 1 per unit.

// Find a model entry anywhere inside an upstream entry by name.
function findModel(entry, name) {
  let hit = null;
  (function walk(o) {
    if (hit || !o || typeof o !== 'object') return;
    if (Array.isArray(o)) return o.forEach(walk);
    if (o.type === 'model' && o.name === name) { hit = o; return; }
    for (const k of ['selectionEntryGroups', 'selectionEntries']) if (o[k]) walk(o[k]);
  })(entry);
  return hit;
}

// After replacing a copied model's constraints, drop the modifiers that pointed at its old min/max.
function dropStaleLimits(m) {
  const stale = x => String(x.field).startsWith('nflb-');
  if (m.modifiers) m.modifiers = m.modifiers.filter(x => !stale(x));
  if (m.modifierGroups) m.modifierGroups = m.modifierGroups.map(g => ({ ...g, modifiers: (g.modifiers || []).filter(x => !stale(x)) })).filter(g => g.modifiers.length);
  return m;
}

// opts.embed: library factions (e.g. Astra Militarum) can't link from an upstream catalogue to
// NFLB-only weapons, so those are copied into the model; official weapons are still linked.
function specialists(b, base, prefix, { embed = false } = {}) {
  const { link, cons } = b;
  const weaponEntry = (key, w) => {
    if (embed && !w.official) {
      const src = b.sharedEntries.find(e => e.id === w.targetId);
      const e = b.cloneEntry(src, `${key}:embed:${w.name}`, { name: w.name });
      e.constraints = cons(`${key}:embed:${w.name}`, 1, 1);
      return { entry: e };
    }
    return { link: link(key, w) };
  };
  return (name, { keep = [], weapons = [], abilities = [], max = 1, pts, profiles = [], infoLinks = [] } = {}) => {
    const key = `kt:${prefix}:${name}`;
    const m = b.cloneEntry(base, key, { name: `${name} [NFLB]` });
    // keep only the listed official gear (links and inline weapon entries) from the base model
    m.entryLinks = (m.entryLinks || []).filter(l => keep.includes(l.name));
    m.selectionEntries = (m.selectionEntries || []).filter(e => keep.includes(e.name));
    m.selectionEntryGroups = (m.selectionEntryGroups || []).filter(g => keep.includes(g.name));
    for (const w of weapons) {
      const r = weaponEntry(key, w);
      if (r.link) m.entryLinks.push(r.link); else m.selectionEntries.push(r.entry);
    }
    for (const k of ['entryLinks', 'selectionEntries', 'selectionEntryGroups']) if (!m[k].length) delete m[k];
    m.constraints = cons(`${key}:max`, null, max);
    dropStaleLimits(m);
    if (abilities.length || profiles.length) m.profiles = [...(m.profiles || []), ...profiles, ...abilities];
    if (infoLinks.length) m.infoLinks = [...(m.infoLinks || []), ...infoLinks];
    if (pts != null) m.costs = (m.costs || [{ name: 'pts', typeId: b.PTS, value: 0 }]).map(c => (c.name === 'pts' ? { ...c, value: pts } : c));
    return m;
  };
}

// Let specialists take the place of a base model that has a minimum (e.g. "Death Korps Trooper" min 5):
// one decrement modifier per specialist on that model's min constraint, injected with the given target.
function shrinkMin(b, baseModel, specialistModels, target, key) {
  const minC = (baseModel.constraints || []).find(c => c.type === 'min');
  if (!minC) return [];
  return specialistModels.map(s => ({ ...target, modifier: {
    field: minC.id, type: 'decrement', value: 1, comment: `NFLB kill team: ${key}`,
    repeats: [{ childId: s.id, field: 'selections', scope: 'parent', shared: true, repeats: 1, roundUp: false, value: 1 }],
  } }));
}

module.exports = { dropStaleLimits, findModel, specialists, shrinkMin };
