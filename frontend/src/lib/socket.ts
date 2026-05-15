import { io, Socket } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace('/api', '')
  : 'http://localhost:4000'

let socket: Socket | null = null
export function getSocket(): Socket {
  if (!socket) {
    console.log('connecting socket to:', SOCKET_URL)
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
    })
  }
  return socket
}
