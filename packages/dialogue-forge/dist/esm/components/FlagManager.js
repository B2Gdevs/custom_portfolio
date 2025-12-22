import React, { useState, useMemo } from 'react';
const flagTypeColors = {
    dialogue: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    quest: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    achievement: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    item: 'bg-green-500/20 text-green-400 border-green-500/30',
    stat: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    title: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    global: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};
const flagTypeLabels = {
    dialogue: 'Dialogue (Temporary)',
    quest: 'Quest',
    achievement: 'Achievement',
    item: 'Item',
    stat: 'Stat',
    title: 'Title',
    global: 'Global',
};
export function FlagManager({ flagSchema, dialogue, onUpdate, onClose }) {
    const [editingFlag, setEditingFlag] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    // Find all flags used in the dialogue tree
    const usedFlags = useMemo(() => {
        if (!dialogue)
            return new Set();
        const used = new Set();
        Object.values(dialogue.nodes).forEach(node => {
            // Check node setFlags
            if (node.setFlags) {
                node.setFlags.forEach(flagId => used.add(flagId));
            }
            // Check choice setFlags and conditions
            if (node.choices) {
                node.choices.forEach(choice => {
                    if (choice.setFlags) {
                        choice.setFlags.forEach(flagId => used.add(flagId));
                    }
                    if (choice.conditions) {
                        choice.conditions.forEach(cond => used.add(cond.flag));
                    }
                });
            }
        });
        return used;
    }, [dialogue]);
    const handleCreateFlag = (type, category) => {
        const newFlag = {
            id: 'new_flag',
            name: 'New Flag',
            type: type || 'dialogue',
            category: category || (type === 'dialogue' ? 'dialogue' : undefined)
        };
        setEditingFlag(newFlag);
        setIsCreating(true);
    };
    const handleSaveFlag = (flag) => {
        if (isCreating) {
            // Add new flag
            onUpdate({
                ...flagSchema,
                flags: [...flagSchema.flags, flag]
            });
            setIsCreating(false);
        }
        else {
            // Update existing flag
            onUpdate({
                ...flagSchema,
                flags: flagSchema.flags.map(f => f.id === flag.id ? flag : f)
            });
        }
        setEditingFlag(null);
    };
    const handleDeleteFlag = (flagId) => {
        if (confirm(`Delete flag "${flagId}"?`)) {
            onUpdate({
                ...flagSchema,
                flags: flagSchema.flags.filter(f => f.id !== flagId)
            });
        }
    };
    // Group flags by category
    const flagsByCategory = flagSchema.flags.reduce((acc, flag) => {
        const cat = flag.category || flag.type || 'other';
        if (!acc[cat])
            acc[cat] = [];
        acc[cat].push(flag);
        return acc;
    }, {});
    return (React.createElement("div", { className: "fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4", onClick: (e) => {
            // Only close if clicking the backdrop, not the modal content
            if (e.target === e.currentTarget) {
                onClose();
            }
        } },
        React.createElement("div", { className: "bg-[#0d0d14] border border-[#1a1a2e] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col", onClick: (e) => e.stopPropagation() },
            React.createElement("div", { className: "p-4 border-b border-[#1a1a2e] flex items-center justify-between" },
                React.createElement("h2", { className: "text-lg font-semibold text-white" }, "Flag Manager"),
                React.createElement("div", { className: "flex gap-2" },
                    React.createElement("button", { onClick: () => handleCreateFlag(), className: "px-3 py-1.5 bg-[#e94560] hover:bg-[#d63850] text-white text-sm rounded flex items-center gap-2" },
                        React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                            React.createElement("line", { x1: "12", y1: "5", x2: "12", y2: "19" }),
                            React.createElement("line", { x1: "5", y1: "12", x2: "19", y2: "12" })),
                        "New Flag"),
                    React.createElement("button", { onClick: (e) => {
                            e.stopPropagation();
                            onClose();
                        }, className: "p-1.5 text-gray-400 hover:text-white transition-colors", title: "Close" },
                        React.createElement("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                            React.createElement("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
                            React.createElement("line", { x1: "6", y1: "6", x2: "18", y2: "18" }))))),
            React.createElement("div", { className: "flex-1 overflow-y-auto p-4" }, editingFlag ? (React.createElement(FlagEditor, { flag: editingFlag, categories: flagSchema.categories || [], onSave: handleSaveFlag, onCancel: () => { setEditingFlag(null); setIsCreating(false); } })) : (React.createElement("div", { className: "space-y-4" },
                React.createElement("div", { className: "bg-[#12121a] border border-[#2a2a3e] rounded-lg p-4 text-sm" },
                    React.createElement("div", { className: "flex items-center justify-between mb-3" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-gray-300 mb-2" },
                                React.createElement("strong", { className: "text-white" }, "Dialogue flags"),
                                " (gray) are temporary and reset after dialogue ends."),
                            React.createElement("p", { className: "text-gray-300" },
                                React.createElement("strong", { className: "text-white" }, "Game flags"),
                                " (colored) persist and affect the entire game.")),
                        React.createElement("div", { className: "text-right" },
                            React.createElement("div", { className: "text-2xl font-bold text-white" }, flagSchema.flags.length),
                            React.createElement("div", { className: "text-xs text-gray-500" }, "Total Flags"),
                            dialogue && (React.createElement("div", { className: "mt-2 pt-2 border-t border-[#2a2a3e]" },
                                React.createElement("div", { className: "text-sm" },
                                    React.createElement("span", { className: "text-[#e94560] font-semibold" }, usedFlags.size),
                                    React.createElement("span", { className: "text-gray-500" }, " / "),
                                    React.createElement("span", { className: "text-gray-400" }, flagSchema.flags.length),
                                    React.createElement("span", { className: "text-xs text-gray-500 block mt-0.5" }, "Used in dialogue")))))),
                    React.createElement("div", { className: "grid grid-cols-7 gap-2 pt-3 border-t border-[#2a2a3e]" }, Object.entries(flagTypeLabels).map(([type, label]) => {
                        const count = flagSchema.flags.filter(f => f.type === type).length;
                        return (React.createElement("div", { key: type, className: "text-center" },
                            React.createElement("div", { className: `text-lg font-bold ${flagTypeColors[type].split(' ')[1]}` }, count),
                            React.createElement("div", { className: "text-[10px] text-gray-500 mt-0.5" }, label.split(' ')[0])));
                    }))),
                Object.entries(flagsByCategory).map(([category, flags]) => {
                    // Determine the flag type for this category (use first flag's type)
                    const categoryType = flags[0]?.type || 'dialogue';
                    return (React.createElement("div", { key: category, className: "border border-[#1a1a2e] rounded-lg overflow-hidden" },
                        React.createElement("div", { className: "bg-[#12121a] px-4 py-2 border-b border-[#1a1a2e] flex items-center justify-between" },
                            React.createElement("h3", { className: "text-sm font-semibold text-white uppercase" }, category),
                            React.createElement("button", { onClick: () => handleCreateFlag(categoryType, category), className: "p-1 text-gray-400 hover:text-white hover:bg-[#2a2a3e] rounded transition-colors", title: `Create new ${categoryType} flag` },
                                React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                                    React.createElement("line", { x1: "12", y1: "5", x2: "12", y2: "19" }),
                                    React.createElement("line", { x1: "5", y1: "12", x2: "19", y2: "12" })))),
                        React.createElement("div", { className: "divide-y divide-[#1a1a2e]" }, flags.map(flag => {
                            const isUsed = usedFlags.has(flag.id);
                            return (React.createElement("div", { key: flag.id, className: `bg-[#0d0d14] hover:bg-[#12121a] transition-colors ${isUsed ? 'border-l-2 border-[#e94560]' : ''}` },
                                React.createElement("div", { className: "px-4 py-3 flex items-center justify-between" },
                                    React.createElement("div", { className: "flex items-center gap-3 flex-1" },
                                        React.createElement("span", { className: `px-2 py-1 rounded text-xs font-medium border ${flagTypeColors[flag.type]}` }, flagTypeLabels[flag.type]),
                                        React.createElement("div", { className: "flex-1" },
                                            React.createElement("div", { className: "flex items-center gap-2" },
                                                React.createElement("span", { className: "font-mono text-sm text-white" }, flag.id),
                                                isUsed && (React.createElement("span", { className: "text-[10px] px-1.5 py-0.5 bg-[#e94560]/20 text-[#e94560] rounded border border-[#e94560]/30", title: "Used in dialogue" }, "Used"))),
                                            flag.name !== flag.id && (React.createElement("div", { className: "text-xs text-gray-400" }, flag.name)),
                                            flag.description && (React.createElement("div", { className: "text-xs text-gray-500 mt-1" }, flag.description))),
                                        flag.valueType && (React.createElement("span", { className: "text-xs text-gray-500 px-2 py-1 bg-[#12121a] rounded" }, flag.valueType))),
                                    React.createElement("div", { className: "flex gap-1" },
                                        React.createElement("button", { onClick: () => setEditingFlag(flag), className: "p-1.5 text-gray-400 hover:text-white", title: "Edit" },
                                            React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                                                React.createElement("path", { d: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" }),
                                                React.createElement("path", { d: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" }))),
                                        React.createElement("button", { onClick: () => handleDeleteFlag(flag.id), className: "p-1.5 text-gray-400 hover:text-red-400", title: "Delete" },
                                            React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                                                React.createElement("polyline", { points: "3 6 5 6 21 6" }),
                                                React.createElement("path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" })))))));
                        }))));
                }),
                flagSchema.flags.length === 0 && (React.createElement("div", { className: "text-center py-12 text-gray-500" },
                    React.createElement("p", null, "No flags defined yet."),
                    React.createElement("button", { onClick: () => handleCreateFlag(), className: "mt-4 px-4 py-2 bg-[#e94560] hover:bg-[#d63850] text-white rounded" }, "Create Your First Flag")))))))));
}
function FlagEditor({ flag, categories, onSave, onCancel }) {
    const [edited, setEdited] = useState(flag);
    const flagTypes = ['dialogue', 'quest', 'achievement', 'item', 'stat', 'title', 'global'];
    return (React.createElement("div", { className: "space-y-4" },
        React.createElement("div", null,
            React.createElement("label", { className: "text-xs text-gray-500 uppercase block mb-1" }, "Flag ID"),
            React.createElement("input", { type: "text", value: edited.id, onChange: (e) => setEdited({ ...edited, id: e.target.value }), className: "w-full bg-[#12121a] border border-[#2a2a3e] rounded px-2 py-1.5 text-sm text-gray-200 font-mono focus:border-[#e94560] outline-none", placeholder: "quest_dragon_slayer" }),
            React.createElement("p", { className: "text-xs text-gray-500 mt-1" }, "Use prefixes: quest_, item_, stat_, etc.")),
        React.createElement("div", null,
            React.createElement("label", { className: "text-xs text-gray-500 uppercase block mb-1" }, "Display Name"),
            React.createElement("input", { type: "text", value: edited.name, onChange: (e) => setEdited({ ...edited, name: e.target.value }), className: "w-full bg-[#12121a] border border-[#2a2a3e] rounded px-2 py-1.5 text-sm text-gray-200 focus:border-[#e94560] outline-none", placeholder: "Dragon Slayer Quest" })),
        React.createElement("div", null,
            React.createElement("label", { className: "text-xs text-gray-500 uppercase block mb-1" }, "Description"),
            React.createElement("textarea", { value: edited.description || '', onChange: (e) => setEdited({ ...edited, description: e.target.value }), className: "w-full bg-[#12121a] border border-[#2a2a3e] rounded px-2 py-1.5 text-sm text-gray-200 focus:border-[#e94560] outline-none min-h-[60px] resize-y", placeholder: "Optional description..." })),
        React.createElement("div", null,
            React.createElement("label", { className: "text-xs text-gray-500 uppercase block mb-1" }, "Flag Type"),
            React.createElement("div", { className: "grid grid-cols-2 gap-2" }, flagTypes.map(type => (React.createElement("button", { key: type, onClick: () => setEdited({ ...edited, type }), className: `px-3 py-2 rounded text-sm border transition-colors ${edited.type === type
                    ? flagTypeColors[type] + ' border-current'
                    : 'bg-[#12121a] border-[#2a2a3e] text-gray-400 hover:border-[#3a3a4e]'}` }, flagTypeLabels[type])))),
            React.createElement("p", { className: "text-xs text-gray-500 mt-2" }, edited.type === 'dialogue' ? (React.createElement("span", { className: "text-gray-400" }, "Temporary flag - resets after dialogue ends")) : (React.createElement("span", { className: "text-white" }, "Persistent flag - affects entire game")))),
        React.createElement("div", null,
            React.createElement("label", { className: "text-xs text-gray-500 uppercase block mb-1" }, "Category"),
            React.createElement("input", { type: "text", value: edited.category || '', onChange: (e) => setEdited({ ...edited, category: e.target.value }), className: "w-full bg-[#12121a] border border-[#2a2a3e] rounded px-2 py-1.5 text-sm text-gray-200 focus:border-[#e94560] outline-none", placeholder: "quests, items, stats, etc.", list: "categories" }),
            React.createElement("datalist", { id: "categories" }, categories.map(cat => React.createElement("option", { key: cat, value: cat })))),
        React.createElement("div", null,
            React.createElement("label", { className: "text-xs text-gray-500 uppercase block mb-1" }, "Value Type"),
            React.createElement("select", { value: edited.valueType || '', onChange: (e) => setEdited({ ...edited, valueType: e.target.value }), className: "w-full bg-[#12121a] border border-[#2a2a3e] rounded px-2 py-1.5 text-sm text-gray-200 focus:border-[#e94560] outline-none" },
                React.createElement("option", { value: "" }, "Boolean (true/false)"),
                React.createElement("option", { value: "number" }, "Number"),
                React.createElement("option", { value: "string" }, "String"))),
        edited.valueType && (React.createElement("div", null,
            React.createElement("label", { className: "text-xs text-gray-500 uppercase block mb-1" }, "Default Value"),
            React.createElement("input", { type: edited.valueType === 'number' ? 'number' : 'text', value: edited.defaultValue?.toString() || '', onChange: (e) => {
                    let value = e.target.value;
                    if (edited.valueType === 'number') {
                        value = parseFloat(value) || 0;
                    }
                    else if (edited.valueType === 'boolean') {
                        value = value === 'true';
                    }
                    setEdited({ ...edited, defaultValue: value });
                }, className: "w-full bg-[#12121a] border border-[#2a2a3e] rounded px-2 py-1.5 text-sm text-gray-200 focus:border-[#e94560] outline-none", placeholder: edited.valueType === 'number' ? '0' : edited.valueType === 'string' ? '""' : 'false' }))),
        React.createElement("div", { className: "flex gap-2 pt-4 border-t border-[#1a1a2e]" },
            React.createElement("button", { onClick: () => onSave(edited), className: "flex-1 px-4 py-2 bg-[#e94560] hover:bg-[#d63850] text-white rounded" }, "Save Flag"),
            React.createElement("button", { onClick: onCancel, className: "px-4 py-2 bg-[#12121a] hover:bg-[#1a1a2e] text-gray-300 rounded" }, "Cancel"))));
}
