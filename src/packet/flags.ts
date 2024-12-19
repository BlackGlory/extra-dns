import { QR } from './constants.js'

export interface IFlags {
  QR: QR // 1 bit
  OPCODE: number // 4 bits
  AA: number // 1 bit
  TC: number // 1 bit
  RD: number // 1 bit
  RA: number // 1 bit
  Z: number // 3 bits
  RCODE: number // 4 bits
}

export function encodeFlags(flags: IFlags): number {
  let result = 0
  let bitOffset = 0

  result += flags.RCODE << bitOffset
  bitOffset += 4

  result += flags.Z << bitOffset
  bitOffset += 3

  result += flags.RA << bitOffset
  bitOffset += 1

  result += flags.RD << bitOffset
  bitOffset += 1

  result += flags.TC << bitOffset
  bitOffset += 1

  result += flags.AA << bitOffset
  bitOffset += 1

  result += flags.OPCODE << bitOffset
  bitOffset += 4

  result += flags.QR << bitOffset
  bitOffset += 1

  return result
}

export function decodeFlags(flags: number): IFlags {
  let bitOffset = 0

  const RCODE = (flags >> bitOffset) & 0b1111
  bitOffset += 4

  const Z = (flags >> bitOffset) & 0b111
  bitOffset += 3

  const RA = (flags >> bitOffset) & 0b1
  bitOffset += 1

  const RD = (flags >> bitOffset) & 0b1
  bitOffset += 1

  const TC = (flags >> bitOffset) & 0b1
  bitOffset += 1

  const AA = (flags >> bitOffset) & 0b1
  bitOffset += 1

  const OPCODE = (flags >> bitOffset) & 0b1111
  bitOffset += 4

  const QR = (flags >> bitOffset) & 0b1
  bitOffset += 1

  return {
    QR
  , OPCODE
  , AA
  , TC
  , RD
  , RA
  , Z
  , RCODE
  }
}
