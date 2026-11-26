#!/usr/bin/env node
/**
 * Aviendha browser check against the local demo (`/aviendha/` subsite).
 *
 * Usage (playwright comes with the @imwz/wp-pattern-sentinel dependency):
 *
 *   npm run test:browser
 *   # or directly, with overrides:
 *   DEMO_SUBSITE=aviendha DEMO_HOME_ID=57 node tests/browser-check.js
 *
 * Expects the local-only admin from seo-strategy's
 * tools/scripts/sentinel-local-admin.sh demo.imagewize.com (password in
 * ~/.config/wp-sentinel/demo.imagewize.com-local.pass, or set WP_PASS).
 * The demo is HTTP only: http://demo.imagewize.test/aviendha/
 *
 * Checks: front end of the published pages (status, Aludra block markup,
 * cookie-consent UI, console/page errors, failed requests), Site Editor
 * canvas (block count, 0 invalid blocks, theme editor stylesheet inside the
 * canvas iframe), the templates screen, and the post editor for the home
 * page. Prints a JSON report; exits 1 on page errors or invalid blocks.
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const BASE = process.env.DEMO_BASE || 'http://demo.imagewize.test';
const SUBSITE = process.env.DEMO_SUBSITE || 'aviendha';
const HOME_ID = process.env.DEMO_HOME_ID || '57';
const PASS_FILE = path.join(process.env.HOME, '.config/wp-sentinel/demo.imagewize.com-local.pass');
const PASS = process.env.WP_PASS || fs.readFileSync(PASS_FILE, 'utf8').trim();

const FRONT_PAGES = ['/', '/about/', '/services/', '/contact/', '/shop/', '/cart/', '/checkout/'];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const report = { base: BASE, subsite: SUBSITE, console: [], failedRequests: [], steps: {} };
  let hardFail = false;

  function watch(page, tag) {
    page.on('console', (m) => {
      if (['error', 'warning'].includes(m.type())) report.console.push(`[${tag} ${m.type()}] ${m.text().slice(0, 280)}`);
    });
    page.on('pageerror', (e) => { hardFail = true; report.console.push(`[${tag} pageerror] ${String(e).slice(0, 280)}`); });
    page.on('response', (r) => { if (r.status() >= 400) report.failedRequests.push(`[${tag}] ${r.status()} ${r.url()}`); });
    // Warder hides its banner from automation unless webdriver is masked.
    page.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => undefined }); });
  }

  // --- login at the network wp-login ---
  const login = await ctx.newPage();
  watch(login, 'login');
  await login.goto(`${BASE}/wp/wp-login.php`, { waitUntil: 'domcontentloaded' });
  await login.fill('#user_login', 'admin');
  await login.fill('#user_pass', PASS);
  await Promise.all([
    login.waitForLoadState('domcontentloaded', { timeout: 60000 }),
    login.click('#wp-submit'),
  ]);
  await login.waitForTimeout(2000);
  report.steps.loginUrl = login.url();
  await login.close();

  const sub = `${BASE}/${SUBSITE}`;

  // --- front end ---
  report.steps.frontend = {};
  for (const p of FRONT_PAGES) {
    const fp = await ctx.newPage();
    watch(fp, `front${p}`);
    try {
      const resp = await fp.goto(sub + p, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await fp.waitForTimeout(3000);
      const aludra = await fp.evaluate(() => document.body.innerHTML.match(/wp-block-aludra-[a-z-]+/g) || []);
      report.steps.frontend[p] = {
        status: resp && resp.status(),
        aludraBlocks: [...new Set(aludra)].slice(0, 10),
        consentUi: await fp.evaluate(() => !!document.querySelector('[class*="warder" i], [id*="warder" i], [class*="cookie-consent" i]')),
      };
    } catch (e) { report.steps.frontend[p] = { error: String(e).slice(0, 200) }; }
    await fp.close();
  }

  async function invalidBlockCount(page) {
    let invalid = 0;
    for (const f of page.frames()) {
      invalid += await f.locator('.is-invalid').count().catch(() => 0);
      invalid += await f.locator('.block-editor-warning:has-text("invalid"), .block-editor-warning:has-text("unexpected")').count().catch(() => 0);
    }
    return invalid;
  }

  async function themeStylesInFrames(page) {
    // WP 7.2 inlines editor styles into the canvas iframe instead of linking
    // them, so accept both a link href and an inline <style> carrying the
    // theme stylesheet (identified by its header comment).
    const found = [];
    for (const f of page.frames()) {
      const r = await f.evaluate(() => {
        const out = { links: [], inline: 0 };
        for (const s of document.styleSheets) {
          if (s.href && s.href.includes('app/themes/')) out.links.push(s.href);
        }
        for (const el of document.querySelectorAll('style')) {
          if (el.textContent.includes('Theme Name: Aviendha')) out.inline++;
        }
        return out;
      }).catch(() => null);
      if (r) { found.push(...r.links); if (r.inline > 0) found.push(`<inlined style x${r.inline}>`); }
    }
    return [...new Set(found)];
  }

  // --- Site Editor ---
  const se = await ctx.newPage();
  watch(se, 'site-editor');
  try {
    await se.goto(`${sub}/wp-admin/site-editor.php`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    try {
      const btn = se.getByRole('button', { name: /edit your site/i }).first();
      if (await btn.isVisible({ timeout: 8000 })) await btn.click();
    } catch (e) { /* no first-visit guide */ }
    await se.waitForTimeout(8000);
    const frame = se.frameLocator('iframe[name="editor-canvas"]');
    let canvasBlocks = 0;
    try { canvasBlocks = await frame.locator('.block-editor-block-list__block').count(); } catch (e) {}
    const invalid = await invalidBlockCount(se);
    if (invalid > 0) hardFail = true;
    report.steps.siteEditor = {
      canvasBlocks,
      invalidBlocks: invalid,
      themeStylesInFrames: await themeStylesInFrames(se),
    };
    // style book: Styles -> Browse styles, then the variation cards carry aria-labels
    await se.locator('button:has-text("Styles")').first().click().catch(() => {});
    await se.waitForTimeout(2500);
    await se.locator('button:has-text("Browse styles")').first().click().catch(() => {});
    await se.waitForTimeout(3000);
    report.steps.styleBook = {
      twilightCards: await se.locator('[aria-label]').evaluateAll(
        (els) => els.map((e) => e.getAttribute('aria-label')).filter((l) => l && /twilight/i.test(l))).catch(() => []),
    };
    // templates screen: opening the Templates section should list the theme's templates
    await se.goto(`${sub}/wp-admin/site-editor.php?path=%2Ftemplates`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await se.waitForTimeout(5000);
    await se.locator('button:has-text("Templates")').first().click().catch(() => {});
    await se.waitForTimeout(4000);
    const contentText = await se.locator('body').innerText().catch(() => '');
    // Template/part *registration* is asserted server-side (get_block_templates());
    // here we only record what the Templates screen shows.
    report.steps.templatesScreen = { snippet: contentText.replace(/\s+/g, ' ').slice(0, 200) };
  } catch (e) { report.steps.siteEditor = { error: String(e).slice(0, 250) }; }

  // --- post editor: home page ---
  const pe = await ctx.newPage();
  watch(pe, 'post-editor');
  try {
    await pe.goto(`${sub}/wp-admin/post.php?post=${HOME_ID}&action=edit`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await pe.waitForTimeout(9000);
    const pf = pe.frameLocator('iframe[name="editor-canvas"]');
    let blocks = 0;
    try { blocks = await pf.locator('.block-editor-block-list__block').count(); } catch (e) {}
    const invalid = await invalidBlockCount(pe);
    if (invalid > 0) hardFail = true;
    report.steps.postEditor = { blocks, invalidBlocks: invalid, themeStylesInFrames: await themeStylesInFrames(pe) };
  } catch (e) { report.steps.postEditor = { error: String(e).slice(0, 250) }; }

  console.log(JSON.stringify(report, null, 1));
  await browser.close();
  process.exitCode = hardFail ? 1 : 0;
}
main().catch((e) => { console.error('FATAL', e); process.exit(1); });
