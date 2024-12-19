import { decodeDomainName, encodeDomainName } from './domain-name.js'
import { concatBuffers, uint16ArrayBigEndian, readUint16LittleEndian } from './utils.js'

export interface IQuestion {
  QNAME: string // 变长, 用DNS名称表示法表示的域名
  QTYPE: number // 2 bytes
  QCLASS: number // 2 bytes
}

export function encodeQuestion(
  question: IQuestion
, byteOffset: number
, messageCompressionDict: Map<string, number>
): ArrayBuffer {
  return concatBuffers([
    encodeDomainName(question.QNAME, byteOffset, messageCompressionDict)
  , uint16ArrayBigEndian([question.QTYPE, question.QCLASS]).buffer
  ])
}

export function decodeQuestion(buffer: ArrayBufferLike, byteOffset: number): {
  question: IQuestion
  newByteOffset: number
} {
  const { domainName: NAME, newByteOffset } = decodeDomainName(
    buffer
  , byteOffset
  )
  byteOffset = newByteOffset

  const [TYPE, CLASS] = readUint16LittleEndian(buffer, byteOffset, 2)
  byteOffset += 2 * Uint16Array.BYTES_PER_ELEMENT

  const question: IQuestion = { QNAME: NAME, QTYPE: TYPE, QCLASS: CLASS }
  return { question, newByteOffset: byteOffset }
}
