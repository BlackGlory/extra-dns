#!/usr/bin/env node
import { program } from 'commander'
import { assert } from '@blackglory/errors'
import { Level, Logger, TerminalTransport, stringToLevel } from 'extra-logger'
import { startServer } from './dns-forwarder.js'
import { parseServerInfo } from './parse-server-info.js'

program
  .option('--port [port]', '', '53')
  .option('--log [level]', '', 'info')
  .argument('<remoteServer>')
  .action(async (remoteServer: string) => {
    const options = getOptions()
    const logger = new Logger({
      level: options.logLevel
    , transport: new TerminalTransport({})
    })

    const remoteServerInfo = parseServerInfo(remoteServer)

    startServer({
      logger
    , remoteServer: {
        host: remoteServerInfo.host
      , port: remoteServerInfo.port ?? 53
      }
    , localServer: {
        host: '0.0.0.0'
      , port: options.port
      }
    })
  })
  .parse()

function getOptions() {
  const opts = program.opts<{
    port: string
    log: string
  }>()

  assert(/^\d+$/.test(opts.port), 'The parameter port must be integer')
  const port: number = Number.parseInt(opts.port, 10)

  const logLevel: Level = stringToLevel(opts.log, Level.Info)

  return {
    port
  , logLevel
  }
}
