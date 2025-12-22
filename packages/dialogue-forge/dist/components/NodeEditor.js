"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeEditor = NodeEditor;
const react_1 = __importStar(require("react"));
const FlagSelector_1 = require("./FlagSelector");
const constants_1 = require("../types/constants");
const lucide_react_1 = require("lucide-react");
const reactflow_converter_1 = require("../utils/reactflow-converter");
const EdgeIcon_1 = require("./EdgeIcon");
const ConditionAutocomplete_1 = require("./ConditionAutocomplete");
function NodeEditor({ node, dialogue, onUpdate, onDelete, onAddChoice, onUpdateChoice, onRemoveChoice, onClose, onPlayFromHere, onFocusNode, flagSchema }) {
    // Local state for condition input values (keyed by block id for conditional blocks, choice id for choices)
    const [conditionInputs, setConditionInputs] = (0, react_1.useState)({});
    const [debouncedConditionInputs, setDebouncedConditionInputs] = (0, react_1.useState)({});
    const [editingCondition, setEditingCondition] = (0, react_1.useState)(null);
    const [debouncedEditingValue, setDebouncedEditingValue] = (0, react_1.useState)('');
    const [dismissedConditions, setDismissedConditions] = (0, react_1.useState)(new Set()); // Track which conditions have been dismissed
    const [expandedConditions, setExpandedConditions] = (0, react_1.useState)(new Set()); // Track which conditions are manually opened
    const prevNodeIdRef = (0, react_1.useRef)(node.id);
    const initializedBlocksRef = (0, react_1.useRef)(new Set());
    const initializedChoicesRef = (0, react_1.useRef)(new Set());
    const debounceTimersRef = (0, react_1.useRef)({});
    const editingDebounceTimerRef = (0, react_1.useRef)(null);
    // Validation function for condition expressions
    const validateCondition = (0, react_1.useMemo)(() => {
        return (conditionStr) => {
            const errors = [];
            const warnings = [];
            if (!conditionStr.trim()) {
                return { isValid: true, errors: [], warnings: [] }; // Empty is valid (optional)
            }
            // Check for basic syntax issues
            const parts = conditionStr.split(/\s+and\s+/i);
            let hasValidPart = false;
            parts.forEach((part, idx) => {
                part = part.trim();
                if (!part)
                    return;
                // Check if it's a valid condition pattern (including literals for always-true/false)
                const patterns = [
                    /^not\s+\$(\w+)$/, // not $flag
                    /^\$(\w+)\s*>=\s*(.+)$/, // $flag >= value
                    /^\$(\w+)\s*<=\s*(.+)$/, // $flag <= value
                    /^\$(\w+)\s*!=\s*(.+)$/, // $flag != value
                    /^\$(\w+)\s*==\s*(.+)$/, // $flag == value
                    /^\$(\w+)\s*>\s*(.+)$/, // $flag > value
                    /^\$(\w+)\s*<\s*(.+)$/, // $flag < value
                    /^\$(\w+)$/, // $flag
                    // Allow literal comparisons (for always-true/false expressions)
                    /^(.+)\s*==\s*(.+)$/, // literal == literal (e.g., 1 == 1, true == true)
                    /^(.+)\s*!=\s*(.+)$/, // literal != literal
                    /^(.+)\s*>=\s*(.+)$/, // literal >= literal
                    /^(.+)\s*<=\s*(.+)$/, // literal <= literal
                    /^(.+)\s*>\s*(.+)$/, // literal > literal
                    /^(.+)\s*<\s*(.+)$/, // literal < literal
                    /^(true|false)$/i, // boolean literals
                ];
                const matches = patterns.some(pattern => pattern.test(part));
                if (!matches) {
                    errors.push(`Invalid syntax in part ${idx + 1}: "${part}"`);
                    return;
                }
                hasValidPart = true;
                // Extract flag name (only if it starts with $)
                const flagMatch = part.match(/\$(\w+)/);
                if (flagMatch) {
                    const flagName = flagMatch[1];
                    // Check if flag exists in schema
                    if (flagSchema) {
                        const flagDef = flagSchema.flags.find(f => f.id === flagName);
                        if (!flagDef) {
                            warnings.push(`Flag "${flagName}" is not defined in your flag schema`);
                        }
                        else {
                            // Check if operator matches flag type
                            if (part.includes('>') || part.includes('<') || part.includes('>=') || part.includes('<=')) {
                                if (flagDef.valueType !== 'number') {
                                    warnings.push(`Flag "${flagName}" is not a number type, but you're using a numeric comparison`);
                                }
                            }
                        }
                    }
                    else {
                        warnings.push(`No flag schema provided - cannot validate flag "${flagName}"`);
                    }
                }
                else {
                    // This is a literal comparison (like "1 == 1" or "true")
                    // These are valid but warn that they're unusual
                    if (part.match(/^(true|false)$/i)) {
                        // Boolean literal - this is fine
                    }
                    else if (part.includes('==') || part.includes('!=') || part.includes('>') || part.includes('<')) {
                        // Literal comparison - warn that this is unusual but allow it
                        warnings.push(`Literal comparison "${part}" will always evaluate to the same result. Consider using a flag variable instead.`);
                    }
                }
            });
            if (!hasValidPart && conditionStr.trim()) {
                errors.push('Invalid condition syntax. Use: $flag, $flag == value, $flag > 10, 1 == 1, etc.');
            }
            return {
                isValid: errors.length === 0,
                errors,
                warnings
            };
        };
    }, [flagSchema]);
    // Only initialize condition inputs when node changes or when new blocks are added
    (0, react_1.useEffect)(() => {
        // Clear everything when switching to a different node
        if (prevNodeIdRef.current !== node.id) {
            prevNodeIdRef.current = node.id;
            setConditionInputs({});
            setDismissedConditions(new Set()); // Reset dismissed conditions when switching nodes
            setExpandedConditions(new Set()); // Reset expanded conditions when switching nodes
            initializedBlocksRef.current.clear();
            initializedChoicesRef.current.clear();
        }
        // Always sync condition inputs with actual block conditions (not just initialize once)
        if (node.conditionalBlocks) {
            setConditionInputs(prev => {
                const newInputs = { ...prev };
                node.conditionalBlocks.forEach(block => {
                    if (block.type !== 'else') {
                        // Always convert condition array to Yarn-style string from the actual block data
                        if (block.condition && block.condition.length > 0) {
                            const conditionStr = block.condition.map(cond => {
                                const varName = `$${cond.flag}`;
                                if (cond.operator === 'is_set') {
                                    return varName;
                                }
                                else if (cond.operator === 'is_not_set') {
                                    return `not ${varName}`;
                                }
                                else if (cond.value !== undefined) {
                                    const op = cond.operator === 'equals' ? '==' :
                                        cond.operator === 'not_equals' ? '!=' :
                                            cond.operator === 'greater_than' ? '>' :
                                                cond.operator === 'less_than' ? '<' :
                                                    cond.operator === 'greater_equal' ? '>=' :
                                                        cond.operator === 'less_equal' ? '<=' : '==';
                                    const value = typeof cond.value === 'string' ? `"${cond.value}"` : cond.value;
                                    return `${varName} ${op} ${value}`;
                                }
                                return '';
                            }).filter(c => c).join(' and ') || '';
                            // Only update if it's different from what we have (to avoid overwriting user typing)
                            if (newInputs[block.id] !== conditionStr) {
                                newInputs[block.id] = conditionStr;
                            }
                        }
                        else {
                            // Empty condition - only set if not already set or if it's different
                            if (newInputs[block.id] === undefined || newInputs[block.id] !== '') {
                                newInputs[block.id] = '';
                            }
                        }
                    }
                });
                // Remove inputs for blocks that no longer exist
                const blockIds = new Set(node.conditionalBlocks.map(b => b.id));
                Object.keys(newInputs).forEach(id => {
                    if (!blockIds.has(id) && !id.startsWith('choice-')) {
                        delete newInputs[id];
                        initializedBlocksRef.current.delete(id);
                    }
                });
                return newInputs;
            });
        }
        else {
            // Clear block inputs but keep choice inputs
            setConditionInputs(prev => {
                const newInputs = {};
                Object.keys(prev).forEach(key => {
                    // Keep choice inputs (they start with 'choice-')
                    if (key.startsWith('choice-')) {
                        newInputs[key] = prev[key];
                    }
                });
                return newInputs;
            });
            initializedBlocksRef.current.clear();
        }
        // Initialize inputs for choice conditions
        if (node.choices) {
            setConditionInputs(prev => {
                const newInputs = { ...prev };
                node.choices.forEach(choice => {
                    const choiceKey = `choice-${choice.id}`;
                    // Only initialize if this choice hasn't been initialized yet
                    if (!initializedChoicesRef.current.has(choiceKey)) {
                        initializedChoicesRef.current.add(choiceKey);
                        if (choice.conditions && choice.conditions.length > 0) {
                            // Convert condition array to Yarn-style string
                            const conditionStr = choice.conditions.map(cond => {
                                const varName = `$${cond.flag}`;
                                if (cond.operator === 'is_set') {
                                    return varName;
                                }
                                else if (cond.operator === 'is_not_set') {
                                    return `not ${varName}`;
                                }
                                else if (cond.value !== undefined) {
                                    const op = cond.operator === 'equals' ? '==' :
                                        cond.operator === 'not_equals' ? '!=' :
                                            cond.operator === 'greater_than' ? '>' :
                                                cond.operator === 'less_than' ? '<' :
                                                    cond.operator === 'greater_equal' ? '>=' :
                                                        cond.operator === 'less_equal' ? '<=' : '==';
                                    const value = typeof cond.value === 'string' ? `"${cond.value}"` : cond.value;
                                    return `${varName} ${op} ${value}`;
                                }
                                return '';
                            }).filter(c => c).join(' and ') || '';
                            newInputs[choiceKey] = conditionStr;
                        }
                        else if (choice.conditions !== undefined) {
                            // Empty array - user clicked "Add Condition"
                            newInputs[choiceKey] = '';
                        }
                    }
                });
                // Remove inputs for choices that no longer exist
                const choiceIds = new Set(node.choices.map(c => `choice-${c.id}`));
                Object.keys(newInputs).forEach(key => {
                    if (key.startsWith('choice-') && !choiceIds.has(key)) {
                        delete newInputs[key];
                        initializedChoicesRef.current.delete(key);
                    }
                });
                return newInputs;
            });
        }
        else {
            // Clear choice inputs
            setConditionInputs(prev => {
                const newInputs = {};
                Object.keys(prev).forEach(key => {
                    if (!key.startsWith('choice-')) {
                        newInputs[key] = prev[key];
                    }
                });
                return newInputs;
            });
            initializedChoicesRef.current.clear();
        }
    }, [node.id, node.conditionalBlocks?.length, node.choices?.length]); // Only depend on length, not the arrays themselves
    // Determine border color based on node type
    const getBorderColor = () => {
        if (node.type === 'npc')
            return 'border-[#e94560]';
        if (node.type === 'player')
            return 'border-[#8b5cf6]';
        if (node.type === 'conditional')
            return 'border-[#3b82f6]';
        return 'border-[#1a1a2e]';
    };
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement("style", null, `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(10px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `),
        react_1.default.createElement("aside", { className: `w-80 border-l ${getBorderColor()} bg-[#0d0d14] overflow-y-auto` },
            react_1.default.createElement("div", { className: "p-4 space-y-4" },
                react_1.default.createElement("div", { className: "flex items-center justify-between" },
                    react_1.default.createElement("span", { className: `text-xs px-2 py-0.5 rounded ${node.type === 'npc' ? 'bg-[#e94560]/20 text-[#e94560]' :
                            node.type === 'player' ? 'bg-purple-500/20 text-purple-400' :
                                'bg-blue-500/20 text-blue-400'}` }, node.type === 'npc' ? 'NPC' : node.type === 'player' ? 'PLAYER' : 'CONDITIONAL'),
                    react_1.default.createElement("div", { className: "flex gap-1" },
                        react_1.default.createElement("button", { onClick: onDelete, className: "p-1 text-gray-500 hover:text-red-400", title: "Delete node" },
                            react_1.default.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                                react_1.default.createElement("polyline", { points: "3 6 5 6 21 6" }),
                                react_1.default.createElement("path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }))),
                        react_1.default.createElement("button", { onClick: onClose, className: "p-1 text-gray-500 hover:text-white", title: "Close" },
                            react_1.default.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                                react_1.default.createElement("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
                                react_1.default.createElement("line", { x1: "6", y1: "6", x2: "18", y2: "18" }))))),
                react_1.default.createElement("div", null,
                    react_1.default.createElement("label", { className: "text-[10px] text-gray-500 uppercase" }, "ID"),
                    react_1.default.createElement("input", { value: node.id, disabled: true, className: "w-full bg-[#12121a] border border-[#2a2a3e] rounded px-2 py-1 text-xs text-gray-500 font-mono" })),
                node.type === 'npc' && (react_1.default.createElement(react_1.default.Fragment, null,
                    react_1.default.createElement("div", null,
                        react_1.default.createElement("label", { className: "text-[10px] text-gray-500 uppercase" }, "Speaker"),
                        react_1.default.createElement("div", { className: "flex items-center gap-2" },
                            react_1.default.createElement("div", { className: "w-8 h-8 rounded-full bg-[#2a2a3e] border border-[#2a2a3e] flex items-center justify-center flex-shrink-0" },
                                react_1.default.createElement(lucide_react_1.User, { size: 16, className: "text-gray-500" })),
                            react_1.default.createElement("input", { type: "text", value: node.speaker || '', onChange: (e) => onUpdate({ speaker: e.target.value }), className: "flex-1 bg-[#12121a] border border-[#2a2a3e] rounded px-2 py-1 text-sm text-gray-200 focus:border-[#e94560] outline-none", placeholder: "Character name" }))),
                    react_1.default.createElement("div", null,
                        react_1.default.createElement("label", { className: "text-[10px] text-gray-500 uppercase" }, "Content"),
                        react_1.default.createElement("textarea", { value: node.content, onChange: (e) => onUpdate({ content: e.target.value }), className: "w-full bg-[#12121a] border border-[#2a2a3e] rounded px-2 py-1 text-sm text-gray-200 focus:border-[#e94560] outline-none min-h-[100px] resize-y", placeholder: "What the character says..." })),
                    react_1.default.createElement("div", null,
                        react_1.default.createElement("label", { className: "text-[10px] text-gray-500 uppercase" }, "Next Node"),
                        react_1.default.createElement("div", { className: "flex items-center gap-2" },
                            node.nextNodeId && onFocusNode && (react_1.default.createElement("button", { type: "button", onClick: (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onFocusNode(node.nextNodeId);
                                }, className: "transition-colors cursor-pointer flex-shrink-0 group", title: `Focus on node: ${node.nextNodeId}` },
                                react_1.default.createElement(EdgeIcon_1.EdgeIcon, { size: 16, color: "#2a2a3e", className: "group-hover:[&_circle]:fill-[#2a2a3e] group-hover:[&_line]:stroke-[#2a2a3e] transition-colors" }))),
                            react_1.default.createElement("select", { value: node.nextNodeId || '', onChange: (e) => onUpdate({ nextNodeId: e.target.value || undefined }), className: "flex-1 bg-[#12121a] border border-[#2a2a3e] rounded px-2 py-1 text-sm text-gray-200 outline-none" },
                                react_1.default.createElement("option", { value: "" }, "\u2014 End \u2014"),
                                Object.keys(dialogue.nodes).filter(id => id !== node.id).map(id => (react_1.default.createElement("option", { key: id, value: id }, id)))))))),
                node.type === 'conditional' && (react_1.default.createElement(react_1.default.Fragment, null,
                    react_1.default.createElement("div", null,
                        react_1.default.createElement("div", { className: "flex items-center justify-between mb-2" },
                            react_1.default.createElement("label", { className: "text-[10px] text-gray-500 uppercase" }, "Conditional Blocks")),
                        node.conditionalBlocks ? (react_1.default.createElement("div", { className: "space-y-2" },
                            node.conditionalBlocks.map((block, idx) => {
                                const conditionValue = block.type !== 'else' ? (conditionInputs[block.id] || '') : '';
                                const debouncedValue = block.type !== 'else' ? (debouncedConditionInputs[block.id] || '') : '';
                                // Use current value for immediate validation feedback, debounced value for final validation
                                const valueToValidate = debouncedValue || conditionValue;
                                const validation = block.type !== 'else' ? validateCondition(valueToValidate) : { isValid: true, errors: [], warnings: [] };
                                const hasError = !validation.isValid;
                                const hasWarning = validation.warnings.length > 0;
                                const showValidation = conditionValue.trim().length > 0;
                                const isManuallyOpen = expandedConditions.has(block.id);
                                const shouldExpand = isManuallyOpen;
                                // Determine block styling based on type
                                const blockTypeStyles = {
                                    if: {
                                        bg: 'bg-[#0a0a0a]',
                                        border: 'border-[#1a1a1a]',
                                        tagBg: 'bg-black',
                                        tagText: 'text-white',
                                        text: 'text-gray-100'
                                    },
                                    elseif: {
                                        bg: 'bg-[#0f0f0f]',
                                        border: 'border-[#1f1f1f]',
                                        tagBg: 'bg-black',
                                        tagText: 'text-white',
                                        text: 'text-gray-200'
                                    },
                                    else: {
                                        bg: 'bg-[#141414]',
                                        border: 'border-[#242424]',
                                        tagBg: 'bg-black',
                                        tagText: 'text-white',
                                        text: 'text-gray-200'
                                    }
                                };
                                const styles = blockTypeStyles[block.type];
                                return (react_1.default.createElement("div", { key: block.id, className: `rounded p-2 space-y-2 ${styles.bg} ${styles.border} border-2` },
                                    react_1.default.createElement("div", { className: "flex items-center gap-2" },
                                        react_1.default.createElement("span", { className: `text-[9px] px-1.5 py-0.5 rounded ${styles.tagBg} ${styles.tagText} font-semibold` }, block.type === 'if' ? 'IF' : block.type === 'elseif' ? 'ELSE IF' : 'ELSE'),
                                        react_1.default.createElement("div", { className: "flex items-center gap-2 flex-1" },
                                            react_1.default.createElement("div", { className: "w-6 h-6 rounded-full bg-[#2a2a2a] flex items-center justify-center flex-shrink-0" },
                                                react_1.default.createElement(lucide_react_1.User, { size: 12, className: "text-gray-400" })),
                                            react_1.default.createElement("input", { type: "text", value: block.speaker || '', onChange: (e) => {
                                                    const newBlocks = [...node.conditionalBlocks];
                                                    newBlocks[idx] = { ...block, speaker: e.target.value || undefined };
                                                    onUpdate({ conditionalBlocks: newBlocks });
                                                }, className: `flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2 py-1 text-xs ${styles.text} focus:border-blue-500 outline-none`, placeholder: "Speaker (optional)" }))),
                                    block.type !== 'else' && (() => {
                                        const parseCondition = (conditionStr) => {
                                            const conditions = [];
                                            if (!conditionStr.trim())
                                                return conditions;
                                            const parts = conditionStr.split(/\s+and\s+/i);
                                            parts.forEach(part => {
                                                part = part.trim();
                                                if (part.startsWith('not ')) {
                                                    const varMatch = part.match(/not\s+\$(\w+)/);
                                                    if (varMatch) {
                                                        conditions.push({ flag: varMatch[1], operator: constants_1.CONDITION_OPERATOR.IS_NOT_SET });
                                                    }
                                                }
                                                else if (part.includes('>=')) {
                                                    const match = part.match(/\$(\w+)\s*>=\s*(.+)/);
                                                    if (match) {
                                                        const value = match[2].trim().replace(/^["']|["']$/g, '');
                                                        conditions.push({ flag: match[1], operator: constants_1.CONDITION_OPERATOR.GREATER_EQUAL, value: isNaN(Number(value)) ? value : Number(value) });
                                                    }
                                                }
                                                else if (part.includes('<=')) {
                                                    const match = part.match(/\$(\w+)\s*<=\s*(.+)/);
                                                    if (match) {
                                                        const value = match[2].trim().replace(/^["']|["']$/g, '');
                                                        conditions.push({ flag: match[1], operator: constants_1.CONDITION_OPERATOR.LESS_EQUAL, value: isNaN(Number(value)) ? value : Number(value) });
                                                    }
                                                }
                                                else if (part.includes('!=')) {
                                                    const match = part.match(/\$(\w+)\s*!=\s*(.+)/);
                                                    if (match) {
                                                        const value = match[2].trim().replace(/^["']|["']$/g, '');
                                                        conditions.push({ flag: match[1], operator: constants_1.CONDITION_OPERATOR.NOT_EQUALS, value: isNaN(Number(value)) ? value : Number(value) });
                                                    }
                                                }
                                                else if (part.includes('==')) {
                                                    const match = part.match(/\$(\w+)\s*==\s*(.+)/);
                                                    if (match) {
                                                        const value = match[2].trim().replace(/^["']|["']$/g, '');
                                                        conditions.push({ flag: match[1], operator: constants_1.CONDITION_OPERATOR.EQUALS, value: isNaN(Number(value)) ? value : Number(value) });
                                                    }
                                                }
                                                else if (part.includes('>') && !part.includes('>=')) {
                                                    const match = part.match(/\$(\w+)\s*>\s*(.+)/);
                                                    if (match) {
                                                        const value = match[2].trim().replace(/^["']|["']$/g, '');
                                                        conditions.push({ flag: match[1], operator: constants_1.CONDITION_OPERATOR.GREATER_THAN, value: isNaN(Number(value)) ? value : Number(value) });
                                                    }
                                                }
                                                else if (part.includes('<') && !part.includes('<=')) {
                                                    const match = part.match(/\$(\w+)\s*<\s*(.+)/);
                                                    if (match) {
                                                        const value = match[2].trim().replace(/^["']|["']$/g, '');
                                                        conditions.push({ flag: match[1], operator: constants_1.CONDITION_OPERATOR.LESS_THAN, value: isNaN(Number(value)) ? value : Number(value) });
                                                    }
                                                }
                                                else {
                                                    const varMatch = part.match(/\$(\w+)/);
                                                    if (varMatch) {
                                                        conditions.push({ flag: varMatch[1], operator: constants_1.CONDITION_OPERATOR.IS_SET });
                                                    }
                                                }
                                            });
                                            return conditions;
                                        };
                                        return (react_1.default.createElement("div", { className: "bg-[#1a1a1a] border border-[#2a2a2a] rounded p-2 space-y-1" },
                                            react_1.default.createElement("div", { className: "flex items-center gap-2" },
                                                react_1.default.createElement("label", { className: `text-[10px] ${styles.text} uppercase font-medium` }, "Condition")),
                                            react_1.default.createElement("div", { className: "relative" },
                                                react_1.default.createElement("input", { type: "text", value: conditionValue, onChange: (e) => {
                                                        setConditionInputs(prev => ({ ...prev, [block.id]: e.target.value }));
                                                        const newBlocks = [...node.conditionalBlocks];
                                                        newBlocks[idx] = {
                                                            ...block,
                                                            condition: parseCondition(e.target.value)
                                                        };
                                                        onUpdate({ conditionalBlocks: newBlocks });
                                                    }, className: `w-full bg-[#1a1a1a] border rounded px-2 py-1 pr-24 text-xs ${styles.text} font-mono outline-none transition-all`, style: {
                                                        borderColor: showValidation
                                                            ? (hasError ? '#ef4444' :
                                                                hasWarning ? '#eab308' :
                                                                    validation.isValid ? '#22c55e' : '#2a2a2a')
                                                            : '#2a2a2a'
                                                    }, placeholder: 'e.g., $flag == "value" or $stat >= 100' }),
                                                react_1.default.createElement("div", { className: "absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1" },
                                                    showValidation && (react_1.default.createElement(react_1.default.Fragment, null, hasError ? (react_1.default.createElement("div", { className: "group relative" },
                                                        react_1.default.createElement(lucide_react_1.AlertCircle, { className: "w-4 h-4 text-red-500" }),
                                                        react_1.default.createElement("div", { className: "absolute right-0 top-6 w-64 p-2 bg-[#1a1a1a] border border-red-500 rounded text-xs text-gray-300 z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" },
                                                            react_1.default.createElement("div", { className: "font-semibold text-red-400 mb-1" }, "Validation Errors:"),
                                                            validation.errors.map((error, i) => (react_1.default.createElement("div", { key: i },
                                                                "\u2022 ",
                                                                error)))))) : hasWarning ? (react_1.default.createElement("div", { className: "group relative" },
                                                        react_1.default.createElement(lucide_react_1.Info, { className: "w-4 h-4 text-yellow-500" }),
                                                        react_1.default.createElement("div", { className: "absolute right-0 top-6 w-64 p-2 bg-[#1a1a1a] border border-yellow-500 rounded text-xs text-gray-300 z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" },
                                                            react_1.default.createElement("div", { className: "font-semibold text-yellow-400 mb-1" }, "Warnings:"),
                                                            validation.warnings.map((warning, i) => (react_1.default.createElement("div", { key: i },
                                                                "\u2022 ",
                                                                warning)))))) : (react_1.default.createElement(lucide_react_1.CheckCircle, { className: "w-4 h-4 text-green-500" })))),
                                                    react_1.default.createElement("button", { onClick: () => {
                                                            setExpandedConditions(prev => {
                                                                const next = new Set(prev);
                                                                next.add(block.id);
                                                                return next;
                                                            });
                                                        }, className: "p-1 text-gray-400 hover:text-blue-400 transition-colors", title: "Expand editor" },
                                                        react_1.default.createElement(lucide_react_1.Maximize2, { size: 14 })))),
                                            showValidation && validation.errors.length > 0 && (react_1.default.createElement("p", { className: "text-[10px] text-red-500 mt-1" }, validation.errors[0])),
                                            showValidation && validation.warnings.length > 0 && validation.errors.length === 0 && (react_1.default.createElement("p", { className: "text-[10px] text-yellow-500 mt-1" }, validation.warnings[0])),
                                            showValidation && validation.isValid && validation.errors.length === 0 && validation.warnings.length === 0 && (react_1.default.createElement("p", { className: "text-[10px] text-green-500 mt-1" }, "Valid condition")),
                                            !conditionValue && (react_1.default.createElement("p", { className: "text-[10px] text-blue-400/80 mt-1" }, "Type Yarn condition: $flag, $flag == value, $stat >= 100, etc."))));
                                    })(),
                                    shouldExpand && (react_1.default.createElement("div", { className: "fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 transition-opacity", style: { animation: 'fadeIn 0.2s ease-in-out' }, onMouseDown: (e) => {
                                            if (e.target === e.currentTarget) {
                                                e.currentTarget.setAttribute('data-mousedown-backdrop', 'true');
                                            }
                                        }, onMouseUp: (e) => {
                                            if (e.target === e.currentTarget &&
                                                e.currentTarget.getAttribute('data-mousedown-backdrop') === 'true') {
                                                setExpandedConditions(prev => {
                                                    const next = new Set(prev);
                                                    next.delete(block.id);
                                                    return next;
                                                });
                                            }
                                            e.currentTarget.removeAttribute('data-mousedown-backdrop');
                                        } },
                                        react_1.default.createElement("div", { className: "bg-[#0d0d14] border border-[#2a2a3e] rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col transition-all", style: { animation: 'slideUp 0.2s ease-out' }, onClick: (e) => e.stopPropagation() },
                                            react_1.default.createElement("div", { className: "p-3 border-b border-[#2a2a3e] flex items-center justify-between bg-gradient-to-r from-[#0d0d14] to-[#1a1a2e]" },
                                                react_1.default.createElement("h3", { className: "text-sm font-semibold text-white flex items-center gap-2" },
                                                    react_1.default.createElement("span", { className: "text-blue-400" }, "\u26A1"),
                                                    "Condition Editor"),
                                                react_1.default.createElement("button", { onClick: () => {
                                                        setExpandedConditions(prev => {
                                                            const next = new Set(prev);
                                                            next.delete(block.id);
                                                            return next;
                                                        });
                                                    }, className: "p-1 text-gray-400 hover:text-white transition-colors", title: "Close (Esc)" },
                                                    react_1.default.createElement(lucide_react_1.X, { size: 16 }))),
                                            react_1.default.createElement("div", { className: "flex flex-1 overflow-hidden" },
                                                react_1.default.createElement("div", { className: "w-44 bg-[#0a0a0f] border-r border-[#2a2a3e] p-3 overflow-y-auto flex flex-col gap-4" },
                                                    react_1.default.createElement("div", { className: "bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-2.5" },
                                                        react_1.default.createElement("div", { className: "flex items-center gap-1.5 mb-1.5" },
                                                            react_1.default.createElement("span", { className: "text-sm" }, "\uD83D\uDCA1"),
                                                            react_1.default.createElement("span", { className: "text-[10px] font-semibold text-blue-400 uppercase tracking-wide" }, "Pro Tip")),
                                                        react_1.default.createElement("p", { className: "text-[10px] text-gray-400 leading-relaxed" },
                                                            "Type ",
                                                            react_1.default.createElement("code", { className: "text-purple-400 bg-purple-500/20 px-1 rounded font-bold" }, "$"),
                                                            " to access variables & flags.")),
                                                    react_1.default.createElement("div", null,
                                                        react_1.default.createElement("label", { className: "text-[9px] text-gray-500 uppercase mb-1.5 block font-semibold tracking-wider" }, "Operators"),
                                                        react_1.default.createElement("div", { className: "grid grid-cols-3 gap-1" }, ['==', '!=', '>=', '<=', '>', '<'].map((op) => (react_1.default.createElement("button", { key: op, type: "button", onClick: () => {
                                                                const val = conditionValue;
                                                                const space = val.length > 0 && !val.endsWith(' ') ? ' ' : '';
                                                                setConditionInputs(prev => ({ ...prev, [block.id]: val + space + op + ' ' }));
                                                            }, className: "px-1.5 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded text-xs font-mono hover:bg-purple-500/40 transition-all" }, op))))),
                                                    react_1.default.createElement("div", null,
                                                        react_1.default.createElement("label", { className: "text-[9px] text-gray-500 uppercase mb-1.5 block font-semibold tracking-wider" }, "Keywords"),
                                                        react_1.default.createElement("div", { className: "grid grid-cols-2 gap-1" }, ['and', 'not'].map((kw) => (react_1.default.createElement("button", { key: kw, type: "button", onClick: () => {
                                                                const val = conditionValue;
                                                                const space = val.length > 0 && !val.endsWith(' ') ? ' ' : '';
                                                                setConditionInputs(prev => ({ ...prev, [block.id]: val + space + kw + ' ' }));
                                                            }, className: "px-1.5 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-xs font-mono hover:bg-blue-500/40 transition-all" }, kw))))),
                                                    react_1.default.createElement("div", null,
                                                        react_1.default.createElement("label", { className: "text-[9px] text-gray-500 uppercase mb-1.5 block font-semibold tracking-wider" }, "Templates"),
                                                        react_1.default.createElement("div", { className: "flex flex-col gap-1" }, [
                                                            { p: '$flag == true', l: 'Boolean' },
                                                            { p: '$stat >= 100', l: 'Compare' },
                                                            { p: '$a and $b', l: 'Multiple' },
                                                        ].map(({ p, l }) => (react_1.default.createElement("button", { key: p, type: "button", onClick: () => setConditionInputs(prev => ({ ...prev, [block.id]: p })), className: "text-left px-2 py-1 bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded text-[10px] font-mono hover:bg-gray-500/20 transition-all" },
                                                            react_1.default.createElement("div", { className: "text-gray-300" }, p),
                                                            react_1.default.createElement("div", { className: "text-[8px] text-gray-600" }, l))))))),
                                                react_1.default.createElement("div", { className: "flex-1 p-4 overflow-y-auto flex flex-col gap-3" },
                                                    react_1.default.createElement(ConditionAutocomplete_1.ConditionAutocomplete, { value: conditionValue, onChange: (newValue) => {
                                                            setConditionInputs(prev => ({ ...prev, [block.id]: newValue }));
                                                            const parseCondition = (conditionStr) => {
                                                                const conditions = [];
                                                                if (!conditionStr.trim())
                                                                    return conditions;
                                                                const parts = conditionStr.split(/\s+and\s+/i);
                                                                parts.forEach(part => {
                                                                    part = part.trim();
                                                                    if (part.startsWith('not ')) {
                                                                        const varMatch = part.match(/not\s+\$(\w+)/);
                                                                        if (varMatch)
                                                                            conditions.push({ flag: varMatch[1], operator: constants_1.CONDITION_OPERATOR.IS_NOT_SET });
                                                                    }
                                                                    else if (part.includes('>=')) {
                                                                        const match = part.match(/\$(\w+)\s*>=\s*(.+)/);
                                                                        if (match) {
                                                                            const value = match[2].trim().replace(/^["']|["']$/g, '');
                                                                            conditions.push({ flag: match[1], operator: constants_1.CONDITION_OPERATOR.GREATER_EQUAL, value: isNaN(Number(value)) ? value : Number(value) });
                                                                        }
                                                                    }
                                                                    else if (part.includes('<=')) {
                                                                        const match = part.match(/\$(\w+)\s*<=\s*(.+)/);
                                                                        if (match) {
                                                                            const value = match[2].trim().replace(/^["']|["']$/g, '');
                                                                            conditions.push({ flag: match[1], operator: constants_1.CONDITION_OPERATOR.LESS_EQUAL, value: isNaN(Number(value)) ? value : Number(value) });
                                                                        }
                                                                    }
                                                                    else if (part.includes('!=')) {
                                                                        const match = part.match(/\$(\w+)\s*!=\s*(.+)/);
                                                                        if (match) {
                                                                            const value = match[2].trim().replace(/^["']|["']$/g, '');
                                                                            conditions.push({ flag: match[1], operator: constants_1.CONDITION_OPERATOR.NOT_EQUALS, value: isNaN(Number(value)) ? value : Number(value) });
                                                                        }
                                                                    }
                                                                    else if (part.includes('==')) {
                                                                        const match = part.match(/\$(\w+)\s*==\s*(.+)/);
                                                                        if (match) {
                                                                            const value = match[2].trim().replace(/^["']|["']$/g, '');
                                                                            conditions.push({ flag: match[1], operator: constants_1.CONDITION_OPERATOR.EQUALS, value: isNaN(Number(value)) ? value : Number(value) });
                                                                        }
                                                                    }
                                                                    else if (part.includes('>') && !part.includes('>=')) {
                                                                        const match = part.match(/\$(\w+)\s*>\s*(.+)/);
                                                                        if (match) {
                                                                            const value = match[2].trim().replace(/^["']|["']$/g, '');
                                                                            conditions.push({ flag: match[1], operator: constants_1.CONDITION_OPERATOR.GREATER_THAN, value: isNaN(Number(value)) ? value : Number(value) });
                                                                        }
                                                                    }
                                                                    else if (part.includes('<') && !part.includes('<=')) {
                                                                        const match = part.match(/\$(\w+)\s*<\s*(.+)/);
                                                                        if (match) {
                                                                            const value = match[2].trim().replace(/^["']|["']$/g, '');
                                                                            conditions.push({ flag: match[1], operator: constants_1.CONDITION_OPERATOR.LESS_THAN, value: isNaN(Number(value)) ? value : Number(value) });
                                                                        }
                                                                    }
                                                                    else {
                                                                        const varMatch = part.match(/\$(\w+)/);
                                                                        if (varMatch)
                                                                            conditions.push({ flag: varMatch[1], operator: constants_1.CONDITION_OPERATOR.IS_SET });
                                                                    }
                                                                });
                                                                return conditions;
                                                            };
                                                            const newBlocks = [...node.conditionalBlocks];
                                                            newBlocks[idx] = { ...block, condition: parseCondition(newValue) };
                                                            onUpdate({ conditionalBlocks: newBlocks });
                                                        }, flagSchema: flagSchema, textarea: true, placeholder: 'e.g., $flag == "value" or $stat >= 100', className: "w-full bg-[#12121a] border border-[#2a2a3e] rounded px-3 py-2 text-sm text-gray-200 font-mono outline-none focus:border-blue-500 min-h-[180px] resize-y" }),
                                                    showValidation && (react_1.default.createElement("div", { className: `p-2 rounded text-xs ${hasError ? 'bg-red-500/10 border border-red-500/30 text-red-400' :
                                                            hasWarning ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400' :
                                                                'bg-green-500/10 border border-green-500/30 text-green-400'}` },
                                                        hasError && (react_1.default.createElement("div", null,
                                                            react_1.default.createElement("strong", null, "Errors:"),
                                                            react_1.default.createElement("ul", { className: "list-disc list-inside mt-1 ml-2" }, validation.errors.map((error, i) => (react_1.default.createElement("li", { key: i }, error)))))),
                                                        hasWarning && (react_1.default.createElement("div", { className: hasError ? 'mt-2' : '' },
                                                            react_1.default.createElement("strong", null, "Warnings:"),
                                                            react_1.default.createElement("ul", { className: "list-disc list-inside mt-1 ml-2" }, validation.warnings.map((warning, i) => (react_1.default.createElement("li", { key: i }, warning)))))),
                                                        !hasError && !hasWarning && (react_1.default.createElement("div", null, "\u2713 Valid condition expression"))))))))),
                                    react_1.default.createElement("div", null,
                                        react_1.default.createElement("label", { className: `text-[10px] ${styles.text} uppercase mb-1 block` }, "Content"),
                                        react_1.default.createElement("textarea", { value: block.content, onChange: (e) => {
                                                const newBlocks = [...node.conditionalBlocks];
                                                newBlocks[idx] = { ...block, content: e.target.value };
                                                onUpdate({ conditionalBlocks: newBlocks });
                                            }, className: `w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-2 py-1 text-sm ${styles.text} outline-none min-h-[80px] resize-y`, placeholder: "Dialogue content..." })),
                                    react_1.default.createElement("div", null,
                                        react_1.default.createElement("label", { className: `text-[10px] ${styles.text} uppercase` }, "Next Node (optional)"),
                                        react_1.default.createElement("div", { className: "flex items-center gap-2" },
                                            block.nextNodeId && onFocusNode && (react_1.default.createElement("button", { type: "button", onClick: (e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    onFocusNode(block.nextNodeId);
                                                }, className: "transition-colors cursor-pointer flex-shrink-0 group", title: `Focus on node: ${block.nextNodeId}` },
                                                react_1.default.createElement(EdgeIcon_1.EdgeIcon, { size: 16, color: block.nextNodeId ? '#3b82f6' : '#2a2a3e', className: "group-hover:[&_circle]:fill-[#3b82f6] group-hover:[&_line]:stroke-[#3b82f6] transition-colors" }))),
                                            react_1.default.createElement("div", { className: "relative flex-1" },
                                                react_1.default.createElement("select", { value: block.nextNodeId || '', onChange: (e) => {
                                                        const newBlocks = [...node.conditionalBlocks];
                                                        newBlocks[idx] = { ...block, nextNodeId: e.target.value || undefined };
                                                        onUpdate({ conditionalBlocks: newBlocks });
                                                    }, className: `w-full bg-[#1a1a1a] border rounded px-2 py-1 pr-8 text-xs ${styles.text} outline-none`, style: {
                                                        borderColor: block.nextNodeId ? '#3b82f6' : '#2a2a3e',
                                                    } },
                                                    react_1.default.createElement("option", { value: "" }, "\u2014 Continue \u2014"),
                                                    Object.keys(dialogue.nodes).filter(id => id !== node.id).map(id => (react_1.default.createElement("option", { key: id, value: id }, id)))),
                                                block.nextNodeId && (react_1.default.createElement("div", { className: "absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none", title: `Connects to node: ${block.nextNodeId}`, style: { color: '#3b82f6' } },
                                                    react_1.default.createElement(lucide_react_1.GitBranch, { size: 14 }))))))));
                            }),
                            react_1.default.createElement("div", { className: "flex gap-2" },
                                node.conditionalBlocks[node.conditionalBlocks.length - 1].type !== 'else' && (react_1.default.createElement("button", { onClick: () => {
                                        const newBlocks = [...node.conditionalBlocks];
                                        newBlocks.push({
                                            id: `block_${Date.now()}`,
                                            type: newBlocks.some(b => b.type === 'if') ? 'elseif' : 'if',
                                            condition: [],
                                            content: '',
                                            speaker: undefined
                                        });
                                        onUpdate({ conditionalBlocks: newBlocks });
                                    }, className: "text-xs px-2 py-1 bg-[#12121a] border border-[#2a2a3e] rounded text-gray-400 hover:text-gray-200" },
                                    "+ Add ",
                                    node.conditionalBlocks.some(b => b.type === 'if') ? 'Else If' : 'If')),
                                !node.conditionalBlocks.some(b => b.type === 'else') && (react_1.default.createElement("button", { onClick: () => {
                                        const newBlocks = [...node.conditionalBlocks];
                                        newBlocks.push({
                                            id: `block_${Date.now()}`,
                                            type: 'else',
                                            condition: undefined,
                                            content: '',
                                            speaker: undefined
                                        });
                                        onUpdate({ conditionalBlocks: newBlocks });
                                    }, className: "text-xs px-2 py-1 bg-[#12121a] border border-[#2a2a3e] rounded text-gray-400 hover:text-gray-200" }, "+ Add Else"))))) : (react_1.default.createElement("div", { className: "text-xs text-gray-500 p-4 text-center border border-[#2a2a3e] rounded" }, "No conditional blocks. Add an \"If\" block to start."))))),
                node.type === 'player' && (react_1.default.createElement("div", null,
                    react_1.default.createElement("div", null,
                        react_1.default.createElement("label", { className: "text-[10px] text-gray-500 uppercase" }, "Speaker"),
                        react_1.default.createElement("div", { className: "flex items-center gap-2" },
                            react_1.default.createElement("div", { className: "w-8 h-8 rounded-full bg-[#2a2a3e] border border-[#2a2a3e] flex items-center justify-center flex-shrink-0" },
                                react_1.default.createElement(lucide_react_1.User, { size: 16, className: "text-gray-500" })),
                            react_1.default.createElement("input", { type: "text", value: node.speaker || '', onChange: (e) => onUpdate({ speaker: e.target.value }), className: "flex-1 bg-[#12121a] border border-[#2a2a3e] rounded px-2 py-1 text-sm text-gray-200 focus:border-[#8b5cf6] outline-none", placeholder: "Character name (optional)" }))),
                    react_1.default.createElement("div", { className: "flex items-center justify-between mb-2 mt-4" },
                        react_1.default.createElement("label", { className: "text-[10px] text-gray-500 uppercase" }, "Choices"),
                        react_1.default.createElement("button", { onClick: onAddChoice, className: "text-[10px] text-[#e94560] hover:text-[#ff6b6b]" }, "+ Add")),
                    react_1.default.createElement("div", { className: "space-y-2" }, node.choices?.map((choice, idx) => {
                        const hasCondition = choice.conditions !== undefined;
                        const choiceKey = `choice-${choice.id}`;
                        const conditionValue = conditionInputs[choiceKey] || '';
                        const debouncedValue = debouncedConditionInputs[choiceKey] || '';
                        // Use debounced value for validation
                        const validationResult = validateCondition(debouncedValue);
                        const choiceColor = reactflow_converter_1.CHOICE_COLORS[idx % reactflow_converter_1.CHOICE_COLORS.length];
                        // Darken the choice color for inputs (reduce brightness by ~40%)
                        const darkenColor = (color) => {
                            // Convert hex to RGB
                            const hex = color.replace('#', '');
                            const r = parseInt(hex.substr(0, 2), 16);
                            const g = parseInt(hex.substr(2, 2), 16);
                            const b = parseInt(hex.substr(4, 2), 16);
                            // Darken by 40%
                            const darkR = Math.floor(r * 0.6);
                            const darkG = Math.floor(g * 0.6);
                            const darkB = Math.floor(b * 0.6);
                            return `rgb(${darkR}, ${darkG}, ${darkB})`;
                        };
                        const darkChoiceColor = darkenColor(choiceColor);
                        return (react_1.default.createElement("div", { key: choice.id, className: `rounded p-2 space-y-2 ${hasCondition
                                ? 'bg-blue-500/10 border-2 border-blue-500/50'
                                : 'bg-[#12121a] border border-[#2a2a3e]'}`, style: {
                                borderTopColor: hasCondition ? undefined : choiceColor
                            } },
                            react_1.default.createElement("div", { className: "flex items-center gap-2 pb-2 border-b", style: {
                                    borderBottomColor: hasCondition ? '#2a2a3e' : choiceColor
                                } },
                                react_1.default.createElement("label", { className: "flex items-center cursor-pointer" },
                                    react_1.default.createElement("div", { className: "relative" },
                                        react_1.default.createElement("input", { type: "checkbox", checked: hasCondition, onChange: (e) => {
                                                if (e.target.checked) {
                                                    // Initialize with empty array to show condition input
                                                    onUpdateChoice(idx, { conditions: [] });
                                                }
                                                else {
                                                    // Remove condition
                                                    onUpdateChoice(idx, { conditions: undefined });
                                                }
                                            }, className: "sr-only" }),
                                        react_1.default.createElement("div", { className: `w-7 h-3.5 rounded-full transition-all duration-200 ease-in-out ${hasCondition ? 'bg-blue-500' : 'bg-[#2a2a3e]'}` },
                                            react_1.default.createElement("div", { className: `w-2.5 h-2.5 rounded-full bg-white transition-all duration-200 ease-in-out mt-0.5 ${hasCondition ? 'translate-x-4' : 'translate-x-0.5'}` })))),
                                hasCondition ? (react_1.default.createElement("span", { className: "text-[9px] px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-400 border border-blue-500/50 font-medium" }, "CONDITIONAL")) : (react_1.default.createElement("span", { className: "text-[9px] px-1.5 py-0.5 rounded bg-[#2a2a3e] text-gray-400 border border-[#2a2a3e] font-medium" }, "CHOICE")),
                                choice.nextNodeId && onFocusNode && (react_1.default.createElement("button", { type: "button", onClick: (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onFocusNode(choice.nextNodeId);
                                    }, className: "transition-colors cursor-pointer flex-shrink-0", title: `Focus on node: ${choice.nextNodeId}` },
                                    react_1.default.createElement(EdgeIcon_1.EdgeIcon, { size: 16, color: reactflow_converter_1.CHOICE_COLORS[idx % reactflow_converter_1.CHOICE_COLORS.length], className: "transition-colors" }))),
                                react_1.default.createElement("div", { className: "relative flex-1" },
                                    react_1.default.createElement("select", { value: choice.nextNodeId, onChange: (e) => onUpdateChoice(idx, { nextNodeId: e.target.value }), className: "w-full bg-[#0d0d14] border rounded px-2 py-1 pr-8 text-xs text-gray-300 outline-none", style: {
                                            borderColor: choice.nextNodeId ? darkChoiceColor : '#2a2a3e',
                                        }, onFocus: (e) => {
                                            if (choice.nextNodeId) {
                                                e.target.style.borderColor = darkChoiceColor;
                                            }
                                            else {
                                                e.target.style.borderColor = '#e94560';
                                            }
                                        }, onBlur: (e) => {
                                            if (choice.nextNodeId) {
                                                e.target.style.borderColor = darkChoiceColor;
                                            }
                                            else {
                                                e.target.style.borderColor = '#2a2a3e';
                                            }
                                        } },
                                        react_1.default.createElement("option", { value: "" }, "\u2014 Select target \u2014"),
                                        Object.keys(dialogue.nodes).map(id => (react_1.default.createElement("option", { key: id, value: id }, id)))),
                                    choice.nextNodeId && (react_1.default.createElement("div", { className: "absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none", title: `Connects to node: ${choice.nextNodeId}`, style: { color: reactflow_converter_1.CHOICE_COLORS[idx % reactflow_converter_1.CHOICE_COLORS.length] } },
                                        react_1.default.createElement(lucide_react_1.GitBranch, { size: 14 })))),
                                react_1.default.createElement("button", { onClick: () => onRemoveChoice(idx), className: "text-gray-600 hover:text-red-400 flex-shrink-0", title: "Remove choice" },
                                    react_1.default.createElement("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                                        react_1.default.createElement("polyline", { points: "3 6 5 6 21 6" }),
                                        react_1.default.createElement("path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" })))),
                            react_1.default.createElement("div", { className: "pt-2" },
                                react_1.default.createElement("input", { type: "text", value: choice.text, onChange: (e) => onUpdateChoice(idx, { text: e.target.value }), className: `w-full bg-[#0d0d14] border rounded px-3 py-2 text-sm outline-none transition-colors ${hasCondition ? 'text-gray-100' : 'text-gray-200'}`, style: {
                                        borderColor: choice.text ? darkChoiceColor : '#2a2a3e'
                                    }, placeholder: "Dialogue text..." })),
                            hasCondition && (react_1.default.createElement("div", { className: "bg-blue-500/5 border border-blue-500/30 rounded p-2 space-y-1" },
                                react_1.default.createElement("div", { className: "flex items-center gap-2" },
                                    react_1.default.createElement("label", { className: "text-[10px] text-blue-400 uppercase font-medium" }, "Condition"),
                                    react_1.default.createElement("button", { onClick: () => onUpdateChoice(idx, { conditions: undefined }), className: "text-[10px] text-gray-500 hover:text-red-400 ml-auto", title: "Remove condition" }, "Remove")),
                                react_1.default.createElement("div", { className: "relative" },
                                    react_1.default.createElement("input", { type: "text", value: conditionValue, onFocus: () => {
                                            setEditingCondition({
                                                id: choiceKey,
                                                value: conditionValue,
                                                type: 'choice',
                                                choiceIdx: idx
                                            });
                                        }, readOnly: true, className: "w-full bg-[#0d0d14] border rounded px-2 py-1 pr-8 text-xs text-gray-300 font-mono outline-none cursor-pointer hover:border-blue-500/50 transition-all", style: {
                                            borderColor: conditionValue.trim().length > 0 && debouncedValue.trim().length > 0
                                                ? (validationResult.isValid ? 'rgba(59, 130, 246, 0.5)' :
                                                    validationResult.errors.length > 0 ? '#ef4444' : '#eab308')
                                                : '#2a2a3e'
                                        }, placeholder: 'e.g., $reputation > 10 or $flag == "value"' }),
                                    conditionValue.trim().length > 0 && debouncedValue.trim().length > 0 && validationResult.errors.length > 0 && (react_1.default.createElement("div", { className: "absolute right-2 top-1/2 -translate-y-1/2 text-red-500", title: validationResult.errors.join('\n') },
                                        react_1.default.createElement(lucide_react_1.AlertCircle, { size: 14 }))),
                                    conditionValue.trim().length > 0 && debouncedValue.trim().length > 0 && validationResult.warnings.length > 0 && validationResult.errors.length === 0 && (react_1.default.createElement("div", { className: "absolute right-2 top-1/2 -translate-y-1/2 text-yellow-500", title: validationResult.warnings.join('\n') },
                                        react_1.default.createElement(lucide_react_1.Info, { size: 14 }))),
                                    conditionValue.trim().length > 0 && debouncedValue.trim().length > 0 && validationResult.isValid && validationResult.errors.length === 0 && validationResult.warnings.length === 0 && (react_1.default.createElement("div", { className: "absolute right-2 top-1/2 -translate-y-1/2 text-green-500", title: "Valid condition" },
                                        react_1.default.createElement(lucide_react_1.CheckCircle, { size: 14 })))),
                                conditionValue.trim().length > 0 && debouncedValue.trim().length > 0 && validationResult.errors.length > 0 && (react_1.default.createElement("p", { className: "text-[10px] text-red-500 mt-1" }, validationResult.errors[0])),
                                validationResult.warnings.length > 0 && validationResult.errors.length === 0 && (react_1.default.createElement("p", { className: "text-[10px] text-yellow-500 mt-1" }, validationResult.warnings[0])),
                                validationResult.isValid && validationResult.errors.length === 0 && validationResult.warnings.length === 0 && conditionValue && (react_1.default.createElement("p", { className: "text-[10px] text-green-500 mt-1" }, "Valid condition")),
                                !conditionValue && (react_1.default.createElement("p", { className: "text-[10px] text-blue-400/80 mt-1" }, "Only shows if condition is true")))),
                            react_1.default.createElement(FlagSelector_1.FlagSelector, { value: choice.setFlags || [], onChange: (flags) => onUpdateChoice(idx, { setFlags: flags.length > 0 ? flags : undefined }), flagSchema: flagSchema, placeholder: "Set flags..." })));
                    })))),
                react_1.default.createElement("div", null,
                    react_1.default.createElement("label", { className: "text-[10px] text-gray-500 uppercase" }, "Set Flags (on enter)"),
                    react_1.default.createElement(FlagSelector_1.FlagSelector, { value: node.setFlags || [], onChange: (flags) => onUpdate({ setFlags: flags.length > 0 ? flags : undefined }), flagSchema: flagSchema, placeholder: "flag1, flag2" })),
                onPlayFromHere && (react_1.default.createElement("button", { onClick: () => onPlayFromHere(node.id), className: "w-full py-2 bg-[#e94560] hover:bg-[#d63850] text-white rounded text-sm flex items-center justify-center gap-2" },
                    react_1.default.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "currentColor" },
                        react_1.default.createElement("polygon", { points: "5 3 19 12 5 21 5 3" })),
                    "Play from Here"))),
            editingCondition && (react_1.default.createElement("div", { className: "fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4", onClick: (e) => {
                    if (e.target === e.currentTarget) {
                        setEditingCondition(null);
                    }
                } },
                react_1.default.createElement("div", { className: "bg-[#0d0d14] border border-[#2a2a3e] rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col", onClick: (e) => e.stopPropagation() },
                    react_1.default.createElement("div", { className: "p-4 border-b border-[#2a2a3e] flex items-center justify-between" },
                        react_1.default.createElement("h3", { className: "text-sm font-semibold text-white" }, "Edit Condition"),
                        react_1.default.createElement("button", { onClick: () => setEditingCondition(null), className: "p-1 text-gray-400 hover:text-white transition-colors" },
                            react_1.default.createElement(lucide_react_1.X, { size: 18 }))),
                    react_1.default.createElement("div", { className: "flex-1 overflow-y-auto p-4" },
                        react_1.default.createElement("div", { className: "space-y-4" },
                            react_1.default.createElement("div", null,
                                react_1.default.createElement("label", { className: "text-xs text-gray-400 uppercase mb-2 block" }, "Yarn Condition Expression"),
                                react_1.default.createElement("textarea", { value: editingCondition.value, onChange: (e) => {
                                        setEditingCondition({
                                            ...editingCondition,
                                            value: e.target.value
                                        });
                                    }, className: "w-full bg-[#12121a] border border-[#2a2a3e] rounded px-4 py-3 text-base text-gray-200 font-mono outline-none focus:border-blue-500 min-h-[200px] resize-y", placeholder: 'e.g., $flag == "value" or $stat >= 100', autoFocus: true }),
                                react_1.default.createElement("p", { className: "text-[10px] text-gray-500 mt-2" }, "Type Yarn condition: $flag, $flag == value, $stat >= 100, etc.")),
                            (() => {
                                const validation = validateCondition(debouncedEditingValue);
                                const hasError = !validation.isValid;
                                const hasWarning = validation.warnings.length > 0;
                                const showValidation = debouncedEditingValue.trim().length > 0 && editingCondition.value.trim().length > 0;
                                if (!showValidation)
                                    return null;
                                return (react_1.default.createElement("div", { className: `p-3 rounded border ${hasError ? 'bg-red-500/10 border-red-500/30' :
                                        hasWarning ? 'bg-yellow-500/10 border-yellow-500/30' :
                                            'bg-green-500/10 border-green-500/30'}` },
                                    react_1.default.createElement("div", { className: "flex items-start gap-2" },
                                        hasError ? (react_1.default.createElement(lucide_react_1.AlertCircle, { size: 16, className: "text-red-500 mt-0.5 flex-shrink-0" })) : hasWarning ? (react_1.default.createElement(lucide_react_1.Info, { size: 16, className: "text-yellow-500 mt-0.5 flex-shrink-0" })) : (react_1.default.createElement(lucide_react_1.CheckCircle, { size: 16, className: "text-green-500 mt-0.5 flex-shrink-0" })),
                                        react_1.default.createElement("div", { className: "flex-1 text-xs" },
                                            hasError && (react_1.default.createElement("div", null,
                                                react_1.default.createElement("strong", { className: "text-red-400" }, "Errors:"),
                                                react_1.default.createElement("ul", { className: "list-disc list-inside mt-1 ml-2 text-red-300" }, validation.errors.map((error, i) => (react_1.default.createElement("li", { key: i }, error)))))),
                                            hasWarning && (react_1.default.createElement("div", { className: hasError ? 'mt-2' : '' },
                                                react_1.default.createElement("strong", { className: "text-yellow-400" }, "Warnings:"),
                                                react_1.default.createElement("ul", { className: "list-disc list-inside mt-1 ml-2 text-yellow-300" }, validation.warnings.map((warning, i) => (react_1.default.createElement("li", { key: i }, warning)))))),
                                            !hasError && !hasWarning && (react_1.default.createElement("div", { className: "text-green-400" }, "\u2713 Valid condition expression"))))));
                            })())),
                    react_1.default.createElement("div", { className: "p-4 border-t border-[#2a2a3e] flex items-center justify-end gap-2" },
                        react_1.default.createElement("button", { onClick: () => setEditingCondition(null), className: "px-4 py-2 bg-[#1a1a2e] hover:bg-[#2a2a3e] text-gray-300 rounded transition-colors" }, "Cancel"),
                        react_1.default.createElement("button", { onClick: () => {
                                // Parse and save the condition
                                const parseCondition = (conditionStr) => {
                                    const conditions = [];
                                    if (!conditionStr.trim())
                                        return conditions;
                                    const parts = conditionStr.split(/\s+and\s+/i);
                                    parts.forEach(part => {
                                        part = part.trim();
                                        if (part.startsWith('not ')) {
                                            const varMatch = part.match(/not\s+\$(\w+)/);
                                            if (varMatch) {
                                                conditions.push({ flag: varMatch[1], operator: constants_1.CONDITION_OPERATOR.IS_NOT_SET });
                                            }
                                        }
                                        else if (part.includes('>=')) {
                                            const match = part.match(/\$(\w+)\s*>=\s*(.+)/);
                                            if (match) {
                                                const value = match[2].trim().replace(/^["']|["']$/g, '');
                                                conditions.push({ flag: match[1], operator: constants_1.CONDITION_OPERATOR.GREATER_EQUAL, value: isNaN(Number(value)) ? value : Number(value) });
                                            }
                                        }
                                        else if (part.includes('<=')) {
                                            const match = part.match(/\$(\w+)\s*<=\s*(.+)/);
                                            if (match) {
                                                const value = match[2].trim().replace(/^["']|["']$/g, '');
                                                conditions.push({ flag: match[1], operator: constants_1.CONDITION_OPERATOR.LESS_EQUAL, value: isNaN(Number(value)) ? value : Number(value) });
                                            }
                                        }
                                        else if (part.includes('!=')) {
                                            const match = part.match(/\$(\w+)\s*!=\s*(.+)/);
                                            if (match) {
                                                const value = match[2].trim().replace(/^["']|["']$/g, '');
                                                conditions.push({ flag: match[1], operator: constants_1.CONDITION_OPERATOR.NOT_EQUALS, value: isNaN(Number(value)) ? value : Number(value) });
                                            }
                                        }
                                        else if (part.includes('==')) {
                                            const match = part.match(/\$(\w+)\s*==\s*(.+)/);
                                            if (match) {
                                                const value = match[2].trim().replace(/^["']|["']$/g, '');
                                                conditions.push({ flag: match[1], operator: constants_1.CONDITION_OPERATOR.EQUALS, value: isNaN(Number(value)) ? value : Number(value) });
                                            }
                                        }
                                        else if (part.includes('>') && !part.includes('>=')) {
                                            const match = part.match(/\$(\w+)\s*>\s*(.+)/);
                                            if (match) {
                                                const value = match[2].trim().replace(/^["']|["']$/g, '');
                                                conditions.push({ flag: match[1], operator: constants_1.CONDITION_OPERATOR.GREATER_THAN, value: isNaN(Number(value)) ? value : Number(value) });
                                            }
                                        }
                                        else if (part.includes('<') && !part.includes('<=')) {
                                            const match = part.match(/\$(\w+)\s*<\s*(.+)/);
                                            if (match) {
                                                const value = match[2].trim().replace(/^["']|["']$/g, '');
                                                conditions.push({ flag: match[1], operator: constants_1.CONDITION_OPERATOR.LESS_THAN, value: isNaN(Number(value)) ? value : Number(value) });
                                            }
                                        }
                                        else {
                                            const varMatch = part.match(/\$(\w+)/);
                                            if (varMatch) {
                                                conditions.push({ flag: varMatch[1], operator: constants_1.CONDITION_OPERATOR.IS_SET });
                                            }
                                        }
                                    });
                                    return conditions;
                                };
                                if (editingCondition.type === 'block' && editingCondition.blockIdx !== undefined) {
                                    const newBlocks = [...node.conditionalBlocks];
                                    newBlocks[editingCondition.blockIdx] = {
                                        ...newBlocks[editingCondition.blockIdx],
                                        condition: parseCondition(editingCondition.value)
                                    };
                                    onUpdate({ conditionalBlocks: newBlocks });
                                    setConditionInputs(prev => ({ ...prev, [editingCondition.id]: editingCondition.value }));
                                }
                                else if (editingCondition.type === 'choice' && editingCondition.choiceIdx !== undefined) {
                                    if (editingCondition.value.trim()) {
                                        const newConditions = parseCondition(editingCondition.value);
                                        onUpdateChoice(editingCondition.choiceIdx, {
                                            conditions: newConditions.length > 0 ? newConditions : []
                                        });
                                    }
                                    else {
                                        onUpdateChoice(editingCondition.choiceIdx, { conditions: [] });
                                    }
                                    setConditionInputs(prev => ({ ...prev, [editingCondition.id]: editingCondition.value }));
                                }
                                setEditingCondition(null);
                            }, className: "px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors" }, "Save"))))))));
}
