/**
 * Resolve the correct ysc binary for the current platform
 */

import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

export interface PlatformInfo {
  platform: NodeJS.Platform;
  arch: string;
  binaryName: string;
  supported: boolean;
}

/**
 * Get platform information
 */
export function getPlatformInfo(): PlatformInfo {
  const platform = os.platform();
  const arch = os.arch();
  
  let binaryName = 'ysc';
  let supported = true;
  
  if (platform === 'win32') {
    binaryName = 'ysc.exe';
  }
  
  // Check if this platform/arch combination is supported
  const supportedCombinations = [
    { platform: 'darwin', arch: 'arm64' },
    { platform: 'darwin', arch: 'x64' },
    { platform: 'win32', arch: 'x64' },
    { platform: 'linux', arch: 'x64' },
  ];
  
  supported = supportedCombinations.some(
    c => c.platform === platform && c.arch === arch
  );
  
  return { platform, arch, binaryName, supported };
}

/**
 * Resolve the path to the ysc binary for the current platform
 */
export function resolveYscBinaryPath(): string {
  const { platform, arch, binaryName, supported } = getPlatformInfo();
  
  if (!supported) {
    throw new Error(`Unsupported platform/arch: ${platform}/${arch}`);
  }
  
  // Binary directory structure:
  // bin/darwin-arm64/ysc
  // bin/darwin-x64/ysc
  // bin/win32-x64/ysc.exe
  // bin/linux-x64/ysc
  
  const binDir = path.resolve(__dirname, '../../bin');
  const platformDir = `${platform}-${arch}`;
  
  return path.join(binDir, platformDir, binaryName);
}

/**
 * Check if the binary is available for the current platform
 */
export function isBinaryAvailable(): boolean {
  try {
    const binaryPath = resolveYscBinaryPath();
    return fs.existsSync(binaryPath);
  } catch {
    return false;
  }
}

/**
 * Get all supported platforms
 */
export function getSupportedPlatforms(): string[] {
  return [
    'darwin-arm64',
    'darwin-x64',
    'win32-x64',
    'linux-x64',
  ];
}

