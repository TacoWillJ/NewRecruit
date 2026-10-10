#!/usr/bin/env node
// Sync this repo with BSData/wh40k-11e and rebuild + re-attach the NFLB overlay.
//
// Layout rule: every root-level *.json that is NOT named "NFLB - *.json" belongs to
// upstream and is overwritten on each sync. NFLB content is authored in nflb-src/*.js
// and generated into "NFLB - <Faction>.json" library catalogues, rebuilt against the
// fresh upstream data every run (official weapons/rules/categories are linked by id).
// Each one is attached to its faction with a single catalogueLink, plus any entryLink
// injections the spec asks for (e.g. adding a detachment to the Detachment picker).
//
// Usage: node tools/sync-upstream.js [--check]
//   --check  skip the download; rebuild + re-link + validate what is already here

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
const { createBuilder } = require('./nflb-lib');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'nflb-src');
const CACHE = path.join(ROOT, '.upstream');
const MANIFEST = path.join(__dirname, 'upstream.json');
const UPSTREAM_URL = 'https://github.com/BSData/wh40k-11e.git';
const NFLB_PREFIX = 'NFLB - ';
const SYSTEM_SUFFIX = ' [NFLB]';

const checkOnly = process.argv.includes('--check');
const git = (args, cwd) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
const readJson = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
// Deterministic output: same input -> same bytes, so git diffs only show real changes.
const writeJson = (f, o) => fs.writeFileSync(path.join(ROOT, f), JSON.stringify(o, null, 2) + '\n');
const isNflb = f => f.startsWith(NFLB_PREFIX);
const rootJson = () => fs.readdirSync(ROOT).filter(f => f.endsWith('.json'));

const problems = [];
const notes = [];
let manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : { commit: null, files: [] };
manifest.nflb = manifest.nflb || {};

// ---------- 1. Refresh upstream cache and copy files ----------
if (!checkOnly) {
  if (!fs.existsSync(path.join(CACHE, '.git'))) {
    git(['clone', '--depth', '1', UPSTREAM_URL, CACHE], ROOT);
  } else {
    git(['fetch', '--depth', '1', 'origin', 'main'], CACHE);
    git(['reset', '--hard', 'origin/main'], CACHE);
  }
  const commit = git(['rev-parse', 'HEAD'], CACHE);
  const commitInfo = git(['log', '-1', '--format=%ci %s'], CACHE);

  const upstreamFiles = fs.readdirSync(CACHE).filter(f => {
    if (!f.endsWith('.json')) return false;
    const o = JSON.parse(fs.readFileSync(path.join(CACHE, f), 'utf8'));
    return o.catalogue || o.gameSystem;
  }).sort();
  const clash = upstreamFiles.filter(isNflb);
  if (clash.length) throw new Error(`Upstream now ships files with the NFLB prefix: ${clash.join(', ')}`);

  for (const f of manifest.files) {
    if (!upstreamFiles.includes(f) && fs.existsSync(path.join(ROOT, f))) {
      fs.unlinkSync(path.join(ROOT, f));
      notes.push(`Removed (gone upstream): ${f}`);
    }
  }
  for (const f of upstreamFiles) {
    if (manifest.commit && !manifest.files.includes(f)) notes.push(`New upstream file: ${f}`);
    fs.copyFileSync(path.join(CACHE, f), path.join(ROOT, f));
  }
  notes.unshift(`Upstream: ${(manifest.commit || 'none').slice(0, 7)} -> ${commit.slice(0, 7)} (${commitInfo})`);
  Object.assign(manifest, { upstream: UPSTREAM_URL, commit, commitInfo, syncedAt: new Date().toISOString(), files: upstreamFiles });
}

// ---------- 2. Rename the game system so it is distinct in New Recruit ----------
const gstFile = rootJson().find(f => !isNflb(f) && readJson(f).gameSystem);
if (!gstFile) throw new Error('No game system file found');
{
  const o = readJson(gstFile);
  if (!o.gameSystem.name.endsWith(SYSTEM_SUFFIX)) {
    o.gameSystem.name += SYSTEM_SUFFIX;
    writeJson(gstFile, o);
  }
}
const gst = readJson(gstFile).gameSystem;

