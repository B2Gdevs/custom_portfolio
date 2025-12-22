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
    dialogue: 'Dialogue',
    quest: 'Quest',
    achievement: 'Achievement',
    item: 'Item',
    stat: 'Stat',
    title: 'Title',
    global: 'Global',
};
const flagTypeIcons = {
    dialogue: '💬',
    quest: '📜',
    achievement: '🏆',
    item: '🎒',
    stat: '📊',
    title: '👑',
    global: '🌐',
};
export function FlagManager({ flagSchema, dialogue, onUpdate, onClose }) {
    const [editingFlag, setEditingFlag] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedSection, setSelectedSection] = useState('all');
    // Find all flags used in the dialogue tree
    const usedFlags = useMemo(() => {
        if (!dialogue)
            return new Set();
        const used = new Set();
        Object.values(dialogue.nodes).forEach(node => {
            if (node.setFlags) {
                node.setFlags.forEach(flagId => used.add(flagId));
            }
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
    // Group flags by type
    const flagsByType = useMemo(() => {
        const grouped = {
            all: flagSchema.flags,
        };
        Object.keys(flagTypeLabels).forEach(type => {
            grouped[type] = flagSchema.flags.filter(f => f.type === type);
        });
        return grouped;
    }, [flagSchema.flags]);
    const currentFlags = flagsByType[selectedSection] || [];
    const handleCreateFlag = (type) => {
        const newFlag = {
            id: 'new_flag',
            name: 'New Flag',
            type: type || 'dialogue',
        };
        setEditingFlag(newFlag);
        setIsCreating(true);
    };
    const handleSaveFlag = (flag) => {
        if (isCreating) {
            onUpdate({
                ...flagSchema,
                flags: [...flagSchema.flags, flag]
            });
            setIsCreating(false);
        }
        else {
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
    // Get counts for each section
    const sectionCounts = useMemo(() => {
        const counts = { all: flagSchema.flags.length };
        Object.keys(flagTypeLabels).forEach(type => {
            counts[type] = flagsByType[type].length;
        });
        return counts;
    }, [flagSchema.flags, flagsByType]);
    return (React.createElement("div", { className: "fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4", onClick: (e) => {
            if (e.target === e.currentTarget) {
                onClose();
            }
        } },
        React.createElement("div", { className: "bg-[#0d0d14] border border-[#1a1a2e] rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col", onClick: (e) => e.stopPropagation() },
            React.createElement("div", { className: "p-4 border-b border-[#1a1a2e] flex items-center justify-between flex-shrink-0" },
                React.createElement("div", null,
                    React.createElement("h2", { className: "text-lg font-semibold text-white" }, "Flag Manager"),
                    React.createElement("p", { className: "text-xs text-gray-500 mt-1" }, dialogue && (React.createElement("span", null,
                        React.createElement("span", { className: "text-[#e94560] font-semibold" }, usedFlags.size),
                        React.createElement("span", { className: "text-gray-500" }, " / "),
                        React.createElement("span", { className: "text-gray-400" }, flagSchema.flags.length),
                        React.createElement("span", { className: "text-gray-500" }, " flags used in dialogue"))))),
                React.createElement("div", { className: "flex gap-2" },
                    React.createElement("button", { onClick: () => handleCreateFlag(selectedSection !== 'all' ? selectedSection : undefined), className: "px-3 py-1.5 bg-[#e94560] hover:bg-[#d63850] text-white text-sm rounded flex items-center gap-2" },
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
            React.createElement("div", { className: "flex-1 flex overflow-hidden" },
                React.createElement("div", { className: "w-64 border-r border-[#1a1a2e] bg-[#12121a] flex flex-col flex-shrink-0" },
                    React.createElement("div", { className: "p-4 border-b border-[#1a1a2e]" },
                        React.createElement("div", { className: "text-xs text-gray-500 uppercase tracking-wider mb-3" }, "Sections"),
                        React.createElement("nav", { className: "space-y-1" },
                            React.createElement("button", { onClick: () => setSelectedSection('all'), className: `w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center justify-between ${selectedSection === 'all'
                                    ? 'bg-[#e94560]/20 text-[#e94560] border border-[#e94560]/30'
                                    : 'text-gray-400 hover:bg-[#1a1a2e] hover:text-white'}` },
                                React.createElement("span", null, "All Flags"),
                                React.createElement("span", { className: "text-xs text-gray-500" }, sectionCounts.all)),
                            Object.entries(flagTypeLabels).map(([type, label]) => (React.createElement("button", { key: type, onClick: () => setSelectedSection(type), className: `w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center justify-between ${selectedSection === type
                                    ? `${flagTypeColors[type]} border`
                                    : 'text-gray-400 hover:bg-[#1a1a2e] hover:text-white'}` },
                                React.createElement("span", { className: "flex items-center gap-2" },
                                    React.createElement("span", null, flagTypeIcons[type]),
                                    React.createElement("span", null, label)),
                                React.createElement("span", { className: "text-xs text-gray-500" }, sectionCounts[type] || 0)))))),
                    React.createElement("div", { className: "p-4 border-t border-[#1a1a2e] mt-auto" },
                        React.createElement("div", { className: "text-xs text-gray-500 uppercase tracking-wider mb-2" }, "Info"),
                        React.createElement("div", { className: "text-xs text-gray-400 space-y-1" },
                            React.createElement("p", null,
                                React.createElement("span", { className: "text-gray-500" }, "Dialogue flags"),
                                " (gray) are temporary and reset after dialogue ends."),
                            React.createElement("p", null,
                                React.createElement("span", { className: "text-white" }, "Game flags"),
                                " (colored) persist and affect the entire game.")))),
                React.createElement("div", { className: "flex-1 overflow-y-auto" }, editingFlag ? (React.createElement("div", { className: "p-6" },
                    React.createElement(FlagEditor, { flag: editingFlag, categories: flagSchema.categories || [], onSave: handleSaveFlag, onCancel: () => { setEditingFlag(null); setIsCreating(false); } }))) : (React.createElement("div", { className: "p-6" }, currentFlags.length === 0 ? (React.createElement("div", { className: "text-center py-12 text-gray-500" },
                    React.createElement("p", { className: "mb-4" },
                        "No ",
                        selectedSection === 'all' ? '' : flagTypeLabels[selectedSection],
                        " flags defined yet."),
                    React.createElement("button", { onClick: () => handleCreateFlag(selectedSection !== 'all' ? selectedSection : undefined), className: "px-4 py-2 bg-[#e94560] hover:bg-[#d63850] text-white rounded" },
                        "Create ",
                        selectedSection === 'all' ? 'a' : flagTypeLabels[selectedSection],
                        " Flag"))) : (React.createElement("div", { className: "space-y-2" }, currentFlags.map(flag => {
                    const isUsed = usedFlags.has(flag.id);
                    return (React.createElement("div", { key: flag.id, className: `bg-[#12121a] border rounded-lg p-4 hover:bg-[#1a1a2e] transition-colors ${isUsed ? 'border-l-4 border-l-[#e94560]' : 'border-[#1a1a2e]'}` },
                        React.createElement("div", { className: "flex items-start justify-between gap-4" },
                            React.createElement("div", { className: "flex-1 min-w-0" },
                                React.createElement("div", { className: "flex items-center gap-2 mb-2" },
                                    React.createElement("span", { className: `px-2 py-1 rounded text-xs font-medium border ${flagTypeColors[flag.type]}` }, flagTypeLabels[flag.type]),
                                    React.createElement("span", { className: "font-mono text-sm text-white" }, flag.id),
                                    isUsed && (React.createElement("span", { className: "text-[10px] px-1.5 py-0.5 bg-[#e94560]/20 text-[#e94560] rounded border border-[#e94560]/30" }, "Used"))),
                                flag.name !== flag.id && (React.createElement("div", { className: "text-sm text-gray-300 mb-1" }, flag.name)),
                                flag.description && (React.createElement("div", { className: "text-xs text-gray-500 mt-1" }, flag.description)),
                                React.createElement("div", { className: "flex items-center gap-3 mt-2" },
                                    flag.category && (React.createElement("span", { className: "text-xs text-gray-500" },
                                        "Category: ",
                                        flag.category)),
                                    flag.valueType && (React.createElement("span", { className: "text-xs text-gray-500" },
                                        "Type: ",
                                        flag.valueType)),
                                    flag.defaultValue !== undefined && (React.createElement("span", { className: "text-xs text-gray-500" },
                                        "Default: ",
                                        String(flag.defaultValue))))),
                            React.createElement("div", { className: "flex gap-1 flex-shrink-0" },
                                React.createElement("button", { onClick: () => setEditingFlag(flag), className: "p-2 text-gray-400 hover:text-white hover:bg-[#2a2a3e] rounded transition-colors", title: "Edit" },
                                    React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                                        React.createElement("path", { d: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" }),
                                        React.createElement("path", { d: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" }))),
                                React.createElement("button", { onClick: () => handleDeleteFlag(flag.id), className: "p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors", title: "Delete" },
                                    React.createElement("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" },
                                        React.createElement("polyline", { points: "3 6 5 6 21 6" }),
                                        React.createElement("path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" })))))));
                }))))))))));
}
function FlagEditor({ flag, categories, onSave, onCancel }) {
    const [edited, setEdited] = useState(flag);
    const flagTypes = ['dialogue', 'quest', 'achievement', 'item', 'stat', 'title', 'global'];
    return (React.createElement("div", { className: "space-y-4 max-w-2xl" },
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
