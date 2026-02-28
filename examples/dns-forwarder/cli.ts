#!/usr/bin/env node
import { program } from 'commander'
import { startDNSForwarder } from './dns-forwarder.js'
import { parseServerInfo } from './parse-server-info.js'
import { parsePort } from './parse-port.js'

program
  .option('--port [port]', '', '53')
  .argument('<remoteServer>')
  .action(async (remoteServer: string) => {
    const options = getOptions()

    const remoteServerInfo = parseServerInfo(remoteServer)

    startDNSForwarder({
      remote: {
        host: remoteServerInfo.host
      , port: remoteServerInfo.port ?? 53
      }
    , local: {
        host: '0.0.0.0'
      , port: options.port
      }
    })
  })
  .parse()

function getOptions(): { port: number } {
  const opts = program.opts<{ port: string }>()

  const port = parsePort(opts.port)

  return { port }
}
