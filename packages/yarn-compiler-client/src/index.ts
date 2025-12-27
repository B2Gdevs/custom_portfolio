/**
 * @magicborn/yarn-compiler-client
 * 
 * Node.js wrapper for the Yarn Spinner compiler (ysc).
 * Bundles ysc binaries for multiple platforms.
 */

export { compileProject, type CompileProjectInput, type CompileProjectOutput } from './compileProject';
export { runYsc, type RunYscArgs, type RunYscResult } from './ysc/runYsc';
export { resolveYscBinaryPath, isBinaryAvailable, getPlatformInfo } from './ysc/resolveBinary';
export { readLinesCsv, readMetadataCsv, type LineEntry, type MetadataEntry } from './artifacts/readCsv';
export { CompilerError, BinaryNotFoundError } from './errors';

