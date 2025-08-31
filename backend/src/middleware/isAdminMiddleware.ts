// src/middleware/isAdminMiddleware.ts
import { Request, Response, NextFunction } from 'express';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Мы полагаемся на то, что authMiddleware уже отработал
  // и записал данные в req.user и req.isAdmin
  if (req.isAdmin) {
    return next(); // Пользователь - админ, пропускаем дальше
  }

  return res.status(403).json({ error: 'Forbidden: Administrator access required' });
};
