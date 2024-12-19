import dgram from 'dgram'
import { assert, go } from '@blackglory/prelude'
import { Deferred } from 'extra-promise'
import { withAbortSignal } from 'extra-abort'
import { IPacket, QR } from './packet/index.js'
import { decodePacket, encodePacket } from './packet/packet.js'

interface IPending {
  users: number
  readonly deferred: Deferred<IPacket>
}

export class DNSClient {
  private pendings = new Map<number, IPending>()

  constructor(
    private host: string
  , private port: number
  , private socket: dgram.Socket = dgram.createSocket('udp4')
  ) {
    this.socket.on('message', message => {
      const packet = decodePacket(message.buffer)

      if (packet.header.flags.QR === QR.Response) {
        const pending = this.pendings.get(packet.header.id)
        if (pending) {
          pending.deferred.resolve(packet)
        }
      }
    })
  }

  async resolve(
    query: IPacket
  , signal?: AbortSignal
  ): Promise<IPacket> {
    signal?.throwIfAborted()

    assert(query.header.flags.QR === QR.Query)

    const id = query.header.id

    const pending: IPending = go(() => {
      const pending = this.pendings.get(id)
      if (pending) {
        return pending
      } else {
        const pending = {
          deferred: new Deferred<IPacket>()
        , users: 0
        }
        this.pendings.set(id, pending)
        return pending
      }
    })

    pending.users++
    try {
      return await withAbortSignal(signal, async () => {
        await new Promise<void>((resolve, reject) => {
          const buffer = encodePacket(query)

          this.socket.send(
            new Uint8Array(buffer)
          , this.port
          , this.host
          , err => {
              if (err) {
                reject(err)
              } else {
                resolve()
              }
            }
          )
        })

        return await pending.deferred
      })
    } finally {
      if (--pending.users === 0) {
        this.pendings.delete(id)
      }
    }
  }
}
