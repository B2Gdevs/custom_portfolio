import React from 'react';
interface ZoomControlsProps {
    scale: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onZoomFit: () => void;
    onZoomToSelection?: () => void;
    className?: string;
}
export declare function ZoomControls({ scale, onZoomIn, onZoomOut, onZoomFit, onZoomToSelection, className }: ZoomControlsProps): React.JSX.Element;
export {};
