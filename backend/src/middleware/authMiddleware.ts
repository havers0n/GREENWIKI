// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../supabaseClient'; // Убедитесь, что путь правильный
import { UserProfile } from '@my-forum/db-types'; // Импортируем наш тип

// 1. Правильно расширяем глобальный неймспейс Express
declare global {
  namespace Express {
    interface Request {
      user?: UserProfile; // Теперь req.user будет иметь правильный тип
      isAdmin?: boolean;
      token?: string; // Сохраняем токен для проброса в сервисы
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // 2. Получаем профиль пользователя, чтобы узнать его роль
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, role, username')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      // Важно: если профиля нет, пользователь не может быть авторизован в системе
      return res.status(403).json({ error: 'User profile not found or inaccessible' });
    }

    // 3. Записываем в req.user объект, соответствующий типу UserProfile
    req.user = profile;
    req.isAdmin = profile.role === 'admin'; // Определяем админа по роли из профиля
    req.token = token; // Сохраняем токен для использования в сервисах

    next();
  } catch (error) {
    if (error instanceof Error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    } else {
        res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};
