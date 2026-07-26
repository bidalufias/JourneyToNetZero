/**
 * Deploy the room edge function via the Supabase Management API.
 *
 * There is no Supabase CLI dependency here on purpose: the CLI is another
 * install on another machine, and the only thing actually needed is a token and
 * two files. Rebuilds first, so what ships is what the source says.
 *
 *   SUPABASE_ACCESS_TOKEN=sbp_... npm run deploy:function
 *
 * Get a token at https://supabase.com/dashboard/account/tokens
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF ?? 'dsibzzchpokqwscjrbif'
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN

if (!TOKEN) {
  console.error(
    'SUPABASE_ACCESS_TOKEN is not set.\n' +
      'Create one at https://supabase.com/dashboard/account/tokens, then:\n' +
      '  SUPABASE_ACCESS_TOKEN=sbp_... npm run deploy:function',
  )
  process.exit(1)
}

console.log('Rebuilding the bundle so the deploy matches source…')
execFileSync(process.execPath, ['tools/build-function.mjs'], { stdio: 'inherit' })

const files = ['supabase/functions/room/index.ts', 'supabase/functions/room/content.gen.ts']

const form = new FormData()
form.append(
  'metadata',
  new Blob(
    [
      JSON.stringify({
        name: 'room',
        entrypoint_path: 'index.ts',
        // The client sends the anon key as a bearer token, which is a JWT.
        verify_jwt: true,
      }),
    ],
    { type: 'application/json' },
  ),
)

for (const path of files) {
  const name = path.split('/').pop()
  form.append('file', new Blob([readFileSync(path)], { type: 'application/typescript' }), name)
  console.log(`  + ${name} (${(readFileSync(path).length / 1024).toFixed(1)} kB)`)
}

const res = await fetch(
  `https://api.supabase.com/v1/projects/${PROJECT_REF}/functions/deploy?slug=room`,
  { method: 'POST', headers: { Authorization: `Bearer ${TOKEN}` }, body: form },
)

const body = await res.text()
if (!res.ok) {
  console.error(`\nDeploy failed (${res.status}):\n${body}`)
  process.exit(1)
}

console.log(`\nDeployed. https://${PROJECT_REF}.supabase.co/functions/v1/room`)
console.log('Now set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY on Netlify and redeploy.')
