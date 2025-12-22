import React from 'react';
import { DialogueTree } from '../types';
interface YarnViewProps {
    dialogue: DialogueTree;
    onExport: () => void;
}
export declare function YarnView({ dialogue, onExport }: YarnViewProps): React.JSX.Element;
export {};
