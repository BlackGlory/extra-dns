import { test, expect } from 'vitest'
import { uint16ArrayLittleEndian, uint32ArrayLittleEndian } from '@src/packet/utils.js'

test('uint16ArrayLittleEndian', () => {
  const array = [1, 2]

  const result = uint16ArrayLittleEndian(array)

  expect(new Uint8Array(result.buffer)).toStrictEqual(new Uint8Array([
    0, 1
  , 0, 2
  ]))
})

test('uint32ArrayLittleEndian', () => {
  const array = [1, 2]

  const result = uint32ArrayLittleEndian(array)

  expect(new Uint8Array(result.buffer)).toStrictEqual(new Uint8Array([
    0, 0, 0, 1
  , 0, 0, 0, 2
  ]))
})
