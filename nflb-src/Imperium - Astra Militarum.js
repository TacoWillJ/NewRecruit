// NFLB overlay for Imperium - Astra Militarum.
// Source: Primarch Project\Workspace\homebrew_cp_11e\source\_reference-*.html (11e cards)
// and mechanised-strike-force-detachment.html, normalised to 11e (2026-10-10):
// official 11e wargear/weapon profiles where an official equivalent exists, 11e Orders
// profiles on Officers, 11e rules wording (Heavy, strategic reserves, sticky objectives).

module.exports = {
  faction: 'Imperium - Astra Militarum.json',
  factionLibrary: 'Imperium - Astra Militarum - Library.json',

  build(b) {
    const { weapon: W, link, choice, model, group, ability, orders, unitProfile, catLinks, ruleLinks, sharedLink, shrinkFor, leadAssociation, cons } = b;
    const units = [];
    const unit = (name, pts, fields) => {
      const u = { name: `${name} [NFLB]`, id: b.id(`unit:${name}`), hidden: false, import: true, type: 'unit',
        costs: [{ name: 'pts', typeId: b.PTS, value: pts }], ...fields };
      units.push(u);
      return u;
    };
    const FACTION = ['Faction: Astra Militarum', 'Imperium'];

    // ---- weapons: official 11e infantry profiles (these resolve to official entries) ----
    const lasgun = W('Lasgun', ['24"', 1, '4+', 3, 0, 1]);
    const laspistol = W('Laspistol', ['12"', 1, '4+', 3, 0, 1]);
    const ccw = W('Close combat weapon', ['Melee', 2, '4+', 3, 0, 1]);
    const chainsword = W('Chainsword', ['Melee', 4, '4+', 3, 0, 1]);
    const flamer = W('Flamer', ['12"', 'D6', 'N/A', 4, 0, 1]);
    const gl = W('Grenade launcher', { frag: ['24"', 'D3', '4+', 4, 0, 1], krak: ['24"', 1, '4+', 9, -2, 'D3'] });
    const melta = W('Meltagun', ['12"', 1, '4+', 9, -4, 'D6']);
    const plasma = W('Plasma gun', { standard: ['24"', 1, '4+', 7, -2, 1], supercharge: ['24"', 1, '4+', 8, -3, 2] });
    const plasmaPistol = W('Plasma pistol', { standard: ['12"', 1, '4+', 7, -2, 1], supercharge: ['12"', 1, '4+', 8, -3, 2] });
    const specials = [flamer, gl, melta, plasma];
    // Infantry heavy weapon team profiles (BS5+, [HEAVY]) as on the official Heavy Weapons Squads
    const heavyBolter = W('Heavy bolter', ['36"', 3, '5+', 5, -1, 2]);
    const mortar = W('Mortar', ['48"', 'D6', '5+', 5, 0, 1]);
    const missile = W('Missile launcher', { frag: ['48"', 'D6', '5+', 4, 0, 1], krak: ['48"', 1, '5+', 9, -2, 'D6'] });
    const lascannon = W('Lascannon', ['48"', 1, '5+', 12, -3, 'D6+1']);
    const autocannon = W('Autocannon', ['48"', 2, '5+', 9, -1, 3]);
    const teamLaspistol = W('Laspistol', ['12"', 2, '4+', 3, 0, 1]);
    const teamCcw = W('Weapons team close combat weapons', ['Melee', 2, '4+', 3, 0, 1]);

    // =========================================================
    // Imperial Guard Squad
    // =========================================================
    let igSquad;
    {
      const k = 'igs';
      const sgt = model(k, 'Sergeant', { min: 1, max: 1, gear: [link(k + ':sgt', laspistol), link(k + ':sgt', chainsword)] });
      const sw = model(k, 'Guardsman w/ Special Weapon', { max: 1, gear: [link(k + ':sw', ccw)], groups: [choice(k + ':sw', 'Special weapon', specials)] });
      const hwt = model(k, 'Heavy Weapon Team', { max: 1, gear: [link(k + ':hwt', teamCcw)], groups: [choice(k + ':hwt', 'Heavy weapon', [autocannon, lascannon, missile])] });
      const guard = model(k, 'Guardsman', { min: 9, max: 9, gear: [link(k + ':g', lasgun), link(k + ':g', ccw)] });
      shrinkFor(guard, [[sw, 1], [hwt, 2]]);
      igSquad = unit('Imperial Guard Squad', 75, {
        categoryLinks: catLinks(k, ['Infantry', 'Battleline', 'Regiment', 'Platoon', 'Grenades', 'Imperial Guard Squad', ...FACTION], 'Battleline'),
        infoLinks: ruleLinks(k, ['Voice Of Command']),
        profiles: [
          unitProfile('Guardsman', ['6"', 3, '5+', 1, '7+', 2]),
          ability(k, 'Hold the Line', 'At the end of your Command phase, if this unit is within range of an objective marker you control, that objective marker remains under your control until your opponent\'s Level of Control over that objective marker is greater than yours at the end of a phase.'),
          ability(k, 'Heavy Weapon Team', 'A Heavy Weapon Team takes the place of two Guardsmen.'),
        ],
        selectionEntries: [sgt, guard, sw, hwt],
      });
    }

    // =========================================================
    // Captain Al'Rahem
    // =========================================================
    const AR = "Captain Al'Rahem";
    const leadsAR = ['Cadian Shock Troops', 'Catachan Jungle Fighters', 'Krieg Combat Engineers', 'Tempestus Aquilons'];
    const alrahem = unit(AR, 70, {
      type: 'model',
      constraints: cons('alrahem:roster', null, 1, 'roster'),
      categoryLinks: catLinks('alrahem', ['Infantry', 'Character', 'Epic Hero', 'Officer', 'Grenades', AR, ...FACTION], 'Epic Hero'),
      associations: [leadAssociation('alrahem', [...leadsAR, igSquad])],
      infoLinks: ruleLinks('alrahem', ['Leader', 'Voice Of Command']),
      profiles: [
        unitProfile(AR, ['6"', 3, '4+', 4, '6+', 1]),
        orders('alrahem', 'This **^^Officer^^** can issue 2 Orders to **^^Regiment^^** units.'),
        ability('alrahem', 'Leader', `This model can be attached to the following units: ${[...leadsAR, igSquad.name].map(n => `**^^${n}^^**`).join(', ')}`),
        ability('alrahem', 'Like the Wind!', 'Each time this model issues an Order, it can issue the following Order instead of one from the Voice of Command list. **LIKE THE WIND!**: Ranged weapons equipped by models in this unit have the **[ASSAULT]** ability, and each time this unit Advances, do not make an Advance roll for it. Instead, until the end of the phase, add 6" to the Move characteristic of models in this unit.'),
        ability('alrahem', 'Tallarn Outflank', 'This model, and any unit it is leading, can be placed into Strategic Reserves. Each time this unit makes an ingress move, it can do so in the first battle round, and it can be set up anywhere on the battlefield that is more than 9" horizontally from all enemy units.'),
        ability('alrahem', 'Bushido of the Sands', 'While this model is leading a unit, you can re-roll Advance and Charge rolls made for that unit.'),
      ],
      entryLinks: [
        link('alrahem', W('Plasma pistol', { standard: ['12"', 1, '3+', 7, -2, 1], supercharge: ['12"', 1, '3+', 8, -3, 2] })),
        link('alrahem', W('Laspistol', ['12"', 1, '3+', 3, 0, 1])),
        link('alrahem', W('Tallarn power sword', ['Melee', 4, '3+', 5, -2, 1], { keywords: '' })),
        sharedLink('alrahem', 'Warlord'),
      ],
    });

    // =========================================================
    // Imperial Guard Command Squad
    // =========================================================
    {
      const k = 'igcs';
      const commander = model(k, 'Commander', { max: 1, pts: 25,
        groups: [
          choice(k + ':cmd', 'Pistol', [laspistol, W('Bolt pistol', ['12"', 1, '4+', 4, 0, 1]), plasmaPistol]),
          choice(k + ':cmd', 'Melee weapon', [chainsword, W('Power weapon', ['Melee', 3, '4+', 4, -2, 1]), W('Power fist', ['Melee', 3, '4+', 6, -2, 2])]),
        ],
        gear: [sharedLink(k + ':cmd', 'Warlord'), sharedLink(k + ':cmd', 'Enhancements')],
      });
      const alrahemLink = { name: AR, id: b.id(`${k}:alrahem-link`), hidden: false, import: true, targetId: alrahem.id, type: 'selectionEntry', constraints: cons(`${k}:alrahem-link`, null, 1) };
      const officer = group(k, 'Officer', [commander, alrahemLink], { min: 1, max: 1, def: commander });

      // official 11e wargear (rules come with the linked entries)
      const kitModels = ['Regimental standard', 'Master vox', 'Medi-pack'].map(n =>
        model(k, `Veteran Guardsman w/ ${n}`, { max: 1, gear: [link(k + ':' + n, lasgun), link(k + ':' + n, ccw), Object.assign(sharedLink(k + ':' + n, n), { constraints: cons(`${k}:${n}:kit`, 1, 1) })] }));
      const specialistGroup = group(k, 'Specialist', kitModels, { max: 1 });
      const specialWeapon = model(k, 'Veteran Guardsman w/ Special Weapon', { max: 1, gear: [link(k + ':sw', ccw)], groups: [choice(k + ':sw', 'Special weapon', specials)] });
      const vet = model(k, 'Veteran Guardsman', { min: 4, max: 4, gear: [link(k + ':vet', lasgun), link(k + ':vet', ccw)] });
      shrinkFor(vet, [...kitModels.map(m => [m, 1]), [specialWeapon, 1]]);

      unit('Imperial Guard Command Squad', 35, {
        categoryLinks: catLinks(k, ['Infantry', 'Character', 'Officer', 'Regiment', 'Platoon', 'Command Squad', 'Grenades', 'Leader', 'Imperial Guard Command Squad', ...FACTION], 'Character'),
        associations: [leadAssociation(k, [igSquad])],
        infoLinks: ruleLinks(k, ['Voice Of Command', 'Leader']),
        profiles: [
          unitProfile('Commander', ['6"', 3, '5+', 3, '7+', 1]),
          unitProfile('Veteran Guardsman', ['6"', 3, '5+', 1, '7+', 1]),
          orders(k, 'This unit’s **^^Officer^^** can issue 1 Order to a **^^Regiment^^** unit.'),
          ability(k, 'Leader', `This unit can be attached to the following unit: **^^${igSquad.name}^^**`),
          ability(k, 'Cadre Standing', 'While this unit contains an **^^Officer^^** model and this unit is within range of an objective marker, this unit can re-roll Battle-shock tests.'),
          ability(k, 'Officer Swap', 'The Commander model can be replaced with a single named **^^Astra Militarum Officer Character^^** (e.g. Captain Al\'Rahem), who uses their own points, wargear, abilities and Orders in place of the Commander\'s. When you do, this unit costs 35 points plus that Character\'s points.'),
        ],
        selectionEntries: [vet, specialWeapon],
        selectionEntryGroups: [officer, specialistGroup],
      });
    }

    // =========================================================
    // Imperial Guard Heavy Weapon Squad
    // =========================================================
    {
      const k = 'ighws';
      const teams = [heavyBolter, mortar, missile, lascannon, autocannon].map(h =>
        model(k, `Heavy Weapon Team w/ ${h.name}`, { max: 3, gear: [link(k + h.name, teamLaspistol), link(k + h.name, teamCcw), link(k + h.name, h)] }));
      unit('Imperial Guard Heavy Weapon Squad', 65, {
        categoryLinks: catLinks(k, ['Infantry', 'Regiment', 'Platoon', 'Grenades', 'Imperial Guard Heavy Weapon Squad', ...FACTION], 'Infantry'),
        infoLinks: ruleLinks(k, ['Voice Of Command']),
        profiles: [
          unitProfile('Heavy Weapon Team', ['6"', 3, '5+', 2, '7+', 1]),
          ability(k, 'Covering Fire', 'Each time you target this unit with the Fire Overwatch Stratagem, while resolving that Stratagem, hits are scored on unmodified Hit rolls of 5+, or on unmodified Hit rolls of 4+ instead if this unit is within 6" of one or more friendly **^^Regiment^^** units.'),
        ],
        selectionEntryGroups: [group(k, '3 Heavy Weapon Teams', teams, { min: 3, max: 3, def: teams[0] })],
      });
    }

    // =========================================================
    // Imperial Guard Special Weapon Squad
    // =========================================================
    {
      const k = 'igsws';
      const sgt = model(k, 'Sergeant', { min: 1, max: 1, gear: [link(k + ':sgt', laspistol), link(k + ':sgt', chainsword)] });
      const troopers = specials.map(s => model(k, `Special Weapons Guardsman w/ ${s.name}`, { max: 4, gear: [link(k + s.name, s)] }));
      unit('Imperial Guard Special Weapon Squad', 70, {
        categoryLinks: catLinks(k, ['Infantry', 'Regiment', 'Platoon', 'Grenades', 'Imperial Guard Special Weapon Squad', ...FACTION], 'Infantry'),
        infoLinks: ruleLinks(k, ['Voice Of Command', 'Lethal Hits']),
        profiles: [
          unitProfile('Special Weapons Guardsman', ['6"', 3, '5+', 1, '7+', 1]),
          ability(k, 'Concentrated Firepower', 'Each time a model in this unit makes a ranged attack that targets a unit within half range, that attack has the **[LETHAL HITS]** ability.'),
        ],
        selectionEntries: [sgt],
        selectionEntryGroups: [group(k, '4 Special Weapons Guardsmen', troopers, { min: 4, max: 4, def: troopers[0] })],
      });
    }

    // =========================================================
    // Imperial Guard Rough Riders
    // =========================================================
    {
      const k = 'igrr';
      const bombs = W('Melta-bombs', ['6"', 1, '4+', 8, -3, 'D6'], { keywords: 'Melta 2' });
      const lance = W('Hunting lance', ['Melee', 2, '3+', 8, -2, 2], { keywords: 'Anti-Infantry 3+' });
      const sabre = W('Cavalry sabre', ['Melee', 2, '4+', 4, -1, 1], { keywords: '' });
      const hooves = W("Mount's hooves", ['Melee', 2, '4+', 4, 0, 1], { keywords: '' });
      const sgt = model(k, 'Rough Rider Sergeant', { min: 1, max: 1, gear: [plasmaPistol, bombs, lance, sabre, hooves].map(w => link(k + ':sgt', w)) });
      const rider = model(k, 'Rough Rider', { min: 4, max: 4, gear: [laspistol, bombs, lance, sabre, hooves].map(w => link(k + ':r', w)) });
      unit('Imperial Guard Rough Riders', 85, {
        categoryLinks: catLinks(k, ['Mounted', 'Regiment', 'Grenades', 'Imperial Guard Rough Riders', ...FACTION], 'Mounted'),
        infoLinks: ruleLinks(k, ['Voice Of Command', 'Scouts', 'Lance', 'Devastating Wounds']),
        profiles: [
          unitProfile('Rough Rider', ['12"', 4, '5+', 2, '7+', 2]),
          ability(k, 'Cavalry Charge', 'Each time this unit ends a Charge move, until the end of the turn, Hunting Lance attacks made by models in this unit have the **[LANCE]** and **[DEVASTATING WOUNDS]** abilities. This unit\'s Hunting Lances are used up after this combat — for the rest of the battle, models in this unit use their Cavalry Sabre in place of their Hunting Lance.'),
          ability(k, 'Outriders', 'This unit has the Scouts 8" ability.'),
          ability(k, 'Crushing Pursuit', 'Each time this unit declares a charge against a unit with 5 or more models, you can re-roll the Charge roll.'),
        ],
        selectionEntries: [sgt, rider],
      });
    }

    // =========================================================
    // Characters + squads batch 2 (2026-10-10). 11e fixes applied vs the cards:
    // leader lists drop units that are themselves Leaders (Cadian Command Squad) or no longer
    // exist (Veteran Guardsmen); bespoke Orders become selectable Orders (11e Orders are issued
    // in the Command phase); Officers get an Orders profile; Kell is an 11e Support unit.
    // =========================================================
    const pistol3 = W('Laspistol', ['12"', 1, '3+', 3, 0, 1]);
    const plasma3 = W('Plasma pistol', { standard: ['12"', 1, '3+', 7, -2, 1], supercharge: ['12"', 1, '3+', 8, -3, 2] });
    // single-model character: stats, weapons (array, or {choice:[...]}) and the rest of the entry
    const character = (name, pts, { stats, kws, primary = 'Epic Hero', gear = [], choose, rules = [], profiles = [], leads, support, extra = {} }) => {
      const k = `char:${name}`;
      const u = unit(name, pts, {
        type: 'model',
        ...(kws.includes('Epic Hero') ? { constraints: cons(`${k}:roster`, null, 1, 'roster') } : {}),
        categoryLinks: catLinks(k, [...kws, ...FACTION], primary),
        infoLinks: ruleLinks(k, [...(leads ? [support ? 'Support' : 'Leader'] : []), ...rules]),
        profiles: [unitProfile(name, stats), ...profiles],
        entryLinks: gear.map(w => link(k, w)),
        ...(choose ? { selectionEntryGroups: [choice(k, choose.name, choose.weapons)] } : {}),
        ...extra,
      });
      if (leads) {
        u.associations = [leadAssociation(k, leads, { support })];
        u.profiles.splice(1, 0, ability(k, support ? 'Support' : 'Leader', `This model can be attached to the following units: ${leads.map(n => `**^^${typeof n === 'string' ? n : n.name}^^**`).join(', ')}${support ? '. You can attach this model to one of the above units even if a Leader has already been attached to it.' : ''}`));
      }
      return u;
    };

    // ---- Penal Legion Squad ----
    let penal;
    {
      const k = 'penal';
      const ccwImp = W('Improvised close combat weapon', ['Melee', 2, '4+', 3, 0, 1], { keywords: '' });
      const sgt = model(k, 'Custodian Sergeant', { min: 1, max: 1, gear: [
        link(k + ':s', W('Autogun', ['24"', 2, '4+', 3, 0, 1], { keywords: 'Rapid Fire 2' })),
        link(k + ':s', W('Shock maul', ['Melee', 3, '3+', 5, -1, 1], { keywords: 'Anti-Infantry 4+' }))] });
      const convicts = model(k, 'Convict', { min: 5, max: 5, gear: [link(k + ':c', laspistol), link(k + ':c', ccwImp)] });
      const shotguns = model(k, 'Convict w/ Shotgun', { min: 3, max: 3, gear: [link(k + ':sg', W('Shotgun', ['12"', 2, '4+', 4, 0, 1], { keywords: 'Assault' })), link(k + ':sg', ccwImp)] });
      const glConvict = model(k, 'Convict w/ Grenade launcher', { min: 1, max: 1, gear: [link(k + ':gl', W('Penal grenade launcher', ['24"', 1, '4+', 5, 0, 1], { keywords: 'Anti-Infantry 4+' })), link(k + ':gl', ccwImp)] });
      penal = unit('Penal Legion Squad', 70, {
        categoryLinks: catLinks(k, ['Infantry', 'Battleline', 'Regiment', 'Penal Legion', ...FACTION], 'Battleline'),
        infoLinks: ruleLinks(k, ['Voice Of Command']),
        profiles: [
          unitProfile('Convict', ['6"', 3, '5+', 1, '8+', 2]),
          ability(k, 'Explosive Collars', 'This unit automatically passes Battle-shock tests and cannot Fall Back. If the Custodian Sergeant is destroyed by an enemy attack, roll one D6 at the end of the phase: on a 4+, until the start of your next turn, add 1 to the Attacks characteristic of melee weapons equipped by models in this unit and those weapons have the **[LETHAL HITS]** ability; at the start of your next turn, remove the remaining models in this unit from the battlefield.'),
          ability(k, 'Desperadoes', 'At the start of each of your turns, roll one D6. Until the end of the turn: 1-2 — melee weapons equipped by models in this unit have the **[LETHAL HITS]** ability; 3-4 — improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1; 5-6 — melee weapons equipped by models in this unit have the **[SUSTAINED HITS 1]** ability.'),
          ability(k, 'Press-Ganged', 'This unit cannot be your Warlord. Officers can only issue the Take Aim! or Fix Bayonets! Orders to this unit.'),
        ],
        selectionEntries: [sgt, convicts, shotguns, glConvict],
      });
    }

    // ---- Last Chancers ----
    let lastChancers;
    {
      const k = 'lastch';
      const spec = (name, gear) => model(k, name, { min: 1, max: 1, gear: gear.map(w => link(`${k}:${name}`, w)) });
      lastChancers = unit('Last Chancers', 110, {
        categoryLinks: catLinks(k, ['Infantry', 'Penal Legion', 'Last Chancers', ...FACTION], 'Infantry'),
        infoLinks: ruleLinks(k, ['Voice Of Command']),
        profiles: [
          unitProfile('Lieutenant Kage', ['6"', 3, '5+', 2, '7+', 2]),
          unitProfile('Last Chancer', ['6"', 3, '5+', 1, '7+', 2]),
          ability(k, 'Suicide Mission', 'The first battle round in which this unit shoots or fights, each time a model in this unit makes an attack, you can re-roll a Hit roll of 1 and you can re-roll a Wound roll of 1. In addition, once in that battle round, you can re-roll one saving throw made for a model in this unit.'),
          ability(k, 'No Quarter Asked, None Given', 'This unit cannot Fall Back and automatically passes Battle-shock tests. Each time a model in this unit is destroyed, roll one D6: on a 6, do not remove it from play; it can shoot (as if it were your Shooting phase) or fight after the attacking unit has finished making its attacks, and is then removed from play.'),
          ability(k, 'Medi-pack (Lieutenant Kage)', 'In your Command phase, while Lieutenant Kage is on the battlefield, one model in this unit, or one friendly **^^Astra Militarum Character^^** model within 3" of this unit, regains 1 lost wound.'),
        ],
        selectionEntries: [
          spec('Lieutenant Kage', [pistol3, W('Power sword', ['Melee', 3, '3+', 5, -2, 1], { keywords: '' })]),
          spec('Brick', [W('Heavy bolter', ['36"', 3, '4+', 5, -1, 2]), ccw]),
          spec('Gunnar', [W('Long-las', ['36"', 1, '3+', 4, -2, 'D3'], { keywords: 'Heavy, Precision, Lethal Hits' }), ccw]),
          spec('Demolition Man', [melta, W('Melta bombs', ['6"', 1, '4+', 8, -3, 'D6'], { keywords: 'Melta 2' }), ccw]),
          spec('Bionics Man', [W('Boltgun', ['24"', 2, '4+', 4, 0, 1], { keywords: 'Rapid Fire 1' }), W('Bionic arm', ['Melee', 3, '3+', 5, -1, 1], { keywords: '' })]),
          spec('Una the Madwoman', [flamer, ccw]),
        ],
      });
    }

    // ---- Wyrdvane Psykers ----
    {
      const k = 'wyrd';
      const m = model(k, 'Wyrdvane Psyker', { min: 3, max: 6, gear: [link(k, laspistol),
        link(k, W('Pooled wyrdpower', ['18"', 'X', '4+', 4, -1, 1], { keywords: 'Psychic, Hazardous' })),
        link(k, W('Wyrdvane stave', ['Melee', 2, '4+', 4, -1, 1], { keywords: 'Psychic' }))] });
      unit('Wyrdvane Psykers', 55, {
        categoryLinks: catLinks(k, ['Infantry', 'Psyker', 'Regiment', 'Wyrdvane Psykers', ...FACTION], 'Infantry'),
        infoLinks: ruleLinks(k, ['Voice Of Command', 'Stealth']),
        modifiers: [{ field: b.PTS, type: 'set', value: 110, conditions: [{ childId: 'model', field: 'selections', includeChildSelections: true, scope: 'self', shared: true, type: 'atLeast', value: 4 }] }],
        profiles: [
          unitProfile('Wyrdvane Psyker', ['6"', 3, '5+', 1, '7+', 2]),
          ability(k, 'Pooled Wyrdpower', 'The Attacks characteristic (X) of this unit\'s pooled wyrdpower is equal to the number of models in this unit when it is selected to shoot. Only one model in this unit can shoot with it each phase.'),
          ability(k, 'Empyric Feedback', 'Each time a model in this unit is destroyed as the result of a Hazardous test, each unit (friend or foe) within 6" of that model suffers D3 mortal wounds.'),
          ability(k, 'Strength in Numbers', 'While this unit contains 3 or more models, models in this unit have the Stealth ability and you can re-roll Battle-shock tests taken for this unit.'),
          ability(k, 'Unit Size', '3 models (55 pts) or 6 models (110 pts).'),
        ],
        selectionEntries: [m],
      });
    }

    // ---- Characters ----
    character('Captain Chenkov', 75, {
      stats: ['6"', 3, '4+', 4, '7+', 1], kws: ['Infantry', 'Character', 'Epic Hero', 'Officer', 'Grenades', 'Captain Chenkov'],
      gear: [pistol3], choose: { name: 'Melee weapon', weapons: [W('Valhallan power sword', ['Melee', 4, '3+', 5, -2, 1], { keywords: '' }), W('Frost-bladed chainsword', ['Melee', 5, '3+', 4, -1, 1], { keywords: 'Sustained Hits 1' })] },
      rules: ['Voice Of Command'], leads: ['Cadian Shock Troops', 'Catachan Jungle Fighters', 'Krieg Combat Engineers', igSquad],
      profiles: [
        orders('chenkov', 'This **^^Officer^^** can issue 2 Orders to **^^Regiment^^** units.'),
        ability('chenkov', 'Numbers Are A Weapon', 'Each time this model issues an Order to a unit that contains 7 or more models, it can issue the following Order instead of one from the Voice of Command list. **NUMBERS ARE A WEAPON!**: Improve the Ballistic Skill characteristic of ranged weapons equipped by models in this unit by 1, and those weapons have the **[SUSTAINED HITS 1]** ability.'),
        ability('chenkov', 'Send in the Next Wave! (Once per battle)', 'In your Command phase, select one friendly **^^Astra Militarum Infantry^^** unit (excluding **^^Characters^^**) that was destroyed. Set up a new unit identical to that unit, at its Starting Strength, wholly within 6" of any battlefield edge and more than 9" horizontally from all enemy units.'),
        ability('chenkov', 'Disposable!', 'While a friendly **^^Astra Militarum Infantry^^** unit is wholly within 6" of this model, that unit automatically passes Battle-shock tests.'),
      ],
    });
    character('Colonel Schaeffer', 85, {
      stats: ['6"', 3, '5+', 4, '6+', 1], kws: ['Infantry', 'Character', 'Epic Hero', 'Officer', 'Penal Legion', 'Colonel Schaeffer'],
      gear: [W("Schaeffer's plasma pistol", { standard: ['12"', 1, '3+', 7, -2, 1], supercharge: ['12"', 1, '3+', 8, -3, 2] }, { keywords: ['Pistol, Precision', 'Hazardous, Pistol, Precision'] }),
        W("Schaeffer's power sword", ['Melee', 4, '3+', 5, -2, 1], { keywords: '' }), W('Bionic gauntlet', ['Melee', 2, '3+', 6, -1, 1], { keywords: '' })],
      rules: ['Voice Of Command'], leads: [lastChancers, penal, 'Cadian Shock Troops', 'Krieg Combat Engineers'],
      profiles: [
        orders('schaeffer', 'This **^^Officer^^** can issue 2 Orders to **^^Regiment^^** or **^^Penal Legion^^** units.'),
        ability('schaeffer', 'Iron Discipline (Aura)', 'While a friendly **^^Penal Legion^^** unit is within 6" of this model, that unit automatically passes Battle-shock tests.'),
        ability('schaeffer', 'Iron Hand (Once per battle)', 'In your Command phase, if this model was destroyed in the previous turn, set it up again with 3 wounds remaining, wholly within 6" of where it was destroyed and more than 3" horizontally from all enemy units.'),
        ability('schaeffer', 'Bionic Eye (Once per battle)', 'You can re-roll one Hit roll, one Wound roll or one saving throw made for this model.'),
      ],
    });
    character('Colour Sergeant Kell', 60, {
      stats: ['6"', 3, '4+', 4, '7+', 1], kws: ['Infantry', 'Character', 'Epic Hero', 'Cadian', 'Grenades', 'Colour Sergeant Kell'],
      gear: [pistol3], choose: { name: 'Melee weapon', weapons: [W('Power fist', ['Melee', 3, '4+', 8, -2, 2], { keywords: '' }), W('Power sword', ['Melee', 4, '3+', 4, -2, 1], { keywords: '' })] },
      rules: [], leads: ['Cadian Shock Troops', 'Kasrkin'], support: true,
      profiles: [
        ability('kell', 'Regimental Standard (Aura)', 'While a friendly **^^Cadian^^** unit is within 6" of this model, you can re-roll Battle-shock tests taken for that unit, and while it is within range of an objective marker, add 1 to the Objective Control characteristic of models in that unit.'),
        ability('kell', 'Listen Up, Maggots!', 'In your Command phase, one friendly **^^Cadian Officer^^** model within 6" of this model can issue one additional Order.'),
        ability('kell', 'Sworn Protector', 'While this model is part of the same attached unit as **^^Ursula Creed^^**, each time Ursula Creed would lose a wound, roll one D6: on a 2+, that wound is allocated to this model instead.'),
        ability('kell', 'Colours of the Cadian 8th', 'Each time a friendly **^^Cadian Infantry^^** model within 6" of this model is destroyed, roll one D6: on a 6, do not remove it from play; it can shoot or fight after the attacking unit has finished making its attacks, and is then removed from play.'),
      ],
    });
    character('Sergeant Bastonne', 55, {
      stats: ['6"', 3, '4+', 4, '6+', 1], kws: ['Infantry', 'Character', 'Epic Hero', 'Cadian', 'Grenades', 'Sergeant Bastonne'],
      gear: [W("Bastonne's plasma pistol", { standard: ['12"', 1, '3+', 7, -2, 1], supercharge: ['12"', 1, '3+', 8, -3, 2] }, { keywords: ['Pistol', 'Hazardous, Pistol'] }),
        W('Power weapon', ['Melee', 4, '3+', 5, -2, 1], { keywords: '' })],
      rules: ['Feel No Pain 6+'], leads: ['Cadian Shock Troops', 'Kasrkin'],
      profiles: [
        ability('bastonne', 'Honour of Cadia', 'While this model is leading a unit, each time a model in that unit makes an attack, you can re-roll a Hit roll of 1. If that unit is within range of an objective marker you control, you can re-roll a Hit roll of 1, 2 or 3 instead.'),
        ability('bastonne', 'Cadian Steel (Once per battle)', 'The first time this model\'s unit is selected as the target of one or more ranged attacks, until the end of the phase, each time an attack targets that unit, subtract 1 from the Wound roll.'),
      ],
    });
    character('Commissar Severina Raine', 55, {
      stats: ['6"', 3, '4+', 4, '6+', 1], kws: ['Infantry', 'Character', 'Epic Hero', 'Officio Prefectus', 'Grenades', 'Severina Raine'],
      gear: [W('Penance', ['12"', 2, '3+', 4, -1, 1], { keywords: 'Pistol, Lethal Hits' }), W('Evenfall', ['Melee', 4, '3+', 4, -1, 1], { keywords: 'Sustained Hits 1' })],
      rules: [], leads: ['Cadian Shock Troops', 'Catachan Jungle Fighters', 'Death Korps of Krieg', 'Tempestus Scions', igSquad],
      profiles: [
        ability('raine', 'Aura of Discipline (Aura)', 'While a friendly **^^Astra Militarum^^** unit is within 6" of this model, you can re-roll Battle-shock tests taken for that unit.'),
        ability('raine', 'Leading from the Front', 'While this model is within Engagement Range of one or more enemy units, friendly **^^Astra Militarum^^** units within 6" of this model automatically pass Battle-shock tests.'),
        ability('raine', 'Summary Execution', 'Each time a friendly **^^Astra Militarum^^** unit within 6" of this model fails a Battle-shock test, you can roll one D6: on a 4+, one model in that unit is destroyed and that test is passed instead.'),
        ability('raine', 'Honourbound', 'Each time a friendly **^^Astra Militarum Officer^^** model within 6" of this model is destroyed, before it is removed from play, this model can issue one Order as if it were that **^^Officer^^**.'),
      ],
    });
    character('Mogul Kamir', 80, {
      stats: ['12"', 5, '4+', 5, '6+', 2, '4+'], kws: ['Mounted', 'Character', 'Epic Hero', 'Officer', 'Attilan', 'Mogul Kamir'],
      gear: [plasma3, pistol3, W('Attilan hunting lance', ['Melee', 5, '3+', 8, -2, 2], { keywords: 'Anti-Infantry 3+' }),
        W('Power sabre', ['Melee', 4, '3+', 5, -2, 1], { keywords: '' }), W('Cyber-horse hooves', ['Melee', 2, '4+', 5, 0, 1], { keywords: '' })],
      rules: ['Voice Of Command', 'Feel No Pain 6+', 'Lance', 'Devastating Wounds'], leads: ['Attilan Rough Riders', units.find(u => u.name === 'Imperial Guard Rough Riders [NFLB]')],
      profiles: [
        orders('kamir', 'This **^^Officer^^** can issue 2 Orders to **^^Regiment^^** units.'),
        ability('kamir', 'Like Lightning!', 'Each time this model issues an Order to a **^^Mounted^^** unit, it can issue the following Order instead of one from the Voice of Command list. **LIKE LIGHTNING!**: You can re-roll Charge rolls made for this unit, and melee weapons equipped by models in this unit have the **[LANCE]** ability.'),
        ability('kamir', 'Heroic Charge', 'Each time this model\'s unit ends a Charge move, until the end of the turn, melee weapons equipped by models in that unit have the **[LANCE]** and **[DEVASTATING WOUNDS]** abilities. After that fight, this model can no longer use its Attilan hunting lance for the rest of the battle.'),
        ability('kamir', 'Honourable Death', 'Each time this model is destroyed in the Fight phase, do not remove it from play; it can fight after the attacking unit has finished making its attacks, and is then removed from play.'),
      ],
    });

    // ---- Knight Commander Pask: +45 pts upgrade for any official Leman Russ ----
    const paskId = b.id('pask');
    const pask = {
      name: 'Knight Commander Pask [NFLB]', id: paskId, hidden: false, import: true, type: 'upgrade',
      constraints: [...cons('pask', null, 1), ...cons('pask:roster', null, 1, 'roster')],
      costs: [{ name: 'pts', typeId: b.PTS, value: 45 }],
      profiles: [
        ability('pask', 'Knight Commander Pask', 'This model is commanded by Knight Commander Pask (0-1 per army). It gains the **^^Character^^**, **^^Epic Hero^^** and **^^Knight Commander Pask^^** keywords.'),
        ability('pask', 'Tank Ace', 'Improve the Ballistic Skill characteristic of ranged weapons equipped by this model by 1 (to a maximum of 2+). In addition, each time this model is selected to shoot, you can re-roll one Wound roll.'),
        ability('pask', 'Hand of Steel', 'While this model has its full number of wounds, it has the Feel No Pain 6+ ability against ranged attacks. While it is Below Half-strength, it has the Lone Operative ability.'),
        ability('pask', 'Master of All Variants', 'Ranged weapons equipped by this model whose names include battle cannon, demolisher cannon, plasma cannon, autocannon, vanquisher cannon, gatling cannon or nova cannon have the **[SUSTAINED HITS 1]** ability.'),
        ability('pask', 'Coordinated Strike (Aura)', 'While a friendly **^^Leman Russ^^** unit is within 12" of this model, that unit is eligible to shoot in a turn in which it Advanced.'),
      ],
    };
    const lemanRuss = b.lib.sharedSelectionEntries.filter(e => /^Leman Russ/.test(e.name) && e.type === 'model').map(e => e.name);
    if (lemanRuss.length < 7) throw new Error(`Expected the Leman Russ variants upstream, found ${lemanRuss.length}`);

    // =========================================================
    // Detachment: Mechanised Strike Force
    // =========================================================
    const detId = b.id('det:msf');
    const detachment = {
      name: 'Mechanised Strike Force [NFLB]', id: detId, hidden: false, import: true, type: 'upgrade',
      categoryLinks: catLinks('det:msf', ['Take and Hold'], null),
      constraints: cons('det:msf', null, 1),
      costs: [{ name: 'pts', typeId: b.PTS, value: 0 }, { name: 'Detachment Points', typeId: b.DP, value: 1 }],
      rules: [
        { name: 'Mechanised Doctrine', id: b.id('det:msf:rule'), hidden: false, description:
          'While a friendly **^^Astra Militarum Infantry^^** unit is embarked within a friendly **^^Astra Militarum Transport^^**, add 1 to the Objective Control characteristic of that **^^Transport^^**.\n\nEach time a friendly **^^Astra Militarum Infantry^^** unit disembarks from a **^^Transport^^** in your turn, until the end of that turn, attacks made with **[HEAVY]** weapons equipped by models in that unit can benefit from the **[HEAVY]** ability even though that unit was set up on the battlefield this turn, provided no model in that unit has moved more than 3" since it disembarked.' },
        ...[
          ['Mechanised Spearhead (1CP)', 'Strategic Ploy. **When:** Start of the first battle round, before the first turn begins. Use once per battle. **Target:** One friendly **^^Astra Militarum Transport^^** unit and any unit embarked within it. **Effect:** Remove that **^^Transport^^** from the battlefield and set it up again anywhere on the battlefield that is wholly within 18" of any battlefield edge and more than 9" horizontally from all enemy units.'],
          ['Open Hatches! (1CP)', 'Battle Tactic. **When:** Your Shooting phase, when a friendly **^^Astra Militarum Transport^^** with one or more units embarked within it is selected to shoot. **Target:** That **^^Transport^^**. **Effect:** Until the end of the phase, add 2 to that **^^Transport^^**\'s Firing Deck value, and each time a model makes an attack with a weapon selected via Firing Deck, you can re-roll a Wound roll of 1.'],
          ['Treads Forward! (1CP)', 'Strategic Ploy. **When:** Your Movement phase, just before a friendly **^^Astra Militarum Transport^^** is selected to move. **Target:** That **^^Transport^^**. **Effect:** Until the end of the phase, add 3" to the Move characteristic of that **^^Transport^^**. In addition, if it Advances this phase, units embarked within it can still disembark this turn.'],
          ['Disembark and Fire! (1CP)', 'Battle Tactic. **When:** Your Shooting phase, when a friendly **^^Astra Militarum Infantry^^** unit that disembarked from a **^^Transport^^** this turn is selected to shoot. **Target:** That unit. **Effect:** Until the end of the phase, **[HEAVY]** weapons equipped by models in that unit have the **[SUSTAINED HITS 1]** ability.'],
          ['Hull-down Defense (1CP)', 'Strategic Ploy. **When:** Your opponent\'s Shooting phase, just after a friendly **^^Astra Militarum Transport^^** is selected as the target of one or more of the attacking unit\'s attacks. **Target:** That **^^Transport^^**. **Effect:** Until the end of the phase, each time an attack targets that **^^Transport^^**, subtract 1 from the Wound roll, and that **^^Transport^^** has the Feel No Pain 5+ ability.'],
          ['Smokescreen Surge (1CP)', 'Strategic Ploy. **When:** End of your Movement phase. **Target:** Every friendly **^^Astra Militarum Transport^^** on the battlefield that did not Advance this turn. **Effect:** Until the start of your next turn, those **^^Transports^^** have the Stealth ability.'],
        ].map(([n, t]) => ({ name: `Stratagem: ${n}`, id: b.id(`det:msf:strat:${n}`), hidden: false, description: t })),
      ],
    };
    const enh = (name, pts, text) => ({
      name, id: b.id(`enh:${name}`), hidden: false, import: true, type: 'upgrade',
      constraints: [...cons(`enh:${name}`, null, 1), ...cons(`enh:${name}:roster`, null, 1, 'roster')],
      costs: [{ name: 'pts', typeId: b.PTS, value: pts }, { name: 'Enhancements', typeId: b.ENH, value: 1 }],
      modifiers: [{ field: 'hidden', type: 'set', value: true, conditions: [{ childId: b.category('Officer').id, field: 'selections', scope: 'ancestor', shared: true, type: 'notInstanceOf', value: 1 }] }],
      profiles: [ability('enh', name, `**^^Officer^^** model only. ${text}`)],
    });
    const enhGroup = {
      name: 'Mechanised Strike Force Enhancements [NFLB]', id: b.id('det:msf:enh'), hidden: false,
      constraints: cons('det:msf:enh', null, 1),
      modifiers: [{ field: 'hidden', type: 'set', value: true, conditions: [{ childId: detId, field: 'selections', includeChildForces: true, includeChildSelections: true, scope: 'roster', shared: true, type: 'lessThan', value: 1 }] }],
      selectionEntries: [
        enh('Track Commander', 15, 'While the bearer\'s unit is embarked within a **^^Transport^^**, improve the Ballistic Skill characteristic of that **^^Transport^^**\'s ranged weapons by 1, and each time that **^^Transport^^** makes an attack that targets the closest eligible target, you can re-roll a Hit roll of 1.'),
        enh('Veteran Crewman', 20, 'While the bearer\'s unit is embarked within a **^^Transport^^**, add 1" to the Move characteristic of that **^^Transport^^**. In addition, once per battle round, when a saving throw made for that **^^Transport^^** is failed (excluding mortal wounds), you can change the result to a successful save.'),
        enh('Master Vox', 25, 'Each time the bearer issues an Order, it can issue it to an eligible unit anywhere on the battlefield. In addition, the bearer can issue 1 additional Order in your Command phase.'),
        enh('Iron-hardened Hull', 15, 'While the bearer\'s unit is embarked within a **^^Transport^^**, add 1 to the Toughness characteristic of that **^^Transport^^**, and that **^^Transport^^** has the Feel No Pain 5+ ability against mortal wounds.'),
      ],
    };

    return {
      rootUnits: units,
      // Copied whole into the upstream pickers (New Recruit won't follow a link into our catalogue)
      injections: [
        { file: 'Imperium - Astra Militarum - Library.json', groupName: 'Detachment', selectionEntry: detachment },
        { file: 'Imperium - Astra Militarum - Library.json', groupName: 'Enhancements', selectionEntryGroup: enhGroup },
        // Pask lives in the Library itself and every Leman Russ variant links to it (same file)
        { file: 'Imperium - Astra Militarum - Library.json', selectionEntry: pask },
        ...lemanRuss.map(n => ({ file: 'Imperium - Astra Militarum - Library.json', entryName: n,
          entryLink: { name: pask.name, id: b.id(`pask:link:${n}`), hidden: false, import: true, targetId: paskId, type: 'selectionEntry' } })),
      ],
    };
  },
};
