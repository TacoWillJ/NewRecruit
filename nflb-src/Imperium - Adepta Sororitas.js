// NFLB overlay for Imperium - Adepta Sororitas: Arch-Confessor Kyrinov, Saint Praxedes,
// Uriah Jacobus. Source: Primarch Project\Workspace\homebrew_cp_11e\source\_reference-*.html,
// parsed by Workspace\export_ref_cards_json.js into data/sororitas-cards.json.
// 11e fixes (2026-10-10): official Acts of Faith army rule; "Hymn rolls" dropped (Hymns of
// Battle is Crusade-only in 11e); Martyrdom's impossible "WS 1+" now +1 to Hit; Heroic
// Intervention (not an 11e action) removed from Kyrinov's Zealot.

const cards = require('./data/sororitas-cards.json');
const { unitsFromCards, resolveLeaders } = require('../tools/nflb-cards');
const kt = require('../tools/nflb-kt');

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

    // ---------- Kill Team kits brought into 40k (user decision 2026-10-10) ----------
    // Novitiates (KT 2024): copies of GW's own Novitiate model (official statline) inside the official
    // Sisters Novitiate Squad, each with its operative's signature weapon. The Purgatus and the
    // Reliquarius are already covered by GW's "Novitiate with Ministorum Flamer" / "with Sacred Banner".
    const { weapon: W, ability } = b;
    const squad = b.lib.sharedSelectionEntries.find(e => e.name === 'Sisters Novitiate Squad');
    const base = squad && kt.findModel(squad, 'Novitiate with Ministorum Flamer');
    if (!base) throw new Error('Sisters Novitiate Squad > Novitiate with Ministorum Flamer not found upstream');
    const nov = kt.specialists(b, base, 'novitiates');
    const KEEP = ['Close combat weapon', 'Autopistol'];
    const novitiates = [
      nov('Novitiate Condemnor', { keep: ['Autopistol'], weapons: [W('Condemnor stake crossbow', ['24"', 1, '3+', 4, -1, 2], { keywords: 'Anti-Psyker 2+, Precision' }), W('Null rod', ['Melee', 2, '3+', 4, -1, 1])] }),
      nov('Novitiate Dialogus', { keep: ['Autopistol'], weapons: [W('Dialogus stave', ['Melee', 2, '3+', 4, 0, 1])],
        abilities: [ability('kt:nov:dialogus', 'Stirring Rhetoric', 'While this model is in this unit, you can re-roll Battle-shock tests taken for this unit.')] }),
      nov('Novitiate Duellist', { keep: ['Autopistol'], weapons: [W('Duelling blades', ['Melee', 3, '3+', 3, -1, 1], { keywords: 'Precision' })] }),
      nov('Novitiate Exactor', { weapons: [W('Neural whips', ['Melee', 3, '3+', 3, -1, 1], { keywords: 'Lethal Hits' })] }),
      nov('Novitiate Hospitaller', { keep: ['Autopistol'], weapons: [W('Surgical saw', ['Melee', 2, '3+', 3, -1, 1])],
        abilities: [ability('kt:nov:hospitaller', "Chirurgeon's Tools", 'While this model is in this unit, models in this unit have the Feel No Pain 6+ ability.')] }),
      nov('Novitiate Penitent', { weapons: [W('Penitent eviscerator', ['Melee', 3, '4+', 6, -2, 2])] }),
      nov('Novitiate Preceptor', { keep: ['Autopistol'], weapons: [W('Mace of the Righteous', ['Melee', 3, '3+', 5, -1, 2])] }),
      nov('Novitiate Pronatus', { keep: KEEP,
        abilities: [ability('kt:nov:pronatus', 'Relic Seeker', 'While this model is within range of an objective marker, it has an Objective Control characteristic of 3.')] }),
    ];

    return { rootUnits: units, injections: novitiates.map(m => ({ file: 'Imperium - Adepta Sororitas.json', entryName: 'Sisters Novitiate Squad', within: 'Novitiates', selectionEntry: m })) };
  },
};
