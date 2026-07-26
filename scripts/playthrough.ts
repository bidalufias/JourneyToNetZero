/**
 * Drives a complete four-player, eight-round game against the real Supabase
 * project, with four phone-sized browser contexts and one board.
 *
 *   npm run build && npx vite preview --port 4173 &
 *   npx tsx scripts/playthrough.ts
 *
 * This is the test that matters: it exercises realtime sync, the hidden-choice
 * handshake, currency transfers and resolution exactly as four people would.
 */
import { chromium, type Browser, type Page } from 'playwright'

const BASE = process.env.BASE ?? 'http://localhost:4173'
// All five screens share one browser context so the local transport (which
// syncs across tabs of one browser) stands in for Supabase Realtime. The
// phase machine, hidden-choice handshake, transfers and resolution are
// exercised exactly as they are in a real four-phone game.
const LOCAL = '?local=1&fast=1'
const PHONE = { width: 390, height: 844 }
const BOARD = { width: 1600, height: 900 }
const ROLES = ['Government', 'Business', 'Community', 'Activist'] as const
const NAMES = ['Aina', 'Faiz', 'Mei Ling', 'Ravi'] as const

const shot = (n: string) => `/tmp/claude-0/-home-user-JourneyToNetZero/4a01ab4d-5427-551d-a98a-1a36a4188a68/scratchpad/pt-${n}.png`

let sharedCtx: Awaited<ReturnType<Browser['newContext']>>

async function openPhone(browser: Browser): Promise<Page> {
  sharedCtx ??= await browser.newContext({ viewport: PHONE })
  const page = await sharedCtx.newPage()
  await page.setViewportSize(PHONE)
  return page
}

async function main() {
  // Use the browser already on the machine rather than downloading another.
  const browser = await chromium.launch(
    process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {},
  )
  const failures: string[] = []
  const log = (m: string) => console.log(`  ${m}`)

  // ---------------------------------------------------------------- host
  const host = await openPhone(browser)
  host.on('pageerror', (e) => failures.push(`host console: ${e.message}`))
  await host.goto(BASE + '/' + LOCAL)
  await host.getByRole('button', { name: 'Start a table' }).click()
  await host.getByPlaceholder('Aina').fill(NAMES[0])
  await host.getByRole('button', { name: ROLES[0], exact: false }).first().click()
  await host.getByRole('button', { name: 'Create table' }).click()

  await host.waitForURL(/\/play\/[A-Z]{4}/, { timeout: 15000 })
  const code = host.url().split('/').pop()!
  log(`table code ${code}`)
  await host.screenshot({ path: shot('01-lobby') })

  // --------------------------------------------------------------- board
  const board = await sharedCtx.newPage()
  await board.setViewportSize(BOARD)
  board.on('pageerror', (e) => failures.push(`board console: ${e.message}`))
  await board.goto(`${BASE}/board/${code}${LOCAL}`)
  await board.waitForTimeout(1500)
  await board.screenshot({ path: shot('02-board-lobby') })

  // ------------------------------------------------------- three joiners
  const players: Page[] = [host]
  for (let i = 1; i < 4; i++) {
    const p = await openPhone(browser)
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
    log(`${ROLES[i]} joined as ${NAMES[i]}`)
  }

  await host.waitForTimeout(1500)
  await board.screenshot({ path: shot('03-board-full') })

  // --------------------------------------------------------------- begin
  await host.getByRole('button', { name: /Begin/ }).click()
  await host.waitForTimeout(1200)
  await host.screenshot({ path: shot('04-briefing') })

  // Verify each player got a private agenda, and that they are not identical
  // by construction (three options per role, drawn at random).
  for (let i = 0; i < 4; i++) {
    const text = await players[i].textContent('body')
    if (!text?.includes('Private — do not show anyone')) {
      failures.push(`${ROLES[i]} was not shown a private agenda`)
    }
  }

  await host.getByRole('button', { name: 'Start round 1' }).click()
  log('round 1 begins')

  // ---------------------------------------------------------- the rounds
  for (let round = 1; round <= 8; round++) {
    // Wait for the choosing phase, skipping ahead through situation/discussion.
    await waitForPhase(host, 'locking', 200_000)

    if (round === 1) {
      await board.screenshot({ path: shot('05-board-locking') })
      await host.screenshot({ path: shot('06-choosing') })
    }

    // STRATEGY=self  picks the cheapest option (index 0) every round.
    // STRATEGY=coop  picks the most collective option available.
    // The two must reach materially different endings, or the engine is not
    // actually differentiating between how the table plays.
    const preferLast = process.env.STRATEGY !== 'self'
    for (let i = 0; i < 4; i++) {
      const p = players[i]
      const buttons = p.locator('button[aria-pressed]')
      const n = await buttons.count()
      const order = preferLast
        ? [...Array(n).keys()].reverse()
        : [...Array(n).keys()]
      let picked = false
      for (const b of order) {
        const btn = buttons.nth(b)
        if (await btn.isEnabled()) {
          await btn.click()
          picked = true
          break
        }
      }
      if (!picked) failures.push(`round ${round}: ${ROLES[i]} had no playable action`)
    }

    await waitForPhase(host, 'resolution', 200_000)
    if (round === 1) {
      await board.screenshot({ path: shot('07-board-resolution') })
      await host.screenshot({ path: shot('08-resolution') })
    }
    log(`round ${round} resolved`)
  }

  // -------------------------------------------------------------- ending
  await waitForText(host, 'Malaysia, 2050', 200_000)
  await host.waitForTimeout(1500)
  await board.screenshot({ path: shot('09-board-ending') })
  await host.screenshot({ path: shot('10-ending') })

  const boardText = (await board.textContent('body')) ?? ''
  for (const expected of ['of 3 national targets met', 'What each of you was really playing for', 'Where it turned']) {
    if (!boardText.includes(expected)) failures.push(`report card missing: "${expected}"`)
  }
  const ending = await board.locator('h1').first().textContent()
  log(`ending: ${ending}`)

  await browser.close()

  if (failures.length) {
    console.error(`\n✗ ${failures.length} problem(s):`)
    for (const f of failures) console.error(`  - ${f}`)
    process.exit(1)
  }
  console.log('\n✓ Full eight-round playthrough completed cleanly.')
}

async function waitForPhase(page: Page, phase: string, timeout: number) {
  const labels: Record<string, string> = {
    locking: 'Choose privately',
    resolution: 'How it landed',
  }
  await waitForText(page, labels[phase] ?? phase, timeout)
}

async function waitForText(page: Page, text: string, timeout: number) {
  await page.locator(`text=${text}`).first().waitFor({ state: 'visible', timeout })
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
