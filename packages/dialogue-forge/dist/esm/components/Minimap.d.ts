import React from 'react';
import { DialogueTree } from '../types';
interface MinimapProps {
    dialogue: DialogueTree;
    viewport: {
        x: number;
        y: number;
        width: number;
        height: number;
        scale: number;
    };
    onNavigate: (x: number, y: number) => void;
    className?: string;
}
export declare function Minimap({ dialogue, viewport, onNavigate, className }: MinimapProps): React.JSX.Element;
export {};
