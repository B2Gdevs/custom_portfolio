/**
 * Node Collision Resolution
 *
 * Utility for resolving overlapping nodes in freeform layout.
 * Iteratively pushes overlapping nodes apart until stable.
 *
 * @see https://reactflow.dev/examples/layout/node-collisions
 */
import { DialogueTree } from '../../types';
interface CollisionOptions {
    /** Maximum iterations before giving up */
    maxIterations?: number;
    /** Overlap ratio threshold to trigger resolution (0-1) */
    overlapThreshold?: number;
    /** Extra margin to add when pushing nodes apart */
    margin?: number;
}
/**
 * Resolve node collisions for freeform layout.
 * Iteratively pushes overlapping nodes apart until no collisions remain.
 *
 * @param dialogue - The dialogue tree with potentially overlapping nodes
 * @param options - Configuration options
 * @returns Updated dialogue tree with resolved positions
 */
export declare function resolveNodeCollisions(dialogue: DialogueTree, options?: CollisionOptions): DialogueTree;
export {};
