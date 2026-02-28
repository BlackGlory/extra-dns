import { assert } from '@blackglory/prelude'

export function parsePort(text: string): number {
  const port: number = Number.parseInt(text, 10)
  assert(Number.isInteger(port),  'The port must be an integer')
  assert(port >= 0 && port <= 65535, 'The port must be in the range [0, 65535]')

  return port
}
