# No Figure Left Behind — Claude Code README

## Last updated: 30 May 2026

This file is for Claude Code. It contains the current project state,
what was done in the last session, and priority tasks for next session.
For full project context and design conventions read CONTEXT.md first.

-----

## Current state

The NewRecruit repo (`https://github.com/TacoWillJ/NewRecruit`) is working:

- All 46 official BSData faction catalogues are present
- The index.bsi discovery file is in place
- New Recruit iOS can find and load the repo successfully
- The Infantry Platoon [NFLB] entry loads in the AM catalogue BUT is missing
  almost all composition, weapon options, and transport options

-----

## PRIORITY 1 — Rewrite Infantry Platoon [NFLB] to match the PDF spec

The source of truth is the Infantry Platoon v3 PDF, now fully read.
The PDF is at:
`https://tacowillj.github.io/nofigureleftbehind.github.io/pdfs/Infantry Platoon.pdf`

Read the official `Imperium - Astra Militarum.cat` in the NewRecruit repo
to understand how the existing Infantry Squad structures its composition,
weapon selectionEntryGroups and constraints — then use that pattern to
build the Infantry Platoon [NFLB] entry to match the PDF exactly.

### POINTS (corrected from first build)

|Component                                  |Points                  |
|-------------------------------------------|------------------------|
|A1 — PCS Base (4 Veteran Guardsmen)        |25pts                   |
|A2 — Generic Platoon Castellan             |25pts                   |
|A2 — Named AM Officer Character            |character’s own full pts|
|B — Infantry Squad (10 models)             |60pts                   |
|C — Heavy Weapons Squad (6 models, 3 teams)|75pts                   |
|D — Special Weapons Squad (5 models)       |60pts                   |
|E — Chimera Transport (per sub-squad)      |70pts                   |

### COMPOSITION

**A — Platoon Command Section (mandatory, exactly 1)**

A1 — PCS Base: 4 Veteran Guardsmen

- Default: Lasgun, close combat weapon, frag & krak grenades
- Each of the 4 may individually choose (free, no extra cost):
  - Keep default loadout
  - Replace lasgun with special weapon: Flamer, Grenade Launcher,
    Meltagun, Plasma Gun, Sniper Rifle, or Demolition Charge
  - Be designated Specialist: Vox-caster, Medi-pack, Regimental
    Standard, or Master Vox (max 1 of each Specialist type per PCS)

A2 — Officer Attachment (pick exactly 1, mandatory):

- Option 1: Generic Platoon Castellan (25pts)
  - Stats: M6” T3 SV5+ W3 LD6+ OC2
  - Default: Laspistol, chainsword, frag & krak grenades
  - Free wargear swaps: laspistol → bolt pistol or plasma pistol;
    chainsword → power weapon or power fist
  - Issues Orders via Voice of Command
- Option 2: Named AM Officer Character (character’s full pts)
  - Replaces Castellan — do NOT also pay the 25pt Castellan cost
  - Uses own statline, wargear, abilities, and points
  - Eligible: any AM Character with Officer or [Leader] keyword
  - Examples: Captain Al’Rahem, Cadian Castellan, Lord Solar Leontus,
    Ursula Creed, Sergeant Harker, Colour Sergeant Kell

**B — Infantry Squad (2-5 per Platoon, 60pts each)**

- 10 models: 1 Sergeant + 9 Guardsmen
- Sergeant default: Laspistol, chainsword, frag & krak grenades
- Guardsmen default: Lasgun, close combat weapon, frag & krak grenades
- Free wargear options (no extra cost):
  - Sergeant: laspistol → bolt pistol or plasma pistol;
    chainsword → power weapon or power fist
  - Special Weapon — up to 1 per squad: one Guardsman replaces
    lasgun with Flamer, Grenade Launcher, Meltagun, Plasma Gun,
    Sniper Rifle, or Demolition Charge
  - Heavy Weapon Team — up to 1 per squad: two Guardsmen form a
    team (gunner + loader), replace lasguns with one of: Autocannon,
    Heavy Bolter, Lascannon, Missile Launcher, Mortar, Heavy Stubber
  - Specialist — up to 1 per squad: one Guardsman becomes
    Vox-caster (re-roll Order range), Medi-pack bearer (5+ FNP),
    or Regimental Standard bearer (auto-pass Battle-shock for squad
    and other sub-squads within 6”)

