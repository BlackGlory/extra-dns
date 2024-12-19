import { decodeDomainName, encodeDomainName } from './domain-name.js'
import { concatBuffers, uint16ArrayLittleEndian, readUint16LittleEndian } from './utils.js'

export interface IQuestion {
  NAME: string // 变长, 用DNS名称表示法表示的域名
  TYPE: number // 2 bytes
  CLASS: number // 2 bytes
}

export function encodeQuestion(
  question: IQuestion
, byteOffset: number
, messageCompressionDict: Map<string, number>
): ArrayBuffer {
  return concatBuffers([
    encodeDomainName(question.NAME, byteOffset, messageCompressionDict)
  , uint16ArrayLittleEndian([question.TYPE, question.CLASS]).buffer
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

  const question: IQuestion = { NAME, TYPE, CLASS }
  return { question, newByteOffset: byteOffset }
}
