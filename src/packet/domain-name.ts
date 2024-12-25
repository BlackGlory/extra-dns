import { isntUndefined } from 'extra-utils'
import { decodeASCII, encodeASCII } from './ascii.js'
import { concatBuffers, uint16ArrayBigEndian, readUint16LittleEndian, readUint8, uint8Array } from './utils.js'

// DNS名称表示法(DNS Name Notation):
// 域名中用点分隔开的组件被称为标签.
// 编码格式为[标签长度, ASCII编码的标签], 以0长度的标签作为终结符.
// 例子: `www.domain.com`将编码为`3www6domain3com0`.

// 消息压缩(Message Compression):
// 通过16位的指针来取代DNS名称表示法中标签的一种压缩方式, 它之所以有效是因为域名中相同的后缀很常见.
// 例如`www.domain.com`和`wap.domain.com`和`共享相同的后缀`domain.com`.
// 指针指向其所在域名字段之前的域名字段中的标签的字节偏移量, 引用该字节偏移量直到其所在的域名字段结束.
// 一个域名字段最多只能有一个指针, 且指针总是位于域名字段的末尾.
// 除了典型的NAME字段外, 一些类型的资源记录的RDATA部分也包含域名字段.
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
      buffers.push(uint16ArrayBigEndian([pointer | (0b11 << 14)]).buffer)

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
): {
  domainName: string
  newByteOffset: number
} {
  const labels: string[] = []

  while (byteOffset < buffer.byteLength) {
    const [firstByte] = readUint8(buffer, byteOffset)

    if (firstByte === 0) {
      byteOffset++
      break
    }
    
    if (firstByte >= (0b11 << 6)) {
      const [pointer] = readUint16LittleEndian(buffer, byteOffset)

      const targetByteOffset = pointer & ~(0b11 << 14)
      const { domainName } = decodeDomainName(buffer, targetByteOffset)

      const targetLabels = domainName.split('.')

      labels.push(...targetLabels)
      byteOffset += Uint16Array.BYTES_PER_ELEMENT

      break
    }

    const length = firstByte
    byteOffset++

    const label = decodeASCII(buffer.slice(byteOffset, byteOffset + length))
    labels.push(label)
    byteOffset += length
  }

  const domainName = labels.join('.')
  return { domainName, newByteOffset: byteOffset }
}
