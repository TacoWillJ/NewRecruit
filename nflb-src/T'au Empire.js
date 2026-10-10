// NFLB overlay for T'au Empire: seven of The Eight (Arra'kon, Bravestorm, Brightsword,
// Ob'lotai 9-0, O'Vesa, Sha'vastos, Torchstar) + Dahyak Grekh. Commander Farsight is official
// in 11e, so our card was retired. Source: Primarch Project\Workspace\homebrew_cp_11e\source\
// _reference-*.html, parsed into data/tau-cards.json.
// 11e fixes (2026-10-10): official For The Greater Good army rule; Markerlight tokens (9e) ->
// 11e Spotted / Observer / Markerlight keyword; Ob'lotai's Heavy "penalty" (11e Heavy has
// none) removed; duplicate Lone Operative text dropped.

const cards = require('./data/tau-cards.json');
const { unitsFromCards, resolveLeaders } = require('../tools/nflb-cards');

module.exports = {
  faction: "T'au Empire.json",
  factionLibrary: "T'au Empire.json",
  inline: true,

  build(b) {
    const units = unitsFromCards(b, cards, {
      prefix: 'tau',
      armyRules: ['For The Greater Good'],
      keywords: c => ({
        kws: [...(/The Eight/.test(c.factionLine) ? ['The Eight'] : []), ...(/Farsight Enclaves/.test(c.factionLine) ? ['Farsight Enclaves'] : [])],
        faction: ["Faction: T'au Empire"],
      }),
      overrides: {
        'commander-arrakon': {
          'Coordinated Fire Strategist': 'At the start of your Shooting phase, select one friendly **^^T\'au Empire^^** unit within 9" of this model. Until the end of the phase, each time a model in that unit makes a ranged attack, you can re-roll a Hit roll of 1; if that attack targets a Spotted unit, you can also re-roll a Wound roll of 1.',
        },
        'commander-oblotai': {
          'Static Gun Platform': 'If this model Remained Stationary in your previous Movement phase, until the start of your next turn, each time this model makes a ranged attack, add 1 to the Hit roll.',
          'Sentinel Protocol [AURA]': 'While a friendly **^^The Eight^^** model is within 9" of this model, each time that model makes a ranged attack, you can re-roll a Hit roll of 1.',
        },
        'commander-shavastos': {
          'Drone Master': 'This model is accompanied by 2 Marker Drones: this model\'s unit has the **^^Markerlight^^** keyword and can act as an Observer unit even if it Advanced this turn.',
          'Wisdom of Years': 'This model and any unit it is leading automatically pass Battle-shock tests. While this model is leading a unit, each time a model in that unit makes a ranged attack that targets a Spotted unit, add 1 to the Hit roll.',
        },
        'commander-torchstar': { 'Lone Operative': null },
        'dahyak-grekh': {
          'Hunter of Pheromones': 'Each time an enemy unit ends a Normal, Advance or Fall Back move within 12" of this model, until the start of your next turn, that enemy unit cannot have the Benefit of Cover or the Stealth ability against attacks made by this model.',
        },
      },
    });
    resolveLeaders(b, units);
    return { rootUnits: units };
  },
};
