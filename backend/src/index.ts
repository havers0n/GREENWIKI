import dotenv from 'dotenv'
dotenv.config()

import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'

import layoutRouter from './routes/layoutRoutes'
import categoryRouter from './routes/categoryRoutes'
import sectionRouter from './routes/sectionRoutes'
import pageRouter from './routes/pageRoutes'

const app = express()

app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ ok: true })
})

app.use('/api/layout', layoutRouter)
app.use('/api/categories', categoryRouter)
app.use('/api/sections', sectionRouter)
app.use('/api/pages', pageRouter)

app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' })
})

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const e = err as { statusCode?: number; message?: string; details?: unknown }
  const status = e?.statusCode || 500
  res.status(status).json({
    error: e?.message || 'Internal Server Error',
    details: e?.details ?? undefined
  })
})

const PORT = Number(process.env.PORT) || 3001
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API server listening on port ${PORT}`)
})
