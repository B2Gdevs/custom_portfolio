/**
 * Run the ysc compiler with given arguments
 */

import { spawn, SpawnOptions } from 'child_process';
import { resolveYscBinaryPath, isBinaryAvailable } from './resolveBinary';
import { BinaryNotFoundError } from '../errors';
import * as os from 'os';

export interface RunYscArgs {
  /** Working directory for the compiler */
  cwd?: string;
  /** Arguments to pass to ysc */
  args: string[];
  /** Environment variables */
  env?: Record<string, string>;
  /** Timeout in milliseconds */
  timeout?: number;
}

export interface RunYscResult {
  /** Exit code */
  code: number;
  /** Standard output */
  stdout: string;
  /** Standard error */
  stderr: string;
  /** Whether the process timed out */
  timedOut: boolean;
}

/**
 * Run the ysc compiler
 */
export async function runYsc(options: RunYscArgs): Promise<RunYscResult> {
  const { cwd = process.cwd(), args, env, timeout = 60000 } = options;
  
  if (!isBinaryAvailable()) {
    const platform = os.platform();
    const arch = os.arch();
    throw new BinaryNotFoundError(platform, arch);
  }
  
  const binaryPath = resolveYscBinaryPath();
  
  return new Promise((resolve, reject) => {
    const spawnOptions: SpawnOptions = {
      cwd,
      env: { ...process.env, ...env },
      stdio: ['pipe', 'pipe', 'pipe'],
    };
    
    const child = spawn(binaryPath, args, spawnOptions);
    
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    
    // Handle timeout
    const timeoutId = timeout > 0 ? setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
    }, timeout) : null;
    
    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('error', (error) => {
      if (timeoutId) clearTimeout(timeoutId);
      reject(error);
    });
    
    child.on('close', (code) => {
      if (timeoutId) clearTimeout(timeoutId);
      resolve({
        code: code ?? -1,
        stdout,
        stderr,
        timedOut,
      });
    });
  });
}

/**
 * Get the ysc version
 */
export async function getYscVersion(): Promise<string | null> {
  try {
    const result = await runYsc({ args: ['--version'] });
    if (result.code === 0) {
      return result.stdout.trim();
    }
    return null;
  } catch {
    return null;
  }
}

