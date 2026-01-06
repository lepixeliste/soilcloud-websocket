import cors from 'cors'
import express, { Request, Response } from 'express'
import { createServer } from 'http'
import { config as dotenv } from 'dotenv'
import { json as jsonParser, urlencoded as urlParser } from 'body-parser'
import { join } from 'path'
import { createWebSocket } from './socket'

const envPath = process.env.NODE_ENV === 'development' ? `.env.local` : `.env`
dotenv({ path: envPath })

const envport = Number.parseInt(process.env.PORT ?? '3000')
const app = express()
const server = createServer(app)
const io = createWebSocket(server)

app.enable('trust proxy')
app.use(cors())

const limit = 5e7
app.use(
  jsonParser({
    limit: limit
  })
)
app.use(
  urlParser({
    limit: limit,
    extended: true
  })
)

const publicPath = join(__dirname, '..', 'public')
app.use('/public', express.static(publicPath))
app.get('*', (req: Request, res: Response<void>) => {
  const indexPath = join(__dirname, '..', 'public', 'index.html')
  res.sendFile(indexPath)
})

app.post('/message', (req: Request, res: Response<{sent: boolean}>) => {
  const json = req.body ?? {}
  const s = io.emit('message', {
    user: json.userId ?? null,
    message: json.message ?? '',
    timestamp: Date.now()
  })
  res.json({ sent: s })
})

server.listen(envport, () => {
  const timestamp = new Date()
  console.log(
    `${timestamp.toUTCString()} > Ready on http://localhost:${envport}`
  )
})
