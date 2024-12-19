# extra-dns
## Install
```sh
npm install --save extra-dns
# or
yarn add extra-dns
```

## Usage
```ts
import { DNSServer, DNSClient } from 'extra-dns'

const stopDNSForwarder = await startDNSForwarder({
  local: { host: '127.0.0.1', port: 53 }
, remote: { host: '8.8.8.8', port: 53 }
})

async function startDNSForwarder({ local, remote }: {
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
```

## API
### DNSServer
```ts
import { Emitter } from '@blackglory/structures'

class DNSServer extends Emitter<{
  query: [
    query: IPacket
  , respond: (response: IPacket) => Promise<void>
  ]
}> {
  constructor(host: string, port: number, socket?: dgram.Socket)

  listen(): Promise<() => Promise<void>>
}
```

### DNSClient
```ts
class DNSClient {
  constructor(host: string, port: number, socket?: dgram.Socket)

  resolve(query: Packet, signal?: AbortSignal): Promise<Packet>
}
```
