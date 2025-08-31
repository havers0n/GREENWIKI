import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@my-forum/db-types'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL) {
  throw new Error('SUPABASE_URL is not set')
}
if (!SUPABASE_ANON_KEY) {
  throw new Error('SUPABASE_ANON_KEY is not set')
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
}

export const supabasePublic: SupabaseClient<Database> = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: { persistSession: false },
    // Увеличиваем таймаут для надежности
    global: {
      fetch: (input, init) => {
        const controller = new AbortController();
        const signal = controller.signal;
        const timeout = setTimeout(() => controller.abort(), 60000);

        return fetch(input, { ...init, signal }).finally(() => clearTimeout(timeout));
      },
    },
  }
)

export const supabaseAdmin: SupabaseClient<Database> = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false },
    // Увеличиваем таймаут для надежности
    global: {
      fetch: (input, init) => {
        const controller = new AbortController();
        const signal = controller.signal;
        const timeout = setTimeout(() => controller.abort(), 60000);

        return fetch(input, { ...init, signal }).finally(() => clearTimeout(timeout));
      },
    },
  }
)
