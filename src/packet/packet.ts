import { decodeHeader, encodeHeader, IHeader } from './header.js'
import { decodeQuestion, encodeQuestion, IQuestion } from './question.js'
import { decodeResourceRecord, encodeResourceRecord, IResourceRecord } from './resource-record.js'
import { concatBuffers } from './utils.js'

export interface IPacket {
  header: IHeader
  questions: IQuestion[]
  answers: IResourceRecord[]
  authorityRecords: IResourceRecord[]
  additionalRecords: IResourceRecord[]
}

export function encodePacket(packet: IPacket): ArrayBuffer {
  const buffers: ArrayBufferLike[] = []

  let byteOffset = 0
  const headerBuffer = encodeHeader(
    packet.header
  , packet.questions.length
  , packet.answers.length
  , packet.authorityRecords.length
  , packet.additionalRecords.length
  )
  buffers.push(headerBuffer)
  byteOffset += headerBuffer.byteLength

  const messageCompressionDict = new Map<string, number>()

  for (const question of packet.questions) {
    const questionBuffer = encodeQuestion(
      question
    , byteOffset
    , messageCompressionDict
    )
    buffers.push(questionBuffer)
    byteOffset += questionBuffer.byteLength
  }

  for (const answer of packet.answers) {
    const answerBuffer = encodeResourceRecord(
      answer
    , byteOffset
    , messageCompressionDict
    )
    buffers.push(answerBuffer)
    byteOffset += answerBuffer.byteLength
  }

  for (const authorityRecord of packet.authorityRecords) {
    const authorityRecordBuffer = encodeResourceRecord(
      authorityRecord
    , byteOffset
    , messageCompressionDict
    )
    buffers.push(authorityRecordBuffer)
    byteOffset += authorityRecordBuffer.byteLength
  }

  for (const additionalRecord of packet.additionalRecords) {
    const additionalRecordBuffer = encodeResourceRecord(
      additionalRecord
    , byteOffset
    , messageCompressionDict
    )
    buffers.push(additionalRecordBuffer)
    byteOffset += additionalRecordBuffer.byteLength
  }

  return concatBuffers(buffers)
}

export function decodePacket(buffer: ArrayBufferLike): IPacket {
  const {
    header
  , questionCount
  , answerCount
  , authorityRecordCount
  , additionalRecordCount
  , newByteOffset
  } = decodeHeader(buffer)
  let byteOffset = newByteOffset

  const questions: IQuestion[] = []
  for (let i = 0; i < questionCount; i++) {
    const { question, newByteOffset } = decodeQuestion(
      buffer
    , byteOffset
    )
    questions.push(question)
    byteOffset = newByteOffset
  }

  const answers: IResourceRecord[] = []
  for (let i = 0; i < answerCount; i++) {
    const { resourceRecord, newByteOffset } = decodeResourceRecord(
      buffer
    , byteOffset
    )
    answers.push(resourceRecord)
    byteOffset = newByteOffset
  }

  const authorityRecords: IResourceRecord[] = []
  for (let i = 0; i < authorityRecordCount; i++) {
    const { resourceRecord, newByteOffset } = decodeResourceRecord(
      buffer
    , byteOffset
    )
    authorityRecords.push(resourceRecord)
    byteOffset = newByteOffset
  }

  const additionalRecords: IResourceRecord[] = []
  for (let i = 0; i < additionalRecordCount; i++) {
    const { resourceRecord, newByteOffset } = decodeResourceRecord(
      buffer
    , byteOffset
    )
    additionalRecords.push(resourceRecord)
    byteOffset = newByteOffset
  }

  return {
    header
  , questions
  , answers
  , authorityRecords
  , additionalRecords
  }
}
