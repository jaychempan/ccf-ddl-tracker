// PLAYWRIGHT_MODULE=/path/to/playwright-core node chrome/tests/deadline-sync-browser.cjs
// Uses a disposable Chrome profile; never reads or changes the user's cards.
const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright-core');

(async () => {
  const context = await chromium.launchPersistentContext('', {
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    ignoreDefaultArgs: ['--disable-extensions'],
    args: ['--enable-unsafe-extension-debugging'],
  });
  try {
    const cdp = await context.browser().newBrowserCDPSession();
    const { id } = await cdp.send('Extensions.loadUnpacked', { path: path.resolve(__dirname, '..') });
    const worker = context.serviceWorkers().find((entry) => entry.url().includes(id)) ||
      await context.waitForEvent('serviceworker');
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await worker.evaluate(async () => {
      const catalog = `- title: CVPR
  confs:
  - year: 2099
    id: cvpr99
    link: https://example.com/cvpr2099
    timeline:
    - deadline: '2099-11-21 23:59:59'
    timezone: UTC+8
`;
      globalThis.fetch = async () => ({ ok: true, text: async () => catalog });
      await chrome.storage.local.set({ starSync: { enabled: false }, deadlines: [
        { title: 'CVPR 2099', datetime: '2099-10-01T00:00:00Z', url: 'https://example.com/cvpr2099' },
        { title: 'Private deadline', datetime: '2099-12-01T00:00:00Z', source: 'manual' },
      ] });
    });
    await page.goto(`chrome-extension://${id}/popup.html`);
    const version = require('../manifest.json').version;
    assert.equal(await page.evaluate(() => chrome.runtime.getManifest().version), version);
    assert.equal(await page.locator('.version-tag').innerText(), `v${version.split('.').slice(0, 2).join('.')}`);
    await page.waitForFunction(() => isPopupReady && deadlineSyncPromise === null);
    assert.equal(await page.locator('#deadline-sync-status').count(), 0);
    const saved = await page.evaluate(async () => (await chrome.storage.local.get('deadlines')).deadlines);
    assert.equal(saved.length, 2);
    assert.equal(saved[0].datetime, '2099-11-21T15:59:59.000Z');
    assert.equal(saved[0].conferenceDeadlineId, 'cvpr99:0:deadline');
    assert.equal(saved[1].datetime, '2099-12-01T00:00:00Z');
    assert.match(await page.locator('#deadline-list').innerText(), /CVPR 2099/);
    const badge = await page.evaluate(() => chrome.action.getBadgeText({}));
    assert.equal(badge, String(Math.floor((Date.parse(saved[0].datetime) - Date.now()) / 86400000)));
    await worker.evaluate(() => {
      globalThis.offlineAttempts = 0;
      globalThis.fetch = async () => { globalThis.offlineAttempts++; throw new Error('offline test'); };
    });
    await page.locator('#refresh-deadlines').click();
    await page.waitForFunction(() => deadlineSyncPromise === null);
    assert.equal(await worker.evaluate(() => globalThis.offlineAttempts), 1);
    assert.equal(await page.locator('#deadline-sync-status').count(), 0);
    assert.deepEqual(await page.evaluate(async () => (await chrome.storage.local.get('deadlines')).deadlines), saved);
    const alarm = await page.evaluate(() => chrome.alarms.get('ccfddl-deadline-sync'));
    assert.equal(alarm.periodInMinutes, 360);
    assert.deepEqual(errors, []);
    if (process.env.SCREENSHOT_PATH) await page.screenshot({ path: process.env.SCREENSHOT_PATH, fullPage: true });
    console.log('Chrome extension: startup legacy migration, rendered cards, badge, manual refresh, offline retention and background alarm passed');
  } finally { await context.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