**C — Heavy Weapons Squad (optional, 0-1 per Platoon, 75pts)**

- 6 models forming 3 Heavy Weapons Teams (gunner + loader each)
- Stats: M6” T3 SV5+ W2 LD7+ OC1
- Each team selects one heavy weapon (free, mix-and-match):
  Autocannon, Heavy Bolter, Lascannon, Missile Launcher, Mortar,
  or Heavy Stubber
- Each model also has laspistol, close combat weapon, grenades

**D — Special Weapons Squad (optional, 0-1 per Platoon, 60pts)**

- 5 models: 1 Sergeant + 4 Special Weapons Guardsmen
- Stats: M6” T3 SV5+ W1 LD7+ OC1
- Sergeant: laspistol, chainsword, grenades
- Each of the 4 Guardsmen selects one special weapon (free,
  mix-and-match, NO duplicate cap — 4 meltaguns is valid):
  Flamer, Grenade Launcher, Meltagun, Plasma Gun, Sniper Rifle,
  or Demolition Charge

**E — Chimera Transport (optional, up to 1 per sub-squad, 70pts each)**

- Stats: M10” T9 SV3+ W11 LD7+ OC2
- Transport 12 Astra Militarum Infantry models
- Default: multi-laser turret + hull heavy bolter
- Free swap: hull heavy bolter → heavy flamer
- Smoke launchers included
- One Chimera may attach to each sub-squad (A, B, C, or D)
- Officer may issue Orders while embarked (measure from Chimera)

### PLATOON ABILITIES

**Voice of Command**
During Command phase, the Officer may issue up to 2 Orders to any
sub-squad within 6” (or measured from Chimera if embarked). Use the
canonical AM Order list. Named Characters with own Order list may use
either list.

**Combined Operations**
The Platoon counts as 1 unit for army-construction, target-selection,
and points-counting. Sub-squads target separately in Shooting phase,
may declare Charges separately, and contribute OC independently.
Platoon is destroyed only when every sub-squad is destroyed.

**Iron Discipline**
While the Officer is on the battlefield (embarked or not), sub-squads
may re-roll failed Battle-shock tests.

**Coordinated Disembark**
When a Chimera in this Platoon is destroyed, disembarked models gain
Stealth and Benefit of Cover until start of your next Movement phase.

### KEYWORDS

Battleline · Infantry · Vehicle · Transport · Smoke · Grenades ·
Officer · Regiment · Platoon · Imperium · Faction: Astra Militarum

-----

## PRIORITY 2 — Verify typeIds against the official .gst

After rewriting the Infantry Platoon, verify all profile typeIds against
`Warhammer 40,000.gst` in the NewRecruit repo (it’s already there).

Key IDs to confirm:

- Unit profile typeId
- Weapon profile typeId
- Ability profile typeId
- Troops category targetId
- Infantry category targetId
- Faction: Astra Militarum targetId
- Imperium targetId

-----

## PRIORITY 3 — Test in New Recruit iOS

Once rewritten, test by building an AM list in New Recruit and confirming:

1. Infantry Platoon [NFLB] appears in Troops alongside standard AM units
1. PCS composition shows correctly (A1 + A2 separately)
1. All wargear options appear and are selectable
1. Heavy Weapons Squad and Special Weapons Squad appear as optional additions
1. Chimera appears as transport option per sub-squad
1. Points calculate correctly against the table above
1. Platoon abilities display correctly

-----

## Future catalogue plans

Once Infantry Platoon is confirmed working, same supplement pattern for all
factions. Each inherits from its official catalogue — never replacing,
always adding.

```
NFLB - Astra Militarum.cat     Infantry Platoon, Last Chancers, etc.
NFLB - Space Marines.cat        Badab War characters, FW named characters
NFLB - Mechanicum.cat           HH Mechanicum units
NFLB - Horus Heresy.cat         HH Space Marine universal units
NFLB - Tau.cat                  The Eight, FW battlesuits
NFLB - Drukhari.cat             Vect, named characters
NFLB - Chaos.cat                Hellforged Adept, Lost & Damned detachments
```