import { decodeASCII, encodeASCII } from './ascii.js'
import { concatBuffers, readUint8, uint8Array } from './utils.js'

// 适用于类型为character-string的字段的字符串编码:
// 第一个字节是字符串的长度, 后续字节为字符串本身.

export function encodeCharacterString(characterString: string): ArrayBufferLike {
  const characterBuffer = encodeASCII(characterString)

  return concatBuffers([
    uint8Array([characterBuffer.byteLength]).buffer
  , characterBuffer
  ])
}

export function decodeCharacterString(buffer: ArrayBufferLike, byteOffset: number): {
  characterString: string
  newByteOffset: number
} {
  const [byteLength] = readUint8(buffer, byteOffset)
  byteOffset++

  const characterBuffer = buffer.slice(byteOffset, byteOffset + byteLength)
  const characterString = decodeASCII(characterBuffer)
  byteOffset += byteLength

  return {
    characterString
  , newByteOffset: byteOffset
  }
}
