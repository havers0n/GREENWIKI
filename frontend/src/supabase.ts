import { createClient } from '@supabase/supabase-js'
import type { Database } from '@my-forum/db-types'

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
)

export type Profile = Database['public']['Tables']['profiles']['Row']
export type CreateProfile = Database['public']['Tables']['profiles']['Insert']
export type UpdateProfile = Database['public']['Tables']['profiles']['Update']
