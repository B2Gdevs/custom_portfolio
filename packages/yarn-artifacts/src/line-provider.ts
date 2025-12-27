/**
 * Line provider implementation using CSV artifacts
 */

import { parseLinesCsv, type LineEntry } from './csv-parser';

export { LineEntry };

export interface LocalizedLine {
  text: string;
  lineId: string;
  substitutions: string[];
  metadata?: Record<string, string>;
}

/**
 * Line provider using CSV line entries
 */
export class CsvLineProvider {
  private lines: Map<string, LineEntry>;
  
  constructor(entries: LineEntry[] = []) {
    this.lines = new Map();
    for (const entry of entries) {
      this.lines.set(entry.id, entry);
    }
  }
  
  /**
   * Load from CSV content
   */
  static fromCsv(csvContent: string): CsvLineProvider {
    const entries = parseLinesCsv(csvContent);
    return new CsvLineProvider(entries);
  }
  
  /**
   * Load from URL
   */
  static async fromUrl(url: string): Promise<CsvLineProvider> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch lines: ${response.status}`);
    }
    const content = await response.text();
    return CsvLineProvider.fromCsv(content);
  }
  
  /**
   * Get a line by ID
   */
  getLine(lineId: string, substitutions: string[] = []): LocalizedLine | null {
    const entry = this.lines.get(lineId);
    if (!entry) {
      return null;
    }
    
    return {
      text: this.applySubstitutions(entry.text, substitutions),
      lineId,
      substitutions,
    };
  }
  
  /**
   * Check if a line exists
   */
  hasLine(lineId: string): boolean {
    return this.lines.has(lineId);
  }
  
  /**
   * Get all line IDs
   */
  getLineIds(): string[] {
    return Array.from(this.lines.keys());
  }
  
  /**
   * Get total line count
   */
  get count(): number {
    return this.lines.size;
  }
  
  /**
   * Prepare lines (no-op for in-memory, but needed for async loading)
   */
  async prepareLines(_lineIds: string[]): Promise<void> {
    // No-op for in-memory provider
  }
  
  private applySubstitutions(text: string, substitutions: string[]): string {
    let result = text;
    substitutions.forEach((sub, idx) => {
      result = result.replace(`{${idx}}`, sub);
    });
    return result;
  }
}

/**
 * Create a line provider from artifacts
 */
export function createLineProvider(
  entries: LineEntry[] | string
): CsvLineProvider {
  if (typeof entries === 'string') {
    return CsvLineProvider.fromCsv(entries);
  }
  return new CsvLineProvider(entries);
}

