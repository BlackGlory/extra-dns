import { decodeFlags, encodeFlags, IFlags } from './flags.js'
import { uint16ArrayBigEndian, readUint16LittleEndian } from './utils.js'

export interface IHeader {
  ID: number // 2 bytes, 16 bits
  flags: IFlags // 2 bytes, 16 bits
  // QDCOUNT: number // 2 bytes, 16 bits
  // ANCOUNT: number // 2 bytes, 16 bits
  // NSCOUNT: number // 2 bytes, 16 bits
  // ARCOUNT: number // 2 bytes, 16 bits
}

export function encodeHeader(
  header: IHeader
, questionsCount: number
, answersCount: number
, authorityRecordsCount: number
, additionalRecordsCount: number
): ArrayBuffer {
  const data = uint16ArrayBigEndian([
    header.ID
  , encodeFlags(header.flags)
  , questionsCount
  , answersCount
  , authorityRecordsCount
  , additionalRecordsCount
  ])

  return data.buffer
}

export function decodeHeader(buffer: ArrayBufferLike): {
  header: IHeader
  questionCount: number
  answerCount: number
  authorityRecordCount: number
  additionalRecordCount: number
  newByteOffset: number
} {
  let byteOffset = 0

  const [
    id
  , flags
  , questionCount
  , answerCount
  , authorityRecordCount
  , additionalRecordCount
  ] = readUint16LittleEndian(buffer, byteOffset, 6)
  byteOffset += 6 * Uint16Array.BYTES_PER_ELEMENT

  const header: IHeader = {
    ID: id
  , flags: decodeFlags(flags)
  }

  return {
    header
  , questionCount
  , answerCount
  , authorityRecordCount
  , additionalRecordCount
  , newByteOffset: byteOffset
  }
}
