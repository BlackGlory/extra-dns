import { Logger } from 'extra-logger'
import { DNSResolver } from './dns-resolver.js'
import { DNSServer } from './dns-server.js'
import { log } from '@blackglory/prelude'

export async function startServer({ localServer, remoteServer }: {
  remoteServer: {
    host: string
    port: number
  }
  localServer: {
    host: string
    port: number
  }
  logger: Logger
}): Promise<void> {
  const resolver = new DNSResolver(remoteServer.host, remoteServer.port)

  const server = new DNSServer(localServer.host, localServer.port)
  server.on('message', async (query, reply) => {
    log('query', query)
    await reply(log('response', await resolver.resolve(query)))
  })

  await server.listen()
}
