// Gellerpox Infected [NFLB-L] (user decision 2026-10-10), shared by the Chaos Space Marines and Death
// Guard specs (GW lists the Legends unit in both). GW's datasheet is kept as-is (its profiles are in
// step with the current Accursed Cultists) and the rest of the Kill Team "Gellerpox Infected" box is
// added: Vulgrar Thrice-cursed and the Mutoid Vermin / Glitchlings. Replaces the official Legends entry.

module.exports = function gellerpox(b, file) {
  const { weapon: W, link, ability, unitProfile, cons, catLinks } = b;
  const SHOW_LEGENDS = '9ed-cbf4-bfe5-90bf';
  const src = b.lib.sharedSelectionEntries.find(e => e.name === 'Gellerpox Infected [Legends]');
  if (!src) throw new Error(`Gellerpox Infected [Legends] no longer exists in ${file}`);
  const k = 'nl:gellerpox';
  const u = b.cloneEntry(src, k, {
    name: 'Gellerpox Infected [NFLB-L]',
    dropModifier: m => JSON.stringify(m.conditions || []).includes(SHOW_LEGENDS),
  });
  const model = (name, { min = 0, max, pts, profile, gear, abilities = [] }) => ({
    name, id: b.id(`${k}:model:${name}`), hidden: false, import: true, type: 'model',
    constraints: cons(`${k}:model:${name}`, min, max),
    costs: [{ name: 'pts', typeId: b.PTS, value: pts }],
    profiles: [profile, ...abilities], entryLinks: gear.map(w => link(`${k}:${name}`, w)),
  });
  const vermin = name => unitProfile(name, ['6"', 2, '7+', 1, '8+', 0]);
  const vulgrar = model('Vulgrar Thrice-cursed', { max: 1, pts: 40,
    profile: unitProfile('Vulgrar Thrice-cursed', ['5"', 6, '6+', 6, '6+', 1]),
    gear: [W('Pyregut', ['12"', 'D6', 'N/A', 5, -1, 1], { keywords: 'Ignores Cover, Torrent' }), W('Fleshmelded weapons', ['Melee', 5, '3+', 6, -1, 2])],
    abilities: [ability(`${k}:vulgrar`, 'Spread the Glorious Gifts', "Once per battle, at the end of your Command phase, if this model is within range of an objective marker you control, that objective marker remains under your control until your opponent's Level of Control over it is greater than yours at the end of a phase.")] });
  const swarm = {
    name: 'Mutoid Vermin and Glitchlings', id: b.id(`${k}:vermin`), hidden: false, constraints: cons(`${k}:vermin`, 0, 4),
    selectionEntries: [
      model('Cursemite', { max: 4, pts: 5, profile: vermin('Cursemite'), gear: [W('Bloodsucking proboscis', ['Melee', 2, '4+', 3, -1, 1])] }),
      model('Eyestinger Swarm', { max: 4, pts: 5, profile: vermin('Eyestinger Swarm'), gear: [W('Stings', ['Melee', 3, '5+', 2, 0, 1])] }),
      model('Sludge-grub', { max: 4, pts: 5, profile: vermin('Sludge-grub'), gear: [W('Acid spit', ['6"', 2, '4+', 3, -1, 1]), W('Fanged maw', ['Melee', 1, '4+', 2, 0, 1])],
        abilities: [ability(`${k}:grub`, 'Caustic Demise', 'Each time this model is destroyed, roll one D6: on a 4+, one enemy unit within 3" of it suffers 1 mortal wound.')] }),
      model('Glitchling', { max: 4, pts: 5, profile: unitProfile('Glitchling', ['6"', 2, '6+', 1, '8+', 0, '6+']), gear: [W('Diseased effluence', ['6"', 2, '4+', 2, 0, 1]), W('Diseased nippers', ['Melee', 2, '4+', 2, 0, 1])] }),
    ],
  };
  u.selectionEntries = [...(u.selectionEntries || []), vulgrar];
  u.selectionEntryGroups = [...(u.selectionEntryGroups || []), swarm];
  u.profiles = [...(u.profiles || []), ability(k, 'NFLB-L Rebalance',
    "GW's Gellerpox Infected [Legends] datasheet (unchanged; its profiles are in step with the current Accursed Cultists) with the rest of the Kill Team box added: Vulgrar Thrice-cursed and up to 4 Mutoid Vermin / Glitchlings (Bloatspawn, Fleshscreamer and Lumberghast are its Nightmare Hulks). Replaces the official Legends entry; base points follow GW's Legends points.")];
  return {
    unit: u,
    hideOfficial: { file, entryName: 'Gellerpox Infected [Legends]', modifier: { field: 'hidden', type: 'set', value: true, comment: 'NFLB-L replacement' } },
  };
};
