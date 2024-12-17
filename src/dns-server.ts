import dgram from 'dgram'
import dnsPacket, { Packet } from 'dns-packet'
import { Emitter } from '@blackglory/structures'
import { isntUndefined } from '@blackglory/prelude'

export class DNSServer extends Emitter<{
  message: [
    query: Packet
  , reply: (response: Packet) => Promise<void>
  ]
}> {
  private socket = dgram.createSocket('udp4')

  constructor(private host: string, private port: number) {
    super()

    this.socket.on('message', (message, remoteInfo) => {
      const packet = dnsPacket.decode(message)

      if (isntUndefined(packet.id) && packet.type === 'query') {
        this.emit(
          'message'
        , packet
        , packet => {
            return new Promise<void>((resolve, reject) => {
              this.socket.send(
                dnsPacket.encode(packet)
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
          }
        )
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
