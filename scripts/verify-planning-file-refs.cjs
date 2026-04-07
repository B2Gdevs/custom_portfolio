#!/usr/bin/env node
/**
 * @deprecated Use: `node vendor/get-anything-done/bin/gad.cjs refs verify`
 * or `pnpm run verify:planning-refs`
 */
const { spawnSync } = require('child_process')
const path = require('path')

const gad = path.join(__dirname, '..', 'vendor', 'get-anything-done', 'bin', 'gad.cjs')
const r = spawnSync(process.execPath, [gad, 'refs', 'verify', ...process.argv.slice(2)], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..'),
})
process.exit(r.status ?? 1)
