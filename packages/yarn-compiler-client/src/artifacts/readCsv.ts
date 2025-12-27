/**
 * Parse Yarn Spinner CSV artifacts
 */

import * as fs from 'fs/promises';

export interface LineEntry {
  /** Line ID (e.g., 'line:node_content_0') */
  id: string;
  /** The actual text content */
  text: string;
  /** Associated file */
  file?: string;
  /** Node name */
  node?: string;
  /** Line number in source */
  lineNumber?: number;
  /** Lock code for localization */
  lock?: string;
  /** Comment/metadata */
  comment?: string;
}

export interface MetadataEntry {
  /** Line ID */
  id: string;
  /** Node name */
  node: string;
  /** Associated tags */
  tags: string[];
}

/**
 * Parse the Lines CSV file
 * 
 * Format: id,text,file,node,lineNumber,lock,comment
 */
export async function readLinesCsv(filePath: string): Promise<LineEntry[]> {
  const content = await fs.readFile(filePath, 'utf-8');
  return parseLinesCsv(content);
}

/**
 * Parse Lines CSV content
 */
export function parseLinesCsv(content: string): LineEntry[] {
  const lines = content.split('\n');
  const entries: LineEntry[] = [];
  
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const fields = parseCsvLine(line);
    if (fields.length >= 2) {
      entries.push({
        id: fields[0],
        text: fields[1],
        file: fields[2] || undefined,
        node: fields[3] || undefined,
        lineNumber: fields[4] ? parseInt(fields[4], 10) : undefined,
        lock: fields[5] || undefined,
        comment: fields[6] || undefined,
      });
    }
  }
  
  return entries;
}

/**
 * Parse the Metadata CSV file
 * 
 * Format: id,node,tags...
 */
export async function readMetadataCsv(filePath: string): Promise<MetadataEntry[]> {
  const content = await fs.readFile(filePath, 'utf-8');
  return parseMetadataCsv(content);
}

/**
 * Parse Metadata CSV content
 */
export function parseMetadataCsv(content: string): MetadataEntry[] {
  const lines = content.split('\n');
  const entries: MetadataEntry[] = [];
  
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const fields = parseCsvLine(line);
    if (fields.length >= 2) {
      entries.push({
        id: fields[0],
        node: fields[1],
        tags: fields.slice(2).filter(t => t.length > 0),
      });
    }
  }
  
  return entries;
}

/**
 * Parse a single CSV line, handling quoted fields
 */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  // Push last field
  fields.push(current);
  
  return fields;
}

