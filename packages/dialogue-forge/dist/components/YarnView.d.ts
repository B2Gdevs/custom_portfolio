import React from 'react';
import { DialogueTree } from '../types';
interface YarnViewProps {
    dialogue: DialogueTree;
    onExport: () => void;
    onImport?: (yarn: string) => void;
}
export declare function YarnView({ dialogue, onExport, onImport }: YarnViewProps): React.JSX.Element;
export {};
