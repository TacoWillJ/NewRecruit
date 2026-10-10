// NFLB overlay for Imperium - Adepta Sororitas: Arch-Confessor Kyrinov, Saint Praxedes,
// Uriah Jacobus. Source: Primarch Project\Workspace\homebrew_cp_11e\source\_reference-*.html,
// parsed by Workspace\export_ref_cards_json.js into data/sororitas-cards.json.
// 11e fixes (2026-10-10): official Acts of Faith army rule; "Hymn rolls" dropped (Hymns of
// Battle is Crusade-only in 11e); Martyrdom's impossible "WS 1+" now +1 to Hit; Heroic
// Intervention (not an 11e action) removed from Kyrinov's Zealot.

const cards = require('./data/sororitas-cards.json');
const { unitsFromCards, resolveLeaders } = require('../tools/nflb-cards');

module.exports = {
  faction: 'Imperium - Adepta Sororitas.json',
  factionLibrary: 'Imperium - Adepta Sororitas.json',
  inline: true,

  build(b) {
    const units = unitsFromCards(b, cards, {
      prefix: 'sororitas',
      armyRules: ['Acts of Faith'],
      skipAbility: /^Faction$/i,
      keywords: () => ({ kws: [], faction: ['Faction: Adepta Sororitas', 'Imperium'] }),
      overrides: {
        'arch-confessor-kyrinov': {
          Zealot: 'Each time this model or a model in its unit makes a melee attack, if that unit made a Charge move this turn or was charged this turn, you can re-roll a Hit roll of 1.',
        },
        'saint-praxedes': {
          'Saint of Ophelia VII [AURA]': 'While a friendly **^^Adepta Sororitas^^** unit is within 6" of this model, you can re-roll Battle-shock tests taken for that unit, and models in that unit have the Feel No Pain 6+ ability.',
          'Martyrdom of the Mace': 'Each time this model is selected to fight, you can declare a Martyrdom. If you do, until the end of the phase, add 1 to the Hit roll for attacks made with the Mace of Saint Praxedes, and that weapon has the **[SUSTAINED HITS 2]** ability. At the end of the phase, this model loses D3 wounds (this cannot be reduced or prevented).',
          'Halo of the Emperor': 'Each time this model is selected as the target of an attack made with a **[PSYCHIC]** weapon, roll one D6: on a 4+, that attack has no effect. In addition, each time an enemy unit within 12" of this model takes a Battle-shock test, subtract 1 from that test.',
        },
      },
    });
    resolveLeaders(b, units);
    return { rootUnits: units };
  },
};
