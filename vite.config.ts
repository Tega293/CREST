import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const rapidApiProxy = (apiKey: string): Plugin => {
  const handle = async (req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse) => {
    if (req.method !== 'GET' || !req.url?.startsWith('/api/watches')) return false
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')
    if (!apiKey) {
      res.statusCode = 503
      res.end(JSON.stringify({ error: 'RapidAPI key is not configured. Add RAPIDAPI_KEY to .env.local and restart the server.' }))
      return true
    }

    const apiHost = 'watch-database1.p.rapidapi.com'
    const headers = { 'x-rapidapi-host': apiHost, 'x-rapidapi-key': apiKey }
    const upstream = async (path: string) => {
      const response = await fetch(`https://${apiHost}${path}`, { headers })
      if (!response.ok) throw new Error(`RapidAPI returned ${response.status}`)
      return response.json() as Promise<unknown>
    }
    const listFrom = (value: unknown): unknown[] => {
      if (Array.isArray(value)) return value
      if (!value || typeof value !== 'object') return []
      const record = value as Record<string, unknown>
      for (const key of ['data', 'watches', 'watch', 'results', 'items', 'make', 'makes']) {
        if (Array.isArray(record[key])) return record[key] as unknown[]
      }
      return []
    }

    try {
      const makeResponse = await upstream('/make')
      const makes = listFrom(makeResponse)
      const watches: unknown[] = []
      const preferredMakes = ['Rolex', 'Omega', 'Patek Philippe', 'Cartier', 'Audemars Piguet', 'Seiko', 'Longines', 'Tudor', 'TAG Heuer', 'Breitling', 'Jaeger-LeCoultre', 'IWC']
      const orderedMakes = [...makes].sort((left, right) => {
        const nameOf = (value: unknown) => value && typeof value === 'object' ? String((value as Record<string, unknown>).makeName || (value as Record<string, unknown>).brand || '') : ''
        const leftRank = preferredMakes.indexOf(nameOf(left))
        const rightRank = preferredMakes.indexOf(nameOf(right))
        return (leftRank < 0 ? preferredMakes.length : leftRank) - (rightRank < 0 ? preferredMakes.length : rightRank)
      })
      for (const make of orderedMakes) {
        if (watches.length >= 200) break
        if (!make || typeof make !== 'object') continue
        const record = make as Record<string, unknown>
        const id = record.id ?? record.makeID ?? record.makeId ?? record.make_id
        if (id === undefined || id === null) continue
        const remaining = Math.min(40, 200 - watches.length)
        const data = await upstream(`/watches/make/${encodeURIComponent(String(id))}/page/1/limit/${remaining}`)
        watches.push(...listFrom(data).slice(0, remaining))
      }
      res.statusCode = 200
      res.end(JSON.stringify({ data: watches.slice(0, 200), count: Math.min(watches.length, 200) }))
    } catch (error) {
      res.statusCode = 502
      res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Unable to load watch records from RapidAPI.' }))
    }
    return true
  }

  return {
    name: 'crest-rapidapi-watch-proxy',
    configureServer(server) { server.middlewares.use((req, res, next) => { void handle(req, res).then(handled => { if (!handled) next() }).catch(next) }) },
    configurePreviewServer(server) { server.middlewares.use((req, res, next) => { void handle(req, res).then(handled => { if (!handled) next() }).catch(next) }) },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return { plugins: [react(), rapidApiProxy(env.RAPIDAPI_KEY || '')] }
})
