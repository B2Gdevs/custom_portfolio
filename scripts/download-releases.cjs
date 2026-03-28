'use strict';

/**
 * Download release artifacts from GitHub into .releases/
 * Usage: node scripts/download-releases.cjs [koodo-tag]
 * If tag omitted, uses latest release for the koodo-reader-v* prefix.
 * Requires GITHUB_REPO env (e.g. MagicbornStudios/custom_portfolio) or defaults to that.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const REPO = process.env.GITHUB_REPO || 'MagicbornStudios/custom_portfolio';
const RELEASES_DIR = path.join(process.cwd(), '.releases');

function get(url) {
  return new Promise((resolve, reject) => {
    const opts = new URL(url);
    const req = https.get(
      {
        hostname: opts.hostname,
        path: opts.pathname + opts.search,
        headers: { 'User-Agent': 'custom_portfolio-download-releases' },
      },
      (res) => {
        if (res.statusCode === 302 || res.statusCode === 301) {
          get(res.headers.location).then(resolve).catch(reject);
          return;
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      }
    );
    req.on('error', reject);
  });
}

async function apiGet(pathname) {
  const token = process.env.GITHUB_TOKEN;
  const opts = {
    hostname: 'api.github.com',
    path: pathname,
    headers: { 'User-Agent': 'custom_portfolio-download-releases' },
  };
  if (token) opts.headers.Authorization = 'token ' + token;
  return new Promise((resolve, reject) => {
    https.get(opts, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString()));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function getLatestReleaseTag(prefix) {
  const releases = await apiGet(`/repos/${REPO}/releases?per_page=100`);
  const tag = releases.find((r) => r.tag_name && r.tag_name.startsWith(prefix));
  return tag ? tag.tag_name : null;
}

async function downloadAsset(tagName, assetName, outPath) {
  const url = `https://github.com/${REPO}/releases/download/${tagName}/${encodeURIComponent(assetName)}`;
  console.log('Downloading', url, '->', outPath);
  const buf = await get(url);
  if (buf.length < 200 && buf.toString().includes('Not Found')) {
    throw new Error('Asset not found: ' + assetName);
  }
  fs.mkdirSync(RELEASES_DIR, { recursive: true });
  fs.writeFileSync(outPath, buf);
  console.log('Wrote', outPath);
}

async function main() {
  const [koodoTag] = process.argv.slice(2);
  const koodo = koodoTag || (await getLatestReleaseTag('koodo-reader-v'));

  if (!koodo) {
    console.warn('No Koodo Reader release found (tag koodo-reader-v*).');
  } else {
    const release = await apiGet(`/repos/${REPO}/releases/tags/${koodo}`);
    const assets = release.assets || [];
    for (const a of assets) {
      const outPath = path.join(RELEASES_DIR, a.name);
      const buf = await get(a.browser_download_url);
      fs.mkdirSync(RELEASES_DIR, { recursive: true });
      fs.writeFileSync(outPath, buf);
      console.log('Wrote', outPath);
    }
    if (assets.length === 0) console.warn('No assets for', koodo);
  }

  console.log('Done. Artifacts in', RELEASES_DIR);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
