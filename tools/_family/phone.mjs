// One phone (or the TV) in a shared headless Chromium, driven one command at a time.
// Usage: node tools/_family/phone.mjs <who> <cmd> [arg]
//   who:  father | mother | son | daughter | tv
//   cmd:  open [path]   open (or reopen) this person's screen at a path, default /play
//         look          screenshot + what the screen says + what can be tapped
//         tap "TEXT"    tap the button or text that says TEXT, then look
//         type "TEXT"   type TEXT into the text box on the screen, then look
//         key "Space"   press a key (the TV's remote), then look
//         say "TEXT"    say something out loud in the living room
//         hear          what people in the living room have said lately
import { chromium } from 'playwright'
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs'

// Where this run's screenshots and living-room chat go. One folder per
// playtest, so two runs never share a chat.
const ROOT = process.env.FAMILY_ROOT || '/tmp/claude-0/-home-user-JourneyToNetZero/d7eef4b3-0dfc-5a56-9820-99faa40be251/scratchpad/family'
const SHOTS = `${ROOT}/shots`
const CHAT = `${ROOT}/chat.log`
mkdirSync(SHOTS, { recursive: true })

const [who, cmd, arg = ''] = process.argv.slice(2)
if (!who || !cmd) {
  console.log('usage: phone.mjs <who> <cmd> [arg]')
  process.exit(1)
}

const stamp = () => new Date().toISOString().slice(11, 19)

function say(text) {
  appendFileSync(CHAT, `${stamp()} [${who}] ${text}\n`)
}
function hear(n = 20) {
  if (!existsSync(CHAT)) return '(nobody has said anything yet)'
  const lines = readFileSync(CHAT, 'utf8').trim().split('\n')
  return lines.slice(-n).join('\n')
}

if (cmd === 'say') {
  say(arg)
  console.log(`You said: ${arg}`)
  console.log('\nLATELY IN THE ROOM:\n' + hear(8))
  process.exit(0)
}
if (cmd === 'hear') {
  console.log(hear(25))
  process.exit(0)
}

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222')
const context = browser.contexts()[0]

async function findPage() {
  for (const p of context.pages()) {
    try {
      const name = await p.evaluate(() => window.name)
      if (name === who) return p
    } catch {
      /* a page that is closing */
    }
  }
  return null
}

async function look(page) {
  await page.waitForTimeout(700)
  const n = readdirSync(SHOTS).filter((f) => f.startsWith(who + '-')).length + 1
  const file = `${SHOTS}/${who}-${String(n).padStart(3, '0')}.png`
  await page.screenshot({ path: file })
  const text = await page.evaluate(() => {
    const t = document.body.innerText || ''
    return t.replace(/\n{3,}/g, '\n\n').trim()
  })
  const buttons = await page.evaluate(() =>
    Array.from(document.querySelectorAll('button, a, [role=button], input'))
      .filter((el) => {
        const r = el.getBoundingClientRect()
        const s = getComputedStyle(el)
        return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && !el.disabled
      })
      .map((el) =>
        el.tagName === 'INPUT'
          ? `[text box: ${el.placeholder || el.getAttribute('aria-label') || ''}]`
          : (el.innerText || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim(),
      )
      .filter(Boolean),
  )
  console.log(`SCREENSHOT: ${file}`)
  console.log(`\nWHAT THE SCREEN SAYS:\n${text.slice(0, 3000)}`)
  console.log(`\nWHAT YOU CAN TAP: ${buttons.map((b) => `[${b}]`).join(' ') || '(nothing)'}`)
  const recent = hear(6)
  if (recent) console.log(`\nLATELY IN THE ROOM:\n${recent}`)
}

let page = await findPage()

if (cmd === 'open') {
  const path = arg || '/play'
  if (!page) {
    page = await context.newPage()
    await page.setViewportSize(who === 'tv' ? { width: 1600, height: 900 } : { width: 390, height: 844 })
  }
  await page.goto(`http://127.0.0.1:5173${path}`, { waitUntil: 'load' })
  await page.evaluate((name) => {
    window.name = name
  }, who)
  await look(page)
} else {
  if (!page) {
    console.log(`${who} has no screen open yet. Run: open`)
    process.exit(1)
  }
  if (cmd === 'look') {
    await look(page)
  } else if (cmd === 'tap') {
    const t = arg.trim()
    const byRole = page.getByRole('button', { name: new RegExp(escape(t), 'i') }).first()
    let target = byRole
    if (!(await byRole.count())) target = page.getByText(new RegExp(escape(t), 'i')).first()
    if (!(await target.count())) {
      console.log(`Nothing on the screen says "${t}".`)
      await look(page)
    } else {
      await target.scrollIntoViewIfNeeded()
      await target.click()
      await look(page)
    }
  } else if (cmd === 'type') {
    const input = page.locator('input:visible').first()
    if (!(await input.count())) {
      console.log('There is no text box on the screen.')
    } else {
      await input.fill(arg)
    }
    await look(page)
  } else if (cmd === 'key') {
    await page.bringToFront()
    await page.keyboard.press(arg)
    await look(page)
  } else {
    console.log(`unknown command ${cmd}`)
  }
}

function escape(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

await browser.close()
