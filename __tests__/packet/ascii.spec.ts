import { test, expect } from 'vitest'
import { encodeASCII, decodeASCII } from '@src/packet/ascii.js'
import { uint8Array } from '@src/packet/utils.js'

test('encodeASCII', () => {
  const text = '01'

  const result = encodeASCII(text)

  expect(result).toStrictEqual(uint8Array([48, 49]).buffer)
})

test('decodeASCII', () => {
  const buffer = uint8Array([48, 49]).buffer

  const result = decodeASCII(buffer)

  expect(result).toStrictEqual('01')
})
