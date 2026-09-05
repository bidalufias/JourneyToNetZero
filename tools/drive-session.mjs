/**
 * Browser rehearsal. Opens the projector and four phones in one Chromium,
 * walks the session and screenshots both surfaces into shots/.
 *
 *   npm run dev                              # in another terminal
 *   npm install --no-save playwright@1.55.0  # once; no browser download needed
 *   node tools/drive-session.mjs             # the whole session
 *   node tools/probe-session.mjs             # the edges: veto, broken promise, defaults, tips
 *
 * BASE_URL and SHOTS_DIR override the defaults. CHROMIUM_PATH points at a
 * specific binary if Playwright cannot find one.
 */
import { chromium } from 'playwright'
import fs from 'node:fs'

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:5173'
const OUT = process.env.SHOTS_DIR ?? new URL('../shots/' + 'drive' + '/', import.meta.url).pathname
fs.mkdirSync(OUT, { recursive: true })
const ROLES = ['government', 'business', 'community', 'activist']
const log = []
const note = (s) => { console.log(s); log.push(s) }

const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH })
const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } })
const dash = await ctx.newPage()
dash.on('pageerror', (e) => note(`DASH PAGEERROR: ${e.message}`))
dash.on('console', (m) => { if (m.type() === 'error') note(`DASH CONSOLE ERROR: ${m.text()}`) })

let n = 0
const shot = async (page, name, full = false) => {
  n++
  const file = `${OUT}/${String(n).padStart(3, '0')}-${name}.png`
  await page.bringToFront(); await wait(120)
  await page.screenshot({ path: file, fullPage: full, animations: 'disabled', timeout: 15000 })
  return file
}
const phaseOf = async () => dash.evaluate(() => document.querySelector('.dash__masthead-right')?.textContent ?? document.body.innerText.slice(0, 120))
const textOf = async (page, sel) => page.evaluate((s) => document.querySelector(s)?.innerText ?? '', sel)
const bodyText = async (page) => page.evaluate(() => document.body.innerText)
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const next = async (label) => { await dash.bringToFront(); await dash.keyboard.press('n'); await wait(600); note(`NEXT -> ${label}: masthead="${(await phaseOf()).replace(/\s+/g, ' ')}"`) }

// ── Home on desktop ─────────────────────────────────────────────
await dash.goto(`${BASE}/`)
await wait(500)
await shot(dash, 'home-desktop')
await dash.goto(`${BASE}/dashboard`)
await wait(800)
const code = (await textOf(dash, '.attract__code')).trim()
note(`room code ${code}`)
await shot(dash, 'dash-lobby-empty')

// ── Phones join ─────────────────────────────────────────────────
const phones = {}
for (const [i, role] of ROLES.entries()) {
  const p = await ctx.newPage()
  await p.setViewportSize({ width: 390, height: 844 })
  p.on('pageerror', (e) => note(`PHONE(${role}) PAGEERROR: ${e.message}`))
  // Scanned QR route
  await p.goto(`${BASE}/play?room=${code}`)
  await wait(400)
  if (i === 0) await shot(p, 'phone-join-seats', true)
  await p.getByRole('button', { name: new RegExp(role, 'i') }).first().click()
  await wait(500)
  if (i === 0) await shot(p, 'phone-take-seat')
  await p.fill('input.field', ['Aisha', 'Ben', 'Chen', 'Dara'][i])
  await p.getByRole('button', { name: 'TAKE THIS SEAT' }).click()
  await wait(500)
  await shot(p, `phone-role-reveal-${role}`)
  await shot(p, `phone-role-reveal-${role}-full`, true)
  if (i === 0) {
    await p.getByRole('button', { name: 'TWO LINES YOU CAN SAY' }).click(); await wait(200)
    await shot(p, `phone-role-reveal-${role}-more-full`, true)
  }
  await p.getByRole('button', { name: 'I AM READY' }).click()
  await wait(400)
  if (i === 0) await shot(p, `phone-lobby-${role}`)
  phones[role] = p
  if (i === 1) await shot(dash, 'dash-lobby-two-seated')
}
await shot(dash, 'dash-lobby-full')
// QR overlay
await dash.bringToFront(); await dash.keyboard.press('q'); await wait(300); await shot(dash, 'dash-qr-overlay'); await dash.keyboard.press('Escape'); await wait(200)

