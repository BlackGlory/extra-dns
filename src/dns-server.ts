import dgram from 'dgram'
import { Emitter } from '@blackglory/structures'
import { IPacket, QR } from './packet/index.js'
import { decodePacket, encodePacket } from './packet/packet.js'

export class DNSServer extends Emitter<{
  query: [
    query: IPacket
  , respond: (response: IPacket) => Promise<void>
  ]
}> {
  constructor(
    private host: string
  , private port: number
  , private socket: dgram.Socket = dgram.createSocket('udp4')
  ) {
    super()

    this.socket.on('message', (message, remoteInfo) => {
      const packet = decodePacket(message.buffer)

      if (packet.header.flags.QR === QR.Query) {
        this.emit('query', packet, packet => {
          return new Promise<void>((resolve, reject) => {
            this.socket.send(
              new Uint8Array(encodePacket(packet))
            , remoteInfo.port
            , remoteInfo.address
            , err => {
                if (err) {
                  reject(err)
                } else {
                  resolve()
                }
              }
            )
          })
        })
      }
    })
  }

  async listen(): Promise<() => Promise<void>> {
    await new Promise<void>((resolve, reject) => {
      this.socket.addListener('error', reject)

      this.socket.bind(this.port, this.host, () => {
        this.socket.removeListener('error', reject)
        resolve()
      })
    })

    return () => new Promise(resolve => this.socket.close(resolve))
  }
}
