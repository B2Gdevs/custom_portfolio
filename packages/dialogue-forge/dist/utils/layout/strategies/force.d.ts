/**
 * Force-Directed Layout Strategy
 *
 * Physics-based layout that spreads nodes evenly.
 * Good for exploring graph structure without hierarchy.
 *
 * Uses a simple force simulation:
 * - Nodes repel each other (like charged particles)
 * - Connected nodes attract (like springs)
 */
import { DialogueTree } from '../../../types';
import { LayoutStrategy, LayoutOptions, LayoutResult } from '../types';
export declare class ForceLayoutStrategy implements LayoutStrategy {
    readonly id = "force";
    readonly name = "Force-Directed";
    readonly description = "Physics-based layout that spreads nodes evenly. Good for exploring complex graphs.";
    readonly defaultOptions: Partial<LayoutOptions>;
    apply(dialogue: DialogueTree, options?: LayoutOptions): LayoutResult;
    private emptyResult;
    supports(): boolean;
}
