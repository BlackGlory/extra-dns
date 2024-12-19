export function decodeASCII(buffer: ArrayBufferLike): string {
  return Buffer.from(buffer).toString('ascii')
}

export function encodeASCII(text: string): ArrayBuffer {
  return new Uint8Array(Buffer.from(text, 'ascii')).buffer
}
