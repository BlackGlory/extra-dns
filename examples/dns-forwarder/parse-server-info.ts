import { assert, go, isntNaN, isString } from '@blackglory/prelude'

export interface IServerInfo {
  host: string
  port?: number
}

export function parseServerInfo(server: string): IServerInfo {
  const [host, portString] = server.split(':') as [string, string | undefined]

  const port = go(() => {
    if (isString(portString)) {
      const port = Number.parseInt(portString)
      assert(isntNaN(port))

      return port
    }
  })

  return {
    host
  , port
  }
}
