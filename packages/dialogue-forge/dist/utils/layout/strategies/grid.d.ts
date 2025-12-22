/**
 * Grid Layout Strategy
 *
 * Simple grid-based layout that arranges nodes in rows and columns.
 * Useful for getting a quick overview of all nodes.
 */
import { DialogueTree } from '../../../types';
import { LayoutStrategy, LayoutOptions, LayoutResult } from '../types';
export declare class GridLayoutStrategy implements LayoutStrategy {
    readonly id = "grid";
    readonly name = "Grid";
    readonly description = "Arranges nodes in a simple grid pattern. Good for viewing all nodes at once.";
    readonly defaultOptions: Partial<LayoutOptions>;
    apply(dialogue: DialogueTree, options?: LayoutOptions): LayoutResult;
    private emptyResult;
    supports(): boolean;
}