// A 5th phone tries the same seat
const late = await ctx.newPage(); await late.setViewportSize({ width: 390, height: 844 })
await late.goto(`${BASE}/play?room=${code}&seat=government`); await wait(800); await shot(late, 'phone-seat-taken', true)
await late.close()

// Menu sheet before the game
await phones.government.locator('.phead__btn[aria-label*="How to play"]').click(); await wait(300)
await shot(phones.government, 'phone-menu-lobby', true)
await phones.government.locator('.sheet__close').click(); await wait(200)

// ── Briefing ─────────────────────────────────────────────────────
await dash.bringToFront(); await dash.keyboard.press('Space'); await wait(600)
note(`START: masthead="${await phaseOf()}"`)
await shot(dash, 'dash-briefing')
await shot(phones.business, 'phone-briefing')

// ── Practice talk ────────────────────────────────────────────────
await next('practiceTalk')
await shot(dash, 'dash-practice-talk')
await shot(phones.government, 'phone-practice-talk', true)
// Gov: open SAY IT
await phones.government.getByText('SAY IT', { exact: true }).click(); await wait(300)
await shot(phones.government, 'phone-say-sheet', true)
await phones.government.getByText('I will pick… if you…').click(); await wait(300)
await shot(phones.government, 'phone-say-deal-1', true)
await phones.government.locator('.sheet__body .btn--ghost').first().click(); await wait(300)
await shot(phones.government, 'phone-say-deal-2', true)
await phones.government.locator('.sheet__body .btn--ghost').first().click(); await wait(400)
await shot(phones.government, 'phone-practice-talk-said', true)
// Business: promise
await phones.business.getByText('SAY IT', { exact: true }).click(); await wait(300)
await phones.business.getByText('I will pick…', { exact: true }).click(); await wait(300)
await shot(phones.business, 'phone-say-promise', true)
await phones.business.locator('.sheet__body .btn--ghost').first().click(); await wait(400)
// Community: veto sheet + demand
await phones.community.getByRole('button', { name: /SAY NO/ }).click(); await wait(300)
await shot(phones.community, 'phone-veto-sheet', true)
await phones.community.locator('.sheet__close').click(); await wait(200)
await phones.community.getByText('SAY IT', { exact: true }).click(); await wait(300)
await phones.community.getByText('I want you to…').click(); await wait(300)
await shot(phones.community, 'phone-say-demand', true)
await phones.community.locator('.sheet__body .btn--ghost').first().click(); await wait(300)
await shot(phones.community, 'phone-say-demand-who', true)
await phones.community.locator('.sheet__body .btn--ghost').first().click(); await wait(400)
// Activist: spotlight sheet
await phones.activist.getByRole('button', { name: /SPOTLIGHT/ }).click(); await wait(300)
await shot(phones.activist, 'phone-spotlight-sheet', true)
await phones.activist.getByRole('button', { name: 'USE SPOTLIGHT' }).click(); await wait(400)
await shot(phones.activist, 'phone-practice-talk-activist-after-spotlight', true)
// Gov: send money sheet
await phones.government.getByRole('button', { name: 'SEND MONEY' }).click(); await wait(300)
await shot(phones.government, 'phone-offer-sheet', true)
await phones.government.getByRole('button', { name: /Business/ }).click(); await wait(200)
await phones.government.getByRole('button', { name: 'SEND 1' }).click(); await wait(400)
await shot(phones.business, 'phone-incoming-offer', true)
await phones.business.getByRole('button', { name: 'ACCEPT' }).click(); await wait(400)
await shot(dash, 'dash-practice-talk-board')
await shot(phones.business, 'phone-practice-talk-business-after', true)

// ── Practice choice ──────────────────────────────────────────────
await next('practiceChoice')
await shot(dash, 'dash-practice-choice')
await shot(phones.community, 'phone-practice-choice', true)
for (const r of ROLES) {
  const p = phones[r]
  await p.locator('.ocard').first().click(); await wait(200)
  if (r === 'community') await shot(p, 'phone-practice-choice-selected', true)
  await p.getByRole('button', { name: 'LOCK MY CARD' }).click(); await wait(300)
  if (r === 'community') await shot(p, 'phone-practice-choice-locked', true)
}
// The fourth lock turns the cards over by itself. No Next here.
note(`after practice locks: masthead="${await phaseOf()}"`)
await shot(dash, 'dash-practice-reveal-0s')
await shot(phones.community, 'phone-practice-reveal', true)
await wait(4000); await shot(dash, 'dash-practice-reveal-4s')
await wait(6000); await shot(dash, 'dash-practice-reveal-10s')

