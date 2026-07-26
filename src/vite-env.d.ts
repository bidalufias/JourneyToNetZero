/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase project URL. Unset falls back to the local one-browser transport. */
  readonly VITE_SUPABASE_URL?: string
  /** Supabase publishable (anon) key. */
  readonly VITE_SUPABASE_ANON_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
