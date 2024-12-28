export * from './constants.js'
export type { IPacket } from './packet.js'
export type { IHeader } from './header.js'
export type { IFlags } from './flags.js'
export type { IQuestion } from './question.js'
export type { IResourceRecord } from './resource-record.js'
export {
  A_RDATA
, AAAA_RDATA
, CNAME_RDATA
, MX_RDATA
, NS_RDATA
, PTR_RDATA
, SOA_RDATA
, AFSDB_RDATA
, NAPTR_RDATA
, SRV_RDATA
} from './rdata.js'
