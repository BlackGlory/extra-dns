#!/usr/bin/env node
import { program } from 'commander'
import { assert } from '@blackglory/errors'
import { startDNSForwarder } from './dns-forwarder.js'
import { parseServerInfo } from './parse-server-info.js'

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

  assert(/^\d+$/.test(opts.port), 'The parameter port must be integer')
  const port: number = Number.parseInt(opts.port, 10)

  return { port }
}
