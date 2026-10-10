# Warhammer 40,000 11th Edition [NFLB]

[BSData/wh40k-11e](https://github.com/BSData/wh40k-11e) plus the **No Figure Left Behind** homebrew, for [New Recruit](https://www.newrecruit.eu/).

## Use it in New Recruit

Add `https://github.com/TacoWillJ/NewRecruit` as a data source and pick **Warhammer 40,000 11th Edition [NFLB]**. NFLB units show up in their normal faction lists with `[NFLB]` after the name, the same way Legends units carry `[Legends]`.

## What's NFLB in here

| Faction | Units | Detachments |
|---|---|---|
| Astra Militarum | Captain Al'Rahem, Imperial Guard Command Squad, Imperial Guard Squad, Imperial Guard Heavy Weapon Squad, Imperial Guard Special Weapon Squad, Imperial Guard Rough Riders | Mechanised Strike Force |

## How the repo is put together

- **Root `*.json` (except `NFLB - *`)**: an untouched copy of BSData's 11e files. Every sync overwrites them. Don't edit them by hand.
- **`nflb-src/*.js`**: the homebrew source, one file per faction.
- **`NFLB - <Faction>.json`**: generated from `nflb-src`. Each one is a library catalogue linked into its faction, so its units load automatically.
- **`tools/sync-upstream.js`**: pulls the latest BSData, rebuilds the NFLB catalogues against it and re-links them. Then it checks every reference.
- **`tools/upstream.json`**: which BSData commit we're on.

```
node tools/sync-upstream.js          # update to latest BSData + rebuild NFLB
node tools/sync-upstream.js --check  # rebuild NFLB only (after editing nflb-src)
```

Where NFLB weapons have the same stats as an official weapon, they link to the official entry, so they pick up GW/BSData changes automatically. Weapons that only exist in NFLB are defined in the NFLB catalogue.

The old 10th edition version of this repo is in git history (last 10e commit: `712a04d`).