// ── Power ────────────────────────────────────────────────────────
await next('power')
await shot(dash, 'dash-power')
for (const r of ROLES) await shot(phones[r], `phone-power-${r}`, true)
// GOT IT on all four ends the step by itself. No Next here.
for (const [i, r] of ROLES.entries()) {
  await phones[r].getByRole('button', { name: 'GOT IT' }).click(); await wait(250)
  if (i === 0) { await shot(phones[r], 'phone-power-got-it', true); await shot(dash, 'dash-power-1-of-4') }
}
await wait(400)
note(`after four GOT IT: masthead="${await phaseOf()}"`)

// ── Goal ─────────────────────────────────────────────────────────
await shot(dash, 'dash-goal')
await shot(phones.activist, 'phone-goal-picker', true)
await phones.activist.locator('.goal').first().click(); await wait(200)
await shot(phones.activist, 'phone-goal-confirm', true)
await phones.activist.getByRole('button', { name: 'CHOOSE THIS ONE' }).click(); await wait(400)
await shot(phones.activist, 'phone-goal-sealed', true)
for (const r of ROLES) {
  if (r === 'activist') continue
  if (r === 'community') await shot(dash, 'dash-goal-3-of-4')
  await phones[r].locator('.goal').first().click(); await wait(150)
  await phones[r].getByRole('button', { name: 'CHOOSE THIS ONE' }).click(); await wait(200)
}
// The fourth goal opens the first crisis by itself. No Next here.
await wait(500)
note(`after four goals: masthead="${await phaseOf()}"`)

// ── Round 1: crisis ──────────────────────────────────────────────
await shot(dash, 'dash-r1-crisis')
for (const r of ROLES) {
  const t = await bodyText(phones[r])
  if (t.includes('A TIP')) { note(`tip went to ${r}`); await shot(phones[r], `phone-r1-tip-${r}`, true) }
}
await shot(phones.government, 'phone-r1-crisis', true)
// Dismiss any tip with SAY NOTHING on whoever has it, except keep one to test publish
for (const r of ROLES) {
  const p = phones[r]
  if ((await bodyText(p)).includes('A TIP')) { await p.getByRole('button', { name: 'SHARE IT' }).click(); await wait(300); note(`${r} published tip`) }
}

// ── Round 1: table ───────────────────────────────────────────────
await next('table R1')
await shot(dash, 'dash-r1-table')
await shot(phones.government, 'phone-r1-table', true)
await shot(phones.community, 'phone-r1-table-community', true)
// Gov pledges deal, business promises, community vetoes business
await phones.government.getByText('SAY IT', { exact: true }).click(); await wait(200)
await phones.government.getByText('I will pick… if you…').click(); await wait(200)
await phones.government.locator('.sheet__body .btn--ghost').first().click(); await wait(200)
await phones.government.locator('.sheet__body .btn--ghost').first().click(); await wait(300)
await phones.business.getByText('SAY IT', { exact: true }).click(); await wait(200)
await phones.business.getByText('I will pick…', { exact: true }).click(); await wait(200)
await shot(phones.business, 'phone-r1-promise-list', true)
await phones.business.locator('.sheet__body .btn--ghost').first().click(); await wait(300)
await phones.community.getByRole('button', { name: /SAY NO/ }).click(); await wait(200)
await phones.community.getByRole('button', { name: /Business/ }).click(); await wait(200)
await phones.community.locator('#veto-slide').evaluate((el) => { el.value = 100; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })) })
await wait(400)
await shot(phones.community, 'phone-r1-table-after-veto', true)
await shot(phones.business, 'phone-r1-table-business-vetoed', true)
await shot(dash, 'dash-r1-table-board')
// Back button review on gov phone
await phones.government.locator('.phead__btn[aria-label*="Look back"]').click(); await wait(300)
await shot(phones.government, 'phone-r1-lookback-crisis', true)
await phones.government.getByRole('button', { name: 'BACK TO THE GAME' }).click(); await wait(200)

