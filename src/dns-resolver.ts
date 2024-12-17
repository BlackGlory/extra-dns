import dgram from 'dgram'
import dnsPacket, { Packet } from 'dns-packet'
import { assert, go, isntUndefined } from '@blackglory/prelude'
import { Deferred } from 'extra-promise'
import { withAbortSignal } from 'extra-abort'

interface IPending {
  users: number
  readonly deferred: Deferred<Packet>
}

export class DNSResolver {
  private pendings = new Map<number, IPending>()
  private socket = dgram.createSocket('udp4')

  constructor(private host: string, private port: number) {
    this.socket.on('message', message => {
      const packet = dnsPacket.decode(message)
      if (isntUndefined(packet.id) && packet.type === 'response') {
        const pending = this.pendings.get(packet.id)
        if (pending) {
          pending.deferred.resolve(packet)
        }
      }
    })
  }

  async resolve(
    query: Packet
  , signal?: AbortSignal
  ): Promise<Packet> {
    signal?.throwIfAborted()

    assert(query.type === 'query')

    const id = query.id
    assert(isntUndefined(id))

    const pending: IPending = go(() => {
      const pending = this.pendings.get(id)
      if (pending) {
        return pending
      } else {
        const pending = {
          deferred: new Deferred<Packet>()
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
          this.socket.send(
            dnsPacket.encode(query)
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
