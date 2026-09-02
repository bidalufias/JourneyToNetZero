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
const OUT = process.env.SHOTS_DIR ?? new URL('../shots/' + 'probe' + '/', import.meta.url).pathname
fs.mkdirSync(OUT, { recursive: true })
const ROLES = ['government', 'business', 'community', 'activist']
const note = (s) => console.log(s)
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH })
const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } })
const dash = await ctx.newPage()
let n = 0
const shot = async (page, name, full = false) => {
  n++
  await page.bringToFront(); await wait(120)
  await page.screenshot({ path: `${OUT}/${String(n).padStart(3, '0')}-${name}.png`, fullPage: full, animations: 'disabled', timeout: 15000 })
}
const bodyText = async (page) => page.evaluate(() => document.body.innerText)
const phaseOf = async () => dash.evaluate(() => document.querySelector('.dash__masthead-right')?.textContent?.replace(/\s+/g, ' ') ?? '')
const next = async (label) => { await dash.bringToFront(); await dash.keyboard.press('n'); await wait(600); note(`NEXT -> ${label}: "${await phaseOf()}"`) }
const btn = (p, name) => p.getByRole('button', { name })

await dash.goto(`${BASE}/dashboard`); await wait(800)
const code = (await dash.evaluate(() => document.querySelector('.attract__code')?.textContent ?? '')).trim()
note(`room ${code}`)
const phones = {}
for (const [i, role] of ROLES.entries()) {
  const p = await ctx.newPage(); await p.setViewportSize({ width: 390, height: 844 })
  await p.goto(`${BASE}/play?room=${code}&seat=${role}`); await wait(400)
  await p.fill('input.field', ['Aisha', 'Ben', 'Chen', 'Dara'][i]); await btn(p, 'TAKE THE SEAT').click(); await wait(300)
  phones[role] = p
}
// Leave government still reading their role, start the session: what happens to that phone?
await shot(phones.government, 'gov-still-reading-role')
await dash.bringToFront(); await dash.keyboard.press('Space'); await wait(600)
await shot(phones.government, 'gov-after-start-yanked')
note('phones after start: ' + (await bodyText(phones.business)).includes('I AM READY'))

await next('practiceTalk'); await next('practiceChoice'); await next('power'); await next('goal')
// Only 3 seal a goal. Advance anyway (what the 45s clock would do).
for (const r of ['government', 'business', 'community']) { await phones[r].locator('.goal').first().click(); await wait(100); await btn(phones[r], 'SEAL IT').click(); await wait(150) }
await shot(dash, 'dash-goal-3-of-4-sealed')
await next('crisis R1 with activist unsealed')
await shot(phones.activist, 'activist-goal-during-crisis', true)
// The tip card can land on this phone and cover the goal picker.
if ((await bodyText(phones.activist)).includes('A TIP OFF')) { note('tip landed on the unsealed activist'); await btn(phones.activist, 'SAY NOTHING').click(); await wait(200) }
await phones.activist.locator('.goal').first().click(); await wait(100); await btn(phones.activist, 'SEAL IT').click(); await wait(300)
await shot(phones.activist, 'activist-after-late-seal', true)

// Tip: whoever has it says nothing. Remember who.
let tipped1 = null
for (const r of ROLES) { if ((await bodyText(phones[r])).includes('A TIP OFF')) { tipped1 = r; await btn(phones[r], 'SAY NOTHING').click(); await wait(200) } }
note(`R1 tip -> ${tipped1}, said nothing`)

