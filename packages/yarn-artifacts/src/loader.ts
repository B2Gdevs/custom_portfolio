/**
 * Load Yarn Spinner compiled artifacts
 */

import { parseLinesCsv, parseMetadataCsv, type LineEntry, type MetadataEntry } from './csv-parser';
import { CsvLineProvider } from './line-provider';

export interface YarnArtifacts {
  /** Compiled program bytes */
  programBytes: ArrayBuffer;
  /** Line entries from CSV */
  lines: LineEntry[];
  /** Metadata entries from CSV */
  metadata: MetadataEntry[];
  /** Line provider for runtime */
  lineProvider: CsvLineProvider;
}

export interface LoadArtifactsOptions {
  /** Path/URL to .yarnc file */
  programPath: string;
  /** Path/URL to Lines.csv (optional, will try to auto-detect) */
  linesCsvPath?: string;
  /** Path/URL to Metadata.csv (optional) */
  metadataCsvPath?: string;
}

/**
 * Load artifacts from file paths (Node.js)
 */
export async function loadArtifacts(
  options: LoadArtifactsOptions,
  readFile: (path: string) => Promise<ArrayBuffer | string>
): Promise<YarnArtifacts> {
  const { programPath, linesCsvPath, metadataCsvPath } = options;
  
  // Load program
  const programData = await readFile(programPath);
  const programBytes = typeof programData === 'string' 
    ? new TextEncoder().encode(programData).buffer 
    : programData;
  
  // Load lines CSV
  let lines: LineEntry[] = [];
  const linesPath = linesCsvPath || deriveLinesCsvPath(programPath);
  try {
    const linesData = await readFile(linesPath);
    const linesContent = typeof linesData === 'string' 
      ? linesData 
      : new TextDecoder().decode(new Uint8Array(linesData));
    lines = parseLinesCsv(linesContent);
  } catch {
    // Lines CSV is optional
  }
  
  // Load metadata CSV
  let metadata: MetadataEntry[] = [];
  if (metadataCsvPath) {
    try {
      const metaData = await readFile(metadataCsvPath);
      const metaContent = typeof metaData === 'string' 
        ? metaData 
        : new TextDecoder().decode(new Uint8Array(metaData));
      metadata = parseMetadataCsv(metaContent);
    } catch {
      // Metadata CSV is optional
    }
  }
  
  return {
    programBytes,
    lines,
    metadata,
    lineProvider: new CsvLineProvider(lines),
  };
}

/**
 * Load artifacts from URLs (Browser)
 */
export async function loadArtifactsFromUrl(
  options: LoadArtifactsOptions
): Promise<YarnArtifacts> {
  const { programPath, linesCsvPath, metadataCsvPath } = options;
  
  // Load program
  const programResponse = await fetch(programPath);
  if (!programResponse.ok) {
    throw new Error(`Failed to load program: ${programResponse.status}`);
  }
  const programBytes = await programResponse.arrayBuffer();
  
  // Load lines CSV
  let lines: LineEntry[] = [];
  const linesPath = linesCsvPath || deriveLinesCsvPath(programPath);
  try {
    const linesResponse = await fetch(linesPath);
    if (linesResponse.ok) {
      const linesContent = await linesResponse.text();
      lines = parseLinesCsv(linesContent);
    }
  } catch {
    // Lines CSV is optional
  }
  
  // Load metadata CSV
  let metadata: MetadataEntry[] = [];
  if (metadataCsvPath) {
    try {
      const metaResponse = await fetch(metadataCsvPath);
      if (metaResponse.ok) {
        const metaContent = await metaResponse.text();
        metadata = parseMetadataCsv(metaContent);
      }
    } catch {
      // Metadata CSV is optional
    }
  }
  
  return {
    programBytes,
    lines,
    metadata,
    lineProvider: new CsvLineProvider(lines),
  };
}

/**
 * Derive lines CSV path from program path
 */
function deriveLinesCsvPath(programPath: string): string {
  // Replace .yarnc with -Lines.csv
  if (programPath.endsWith('.yarnc')) {
    return programPath.replace('.yarnc', '-Lines.csv');
  }
  return programPath + '-Lines.csv';
}

