import { Server as HttpServer } from 'http'
import { Server as SocketServer } from 'socket.io'

export function createWebSocket(httpServer: HttpServer) {
  const _sockets: { socket: string; id: string | number | null }[] = []
  const io = new SocketServer(httpServer, {
    cors: {
      origin: '*'
    }
  })
  io.on('connection', (socket) => {
    socket.on('user', (data) => {
      const s = _sockets.findIndex(
        (client) => client.socket === socket.id || client.id === data.id
      )
      if (s < 0) {
        _sockets.push({
          socket: socket.id,
          id: data.id
        })
        io.emit('connected', {
          id: data.id
        })
      } else if (_sockets[s].socket !== socket.id) {
        _sockets.splice(s, 1)
        _sockets.push({
          socket: socket.id,
          id: data.id
        })
      }
      io.emit('users', _sockets)
      io.emit('time', new Date().toUTCString())
    })

    socket.on('message', (msg) => {
      io.emit('message', msg)
    })

    socket.on('disconnect', () => {
      const s = _sockets.findIndex((client) => client.socket === socket.id)
      if (s < 0) {
        _sockets.splice(s, 1)
        io.emit('users', _sockets)
      }
    })

    setInterval(() => {
      io.emit('time', new Date().toUTCString())
    }, 60e3)
  })
  return io
}
