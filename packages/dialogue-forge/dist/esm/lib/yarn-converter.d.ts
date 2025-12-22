import { DialogueTree } from '../types';
/**
 * Convert DialogueTree to Yarn Spinner format
 *
 * Flags are converted to Yarn variables ($variable).
 * Variables are NOT stored in the .yarn file - they're managed by
 * Yarn Spinner's Variable Storage at runtime.
 *
 * The .yarn file contains commands like:
 * - <<set $flag_name = value>> - Sets variable in Variable Storage
 * - <<if $flag_name>> - Checks variable in Variable Storage
 */
export declare function exportToYarn(tree: DialogueTree): string;
/**
 * Parse Yarn Spinner format to DialogueTree
 */
export declare function importFromYarn(yarnContent: string, title?: string): DialogueTree;
