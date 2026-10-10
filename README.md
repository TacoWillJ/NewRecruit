# Warhammer 40,000 11th Edition [NFLB]

[BSData/wh40k-11e](https://github.com/BSData/wh40k-11e) plus the **No Figure Left Behind** homebrew, for [New Recruit](https://www.newrecruit.eu/).

## Use it in New Recruit

Add `https://github.com/TacoWillJ/NewRecruit` as a data source and pick **Warhammer 40,000 11th Edition [NFLB]**. NFLB units show up in their normal faction lists with `[NFLB]` after the name, the same way Legends units carry `[Legends]`.

## What's NFLB in here

| Faction | Units | Detachments |
|---|---|---|
| Astra Militarum | Captain Al'Rahem, Captain Chenkov, Colonel Schaeffer, Colour Sergeant Kell (Support), Commissar Severina Raine, Mogul Kamir, Sergeant Bastonne, Imperial Guard Command Squad / Squad / Heavy Weapon Squad / Special Weapon Squad / Rough Riders, Penal Legion Squad, Last Chancers, Wyrdvane Psykers; Knight Commander Pask as a +45 pt upgrade on any Leman Russ; Kill Team kits: Ratling Kill Team (Ratlings + Ogryn + Bullgryn) and Bruiser / Confidant / Zealot / Sapper / Spotter options on the official Death Korps of Krieg | Mechanised Strike Force |
| Orks | 24 units dropped in the Sept 2026 codex: 15 Legendary Proxies (Speed Freeks buggies, Wurrboy, Big Gunz, Nobz on Warbikes, Attack Fighta, Fighta-Bommer, Meka-Dread, Mega Dread, Kannonwagon, Squiggoth, Big Mek with Kustom Force Field, Ufthak Blackhawk) + 9 homebrew (Skorchas, Deffkoptas with Big Shootas, Da Red Gobbo, Grot Bomm Launcha, Kill Krusha, 'Chinork' Warkopta, Painboy/Big Mek on Warbike, Deff Rolla Battle Fortress) + NFLB-L Big Trakk, Kill Tank; Kill Team kits: Wrecka Krew (mixed Breaka Boyz + Tankbustas) and Snipa / Slasha / Comms Boy options on the official Kommandos | — |
| Adepta Sororitas | Arch-Confessor Kyrinov, Saint Praxedes, Uriah Jacobus; Kill Team kit: Condemnor / Dialogus / Duellist / Exactor / Hospitaller / Penitent / Preceptor / Pronatus options on the official Sisters Novitiate Squad | — |
| Drukhari | Asdrubael Vect, Vect on the Dais of Destruction, Baron Sathonyx, Duke Sliscus the Serpent, Kheradruakh the Decapitator | — |
| T'au Empire | The Eight (Commanders Arra'kon, Bravestorm, Brightsword, Ob'lotai 9-0, O'Vesa, Sha'vastos, Torchstar — Farsight himself is official), Dahyak Grekh | — |
| Chaos Space Marines | NFLB-L Gellerpox Infected (adds Vulgrar Thrice-cursed + Mutoid Vermin / Glitchlings); Kill Team kit: Blooded operatives (Traitor Ogryn, Brimstone Grenadier, Trench Sweeper, Flenser, Butcher, Thug, Enforcer, Corpseman, Commsman) as options on the official Traitor Guardsmen Squad | — |
| Death Guard | NFLB-L Gellerpox Infected | — |
| Leagues of Votann | Kill Team kit: Hearthkyn Salvagers (Dôzr, Field Medic, Grenadier, Jump Pack Warrior, Kinlynk, Kognitâar, Locâtr, Lugger) as options on the official Hearthkyn Warriors | — |
| Adeptus Mechanicus | 35 Horus Heresy Mechanicum units (incl. Dark Mechanicum: Anacharis Scoria, Archmagos Draykavac) — only selectable with one of the two NFLB Mechanicum detachments; Heterodox-locked units only with Dark Mechanicum. Plus Legio Cybernetica battle robots (Cataphract, Colossus, Conqueror, Crusader), always available. Official Legends Decimator, Blood Slaughterer, Greater Brass Scorpion, Kytan Ravager and Tarantula Sentry Battery linked in from the Heresy Legends library; Kill Team kit: Auto-proxy / Breacher / Technomedic Servitor options on the official Servitor Battleclade | Taghmata Omnissiah, Dark Mechanicum |

**[NFLB-L]** units are rebalanced copies of official **[Legends]** datasheets that fell out of step with their 11th edition codex (currently Orks: Big Trakk, Kill Tank; Chaos Space Marines / Death Guard: Gellerpox Infected). They replace the official Legends entries on purpose.

**Kill Team kits:** models from Kill Team boxes with no 40k rules are added as options inside GW's own datasheets (copies of an official model, so they keep its statline), or as a mixed unit priced from the official units it combines.

**Points:** NFLB units anchored to an official unit (e.g. Legendary Proxies) take that unit's *current* points plus a fixed offset on every sync, so they follow each Munitorum Field Manual.

## How the repo is put together

- **Root `*.json` (except `NFLB - *`)**: an untouched copy of BSData's 11e files. Every sync overwrites them. Don't edit them by hand.
- **`nflb-src/*.js`**: the homebrew source, one file per faction.
- **`NFLB - <Faction>.json`**: generated from `nflb-src`. Each one is a library catalogue linked into its faction, so its units load automatically. Factions with no separate library in BSData (e.g. Orks) are merged straight into the faction file instead (`inline: true`).
- **`tools/sync-upstream.js`**: pulls the latest BSData, rebuilds the NFLB catalogues against it and re-links them. Then it checks every reference.
- **`tools/upstream.json`**: which BSData commit we're on.

```
node tools/sync-upstream.js          # update to latest BSData + rebuild NFLB
node tools/sync-upstream.js --check  # rebuild NFLB only (after editing nflb-src)
```

New Recruit reads the latest **GitHub release**, so publish a new release after every push, then delete and re-add the game in the app. Every official file the sync edits gets revision `upstream × 1000 + patch`, so New Recruit loads our copy instead of a cached official one.

Where NFLB weapons have the same stats as an official weapon, they link to the official entry, so they pick up GW/BSData changes automatically. Weapons that only exist in NFLB are defined in the NFLB catalogue.

The old 10th edition version of this repo is in git history (last 10e commit: `712a04d`).
