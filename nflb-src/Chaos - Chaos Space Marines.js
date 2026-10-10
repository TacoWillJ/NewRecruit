// NFLB overlay for Chaos - Chaos Space Marines. Kill Team kits brought into 40k (user decision 2026-10-10):
// - Blooded (KT 2024): operatives with no 40k option, as copies of GW's own Traitor Guardsman model
//   (official statline) inside the official Traitor Guardsmen Squad, taking a Guardsman's place.
// - Gellerpox Infected [NFLB-L] (see tools/nflb-gellerpox.js).
// CSM have no separate library catalogue, so this is merged inline.

const kt = require('../tools/nflb-kt');
const gellerpox = require('../tools/nflb-gellerpox');

module.exports = {
  faction: 'Chaos - Chaos Space Marines.json',
  factionLibrary: 'Chaos - Chaos Space Marines.json',
  inline: true,

  build(b) {
    const { weapon: W, ability, unitProfile } = b;
    const F = 'Chaos - Chaos Space Marines.json';
    const squad = b.lib.sharedSelectionEntries.find(e => e.name === 'Traitor Guardsmen Squad');
    const base = squad && kt.findModel(squad, 'Guardsman w/ lasgun');
    if (!base) throw new Error('Traitor Guardsmen Squad > Guardsman w/ lasgun not found upstream');
    const traitor = kt.specialists(b, base, 'blooded');
    const CCW = 'Close combat weapon';
    const blooded = [
      // an Ogryn is priced as one third of the Astra Militarum Ogryn Squad (3 for 60)
      traitor('Traitor Ogryn', { pts: 20, profiles: [unitProfile('Traitor Ogryn', ['6"', 6, '5+', 3, '7+', 1])],
        weapons: [W('Power maul and mutant claw', ['Melee', 4, '3+', 6, -1, 2])],
        abilities: [ability('kt:blooded:ogryn', 'Avalanche of Muscle', 'Each time this unit ends a Charge move, if this model is in it, select one enemy unit within Engagement Range of it and roll one D6: on a 4+, that unit suffers D3 mortal wounds.')] }),
      traitor('Traitor Brimstone Grenadier', { keep: [CCW], weapons: [W('Diabolyk bomb', ['6"', 'D6', '4+', 6, -1, 1], { keywords: 'Blast, Hazardous, One Shot' })] }),
      traitor('Traitor Trench Sweeper', { weapons: [W('Shotgun', ['12"', 2, '4+', 4, 0, 1], { keywords: 'Assault' }), W('Bayonet and shield', ['Melee', 2, '4+', 3, 0, 1])],
        abilities: [ability('kt:blooded:sweeper', 'Shielding', 'This model has a Save characteristic of 4+.')] }),
      traitor('Traitor Flenser', { weapons: [W('Skinning blades', ['Melee', 3, '3+', 3, -1, 1])] }),
      traitor('Traitor Butcher', { weapons: [W('Power weapon and cleaver', ['Melee', 3, '3+', 4, -2, 1])] }),
      traitor('Traitor Thug', { weapons: [W('Heavy club', ['Melee', 3, '4+', 5, 0, 1])] }),
      traitor('Traitor Enforcer', { weapons: [W('Bolt pistol', ['12"', 1, '4+', 4, 0, 1], { keywords: 'Pistol' }), W('Power fist', ['Melee', 2, '4+', 8, -2, 2])],
        abilities: [ability('kt:blooded:enforcer', 'Gruelling Disciplinarian', 'While this model is in this unit, you can re-roll Battle-shock tests taken for this unit.')] }),
      traitor('Traitor Corpseman', { keep: ['Lasgun'], weapons: [W('Stimm needle', ['Melee', 1, '4+', 2, 0, 1], { keywords: 'Anti-Infantry 4+' })],
        abilities: [ability('kt:blooded:corpseman', 'STIMMs', 'While this model is in this unit, models in this unit have the Feel No Pain 6+ ability.')] }),
      traitor('Traitor Commsman', { keep: ['Lasgun', CCW],
        abilities: [ability('kt:blooded:commsman', 'Signal', "Each time you target this model's unit with a Stratagem, roll one D6: on a 5+, you gain 1CP.")] }),
    ];
    const g = gellerpox(b, F);
    return {
      rootUnits: [g.unit],
      injections: [
        ...blooded.map(m => ({ file: F, entryName: 'Traitor Guardsmen Squad', within: '9 Traitor Guardsmen', selectionEntry: m })),
        g.hideOfficial,
      ],
    };
  },
};
