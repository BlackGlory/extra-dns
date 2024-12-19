import { test, expect } from 'vitest'
import { uint16ArrayBigEndian, uint32ArrayBigEndian } from '@src/packet/utils.js'

test('uint16ArrayBigEndian', () => {
  const array = [1, 2]

  const result = uint16ArrayBigEndian(array)

  expect(new Uint8Array(result.buffer)).toStrictEqual(new Uint8Array([
    0, 1
  , 0, 2
  ]))
})

test('uint32ArrayBigEndian', () => {
  const array = [1, 2]

  const result = uint32ArrayBigEndian(array)

  expect(new Uint8Array(result.buffer)).toStrictEqual(new Uint8Array([
    0, 0, 0, 1
  , 0, 0, 0, 2
  ]))
})
