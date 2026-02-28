import { describe, test, expect } from 'vitest'
import { encodeDomainName } from '@src/packet/domain-name.js'
import { uint8Array } from '@src/packet/utils.js'
import { encodeASCII } from '@src/packet/ascii.js'

describe('encodeDomainName', () => {
  test('general', () => {
    const domainName = 'example.com'
    const messageCompressionDict = new Map<string, number>()
    const byteOffset = 0

    const result = encodeDomainName(
      domainName
    , byteOffset
    , messageCompressionDict
    , false
    )

    expect(result).toStrictEqual(uint8Array([
      'example'.length
    , ...new Uint8Array(encodeASCII('example'))
    , 'com'.length
    , ...new Uint8Array(encodeASCII('com'))
    , 0
    ]).buffer)
    expect(messageCompressionDict).toStrictEqual(new Map([
      ['example.com', 0]
    , ['com', 1 + 'example'.length]
    ]))
  })

  test('edge: single label domain name', () => {
    const domainName = 'localhost'
    const messageCompressionDict = new Map<string, number>()
    const byteOffset = 0

    const result = encodeDomainName(
      domainName
    , byteOffset
    , messageCompressionDict
    , false
    )

    expect(result).toStrictEqual(uint8Array([
      'localhost'.length
    , ...new Uint8Array(encodeASCII('localhost'))
    , 0
    ]).buffer)
    expect(messageCompressionDict).toStrictEqual(new Map([
      ['localhost', 0]
    ]))
  })
})
