import { decodeDomainName, encodeDomainName } from './domain-name.js'
import { concatBuffers, uint16ArrayBigEndian, uint32ArrayBigEndian, readUint16LittleEndian, readUint32LittleEndian } from './utils.js'
import { TYPE } from './constants.js'
import { go } from '@blackglory/prelude'
import { A_RDATA, AAAA_RDATA, AFSDB_RDATA, CNAME_RDATA, IRDATADecoder, MX_RDATA, NAPTR_RDATA, NS_RDATA, PTR_RDATA, SOA_RDATA, SRV_RDATA } from './rdata.js'

// 消息压缩的存在使得DNS服务器在面对新的资源记录类型时丧失兼容性(由于RDATA无法解析, 指针将指向错误的位置),
// RFC 3597定义了面对未知DNS资源记录类型时应采取的标准做法:
// DNS服务器应该仅对知名的资源记录类型使用消息压缩, "知名"被定义为该资源记录类型被写在在RFC 1035里.

// 排除掉RFC 1035中实验性的和过时的资源记录类型, 以及RDATA中不包含域名字段的资源记录类型,
// 剩余的资源记录类型为:
// CNAME, MX, NS, PTR, SOA

// RFC 3597还要求实现这些资源记录类型的解压:
// RP, AFSDB, RT, SIG, PX, NXT, NAPTR, SRV
// 其中RP, RT, SIG, PX, NXT被IANA认为是过时的资源记录类型:
// https://en.wikipedia.org/wiki/List_of_DNS_record_types#Obsolete_record_types

type RDATA =
| A_RDATA
| AAAA_RDATA
| CNAME_RDATA
| MX_RDATA
| NS_RDATA
| PTR_RDATA
| SOA_RDATA
| AFSDB_RDATA
| NAPTR_RDATA
| SRV_RDATA

export interface IResourceRecord {
  NAME: string // domain-name
  TYPE: number // 2 bytes
  CLASS: number // 2 bytes
  TTL: number // 4 bytes, 32 bits
  // RDLENGTH: number // 2 bytes, 16 bits
  RDATA: ArrayBufferLike // 缓冲区, 长度由RDLENGTH定义

  /**
   * `rdata` has higher priority than `RDATA`
   */
  rdata?: RDATA | null
}

export function encodeResourceRecord(
  resourceRecord: IResourceRecord
, byteOffset: number
, messageCompressionDict: Map<string, number>
): ArrayBuffer {
  const name = encodeDomainName(
    resourceRecord.NAME
  , byteOffset
  , messageCompressionDict
  , true
  )
  byteOffset += name.byteLength

  const type = uint16ArrayBigEndian([resourceRecord.TYPE, resourceRecord.CLASS])
  byteOffset += type.byteLength

  const ttl = uint32ArrayBigEndian([resourceRecord.TTL])
  byteOffset += ttl.byteLength

  // RLENGTH
  byteOffset += 1 * Uint16Array.BYTES_PER_ELEMENT

  const rdata = resourceRecord.rdata
    ? resourceRecord.rdata._encode(byteOffset, messageCompressionDict)
    : resourceRecord.RDATA
  byteOffset += rdata.byteLength

  const rlength = uint16ArrayBigEndian([rdata.byteLength])

  return concatBuffers([
    name
  , type.buffer
  , ttl.buffer
  , rlength.buffer
  , rdata
  ])
}

export function decodeResourceRecord(
  buffer: ArrayBufferLike
, byteOffset: number
): {
  resourceRecord: IResourceRecord
  newByteOffset: number
} {
  const { domainName: NAME, newByteOffset } = decodeDomainName(
    buffer
  , byteOffset
  )
  byteOffset = newByteOffset

  const [_TYPE, CLASS] = readUint16LittleEndian(buffer, byteOffset, 2)
  byteOffset += 2 * Uint16Array.BYTES_PER_ELEMENT

  const [TTL] = readUint32LittleEndian(buffer, byteOffset)
  byteOffset += 1 * Uint32Array.BYTES_PER_ELEMENT

  const [RDLENGTH] = readUint16LittleEndian(buffer, byteOffset)
  byteOffset += 1 * Uint16Array.BYTES_PER_ELEMENT

  const RDATA = buffer.slice(byteOffset, byteOffset + RDLENGTH)
  const rdataDecoder: IRDATADecoder<RDATA> | undefined = go(() => {
    switch (_TYPE) {
      case TYPE.A: return A_RDATA
      case TYPE.AAAA: return AAAA_RDATA
      case TYPE.CNAME: return CNAME_RDATA
      case TYPE.MX: return MX_RDATA
      case TYPE.NS: return NS_RDATA
      case TYPE.PTR: return PTR_RDATA
      case TYPE.SOA: return SOA_RDATA
      case TYPE.AFSDB: return AFSDB_RDATA
      case TYPE.NAPTR: return NAPTR_RDATA
      case TYPE.SRV: return SRV_RDATA
    }
  })
  const rdata = rdataDecoder?.decode(buffer, byteOffset) ?? null
  byteOffset += RDATA.byteLength

  const resourceRecord: IResourceRecord = {
    NAME
  , TYPE: _TYPE
  , CLASS
  , TTL
  , RDATA
  , rdata
  }

  return { resourceRecord, newByteOffset: byteOffset }
}
