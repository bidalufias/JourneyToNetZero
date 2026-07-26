/**
 * Drives a full eight-round game with one human and three computer seats,
 * against the built app.
 *
 *   npm run build && npx vite preview --port 4173 &
 *   npx tsx scripts/solo.ts
 *
 * The computer-seat handshake is the fiddly part — the driver locks those
 * seats, holds their picks locally so nothing leaks before the reveal, and
 * publishes them alongside its own. A seat with nothing playable has no choice
 * to publish, which must not stall the round. This exercises all of that.
 */
import { chromium, type Page } from 'playwright'

const BASE = process.env.BASE ?? 'http://localhost:4173'
const LOCAL = '?local=1&fast=1'
const PHONE = { width: 390, height: 844 }
const HUMANS = Number(process.env.HUMANS ?? 1)
const ROLES = ['Government', 'Business', 'Community', 'Activist'] as const
const NAMES = ['Aina', 'Faiz', 'Mei Ling', 'Ravi'] as const

async function waitForText(page: Page, text: string, timeout = 120_000) {
  await page.locator(`text=${text}`).first().waitFor({ state: 'visible', timeout })
}

async function main() {
  const browser = await chromium.launch(
    process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
  )
  const ctx = await browser.newContext({ viewport: PHONE })
  const failures: string[] = []

  const host = await ctx.newPage()
  host.on('pageerror', (e) => failures.push(`host console: ${e.message}`))
  await host.goto(BASE + '/' + LOCAL)
  await host.getByRole('button', { name: 'Start a table' }).click()
  await host.getByPlaceholder('Aina').fill(NAMES[0])
  await host.getByRole('button', { name: ROLES[0], exact: false }).first().click()
  await host.getByRole('button', { name: 'Create table' }).click()
  await host.waitForURL(/\/play\/[A-Z]{4}/, { timeout: 15000 })
  const code = host.url().split('/').pop()!
  console.log(`  table ${code}, ${HUMANS} human${HUMANS === 1 ? '' : 's'}`)

  const players: Page[] = [host]
  for (let i = 1; i < HUMANS; i++) {
    const p = await ctx.newPage()
    p.on('pageerror', (e) => failures.push(`${ROLES[i]} console: ${e.message}`))
    await p.goto(BASE + '/' + LOCAL)
    await p.getByRole('button', { name: 'Join with a code' }).click()
    await p.getByPlaceholder('ABCD').fill(code)
    await p.waitForTimeout(700)
    await p.getByPlaceholder('Aina').fill(NAMES[i])
    await p.getByRole('button', { name: ROLES[i], exact: false }).first().click()
    await p.getByRole('button', { name: 'Join', exact: true }).click()
    await p.waitForURL(/\/play\/[A-Z]{4}/, { timeout: 15000 })
    players.push(p)
  }

  await host.getByRole('button', { name: /Fill \d seats? with the computer/ }).click()
  // By role, not by text: the rules dialog sits in the DOM on every screen and
  // contains the word "begins".
  await host.getByRole('button', { name: /Begin/ }).waitFor({ state: 'visible', timeout: 20_000 })
  // Scoped to the seat list: the rules dialog is always mounted and mentions
  // computer seats too, so counting across the whole page overcounts.
  const table = host.locator('section').filter({ hasText: 'At the table' })
  const computers = await table.getByText('Computer', { exact: true }).count()
  if (computers !== 4 - HUMANS) {
    failures.push(`expected ${4 - HUMANS} computer seats in the lobby, saw ${computers}`)
  }

  await host.getByRole('button', { name: /Begin/ }).click()
  await host.getByRole('button', { name: 'Start round 1' }).waitFor({ state: 'visible', timeout: 20_000 })
  await host.getByRole('button', { name: 'Start round 1' }).click()

  for (let round = 1; round <= 8; round++) {
    await waitForText(host, 'Choose privately')
    for (const p of players) {
      const buttons = p.locator('button[aria-pressed]')
      const n = await buttons.count()
      let picked = false
      for (let k = n - 1; k >= 0; k--) {
        if (await buttons.nth(k).isEnabled()) {
          await buttons.nth(k).click()
          picked = true
          break
        }
      }
      if (!picked) failures.push(`round ${round}: no playable action for a human`)
    }
    // If the computer seats stalled, this is where it would hang.
    await waitForText(host, 'How it landed')
    console.log(`  round ${round} resolved`)
  }

  await waitForText(host, 'Malaysia, 2050')
  await host.waitForTimeout(1200)
  const report = (await host.locator('main').innerText()) ?? ''
  const ending = await host.locator('h1').first().textContent()
  console.log(`  ending: ${ending}`)
  if (!report.includes('of 3 national targets met')) {
    failures.push('report card did not render the national result')
  }

  await browser.close()
  if (failures.length) {
    console.error(`\n✗ ${failures.length} problem(s):`)
    for (const f of failures) console.error(`  - ${f}`)
    process.exit(1)
  }
  console.log(`\n✓ Eight rounds completed with ${4 - HUMANS} computer seat(s).`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
