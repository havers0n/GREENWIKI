import { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '../supabaseClient'

// Расширяем Express.Request для безопасной записи user и isAdmin
declare module 'express-serve-static-core' {
  interface Request {
    user?: { id: string }
    isAdmin?: boolean
  }
}

/**
 * Проверяет JWT из заголовка Authorization и роль пользователя (profiles.role === 'admin')
 * Требуется заголовок: Authorization: Bearer <access_token>
 */
export async function isAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization || ''
    const [scheme, token] = authHeader.split(' ')

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token)
    if (userError || !userData?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const userId = userData.user.id
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    if (profile.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    req.user = { id: userId }
    req.isAdmin = true
    return next()
  } catch {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}

export default isAdmin