// ── Round 1: choice ──────────────────────────────────────────────
await next('choice R1')
await shot(dash, 'dash-r1-choice')
await shot(phones.business, 'phone-r1-choice-business-vetoed', true)
await shot(phones.government, 'phone-r1-choice-gov', true)
// pick and lock 3
for (const r of ['government', 'business', 'community']) {
  const p = phones[r]
  await p.locator('.ocard:not([disabled])').first().click(); await wait(150)
  await p.getByRole('button', { name: 'LOCK MY CARD' }).click(); await wait(250)
}
await shot(dash, 'dash-r1-choice-last-one')
await shot(phones.government, 'phone-r1-locked', true)
await shot(phones.activist, 'phone-r1-choice-activist-unlocked', true)
await phones.activist.locator('.ocard:not([disabled])').first().click(); await wait(150)
await phones.activist.getByRole('button', { name: 'LOCK MY CARD' }).click(); await wait(500)
note(`after all lock: masthead="${await phaseOf()}"`)

// ── Reckoning ────────────────────────────────────────────────────
await shot(dash, 'dash-r1-reckoning-0s')
await shot(phones.government, 'phone-r1-reckoning', true)
await wait(3500); await shot(dash, 'dash-r1-reckoning-4s')
await wait(3000); await shot(dash, 'dash-r1-reckoning-7s')
await wait(3500); await shot(dash, 'dash-r1-reckoning-10s')
await wait(3000); await shot(dash, 'dash-r1-reckoning-13s')
await wait(4000); await shot(dash, 'dash-r1-reckoning-17s')
// pause test
await dash.keyboard.press('p'); await wait(400)
await shot(dash, 'dash-paused'); await shot(phones.business, 'phone-paused', true)
await dash.keyboard.press('p'); await wait(300)

// ── Trust, summary ───────────────────────────────────────────────
await next('trust R1')
await shot(dash, 'dash-r1-trust')
await shot(phones.government, 'phone-r1-result-gov', true)
await shot(phones.business, 'phone-r1-result-business', true)
await next('summary R1')
await shot(dash, 'dash-r1-summary')
await shot(phones.community, 'phone-r1-summary', true)

// ── Rounds 2..6 quickly ──────────────────────────────────────────
for (let round = 2; round <= 6; round++) {
  await next(`crisis R${round}`)
  if (round === 2) { await shot(dash, 'dash-r2-crisis'); await shot(phones.activist, 'phone-r2-crisis', true) }
  // dismiss tips silently
  for (const r of ROLES) { const p = phones[r]; if ((await bodyText(p)).includes('A TIP')) { await p.getByRole('button', { name: 'KEEP IT SECRET' }).click(); await wait(200) } }
  await next(`table R${round}`)
  if (round === 2) await shot(phones.business, 'phone-r2-table', true)
  if (round === 4) { await shot(dash, 'dash-r4-table'); await shot(phones.government, 'phone-r4-table', true) }
  await next(`choice R${round}`)
  if (round === 2) await shot(phones.government, 'phone-r2-choice', true)
  if (round === 4) await shot(phones.government, 'phone-r4-choice', true)
  // pick greenest available option (first) for gov/business, first for others, lock
  for (const r of ROLES) {
    const p = phones[r]
    const cards = p.locator('.ocard:not([disabled])')
    if (await cards.count()) { await cards.first().click(); await wait(100); await p.getByRole('button', { name: 'LOCK MY CARD' }).click(); await wait(150) }
  }
  await wait(600)
  note(`R${round} resolved: masthead="${await phaseOf()}"`)
  await wait(11000)
  await shot(dash, `dash-r${round}-reckoning-late`)
  await next(`trust R${round}`)
  if (round === 6) await shot(phones.government, 'phone-r6-result', true)
  await next(`summary R${round}`)
  await shot(dash, `dash-r${round}-summary`)
}

// ── Results ──────────────────────────────────────────────────────
await next('results')
await shot(dash, 'dash-results')
for (const r of ROLES) await shot(phones[r], `phone-results-${r}`, true)
await next('ended')
await shot(dash, 'dash-ended')
await shot(phones.government, 'phone-ended', true)
// what does NEXT do now?
await next('after ended')
await shot(dash, 'dash-after-ended')

// Facilitator window standalone
const fac = await ctx.newPage(); await fac.setViewportSize({ width: 560, height: 900 })
await fac.goto(`${BASE}/facilitator?room=${code}`); await wait(800)
await shot(fac, 'facilitator-window', true)
// how to play static page on phone
const htp = await ctx.newPage(); await htp.setViewportSize({ width: 390, height: 844 })
await htp.goto(`${BASE}/how-to-play.html?room=${code}`); await wait(500)
await shot(htp, 'how-to-play-top')

fs.writeFileSync(`${OUT}/log.txt`, log.join('\n'))
await browser.close()
