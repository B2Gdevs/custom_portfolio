/**
 * Parse Yarn Spinner CSV files
 */

export interface LineEntry {
  id: string;
  text: string;
  file?: string;
  node?: string;
  lineNumber?: number;
  lock?: string;
  comment?: string;
}

export interface MetadataEntry {
  id: string;
  node: string;
  tags: string[];
}

/**
 * Parse a Lines CSV string
 */
export function parseLinesCsv(content: string): LineEntry[] {
  const lines = content.split('\n');
  const entries: LineEntry[] = [];
  
  // Skip header row
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
 * Parse a Metadata CSV string
 */
export function parseMetadataCsv(content: string): MetadataEntry[] {
  const lines = content.split('\n');
  const entries: MetadataEntry[] = [];
  
  // Skip header row
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
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  fields.push(current);
  return fields;
}

