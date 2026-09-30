// Run with: node chrome/tests/release.test.mjs
// Keep the manifest, popup, bilingual docs, and website release copy in sync.
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = new URL("../../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const manifest = JSON.parse(await read("chrome/manifest.json"));
assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
const [major, minor] = manifest.version.split(".");
const displayVersion = `v${major}.${minor}`;
const changelogKey = `changelog.v${major}${minor}.title`;
const popup = await read("chrome/popup.html");
assert.ok(popup.includes(`aria-label="Version ${major}.${minor}">${displayVersion}</span>`));
assert.equal(manifest.action.default_popup, "popup.html");
assert.equal(manifest.options_page, "popup.html");

for (const [path, label] of [["README.md", "Version"], ["README.zh-CN.md", "版本"]]) {
  const text = await read(path);
  assert.ok(text.includes(`**${label}:** \`${displayVersion}\``), `${path}: current version`);
  assert.ok(text.includes(`<strong>${displayVersion}</strong>`), `${path}: current changelog`);
  assert.doesNotMatch(text, /Unreleased|尚未发布/);
}
const extensionReadme = await read("chrome/README.md");
assert.ok(extensionReadme.includes(`**${displayVersion}**`));
assert.ok(extensionReadme.includes(`\`${manifest.version}\``));

const websiteScript = await read("website/script.js");
new vm.Script(websiteScript, { filename: "website/script.js" });
const start = websiteScript.indexOf("const translations =");
const end = websiteScript.indexOf("\nfunction setMenuOpen", start);
assert.ok(start >= 0 && end > start, "website translation table exists");
const translations = vm.runInNewContext(`${websiteScript.slice(start, end)}\ntranslations;`);
for (const language of ["en", "zh"]) {
  const pages = translations[language].pages;
  assert.ok(pages.home["home.release"].includes(displayVersion));
  assert.ok(pages.getIt["getIt.release.body"].includes(displayVersion));
  assert.equal(pages.changelog[changelogKey], displayVersion);
}

const pages = ["index.html", "get-it/index.html", "guide/index.html", "faq/index.html", "privacy/index.html", "changelog/index.html"];
for (const path of pages) {
  const url = new URL(`website/${path}`, root);
  const html = await readFile(url, "utf8");
  const page = html.match(/\bdata-page="([^"]+)"/)?.[1];
  assert.ok(page, `${path}: page identifier`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, `${path}: unique DOM IDs`);
  if (page === "home") {
    const slides = [...html.matchAll(/<article[^>]*\bid="([^"]+)"[^>]*\bdata-preview-slide/g)].map((match) => match[1]);
    const tabs = [...html.matchAll(/data-preview-target="(\d+)"\s+aria-controls="([^"]+)"/g)];
    assert.equal(slides[0], `preview-v${major}${minor}`, "current release is the first preview");
    assert.equal(tabs.length, slides.length, "each preview has a navigation dot");
    tabs.forEach(([, index, target], position) => {
      assert.equal(Number(index), position, "preview dots use consecutive indexes");
      assert.equal(target, slides[position], "preview dot targets its matching slide");
    });
  }
  for (const language of ["en", "zh"]) {
    const messages = { ...translations[language].common, ...translations[language].pages[page] };
    for (const [, key] of html.matchAll(/\bdata-i18n(?:-html|-alt|-content|-aria-label)?="([^"]+)"/g)) {
      assert.ok(messages[key], `${path}: ${language} translation for ${key}`);
    }
  }
  for (const [, target] of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
    if (/^(?:[a-z]+:|\/\/|#)/i.test(target)) continue;
    const destination = new URL(target, url);
    const info = await stat(fileURLToPath(destination));
    if (info.isDirectory()) await stat(new URL("index.html", destination));
  }
}

console.log({ release: displayVersion, manifestVersion: manifest.version, websitePages: pages.length, languages: ["en", "zh"], result: "Release consistency checks passed" });
