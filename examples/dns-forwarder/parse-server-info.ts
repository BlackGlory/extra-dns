import { isString } from '@blackglory/prelude'
import { parsePort } from './parse-port.js'

export interface IServerInfo {
  host: string
  port?: number
}

export function parseServerInfo(server: string): IServerInfo {
  const [host, portString] = server.split(':') as [string, string | undefined]

  const port = isString(portString)
             ? parsePort(portString)
             : undefined

  return {
    host
  , port
  }
}
