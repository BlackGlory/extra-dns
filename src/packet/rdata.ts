import { decodeDomainName, encodeDomainName } from './domain-name.js'
import { concatBuffers, uint16ArrayBigEndian, uint32ArrayBigEndian, readUint16LittleEndian, readUint32LittleEndian } from './utils.js'
import { decodeCharacterString, encodeCharacterString } from './character-string.js'
import { go } from '@blackglory/prelude'

export interface IRDATADecoder<T> {
  decode(buffer: ArrayBufferLike, byteOffset: number): T
}

interface IRDATAEncoder {
  _encode(
    byteOffset: number
  , messageCompressionDict: Map<string, number>
  ): ArrayBufferLike
}

// RFC 1035
export class CNAME_RDATA implements IRDATAEncoder {
  constructor(
    public CNAME: string // domain-name
  ) {}

  static decode(buffer: ArrayBufferLike, byteOffset: number): CNAME_RDATA {
    const cname = decodeDomainName(buffer, byteOffset).domainName

    return new CNAME_RDATA(cname)
  }

  _encode(
    byteOffset: number
  , messageCompressionDict: Map<string, number>
  ): ArrayBufferLike {
    return encodeDomainName(this.CNAME, byteOffset, messageCompressionDict, true)
  }
}

// RFC 1035
export class MX_RDATA implements IRDATAEncoder {
  constructor(
    public PREFERENCE: number // 2 bytes, 16 bits
  , public EXCHANGE: string // domain-name
  ) {}

  static decode(buffer: ArrayBufferLike, byteOffset: number): MX_RDATA {
    const [PREFERENCE] = readUint16LittleEndian(buffer, byteOffset)
    byteOffset += 1 * Uint16Array.BYTES_PER_ELEMENT

    const EXCHANGE = decodeDomainName(buffer, byteOffset).domainName

    return new MX_RDATA(PREFERENCE, EXCHANGE)
  }

  _encode(
    byteOffset: number
  , messageCompressionDict: Map<string, number>
  ): ArrayBufferLike {
    const preference = uint16ArrayBigEndian([this.PREFERENCE])
    byteOffset += preference.byteLength

    const exchange = encodeDomainName(
      this.EXCHANGE
    , byteOffset
    , messageCompressionDict
    , true
    )
    byteOffset += exchange.byteLength

    return concatBuffers([
      preference.buffer
    , exchange
    ])
  }
}

// RFC 1035
export class NS_RDATA implements IRDATAEncoder {
  constructor(
    public NSDNAME: string // domain-name
  ) {}

  static decode(buffer: ArrayBufferLike, byteOffset: number): NS_RDATA {
    const NSDNAME = decodeDomainName(buffer, byteOffset).domainName

    return new NS_RDATA(NSDNAME)
  }

  _encode(
    byteOffset: number
  , messageCompressionDict: Map<string, number>
  ): ArrayBufferLike {
    return encodeDomainName(this.NSDNAME, byteOffset, messageCompressionDict, true)
  }
}

// RFC 1035
export class PTR_RDATA implements IRDATAEncoder {
  constructor(
    public PTRDNAME: string // domain-name
  ) {}

  static decode(buffer: ArrayBufferLike, byteOffset: number): PTR_RDATA {
    const PTRDNAME = decodeDomainName(buffer, byteOffset).domainName

    return new PTR_RDATA(PTRDNAME)
  }

  _encode(
    byteOffset: number
  , messageCompressionDict: Map<string, number>
  ): ArrayBufferLike {
    return encodeDomainName(this.PTRDNAME, byteOffset, messageCompressionDict, true)
  }
}

// RFC 1035
export class SOA_RDATA implements IRDATAEncoder {
  constructor(
    public MNAME: string // domain-name
  , public RNAME: string // domain-name
  , public SERIAL: number // 4 bytes, 32 bits
  , public REFRESH: number // 4 bytes, 32 bits
  , public RETRY: number // 4 bytes, 32 bits
  , public EXPIRE: number // 4 bytes, 32 bits
  , public MINIMUM: number // 4 bytes, 32 bits
  ) {}

  static decode(buffer: ArrayBufferLike, byteOffset: number): SOA_RDATA {
    const MNAME = go(() => {
      const { domainName, newByteOffset } = decodeDomainName(buffer, byteOffset)
      byteOffset = newByteOffset
      return domainName
    })

    const RNAME = go(() => {
      const { domainName, newByteOffset } = decodeDomainName(buffer, byteOffset)
      byteOffset = newByteOffset
      return domainName
    })

    const [
      SERIAL
    , REFRESH
    , RETRY
    , EXPIRE
    , MINIMUM
    ] = readUint32LittleEndian(buffer, byteOffset, 5)
    byteOffset += 5 * Uint32Array.BYTES_PER_ELEMENT

    return new SOA_RDATA(
      MNAME
    , RNAME
    , SERIAL
    , REFRESH
    , RETRY
    , EXPIRE
    , MINIMUM
    )
  }

  _encode(
    byteOffset: number
  , messageCompressionDict: Map<string, number>
  ): ArrayBufferLike {
    const mname = encodeDomainName(this.MNAME, byteOffset, messageCompressionDict, true)
    byteOffset += mname.byteLength

    const rname = encodeDomainName(this.RNAME, byteOffset, messageCompressionDict, true)
    byteOffset += rname.byteLength

    return concatBuffers([
      mname
    , rname
    , uint32ArrayBigEndian([
        this.SERIAL
      , this.REFRESH
      , this.RETRY
      , this.EXPIRE
      , this.MINIMUM
      ]).buffer
    ])
  }
}

