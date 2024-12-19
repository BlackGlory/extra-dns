import { isntUndefined } from 'extra-utils'
import { decodeASCII, encodeASCII } from './ascii.js'
import { concatBuffers, uint16ArrayLittleEndian, readUint16LittleEndian, readUint8, uint8Array } from './utils.js'
import { assert } from '@blackglory/prelude'

// DNS名称表示法(DNS Name Notation):
// 域名中用点分隔开的组件被称为标签.
// 编码格式为[标签长度, ASCII编码的标签], 以0长度的标签作为终结符.
// 例子: `www.domain.com`将编码为`3www6domain3com0`.

// 消息压缩(Message Compression):
// 通过16位的指针来取代DNS名称表示法中标签的一种压缩方式, 它之所以有效是因为域名中相同的后缀很常见.
// 例如`www.domain.com`和`wap.domain.com`和`共享相同的后缀`domain.com`.
// 指针指向其所在NAME字段之前的NAME字段中的标签的字节位置,
// 引用该字节位置直到NAME字段结束为止的内容, 以替代指针所在NAME字段的后续内容,
// 因此一个NAME字段最多只能有一个指针, 且指针总是位于NAME字段的末尾.
// 如何区别指针和标签:
// - 指针以2个二进制1开头, 之后的位数用来表示字节位置, 因此首字节总是大于等于十进制192.
// - 标签以2个二进制0开头，之后的位数用来表示长度, 因此首字节总是小于等于十进制63.

export function encodeDomainName(
  domainName: string
, byteOffset: number
, messageCompressionDict: Map<string, number>
): ArrayBuffer {
  const labels = domainName.split('.')
  if (labels.length === 1) labels.length = 0

  const buffers: ArrayBufferLike[] = []
  for (let i = 0; i < labels.length; i++) {
    const key = labels.slice(i).join('.')

    const pointer = messageCompressionDict.get(key)
    if (isntUndefined(pointer)) {
      buffers.push(uint16ArrayLittleEndian([pointer | (0b11 << 14)]).buffer)

      return concatBuffers(buffers)
    } else {
      messageCompressionDict.set(key, byteOffset)

      const label = labels[i]

      buffers.push(uint8Array([label.length]).buffer)
      byteOffset++

      const buffer = encodeASCII(label)
      buffers.push(buffer)
      byteOffset += buffer.byteLength
    }
  }
  buffers.push(uint8Array([0]).buffer)

  return concatBuffers(buffers)
}

export function decodeDomainName(
  buffer: ArrayBufferLike
, byteOffset: number
, messageCompressionDict: Map<number, string>
): {
  domainName: string
  newByteOffset: number
} {
  const labelByteOffsetPairs: [label: string, byteOffset: number][] = []

  while (byteOffset < buffer.byteLength) {
    const [firstByte] = readUint8(buffer, byteOffset)

    if (firstByte === 0) {
      byteOffset++
      break
    }
    
    if (firstByte >= (0b11 << 6)) {
      const [pointer] = readUint16LittleEndian(buffer, byteOffset)

      const label = messageCompressionDict.get(pointer & ~(0b11 << 14))
      assert(isntUndefined(label))

      labelByteOffsetPairs.push([label, byteOffset])
      byteOffset += Uint16Array.BYTES_PER_ELEMENT

      break
    }

    const length = firstByte
    const label = decodeASCII(buffer.slice(byteOffset + 1, byteOffset + 1 + length))
    labelByteOffsetPairs.push([label, byteOffset])
    byteOffset += 1 + length
  }

  for (let i = 0; i < labelByteOffsetPairs.length; i++) {
    const [, offset] = labelByteOffsetPairs[i]
    const pairs = labelByteOffsetPairs.slice(i)
    const label = pairs.map(([label]) => label).join('.')
    messageCompressionDict.set(offset, label)
  }

  const domainName = labelByteOffsetPairs
    .map(([label]) => label)
    .join('.')
  return { domainName, newByteOffset: byteOffset }
}
