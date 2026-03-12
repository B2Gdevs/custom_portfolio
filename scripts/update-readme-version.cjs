'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const PACKAGE_DIR = path.join(ROOT, 'packages', 'repub-builder');
const PKG_PATH = path.join(PACKAGE_DIR, 'package.json');
const README_PATH = path.join(PACKAGE_DIR, 'README.md');

const pkg = JSON.parse(fs.readFileSync(PKG_PATH, 'utf8'));
const version = pkg.version;

let readme = fs.readFileSync(README_PATH, 'utf8');
readme = readme.replace(/\{\{VERSION\}\}/g, version);

fs.writeFileSync(README_PATH, readme, 'utf8');
console.log('Updated README with version', version);
