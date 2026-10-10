// NFLB overlay for Imperium - Astra Militarum.
// Source of truth: Primarch Project\Workspace\homebrew_cp_11e\source\_reference-*.html (11e cards)
// and mechanised-strike-force-detachment.html.

module.exports = {
  faction: 'Imperium - Astra Militarum.json',
  factionLibrary: 'Imperium - Astra Militarum - Library.json',

  build(b) {
    const { weapon: W, link, choice, model, group, upgrade, ability, unitProfile, catLinks, ruleLinks, sharedLink, shrinkFor, leadAssociation, cons } = b;
    const units = [];
    const unit = (name, pts, fields) => {
      const u = { name: `${name} [NFLB]`, id: b.id(`unit:${name}`), hidden: false, import: true, type: 'unit',
        costs: [{ name: 'pts', typeId: b.PTS, value: pts }], ...fields };
      units.push(u);
      return u;
    };

    // ---- shared weapon stat lines (from the 11e cards) ----
    const lasgun = W('Lasgun', ['24"', 1, '4+', 3, 0, 1]);
    const laspistol = W('Laspistol', ['12"', 1, '4+', 3, 0, 1]);
    const ccw = W('Close combat weapon', ['Melee', 2, '4+', 3, 0, 1]);
    const sgtChainsword = W('Chainsword', ['Melee', 4, '3+', 3, 0, 1]);
    const flamer = W('Flamer', ['12"', 'D6', 'N/A', 4, 0, 1]);
    const gl = W('Grenade launcher', { frag: ['24"', 'D3', '4+', 4, 0, 1], krak: ['24"', 1, '4+', 9, -2, 'D3'] });
    const melta = W('Meltagun', ['12"', 1, '4+', 9, -4, 'D6']);
    const plasma = W('Plasma gun', { standard: ['24"', 1, '4+', 7, -2, 1], supercharge: ['24"', 1, '4+', 8, -3, 2] });
    const plasmaPistol = W('Plasma pistol', { standard: ['12"', 1, '4+', 7, -2, 1], supercharge: ['12"', 1, '4+', 8, -3, 2] });
    const specials = [flamer, gl, melta, plasma];
    const missile = W('Missile launcher', { frag: ['48"', 'D6', '4+', 4, 0, 1], krak: ['48"', 1, '4+', 9, -2, 'D6'] });
    const lascannon = W('Lascannon', ['48"', 1, '4+', 12, -3, 'D6+1']);
    const autocannon = W('Autocannon', ['48"', 2, '4+', 9, -1, 3]);

    // =========================================================
    // Captain Al'Rahem
    // =========================================================
    const AR = "Captain Al'Rahem";
    const alrahem = unit(AR, 70, {
      type: 'model',
      constraints: cons('alrahem:roster', null, 1, 'roster'),
      categoryLinks: catLinks('alrahem', ['Infantry', 'Character', 'Epic Hero', 'Officer', AR, 'Faction: Astra Militarum', 'Imperium'], 'Epic Hero'),
      associations: [leadAssociation('alrahem', ['Cadian Shock Troops', 'Catachan Jungle Fighters', 'Krieg Combat Engineers', 'Tempestus Aquilons'])],
      infoLinks: ruleLinks('alrahem', ['Leader', 'Voice Of Command']),
      profiles: [
        unitProfile(AR, ['6"', 3, '4+', 4, '6+', 1]),
        ability('alrahem', 'Leader', 'This model can be attached to one of the following units: Cadian Shock Troops, Catachan Jungle Fighters, Krieg Combat Engineers, Tempestus Aquilons.'),
        ability('alrahem', '"Like the Wind!" Order', 'Once per turn, in your Movement phase, you can issue the Like the Wind! Order to a friendly **^^Astra Militarum Infantry^^** unit within 6" of this model. Until the end of the turn, that unit can move as if it had the Scouts 6" ability and its ranged weapons gain the **[ASSAULT]** ability. This is in addition to any other Orders issued by other **^^Officers^^**.'),
        ability('alrahem', 'Tallarn Outflank', 'During deployment, instead of placing this model (and its attached unit, if any) on the battlefield, you can place it in Strategic Reserves. In your Movement phase, you can set up this unit anywhere on the battlefield more than 9" away from enemy models. This may be used from the first battle round.'),
        ability('alrahem', 'Bushido of the Sands', 'Each time the unit Al\'Rahem leads Advances or Charges, you can re-roll the dice. This ability also applies if the attached unit benefits from the Like the Wind! Order this turn.'),
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
      const commander = model(k, 'Commander', { min: null, max: 1, pts: 25,
        groups: [
          choice(k + ':cmd', 'Pistol', [laspistol, W('Bolt pistol', ['12"', 1, '4+', 4, 0, 1]), plasmaPistol]),
          choice(k + ':cmd', 'Melee weapon', [sgtChainsword, W('Power weapon', ['Melee', 3, '3+', 4, -2, 1]), W('Power fist', ['Melee', 3, '3+', 6, -2, 2])]),
        ],
        gear: [sharedLink(k + ':cmd', 'Warlord'), sharedLink(k + ':cmd', 'Enhancements')],
      });
      const officer = group(k, 'Officer', [commander, { name: AR, id: b.id(`${k}:alrahem-link`), hidden: false, import: true, targetId: alrahem.id, type: 'selectionEntry', constraints: cons(`${k}:alrahem-link`, null, 1) }], { min: 1, max: 1, def: commander });

      const kit = (name, text) => upgrade(k, name, { profiles: [ability(k, `${name} (if taken)`, text)] });
      const specialistModels = [
        ['Regimental Standard', 'While a model with a Regimental Standard is part of this unit, each time a friendly **^^Regiment^^** unit within 6" of this unit would take a Battle-shock test, it automatically passes.'],
        ['Master Vox', 'While a model with a Master Vox is part of this unit, Orders issued by an **^^Officer^^** to this unit, or by an **^^Officer^^** within this unit to another unit, can target friendly **^^Regiment^^** units within 12" instead of 6".'],
        ['Medi-pack', 'While a model with a Medi-pack is part of this unit, models in this unit have the Feel No Pain 5+ ability.'],
      ].map(([n, t]) => model(k, `Veteran Guardsman w/ ${n}`, { max: 1, gear: [link(k + ':' + n, ccw)], entries: [Object.assign(kit(n, t), { constraints: cons(`${k}:${n}:kit`, 1, 1) })] }));
      const specialistGroup = group(k, 'Specialist (instead of Lasgun)', specialistModels, { max: 1 });
      const specialWeapon = model(k, 'Veteran Guardsman w/ Special Weapon', { max: 1, gear: [link(k + ':sw', ccw)], groups: [choice(k + ':sw', 'Special weapon', specials)] });
      const vet = model(k, 'Veteran Guardsman', { min: 4, max: 4, gear: [link(k + ':vet', lasgun), link(k + ':vet', ccw)] });
      shrinkFor(vet, [...specialistModels.map(m => [m, 1]), [specialWeapon, 1]]);

      unit('Imperial Guard Command Squad', 35, {
        categoryLinks: catLinks(k, ['Infantry', 'Character', 'Officer', 'Regiment', 'Leader', 'Imperial Guard Command Squad', 'Faction: Astra Militarum', 'Imperium'], 'Character'),
        infoLinks: ruleLinks(k, ['Voice Of Command']),
        profiles: [
          unitProfile('Commander', ['6"', 3, '5+', 3, '7+', 1]),
          unitProfile('Veteran Guardsman', ['6"', 3, '5+', 1, '7+', 1]),
          ability(k, 'Cadre Standing', 'While this unit contains the Commander model and is within range of an objective marker, this unit can re-roll Battle-shock tests.'),
          ability(k, 'Leader (Officer Swap)', 'The Commander model can be replaced with a single named **^^Astra Militarum Officer Character^^** at their own full points cost, wargear, and abilities (e.g. Captain Al\'Rahem). When you do, the unit\'s cost becomes 35 points (the 4 Veteran Guardsmen only) plus the named Character\'s own points. The named Character occupies the Commander\'s role in this unit and issues Orders per their own datasheet (or this unit\'s Orders ability, whichever is more generous). Only one Officer may occupy this slot.'),
        ],
        selectionEntries: [vet, specialWeapon],
        selectionEntryGroups: [officer, specialistGroup],
      });
    }

    // =========================================================
    // Imperial Guard Squad
    // =========================================================
    {
      const k = 'igs';
      const sgt = model(k, 'Sergeant', { min: 1, max: 1, gear: [link(k + ':sgt', laspistol), link(k + ':sgt', sgtChainsword)] });
      const sw = model(k, 'Guardsman w/ Special Weapon', { max: 1, gear: [link(k + ':sw', ccw)], groups: [choice(k + ':sw', 'Special weapon', specials)] });
      const hwt = model(k, 'Heavy Weapon Team', { max: 1, groups: [choice(k + ':hwt', 'Heavy weapon', [autocannon, lascannon, missile])] });
      const guard = model(k, 'Guardsman', { min: 9, max: 9, gear: [link(k + ':g', lasgun), link(k + ':g', ccw)] });
      shrinkFor(guard, [[sw, 1], [hwt, 2]]);
      unit('Imperial Guard Squad', 75, {
        categoryLinks: catLinks(k, ['Infantry', 'Battleline', 'Regiment', 'Imperial Guard Squad', 'Faction: Astra Militarum', 'Imperium'], 'Battleline'),
        infoLinks: ruleLinks(k, ['Voice Of Command']),
        profiles: [
          unitProfile('Guardsman', ['6"', 3, '5+', 1, '7+', 2]),
          ability(k, 'Hold the Line', 'At the end of your Command phase, if this unit is within range of an objective marker you control, that objective marker remains under your control, even if you have no models within range of it, until your opponent controls it at the start or end of any turn.'),
          ability(k, 'Heavy Weapon Team', 'A Heavy Weapon Team takes the place of two Guardsmen.'),
        ],
        selectionEntries: [sgt, guard, sw, hwt],
      });
    }

    // =========================================================
    // Imperial Guard Heavy Weapon Squad
    // =========================================================
    {
      const k = 'ighws';
      const heavy = [
        W('Heavy bolter', ['36"', 3, '4+', 5, -1, 2]),
        W('Mortar', ['48"', 'D6', '4+', 5, 0, 1]),
        missile, lascannon, autocannon,
      ];
      const teams = heavy.map(h => model(k, `Heavy Weapon Team w/ ${h.name}`, { max: 3, gear: [link(k + h.name, laspistol), link(k + h.name, W('Weapons team close combat weapons', ['Melee', 2, '4+', 3, 0, 1])), link(k + h.name, h)] }));
      unit('Imperial Guard Heavy Weapon Squad', 65, {
        categoryLinks: catLinks(k, ['Infantry', 'Regiment', 'Imperial Guard Heavy Weapon Squad', 'Faction: Astra Militarum', 'Imperium'], 'Infantry'),
        infoLinks: ruleLinks(k, ['Voice Of Command']),
        profiles: [
          unitProfile('Heavy Weapon Team', ['6"', 3, '5+', 2, '7+', 1]),
          ability(k, 'Covering Fire', 'Each time you target this unit with the Fire Overwatch Stratagem, while resolving that Stratagem, hits are scored on unmodified Hit rolls of 5+, or on unmodified Hit rolls of 4+ instead if this unit is within 6" of one or more friendly **^^Regiment^^** units.'),
          ability(k, 'Unit Composition', '6 models forming 3 Heavy Weapon Teams (2 models per team). Each team is equipped with one of: Heavy Bolter, Mortar, Missile Launcher, Lascannon, or Autocannon (mix-and-match freely).'),
        ],
        selectionEntryGroups: [group(k, '3 Heavy Weapon Teams', teams, { min: 3, max: 3, def: teams[0] })],
      });
    }

    // =========================================================
    // Imperial Guard Special Weapon Squad
    // =========================================================
    {
      const k = 'igsws';
      const sgt = model(k, 'Sergeant', { min: 1, max: 1, gear: [link(k + ':sgt', laspistol), link(k + ':sgt', sgtChainsword)] });
      const troopers = specials.map(s => model(k, `Special Weapons Guardsman w/ ${s.name}`, { max: 4, gear: [link(k + s.name, s)] }));
      unit('Imperial Guard Special Weapon Squad', 70, {
        categoryLinks: catLinks(k, ['Infantry', 'Regiment', 'Imperial Guard Special Weapon Squad', 'Faction: Astra Militarum', 'Imperium'], 'Infantry'),
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
        categoryLinks: catLinks(k, ['Mounted', 'Regiment', 'Grenades', 'Imperial Guard Rough Riders', 'Faction: Astra Militarum', 'Imperium'], 'Mounted'),
        infoLinks: ruleLinks(k, ['Voice Of Command', 'Scouts', 'Lance', 'Devastating Wounds']),
        profiles: [
          unitProfile('Rough Rider', ['12"', 4, '5+', 2, '7+', 2]),
          ability(k, 'Cavalry Charge', 'Each time this unit ends a Charge move, until the end of the turn, Hunting Lance attacks made by models in this unit have the **[LANCE]** and **[DEVASTATING WOUNDS]** abilities. This unit\'s Hunting Lances are used up after this combat — for the rest of the battle, replace the Hunting Lance profile with the Cavalry Sabre profile.'),
          ability(k, 'Outriders', 'This unit has the Scouts 8" ability.'),
          ability(k, 'Crushing Pursuit', 'Each time this unit declares a charge against a unit with 5 or more models, you can re-roll the Charge roll.'),
        ],
        selectionEntries: [sgt, rider],
      });
    }

    // =========================================================
    // Detachment: Mechanised Strike Force
    // =========================================================
    const detId = b.id('det:msf');
    const detachment = {
      name: 'Mechanised Strike Force [NFLB]', id: detId, hidden: false, import: true, type: 'upgrade',
      constraints: cons('det:msf', null, 1),
      costs: [{ name: 'pts', typeId: b.PTS, value: 0 }, { name: 'Detachment Points', typeId: b.DP, value: 1 }],
      rules: [
        { name: 'Mechanised Doctrine', id: b.id('det:msf:rule'), hidden: false, description:
          'While a friendly **^^Astra Militarum Infantry^^** unit is embarked in a friendly **^^Astra Militarum Transport^^**, that unit adds 1 to its Objective Control characteristic (modifying the Transport\'s OC for purposes of objective contests).\n\nEach time a friendly **^^Astra Militarum Infantry^^** unit disembarks from a Transport during your turn, until the end of that turn, ranged attacks made by models in that unit with the **[HEAVY]** ability are made at the firing model\'s full Ballistic Skill (the unit ignores the standard penalty for moving when firing Heavy weapons that turn).\n\nForce Disposition: Sweep and Clear.' },
        ...[
          ['Mechanised Spearhead (1CP)', 'Strategic Ploy. **When:** Pre-game, after both armies have deployed but before the first turn begins. Use once per battle. **Target:** One friendly **^^Astra Militarum Transport^^** unit and its embarked unit. **Effect:** Redeploy that Transport (and its embarked unit) anywhere on the battlefield wholly within 18" of any battlefield edge and more than 9" from any enemy unit.'],
          ['Open Hatches! (1CP)', 'Battle Tactic. **When:** Your Shooting phase, just after a friendly Transport\'s embarked unit is selected to shoot using Firing Deck. **Target:** That embarked unit. **Effect:** Until the end of the phase, increase the Transport\'s Firing Deck characteristic by 2. The embarked unit may also re-roll Wound rolls of 1 from these Firing Deck attacks.'],
          ['Treads Forward! (1CP)', 'Strategic Ploy. **When:** Your Movement phase, just before a friendly **^^Astra Militarum Transport^^** is selected to move. **Target:** That Transport. **Effect:** Add 3" to that Transport\'s Move characteristic until the end of the phase. In addition, if the Transport Advances this Movement phase, models embarked in it may still disembark this turn.'],
          ['Disembark and Fire! (1CP)', 'Battle Tactic. **When:** Your Shooting phase, after a friendly **^^Astra Militarum Infantry^^** unit that disembarked this turn is selected to shoot. **Target:** That unit. **Effect:** Until the end of the phase, that unit\'s ranged attacks with the **[HEAVY]** ability gain the **[SUSTAINED HITS 1]** ability.'],
          ['Hull-down Defense (1CP)', 'Strategic Ploy. **When:** Start of your opponent\'s Shooting phase, just after a friendly **^^Astra Militarum Transport^^** has been selected as the target of one or more attacks. **Target:** That Transport. **Effect:** Until the end of the phase, ranged attacks targeting that Transport are subject to -1 to the Wound roll, and the Transport has the Feel No Pain 5+ ability.'],
          ['Smokescreen Surge (1CP)', 'Strategic Ploy. **When:** End of your Movement phase. **Target:** All friendly **^^Astra Militarum Transports^^** on the battlefield. **Effect:** Until the start of your next turn, those Transports gain the Stealth ability and the Benefit of Cover. Cannot be used by a Transport that Advanced this turn.'],
        ].map(([n, t]) => ({ name: `Stratagem: ${n}`, id: b.id(`det:msf:strat:${n}`), hidden: false, description: t })),
      ],
    };
    const enh = (name, text) => ({
      name, id: b.id(`enh:${name}`), hidden: false, import: true, type: 'upgrade',
      constraints: [...cons(`enh:${name}`, null, 1), ...cons(`enh:${name}:roster`, null, 1, 'roster')],
      costs: [{ name: 'pts', typeId: b.PTS, value: 0 }, { name: 'Enhancements', typeId: b.ENH, value: 1 }],
      modifiers: [{ field: 'hidden', type: 'set', value: true, conditions: [{ childId: b.category('Officer').id, field: 'selections', scope: 'ancestor', shared: true, type: 'notInstanceOf', value: 1 }] }],
      profiles: [ability('enh', name, `**^^Astra Militarum Officer^^** model only. ${text}`)],
    });
    const enhGroup = {
      name: 'Mechanised Strike Force Enhancements [NFLB]', id: b.id('det:msf:enh'), hidden: false,
      constraints: cons('det:msf:enh', null, 1),
      modifiers: [{ field: 'hidden', type: 'set', value: true, conditions: [{ childId: detId, field: 'selections', includeChildForces: true, includeChildSelections: true, scope: 'roster', shared: true, type: 'lessThan', value: 1 }] }],
      selectionEntries: [
        enh('Track Commander', 'While the bearer is embarked in a Transport, that Transport\'s ranged weapons are made at BS 3+ (instead of BS 4+), and the Transport\'s unit can re-roll Hit rolls of 1 against the closest visible enemy unit.'),
        enh('Veteran Crewman', 'While the bearer is embarked in a Transport, that Transport adds 1" to its Move characteristic, and the first failed save (other than against a Mortal Wound) the Transport makes each battle round is automatically passed instead.'),
        enh('Master Vox (Enhancement)', 'The bearer can issue Orders to any friendly **^^Astra Militarum^^** unit on the battlefield (instead of being limited to range or the normal Order-target restrictions). In addition, the bearer issues 1 additional Order per Command phase.'),
        enh('Iron-hardened Hull', 'While the bearer is embarked in a Transport, that Transport\'s Toughness characteristic is increased by 1, and the Transport has a 5+ Feel No Pain against Mortal Wounds.'),
      ],
    };

    return {
      rootUnits: units,
      sharedSelectionEntries: [detachment],
      sharedSelectionEntryGroups: [enhGroup],
      // Links added into upstream groups so the detachment/enhancements appear in the normal pickers
      injections: [
        { file: 'Imperium - Astra Militarum - Library.json', groupName: 'Detachment', entryLink: { name: detachment.name, id: b.id('inj:det'), hidden: false, import: true, targetId: detId, type: 'selectionEntry' } },
        { file: 'Imperium - Astra Militarum - Library.json', groupName: 'Enhancements', entryLink: { name: enhGroup.name, id: b.id('inj:enh'), hidden: false, import: true, targetId: enhGroup.id, type: 'selectionEntryGroup' } },
      ],
    };
  },
};