await next('table R1')
// Real veto: community drags slider on Business
const c = phones.community
await btn(c, /SAY NO/).click(); await wait(300)
await btn(c, /Business/).click(); await wait(200)
const box = await c.locator('#veto-slide').boundingBox()
await c.mouse.move(box.x + 8, box.y + box.height / 2); await c.mouse.down()
await c.mouse.move(box.x + box.width - 2, box.y + box.height / 2, { steps: 12 }); await c.mouse.up(); await wait(500)
await shot(c, 'community-after-real-veto', true)
await shot(phones.business, 'business-table-after-veto', true)
await shot(dash, 'dash-table-after-veto')
// Business promises the card it will NOT pick (to break a promise)
const b = phones.business
await btn(b, 'SAY IT').click(); await wait(200); await b.getByText('I will choose…', { exact: true }).click(); await wait(200)
const promiseBtns = b.locator('.sheet__body .btn--ghost')
note(`business promise options: ${await promiseBtns.count()}`)
await promiseBtns.first().click(); await wait(300)
// Gov turns co-funding on
await btn(phones.government, 'SAY IT').click(); await wait(200); await phones.government.getByText('I will pay half of any partnership.').click(); await wait(300)
await shot(dash, 'dash-table-cofund-and-pledge')
await shot(phones.government, 'gov-table-after-cofund', true)

await next('choice R1')
await shot(b, 'business-choice-vetoed', true)
// Business locks a DIFFERENT available card than promised (last available)
const bcards = b.locator('.ocard:not([disabled])'); note(`business available cards: ${await bcards.count()}`)
await bcards.last().click(); await wait(100); await btn(b, 'LOCK IT IN').click(); await wait(200)
for (const r of ['government', 'community']) { const p = phones[r]; await p.locator('.ocard:not([disabled])').first().click(); await wait(100); await btn(p, 'LOCK IT IN').click(); await wait(150) }
// Activist selects but does not lock; let the 60s clock lock it.
await phones.activist.locator('.ocard:not([disabled])').first().click(); await wait(200)
await shot(phones.activist, 'activist-selected-not-locked', true)
note('waiting for R1 choice clock to expire (up to 60s)...')
for (let i = 0; i < 70; i++) { await wait(1000); if ((await phaseOf()).includes('REVEAL')) break }
note(`after expiry: "${await phaseOf()}"`)
await wait(12500)
await shot(dash, 'dash-r1-reveal-broken-promise-sting')
await wait(3000)
await shot(dash, 'dash-r1-reveal-all-cards')
await next('trust'); await shot(phones.activist, 'activist-result-autolocked', true); await shot(b, 'business-result-broke-promise', true)
await next('summary')

// Rounds 2..6: dismiss tips, note who gets them; the R1 tipped role should get one again by R5/6.
for (let round = 2; round <= 6; round++) {
  await next(`crisis R${round}`)
  for (const r of ROLES) {
    const t = await bodyText(phones[r])
    if (t.includes('A TIP OFF')) { note(`R${round} tip card visible on ${r}`); await btn(phones[r], 'SAY NOTHING').click(); await wait(150) }
  }
  // Ask the room directly who was dealt the tip this round (read the dashboard's tip line is anonymous; use the phone body instead)
  if (round === 2) {
    // nobody selects anything: let the 40s clock default everyone
    await next('table'); await next('choice')
    note('R2: nobody touches a phone, waiting for default lock...')
    for (let i = 0; i < 50; i++) { await wait(1000); if ((await phaseOf()).includes('REVEAL')) break }
    await wait(1000); await shot(dash, 'dash-r2-reveal-defaulted')
    await next('trust'); await shot(phones.community, 'community-result-defaulted', true); await next('summary')
    continue
  }
  await next('table'); await next('choice')
  for (const r of ROLES) { const p = phones[r]; const cards = p.locator('.ocard:not([disabled])'); if (await cards.count()) { await cards.first().click(); await wait(80); await btn(p, 'LOCK IT IN').click(); await wait(120) } }
  await wait(600); await next('trust'); await next('summary')
}
// Which roles ever showed a tip card after round 1? Compare with the rotation rule (everyone gets one in R1-4, repeats in R5-6).
await next('results'); await shot(dash, 'dash-results-2')
await browser.close()
