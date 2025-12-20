import React, { useState } from 'react';
import { FlagSchema, FlagDefinition } from '../types/flags';

interface FlagSelectorProps {
  value: string[];
  onChange: (flags: string[]) => void;
  flagSchema?: FlagSchema;
  placeholder?: string;
}

export function FlagSelector({ value, onChange, flagSchema, placeholder = "flag1, flag2" }: FlagSelectorProps) {
  const [inputValue, setInputValue] = useState(value.join(', '));
  const [showDropdown, setShowDropdown] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputValue(text);
    const flags = text.split(',').map(s => s.trim()).filter(Boolean);
    onChange(flags);
  };

  const handleFlagClick = (flagId: string) => {
    const current = inputValue ? inputValue.split(',').map(s => s.trim()).filter(Boolean) : [];
    if (!current.includes(flagId)) {
      const newValue = [...current, flagId].join(', ');
      setInputValue(newValue);
      onChange([...current, flagId]);
    }
    setShowDropdown(false);
  };

  const filteredFlags = flagSchema?.flags.filter(flag => 
    !inputValue.toLowerCase().includes(flag.id.toLowerCase())
  ) || [];

  const flagsByCategory = filteredFlags.reduce((acc, flag) => {
    const cat = flag.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(flag);
    return acc;
  }, {} as Record<string, FlagDefinition[]>);

  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        className="w-full bg-[#12121a] border border-[#2a2a3e] rounded px-2 py-1 text-sm text-gray-200 outline-none font-mono focus:border-[#e94560]"
        placeholder={placeholder}
      />
      
      {showDropdown && flagSchema && filteredFlags.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-[#1a1a2e] border border-[#2a2a3e] rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {Object.entries(flagsByCategory).map(([category, flags]) => (
            <div key={category}>
              <div className="px-3 py-1.5 text-[10px] text-gray-500 uppercase border-b border-[#2a2a3e] bg-[#12121a]">
                {category}
              </div>
              {flags.map(flag => (
                <button
                  key={flag.id}
                  onClick={() => handleFlagClick(flag.id)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-[#2a2a3e] flex items-center justify-between"
                >
                  <div>
                    <div className="font-mono text-xs">{flag.id}</div>
                    {flag.name !== flag.id && (
                      <div className="text-xs text-gray-500">{flag.name}</div>
                    )}
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                    flag.type === 'quest' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                    flag.type === 'achievement' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                    flag.type === 'item' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                    flag.type === 'stat' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                    flag.type === 'title' ? 'bg-pink-500/20 text-pink-400 border-pink-500/30' :
                    flag.type === 'global' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                    'bg-gray-500/20 text-gray-400 border-gray-500/30'
                  }`}>
                    {flag.type === 'dialogue' ? 'temp' : flag.type}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

