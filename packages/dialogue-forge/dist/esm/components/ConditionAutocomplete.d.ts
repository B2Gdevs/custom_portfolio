import React from 'react';
import { FlagSchema } from '../types/flags';
interface ConditionAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    placeholder?: string;
    className?: string;
    style?: React.CSSProperties;
    flagSchema?: FlagSchema;
    textarea?: boolean;
}
export declare function ConditionAutocomplete({ value, onChange, onBlur, placeholder, className, style, flagSchema, textarea }: ConditionAutocompleteProps): React.JSX.Element;
export {};
