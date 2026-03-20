const fs = require('fs');
const path = require('path');

const standaloneServerPath = path.join(
  path.resolve(__dirname, '..'),
  '.standalone',
  'portfolio-reader',
  'server.cjs'
);

if (!fs.existsSync(standaloneServerPath)) {
  console.error(
    'Standalone reader build not found. Run `pnpm run build:reader:standalone` first.'
  );
  process.exit(1);
}

require(standaloneServerPath);
