import React from 'react';
import { FlagSchema } from '../types/flags';
import 'react-tooltip/dist/react-tooltip.css';
interface FlagSelectorProps {
    value: string[];
    onChange: (flags: string[]) => void;
    flagSchema?: FlagSchema;
    placeholder?: string;
}
export declare function FlagSelector({ value, onChange, flagSchema, placeholder }: FlagSelectorProps): React.JSX.Element;
export {};
