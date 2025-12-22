import React from 'react';
interface GuidePanelProps {
    isOpen: boolean;
    onClose: () => void;
}
export declare function GuidePanel({ isOpen, onClose }: GuidePanelProps): React.JSX.Element | null;
export {};
