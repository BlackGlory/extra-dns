import { sum } from 'extra-utils'

export function concatBuffers(buffers: ArrayBufferLike[]): ArrayBuffer {
  const byteLength = buffers
    .map(buffer => buffer.byteLength)
    .reduce(sum)

  const data = new Uint8Array(byteLength)

  let byteOffset = 0
  for (const buffer of buffers) {
    data.set(new Uint8Array(buffer), byteOffset)
    byteOffset += buffer.byteLength
  }

  return data.buffer
}

export function readUint8(
  buffer: ArrayBufferLike
, byteOffset: number
, length: number = 1
): Uint8Array {
  return new Uint8Array(buffer, byteOffset, length)
}

export function readUint16LittleEndian(
  buffer: ArrayBufferLike
, byteOffset: number
, length: number = 1
): Uint16Array {
  const data = new Uint16Array(length)

  const view = new DataView(buffer)
  for (
    let i = 0
  ; i < data.length
  ; i++, byteOffset += Uint16Array.BYTES_PER_ELEMENT
  ) {
    data[i] = view.getUint16(byteOffset)
  }

  return data
}

export function readUint32LittleEndian(
  buffer: ArrayBufferLike
, byteOffset: number
, length: number = 1
): Uint32Array {
  const data = new Uint32Array(length)

  const view = new DataView(buffer)
  for (
    let i = 0
  ; i < data.length
  ; i++, byteOffset += Uint32Array.BYTES_PER_ELEMENT
  ) {
    data[i] = view.getUint32(byteOffset)
  }

  return data
}

export function uint8Array(array: ArrayLike<number>): Uint8Array {
  return new Uint8Array(array)
}

export function uint16ArrayLittleEndian(
  array: ArrayLike<number>
): Uint16Array<ArrayBuffer> {
  const data = new Uint16Array(array.length)

  const view = new DataView(data.buffer)
  for (
    let i = 0, byteOffset = 0
  ; i < array.length
  ; i++, byteOffset += Uint16Array.BYTES_PER_ELEMENT
  ) {
    view.setUint16(byteOffset, array[i])
  }

  return data
}

export function uint32ArrayLittleEndian(
  array: ArrayLike<number>
): Uint32Array<ArrayBuffer> {
  const data = new Uint32Array(array.length)

  const view = new DataView(data.buffer)
  for (
    let i = 0, byteOffset = 0
  ; i < array.length
  ; i++, byteOffset += Uint32Array.BYTES_PER_ELEMENT
  ) {
    view.setUint32(byteOffset, array[i])
  }

  return data
}
