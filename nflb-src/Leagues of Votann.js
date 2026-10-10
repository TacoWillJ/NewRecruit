// NFLB overlay for Leagues of Votann. Kill Team kits brought into 40k (user decision 2026-10-10):
// Hearthkyn Salvagers (KT 2024) operatives with no 40k option, as copies of GW's own Hearthkyn
// Warrior model (official statline, autoch-pattern bolt pistol) inside the official Hearthkyn
// Warriors datasheet. Votann have no separate library catalogue, so this is merged inline.

const kt = require('../tools/nflb-kt');

module.exports = {
  faction: 'Leagues of Votann.json',
  factionLibrary: 'Leagues of Votann.json',
  inline: true,

  build(b) {
    const { weapon: W, ability } = b;
    const unit = b.lib.sharedSelectionEntries.find(e => e.name === 'Hearthkyn Warriors');
    const base = unit && kt.findModel(unit, 'Hearthkyn Warrior w/ bolter');
    if (!base) throw new Error('Hearthkyn Warriors > Hearthkyn Warrior w/ bolter not found upstream');
    const kyn = kt.specialists(b, base, 'hearthkyn');
    const PISTOL = 'Autoch-pattern bolt pistol';
    const models = [
      kyn('Hearthkyn Dôzr', { keep: [PISTOL], weapons: [W('Concussion knux', ['Melee', 3, '4+', 5, -1, 1], { keywords: 'Lethal Hits' })] }),
      kyn('Hearthkyn Field Medic', { keep: [PISTOL], weapons: [W('Plasma knife', ['Melee', 2, '4+', 4, -2, 1])],
        abilities: [ability('kt:kyn:medic', 'Medic!', 'While this model is in this unit, models in this unit have the Feel No Pain 6+ ability.')] }),
      kyn('Hearthkyn Grenadier', { keep: [PISTOL, 'Close combat weapon'], weapons: [W('C8 HX charge', ['6"', 1, '4+', 8, -2, 3], { keywords: 'Blast, One Shot' })] }),
      kyn('Hearthkyn Jump Pack Warrior', { keep: [PISTOL, 'Close combat weapon', 'Autoch-pattern bolter'],
        abilities: [ability('kt:kyn:jump', 'Jump Pack', 'This model counts as a Hearthkyn Warrior with an autoch-pattern bolter (its jump pack has no additional rules in this unit).')] }),
      kyn('Hearthkyn Kinlynk', { keep: [PISTOL, 'Close combat weapon'],
        abilities: [ability('kt:kyn:kinlynk', 'Signal', "Each time you target this model's unit with a Stratagem, roll one D6: on a 5+, you gain 1CP.")] }),
      kyn('Hearthkyn Kognitâar', { keep: [PISTOL, 'Close combat weapon'],
        abilities: [ability('kt:kyn:kognitaar', 'Tactician', "Once per battle, in your Command phase, if this model is on the battlefield, select one enemy unit visible to this model's unit. That enemy unit gains 1 Judgement token.")] }),
      kyn('Hearthkyn Locâtr', { keep: [PISTOL, 'Close combat weapon'],
        abilities: [ability('kt:kyn:locatr', 'Spot', "Once per battle, when this model's unit is selected to shoot, until the end of the phase, each time a model in this unit makes a ranged attack, you can re-roll a Hit roll of 1.")] }),
      kyn('Hearthkyn Lugger', { keep: [PISTOL, 'Close combat weapon', 'Autoch-pattern bolter'],
        abilities: [ability('kt:kyn:lugger', 'Well Supplied', "Once per battle, when you target this model's unit with a Stratagem, reduce the CP cost of that use of that Stratagem by 1CP.")] }),
    ];
    return {
      rootUnits: [],
      injections: models.map(m => ({ file: 'Leagues of Votann.json', entryName: 'Hearthkyn Warriors', within: 'Hearthkyn Warriors', selectionEntry: m })),
    };
  },
};
