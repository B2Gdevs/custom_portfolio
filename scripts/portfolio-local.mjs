import { spawn } from 'node:child_process'

const command = process.argv[2] || 'help'

function getPnpmCommand() {
  return process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
}

function run(args, envOverrides = {}) {
  const child = spawn(getPnpmCommand(), args, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      ...envOverrides,
    },
    stdio: 'inherit',
  })

  child.on('exit', (code) => process.exit(code ?? 0))
  child.on('error', (error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  })
}

switch (command) {
  case 'dev':
    run(['--filter', '@portfolio/app', 'run', 'dev'], { PORT: '3000' })
    break
  case 'build':
    run(['--filter', '@portfolio/app', 'run', 'build'])
    break
  case 'start':
    run(['--filter', '@portfolio/app', 'exec', 'next', 'start', '--hostname', '127.0.0.1', '--port', '3001'])
    break
  default:
    console.log('Usage: node scripts/portfolio-local.mjs <dev|build|start>')
    process.exit(0)
}
