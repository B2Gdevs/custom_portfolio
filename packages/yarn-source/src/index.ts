/**
 * @magicborn/yarn-source
 * 
 * Convert DialogueTree graphs to Yarn Spinner source format
 * with stable line IDs for compilation and localization.
 */

export { exportGraphToYarn, type ExportOptions } from './exportGraphToYarn';
export { ensureLineIds, generateLineId, type LineIdOptions } from './ensureLineIds';
export { createSourceMap, type SourceMap, type SourceMapEntry } from './sourceMap';
export { YarnSourceBuilder } from './builder';

