/**
 * Compile a Yarn project to binary artifacts
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { runYsc } from './ysc/runYsc';
import { readLinesCsv, readMetadataCsv, type LineEntry, type MetadataEntry } from './artifacts/readCsv';
import { CompilerError } from './errors';

export interface CompileProjectInput {
  /** Directory containing .yarn files, or path to single .yarn file */
  source: string;
  /** Output directory for compiled artifacts */
  outDir: string;
  /** Base name for output files (default: 'dialogue') */
  outputName?: string;
  /** Additional ysc arguments */
  extraArgs?: string[];
}

export interface CompileProjectOutput {
  /** Path to compiled .yarnc program */
  programPath: string;
  /** Path to lines CSV */
  linesCsvPath: string;
  /** Path to metadata CSV */
  metadataCsvPath: string;
  /** Parsed line entries */
  lines: LineEntry[];
  /** Parsed metadata entries */
  metadata: MetadataEntry[];
  /** Compiler stdout */
  stdout: string;
  /** Compiler stderr */
  stderr: string;
}

/**
 * Compile a Yarn project
 * 
 * @example
 * ```ts
 * const result = await compileProject({
 *   source: './dialogues',
 *   outDir: './build',
 *   outputName: 'game-dialogues',
 * });
 * console.log('Compiled:', result.programPath);
 * console.log('Lines:', result.lines.length);
 * ```
 */
export async function compileProject(input: CompileProjectInput): Promise<CompileProjectOutput> {
  const { source, outDir, outputName = 'dialogue', extraArgs = [] } = input;
  
  // Ensure output directory exists
  await fs.mkdir(outDir, { recursive: true });
  
  // Build ysc arguments
  // ysc compile <source> --output-directory <outDir> --output-name <name> --format yarnc
  const args = [
    'compile',
    source,
    '--output-directory', outDir,
    '--output-name', outputName,
    '--format', 'yarnc',
    ...extraArgs,
  ];
  
  // Run compiler
  const result = await runYsc({ args, cwd: process.cwd() });
  
  if (result.code !== 0) {
    throw new CompilerError(
      `Yarn Spinner compilation failed with exit code ${result.code}`,
      result.code,
      result.stdout,
      result.stderr
    );
  }
  
  // Build output paths
  const programPath = path.join(outDir, `${outputName}.yarnc`);
  const linesCsvPath = path.join(outDir, `${outputName}-Lines.csv`);
  const metadataCsvPath = path.join(outDir, `${outputName}-Metadata.csv`);
  
  // Verify outputs exist
  const programExists = await fileExists(programPath);
  if (!programExists) {
    throw new CompilerError(
      `Compiled program not found at ${programPath}`,
      result.code,
      result.stdout,
      result.stderr
    );
  }
  
  // Read CSV files if they exist
  let lines: LineEntry[] = [];
  let metadata: MetadataEntry[] = [];
  
  if (await fileExists(linesCsvPath)) {
    lines = await readLinesCsv(linesCsvPath);
  }
  
  if (await fileExists(metadataCsvPath)) {
    metadata = await readMetadataCsv(metadataCsvPath);
  }
  
  return {
    programPath,
    linesCsvPath,
    metadataCsvPath,
    lines,
    metadata,
    stdout: result.stdout,
    stderr: result.stderr,
  };
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Compile Yarn source string to artifacts
 * 
 * Creates a temporary file, compiles it, and returns results.
 */
export async function compileSource(
  yarnSource: string,
  options: Omit<CompileProjectInput, 'source'> & { tempDir?: string }
): Promise<CompileProjectOutput> {
  const { tempDir = '/tmp', ...compileOptions } = options;
  const tempFile = path.join(tempDir, `yarn-${Date.now()}.yarn`);
  
  try {
    // Write source to temp file
    await fs.writeFile(tempFile, yarnSource, 'utf-8');
    
    // Compile
    return await compileProject({
      ...compileOptions,
      source: tempFile,
    });
  } finally {
    // Cleanup temp file
    try {
      await fs.unlink(tempFile);
    } catch {
      // Ignore cleanup errors
    }
  }
}

