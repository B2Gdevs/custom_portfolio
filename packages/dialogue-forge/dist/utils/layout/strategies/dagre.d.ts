/**
 * Dagre Layout Strategy
 *
 * Hierarchical layout using the dagre library.
 * Best for dialogue trees with clear start-to-end flow.
 *
 * @see https://github.com/dagrejs/dagre
 * @see https://reactflow.dev/examples/layout/dagre
 */
import { DialogueTree } from '../../../types';
import { LayoutStrategy, LayoutOptions, LayoutResult } from '../types';
export declare class DagreLayoutStrategy implements LayoutStrategy {
    readonly id = "dagre";
    readonly name = "Dagre (Hierarchical)";
    readonly description = "Hierarchical layout that flows from start to end. Best for linear dialogue with branches.";
    readonly defaultOptions: Partial<LayoutOptions>;
    apply(dialogue: DialogueTree, options?: LayoutOptions): LayoutResult;
    supports(dialogue: DialogueTree): boolean;
}
