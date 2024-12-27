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
  local: { host: string; port: number }
  remote: { host: string; port: number }
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
```ts
interface IPacket {
  header: IHeader
  questions: IQuestion[]
  answers: IResourceRecord[]
  authorityRecords: IResourceRecord[]
  additionalRecords: IResourceRecord[]
}

interface IHeader {
  ID: number
  flags: IFlags
}

interface IQuestion {
  QNAME: string
  QTYPE: number
  QCLASS: number
}

interface IResourceRecord<Type extends TYPE = number> {
  NAME: string
  TYPE: number
  CLASS: number
  TTL: number
  RDATA: ArrayBufferLike

  /**
   * `rdata` has higher priority than `RDATA`
   */
  rdata:
  | CNAME_RDATA
  | MX_RDATA
  | NS_RDATA
  | PTR_RDATA
  | SOA_RDATA
  | AFSDB_RDATA
  | NAPTR_RDATA
  | SRV_RDATA
  | null
}

interface IFlags {
  QR: QR
  OPCODE: number
  AA: number
  TC: number
  RD: number
  RA: number
  Z: number
  RCODE: number
}

enum QR { /*...*/ }
enum CLASS { /*...*/ }
enum TYPE { /*...*/ }
enum OPCODE { /* ... */ }
enum RCODE { /* ... */ }
```

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

### RDATA
#### CNAME_RDATA
```ts
class CNAME_RDATA {
  constructor(
    public CNAME: string
  )

  static decode(buffer: ArrayBufferLike, byteOffset: number): CNAME_RDATA
}
```

#### MX_RDATA
```ts
class MX_RDATA {
  constructor(
    public PREFERENCE: number
  , public EXCHANGE: string
  )

  static decode(buffer: ArrayBufferLike, byteOffset: number): MX_RDATA
}
```

#### NS_RDATA
```ts
class NS_RDATA {
  constructor(
    public NSDNAME: string
  )

  static decode(buffer: ArrayBufferLike, byteOffset: number): NS_RDATA
}
```

#### PTR_RDATA
```ts
class PTR_RDATA {
  constructor(
    public PTRDNAME: string
  )

  static decode(buffer: ArrayBufferLike, byteOffset: number): PTR_RDATA
}
```

#### SOA_RDATA
```ts
class SOA_RDATA {
  constructor(
    public MNAME: string
  , public RNAME: string
  , public SERIAL: number
  , public REFRESH: number
  , public RETRY: number
  , public EXPIRE: number
  , public MINIMUM: number
  ) {}

  static decode(buffer: ArrayBufferLike, byteOffset: number): SOA_RDATA
}
```

#### AFSDB_RDATA
```ts
class AFSDB_RDATA {
  constructor(
    public SUBTYPE: number
  , public HOSTNAME: string
  )

  static decode(buffer: ArrayBufferLike, byteOffset: number): AFSDB_RDATA
}
```

#### NAPTR_RDATA
```ts
class NAPTR_RDATA {
  constructor(
    public ORDER: number
  , public PREFERENCE: number
  , public FLAGS: string
  , public SERVICES: string
  , public REGEXP: string
  , public REPLACEMENT: string
  )

  static decode(buffer: ArrayBufferLike, byteOffset: number): NAPTR_RDATA
}
```

#### SRV_RDATA
```ts
class SRV_RDATA {
  constructor(
    public PRIORITY: number
  , public WEIGHT: number
  , public PORT: number
  , public TARGET: string
  ) {}

  static decode(buffer: ArrayBufferLike, byteOffset: number): SRV_RDATA
}
```
