import { createClient } from '@supabase/supabase-js'
import type { Database } from '@my-forum/db-types'

// Проверяем наличие переменных окружения
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔧 Supabase Config Check:');
console.log('URL:', supabaseUrl ? 'present' : 'MISSING');
console.log('KEY:', supabaseAnonKey ? 'present' : 'MISSING');

// Создаем заглушку для случаев, когда Supabase не настроен
const createSupabaseMock = () => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signUp: () => Promise.resolve({ error: { message: 'Supabase не настроен' } }),
    signInWithPassword: () => Promise.resolve({ error: { message: 'Supabase не настроен' } }),
    signOut: () => Promise.resolve({ error: null })
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: { message: 'Supabase не настроен' } })
      })
    }),
    insert: () => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: { message: 'Supabase не настроен' } })
      })
    }),
    update: () => ({
      eq: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: { message: 'Supabase не настроен' } })
        })
      })
    })
  })
});

// Создаем экземпляр Supabase
export const supabase = (!supabaseUrl || !supabaseAnonKey)
  ? createSupabaseMock() as any
  : createClient<Database>(supabaseUrl, supabaseAnonKey)

export type Profile = Database['public']['Tables']['profiles']['Row']
export type CreateProfile = Database['public']['Tables']['profiles']['Insert']
export type UpdateProfile = Database['public']['Tables']['profiles']['Update']
