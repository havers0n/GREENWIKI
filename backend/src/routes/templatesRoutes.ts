import { Router, Request, Response } from 'express'
import { supabaseAdmin } from '../supabaseClient'
import { isAdmin } from '../middleware/authMiddleware'

const router = Router()

// GET /api/templates - список шаблонов
router.get('/', isAdmin, async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('page_templates')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return res.status(500).json({ error: 'Failed to fetch templates' })
    return res.status(200).json({ data: data ?? [] })
  } catch {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

// POST /api/templates - создать шаблон
router.post('/', isAdmin, async (req: Request, res: Response) => {
  try {
    const { title, description, preview_url, blocks, created_by } = req.body ?? {}
    if (!title || !Array.isArray(blocks)) {
      return res.status(400).json({ error: 'title and blocks[] are required' })
    }
    const payload = {
      title,
      description: description ?? null,
      preview_url: preview_url ?? null,
      blocks,
      created_by: created_by ?? req.user?.id ?? null,
    }

    const { data, error } = await supabaseAdmin
      .from('page_templates')
      .insert(payload as any)
      .select('*')
      .single()

    if (error) return res.status(400).json({ error: 'Failed to create template', details: error.message })
    return res.status(201).json({ data })
  } catch {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

// GET /api/templates/:id - один шаблон
router.get('/:id', isAdmin, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('page_templates')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (error) return res.status(404).json({ error: 'Template not found' })
    return res.status(200).json({ data })
  } catch {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

export default router