// ---------- 3. Build NFLB catalogues from nflb-src/ ----------
const specs = fs.existsSync(SRC) ? fs.readdirSync(SRC).filter(f => f.endsWith('.js')).sort() : [];
const built = [];
for (const sf of specs) {
  delete require.cache[require.resolve(path.join(SRC, sf))];
  const spec = require(path.join(SRC, sf));
  const outFile = NFLB_PREFIX + spec.faction;
  const name = outFile.replace(/\.json$/, '');
  try {
    for (const f of [spec.faction, spec.factionLibrary]) {
      if (!fs.existsSync(path.join(ROOT, f))) throw new Error(`upstream file "${f}" no longer exists (renamed or removed?)`);
    }
    const b = createBuilder({ root: ROOT, catalogueName: name, factionLibrary: spec.factionLibrary });
    const out = spec.build(b);
    const catId = b.id('catalogue');
    const catalogue = {
      name, id: catId, authorName: 'No Figure Left Behind', authorUrl: 'https://tacowillj.github.io/nofigureleftbehind.github.io/',
      battleScribeVersion: gst.battleScribeVersion, gameSystemId: gst.id, gameSystemRevision: gst.revision,
      library: true, revision: 1, type: 'catalogue', xmlns: 'http://www.battlescribe.net/schema/catalogueSchema',
      publications: [{ name: 'No Figure Left Behind', id: b.id('publication'), hidden: false, shortName: 'NFLB' }],
      catalogueLinks: [{ name: b.lib.name, id: b.id('link:library'), importRootEntries: false, targetId: b.lib.id, type: 'catalogue' }],
      categoryEntries: b.ownCategories,
      entryLinks: out.rootUnits.map(u => ({ name: u.name, id: b.id(`root:${u.id}`), hidden: false, import: true, targetId: u.id, type: 'selectionEntry' })),
      sharedSelectionEntries: [...out.rootUnits, ...(out.sharedSelectionEntries || []), ...b.sharedEntries],
      sharedSelectionEntryGroups: out.sharedSelectionEntryGroups || [],
    };
    // Bump the revision only when the generated content actually changes
    const hash = crypto.createHash('sha1').update(JSON.stringify(catalogue)).digest('hex');
    const prev = manifest.nflb[outFile] || { hash: null, revision: 0 };
    const revision = prev.hash === hash ? prev.revision : prev.revision + 1;
    catalogue.revision = revision;
    manifest.nflb[outFile] = { hash, revision };
    writeJson(outFile, { catalogue });
    built.push({ outFile, spec, catId, catName: name, injections: out.injections || [] });
    notes.push(`Built ${outFile} (rev ${revision}): ${out.rootUnits.length} units, ${b.sharedEntries.length} NFLB-only weapons`);
  } catch (e) {
    problems.push(`${sf}: ${e.message}`);
  }
}
// Stale generated files whose spec was deleted
for (const f of rootJson().filter(isNflb)) {
  if (!built.some(x => x.outFile === f) && !specs.some(s => NFLB_PREFIX + require(path.join(SRC, s)).faction === f)) {
    fs.unlinkSync(path.join(ROOT, f));
    notes.push(`Removed stale ${f} (no matching nflb-src spec)`);
  }
}

// ---------- 4. Attach: catalogueLink into the faction + entryLink injections ----------
for (const { spec, catId, catName, injections } of built) {
  const fo = readJson(spec.faction);
  fo.catalogue.catalogueLinks = fo.catalogue.catalogueLinks || [];
  if (!fo.catalogue.catalogueLinks.some(l => l.targetId === catId)) {
    fo.catalogue.catalogueLinks.push({ name: catName, id: `nflb-link-${catId}`, importRootEntries: true, targetId: catId, type: 'catalogue' });
    writeJson(spec.faction, fo);
  }
  const byFile = {};
  for (const inj of injections) (byFile[inj.file] = byFile[inj.file] || []).push(inj);
  for (const [file, list] of Object.entries(byFile)) {
    const o = readJson(file);
    const c = o.catalogue || o.gameSystem;
    let changed = false;
    for (const inj of list) {
      const g = (c.sharedSelectionEntryGroups || []).find(x => x.name === inj.groupName);
      if (!g) { problems.push(`Injection target group "${inj.groupName}" not found in ${file} (renamed upstream?)`); continue; }
      g.entryLinks = g.entryLinks || [];
      if (!g.entryLinks.some(l => l.id === inj.entryLink.id)) { g.entryLinks.push(inj.entryLink); changed = true; }
    }
    if (changed) writeJson(file, o);
  }
}

// ---------- 5. Validate every reference in the NFLB catalogues ----------
const ids = new Set();
const collect = o => {
  if (Array.isArray(o)) return o.forEach(collect);
  if (o && typeof o === 'object') {
    if (typeof o.id === 'string') ids.add(o.id);
    Object.values(o).forEach(collect);
  }
};
for (const f of rootJson()) collect(readJson(f));
const KEYWORD_IDS = new Set(['unit', 'model', 'self', 'parent', 'force', 'roster', 'ancestor', 'primary-catalogue', 'model-or-unit', 'any']);
for (const { outFile } of built) {
  const walk = (o, where) => {
    if (Array.isArray(o)) return o.forEach(x => walk(x, where));
    if (!o || typeof o !== 'object') return;
    const here = o.name ? `${where} > ${o.name}` : where;
    for (const k of ['targetId', 'typeId', 'childId']) {
      const v = o[k];
      if (typeof v === 'string' && !ids.has(v) && !KEYWORD_IDS.has(v)) problems.push(`Broken reference ${k}=${v} at ${here}`);
    }
    if (o.field && /^[0-9a-z]{2,}-/.test(o.field) && !ids.has(o.field)) problems.push(`Broken modifier field ${o.field} at ${here}`);
    for (const v of Object.values(o)) if (typeof v === 'object') walk(v, here);
  };
  walk(readJson(outFile).catalogue, outFile);
}

fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');

// ---------- Report ----------
for (const n of notes) console.log(n);
if (problems.length) {
  console.log(`\n${problems.length} PROBLEM(S):`);
  for (const p of problems) console.log(`  - ${p}`);
  process.exit(1);
}
console.log('OK: all NFLB references resolve.');
