// Run with: node chrome/tests/theme.test.mjs
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../theme.js", import.meta.url), "utf8");
const html = await readFile(new URL("../popup.html", import.meta.url), "utf8");
assert.match(html, /<script\s+src="theme\.js"\s+defer><\/script>/);

function createThemeHarness() {
  const inputs = ["system", "light", "dark"].map((value) => ({
    value,
    checked: false,
    matches: (selector) => selector === 'input[name="theme"]',
  }));
  const listeners = new Map();
  const reads = [];
  const writes = [];
  let storageListener;
  let lastError;
  let synchronousStorageAccesses = 0;
  const document = {
    documentElement: { dataset: {} },
    querySelectorAll: () => inputs,
    addEventListener: (name, callback) => listeners.set(name, callback),
  };
  const sandbox = {
    document,
    chrome: {
      runtime: { get lastError() { return lastError; } },
      storage: {
        local: {
          get: (defaults, callback) => reads.push({ defaults, callback }),
          set: (values) => writes.push(values),
        },
        onChanged: { addListener: (callback) => { storageListener = callback; } },
      },
    },
    get localStorage() {
      synchronousStorageAccesses += 1;
      throw new Error("Synchronous storage is unavailable during popup startup");
    },
  };
  vm.runInNewContext(source, sandbox, { filename: "theme.js" });
  return {
    document, inputs, reads, writes,
    synchronousStorageAccesses: () => synchronousStorageAccesses,
    respond: (theme, error) => {
      lastError = error;
      reads[0].callback({ theme });
      lastError = undefined;
    },
    choose: (value) => {
      const target = inputs.find((input) => input.value === value);
      target.checked = true;
      listeners.get("change")({ target });
    },
    changeStorage: (theme) => storageListener({ theme: { newValue: theme } }, "local"),
  };
}

const pending = createThemeHarness();
assert.equal(pending.synchronousStorageAccesses(), 0);
assert.equal(pending.document.documentElement.dataset.theme, "system");
assert.equal(pending.inputs[0].checked, true);
assert.equal(pending.writes.length, 0);
pending.respond("dark");
assert.equal(pending.document.documentElement.dataset.theme, "dark");
assert.equal(pending.inputs[2].checked, true);
assert.equal(pending.synchronousStorageAccesses(), 0);

const changed = createThemeHarness();
changed.choose("light");
changed.respond("dark");
assert.equal(changed.document.documentElement.dataset.theme, "light");
assert.equal(changed.writes[0].theme, "light");
changed.changeStorage("dark");
assert.equal(changed.document.documentElement.dataset.theme, "dark");

for (const [theme, error] of [["invalid", undefined], ["dark", { message: "Storage unavailable" }]]) {
  const h = createThemeHarness();
  h.respond(theme, error);
  assert.equal(h.document.documentElement.dataset.theme, "system");
  assert.equal(h.writes.length, 0);
}

console.log({ passed: 4, result: "Async theme loading, blocked sync storage, preference races and read failures passed" });
