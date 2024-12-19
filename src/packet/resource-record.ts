import { decodeDomainName, encodeDomainName } from './domain-name.js'
import { concatBuffers, uint16ArrayLittleEndian, uint32ArrayLittleEndian, readUint16LittleEndian, readUint32LittleEndian } from './utils.js'

export interface IResourceRecord {
  NAME: string // 变长, 用DNS名称表示法表示的域名
  TYPE: number // 2 bytes
  CLASS: number // 2 bytes
  TTL: number // 4 bytes, 32 bits
  // RDLENGTH: number // 2 bytes, 16 bits
  RDATA: ArrayBufferLike // 缓冲区, 长度由RDLENGTH定义
}

export function encodeResourceRecord(
  resourceRecord: IResourceRecord
, byteOffset: number
, messageCompressionDict: Map<string, number>
): ArrayBuffer {
  return concatBuffers([
    encodeDomainName(resourceRecord.NAME, byteOffset, messageCompressionDict)
  , uint16ArrayLittleEndian([resourceRecord.TYPE, resourceRecord.CLASS]).buffer
  , uint32ArrayLittleEndian([resourceRecord.TTL]).buffer
  , uint16ArrayLittleEndian([resourceRecord.RDATA.byteLength]).buffer
  , resourceRecord.RDATA
  ])
}

export function decodeResourceRecord(
  buffer: ArrayBufferLike
, byteOffset: number
, messageCompressionDict: Map<number, string>
): {
  resourceRecord: IResourceRecord
  newByteOffset: number
} {
  const { domainName: NAME, newByteOffset } = decodeDomainName(
    buffer
  , byteOffset
  , messageCompressionDict
  )
  byteOffset = newByteOffset

  const [TYPE, CLASS] = readUint16LittleEndian(buffer, byteOffset, 2)
  byteOffset += 2 * Uint16Array.BYTES_PER_ELEMENT

  const [TTL] = readUint32LittleEndian(buffer, byteOffset)
  byteOffset += 1 * Uint32Array.BYTES_PER_ELEMENT

  const [RDLENGTH] = readUint16LittleEndian(buffer, byteOffset)
  byteOffset += 1 * Uint16Array.BYTES_PER_ELEMENT

  const RDATA = buffer.slice(byteOffset, byteOffset + RDLENGTH)
  byteOffset += RDLENGTH

  const resourceRecord: IResourceRecord = { NAME, TYPE, CLASS, TTL, RDATA }

  return { resourceRecord, newByteOffset: byteOffset }
}