// RFC 1183
export class AFSDB_RDATA implements IRDATAEncoder {
  constructor(
    public SUBTYPE: number // 2 bytes, 16 bits
  , public HOSTNAME: string // domain-name
  ) {}

  static decode(buffer: ArrayBufferLike, byteOffset: number): AFSDB_RDATA {
    const [SUBTYPE] = readUint16LittleEndian(buffer, byteOffset)
    byteOffset += 1 * Uint16Array.BYTES_PER_ELEMENT

    const HOSTNAME = decodeDomainName(buffer, byteOffset).domainName

    return new AFSDB_RDATA(SUBTYPE, HOSTNAME)
  }

  _encode(
    byteOffset: number
  , messageCompressionDict: Map<string, number>
  ): ArrayBufferLike {
    const subtype = uint16ArrayBigEndian([this.SUBTYPE])
    byteOffset += subtype.byteLength

    const hostname = encodeDomainName(
      this.HOSTNAME
    , byteOffset
    , messageCompressionDict
    , false
    )
    byteOffset += hostname.byteLength

    return concatBuffers([
      subtype.buffer
    , hostname
    ])
  }
}

// RFC 3403
export class NAPTR_RDATA implements IRDATAEncoder {
  constructor(
    public ORDER: number // 2 bytes, 16 bits
  , public PREFERENCE: number // 2 bytes, 16 bits
  , public FLAGS: string // character-string
  , public SERVICES: string // character-string
  , public REGEXP: string // character-string
  , public REPLACEMENT: string // domain-name
  ) {}

  static decode(buffer: ArrayBufferLike, byteOffset: number): NAPTR_RDATA {
    const [ORDER, PREFERENCE] = readUint16LittleEndian(buffer, byteOffset, 2)
    byteOffset += 2 * Uint16Array.BYTES_PER_ELEMENT

    const FLAGS = go(() => {
      const { characterString, newByteOffset } = decodeCharacterString(buffer, byteOffset)
      byteOffset = newByteOffset
      return characterString
    })

    const SERVICES = go(() => {
      const { characterString, newByteOffset } = decodeCharacterString(buffer, byteOffset)
      byteOffset = newByteOffset
      return characterString
    })

    const REGEXP = go(() => {
      const { characterString, newByteOffset } = decodeCharacterString(buffer, byteOffset)
      byteOffset = newByteOffset
      return characterString
    })

    const REPLACEMENT = go(() => {
      const { domainName, newByteOffset } = decodeDomainName(buffer, byteOffset)
      byteOffset = newByteOffset
      return domainName
    })

    return new NAPTR_RDATA(
      ORDER
    , PREFERENCE
    , FLAGS
    , SERVICES
    , REGEXP
    , REPLACEMENT
    )
  }

  _encode(
    byteOffset: number
  , messageCompressionDict: Map<string, number>
  ): ArrayBufferLike {
    const order = uint16ArrayBigEndian([this.ORDER])
    byteOffset += order.byteLength

    const preference = uint16ArrayBigEndian([this.PREFERENCE])
    byteOffset += preference.byteLength

    const flags = encodeCharacterString(this.FLAGS)
    byteOffset += flags.byteLength

    const services = encodeCharacterString(this.SERVICES)
    byteOffset += services.byteLength

    const regexp = encodeCharacterString(this.REGEXP)
    byteOffset += regexp.byteLength

    const replacement = encodeDomainName(
      this.REPLACEMENT
    , byteOffset
    , messageCompressionDict
    , false
    )
    byteOffset += replacement.byteLength

    return concatBuffers([
      order.buffer
    , preference.buffer
    , flags
    , services
    , regexp
    , replacement
    ])
  }
}

// RFC 2782
export class SRV_RDATA implements IRDATAEncoder {
  constructor(
    public PRIORITY: number // 2 bytes, 16 bits
  , public WEIGHT: number // 2 bytes, 16 bits
  , public PORT: number // 2 bytes, 16 bits
  , public TARGET: string // domain-name
  ) {}

  static decode(buffer: ArrayBufferLike, byteOffset: number): SRV_RDATA {
    const [PRIORITY, WEIGHT, PORT] = readUint16LittleEndian(buffer, byteOffset, 3)
    byteOffset += 3 * Uint16Array.BYTES_PER_ELEMENT

    const TARGET = decodeDomainName(buffer, byteOffset).domainName

    return new SRV_RDATA(PRIORITY, WEIGHT, PORT, TARGET)
  }

  _encode(
    byteOffset: number
  , messageCompressionDict: Map<string, number>
  ): ArrayBufferLike {
    const priority = uint16ArrayBigEndian([this.PRIORITY])
    byteOffset += priority.byteLength

    const weight = uint16ArrayBigEndian([this.WEIGHT])
    byteOffset += weight.byteLength

    const port = uint16ArrayBigEndian([this.PORT])
    byteOffset += port.byteLength

    const target = encodeDomainName(this.TARGET, byteOffset, messageCompressionDict, false)
    byteOffset += target.byteLength

    return concatBuffers([
      priority.buffer
    , weight.buffer
    , port.buffer
    , target
    ])
  }
}
