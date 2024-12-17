import { Logger } from 'extra-logger'
import dgram from 'dgram'
import dnsPacket from 'dns-packet'

export function startServer({ localServer, remoteServer }: {
  remoteServer: {
    host: string
    port: number
  }
  localServer: {
    host: string
    port: number
  }
  logger: Logger
}): void {
  const socket = dgram.createSocket('udp4')

  const idToRemoteInfo = new Map<number, dgram.RemoteInfo>()
  socket.on('message', (message, remoteInfo) => {
    const packet = dnsPacket.decode(message)

    if (packet.id) {
      switch (packet.type) {
        case 'query': {
          if (!idToRemoteInfo.has(packet.id)) {
            idToRemoteInfo.set(packet.id, remoteInfo)
            socket.send(message, remoteServer.port, remoteServer.host)
          }

          break
        }
        case 'response': {
          const remoteInfo = idToRemoteInfo.get(packet.id)
          if (remoteInfo) {
            socket.send(message, remoteInfo.port, remoteInfo.address)
            idToRemoteInfo.delete(packet.id)
          }

          break
        }
      }
    }
  })

  socket.bind(localServer.port, localServer.host)
}
