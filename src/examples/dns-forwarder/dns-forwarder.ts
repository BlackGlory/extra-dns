import { DNSServer } from '@src/dns-server.js'
import { DNSClient } from '@src/dns-client.js'

export async function startDNSForwarder({ local, remote }: {
  local: {
    host: string
    port: number
  }
  remote: {
    host: string
    port: number
  }
}): Promise<() => Promise<void>> {
  const server = new DNSServer(local.host, local.port)
  const client = new DNSClient(remote.host, remote.port)

  server.on('query', async (query, respond) => {
    await respond(await client.resolve(query))
  })

  return await server.listen()
}
