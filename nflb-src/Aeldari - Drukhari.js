// NFLB overlay for Aeldari - Drukhari: Asdrubael Vect, Vect on the Dais of Destruction,
// Baron Sathonyx, Duke Sliscus, Kheradruakh. Source: Primarch Project\Workspace\
// homebrew_cp_11e\source\_reference-*.html, parsed into data/drukhari-cards.json.
// 11e fixes (2026-10-10): official Power from Pain army rule; official Shadow Field wording;
// personal Combat Drug abilities reworded around the 11e Combat Drugs list; "Deny the Witch"
// (not in 11e) replaced; the Dais uses Firing Deck like the official Raider.

const cards = require('./data/drukhari-cards.json');
const { unitsFromCards, resolveLeaders } = require('../tools/nflb-cards');

const shadowField = sv => `This model has a ${sv} invulnerable save. You cannot re-roll invulnerable saving throws made for this model. The first time an invulnerable saving throw made for this model is failed, until the end of the battle, this model has no invulnerable save.`;

module.exports = {
  faction: 'Aeldari - Drukhari.json',
  factionLibrary: 'Aeldari - Aeldari Library.json',
  inline: true,

  build(b) {
    const units = unitsFromCards(b, cards, {
      prefix: 'drukhari',
      armyRules: ['Power from Pain'],
      keywords: () => ({ kws: ['Aeldari'], faction: ['Faction: Drukhari'] }),
      extraRules: { 'vect-on-dais': ['Firing Deck 10'] },
      overrides: {
        'asdrubael-vect': {
          'Shadow Field': shadowField('3+'),
          'Master of Combat Drugs': 'While this model is leading a unit, in your Command phase, select one Combat Drug from the Combat Drugs list. Until the start of your next Command phase, that Combat Drug is active for this model\'s unit (in addition to any active for your army), and each time a model in that unit makes an attack, add 1 to the Wound roll.',
        },
        'baron-sathonyx': { 'Shadow Field': shadowField('4+') },
        'duke-sliscus': {
          'Shadow Field': shadowField('4+'),
          'Dark Olympiad Master': 'While this model is leading a unit, in your Command phase, select two Combat Drugs from the Combat Drugs list. Until the start of your next Command phase, those Combat Drugs are active for this model\'s unit (in addition to any active for your army).',
          'Pirate Prince [AURA]': 'While a friendly **^^Kabalite Warriors^^** unit is within 6" of this model, models in that unit have the Stealth ability.',
        },
        kheradruakh: {
          'Heart of Living Shadow': 'Each time this model makes a Normal, Advance or Fall Back move, it can move through models and terrain features as if they were not there.',
          'Tide of Shadow [AURA]': 'While a friendly **^^Mandrakes^^** unit is within 6" of this model, models in that unit have the Infiltrators ability, and each time an attack with the **[PSYCHIC]** ability targets that unit, subtract 1 from the Wound roll.',
          'Shadow Cloak': 'This model has a 5+ invulnerable save. Each time a ranged attack targets this model, if the attacking model is more than 12" away, an unmodified Hit roll of 1-3 fails.',
        },
        'vect-on-dais': {
          'Shadow Field': shadowField('4+'),
          'Open-Topped Transport': 'This model has a transport capacity of 10 **^^Drukhari Infantry^^** models (excluding **^^Jump Pack^^** models). Units embarked within it can disembark even if this model Advanced this turn (but cannot declare a charge that turn).',
          'Vect Commands [AURA]': 'While a friendly **^^Drukhari^^** unit is within 9" of this model, each time a model in that unit makes an attack, you can re-roll a Hit roll of 1. Asdrubael Vect and Vect on the Dais of Destruction cannot both be included in the same army.',
        },
      },
    });
    resolveLeaders(b, units);
    // the two Vects are the same character
    const [vect, dais] = ['Asdrubael Vect [NFLB]', 'Vect on the Dais of Destruction [NFLB]'].map(n => units.find(u => u.name === n));
    for (const [u, other] of [[vect, dais], [dais, vect]]) {
      u.modifiers = [...(u.modifiers || []), { field: 'hidden', type: 'set', value: true,
        conditions: [{ childId: other.id, field: 'selections', includeChildSelections: true, includeChildForces: true, scope: 'roster', shared: true, type: 'atLeast', value: 1 }] }];
    }
    return { rootUnits: units };
  },
};
