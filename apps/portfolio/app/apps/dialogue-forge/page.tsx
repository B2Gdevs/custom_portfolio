'use client';

import Link from 'next/link';
import { ArrowLeft, Code, GitBranch, Play } from 'lucide-react';
import { DialogueEditorV2 } from '@magicborn/dialogue-forge/src/components/DialogueEditorV2';
import { GuidePanel } from '@magicborn/dialogue-forge/src/components/GuidePanel';
import { FlagManager } from '@magicborn/dialogue-forge/src/components/FlagManager';
import { useDialogueForgePageState } from '@/lib/dialogue-forge/use-dialogue-forge-page-state';

export default function DialogueForgePage() {
  const {
    dialogueTree,
    flagSchema,
    setFlagSchema,
    viewMode,
    setViewMode,
    showFlagManager,
    setShowFlagManager,
    showGuide,
    setShowGuide,
    layoutStrategy,
    setLayoutStrategy,
    hasChanges,
    setHasChanges,
    updateDialogueTree,
    handleExportYarn,
    loadExampleDialogue,
    loadExampleFlags,
  } = useDialogueForgePageState();

  const isGraph = viewMode === 'graph';

  return (
    <div className="flex w-full min-h-[min(90dvh,56rem)] flex-1 flex-col overflow-hidden bg-[#0a0a0f] lg:min-h-0">
      <header className="sticky top-0 z-50 border-b border-[#1a1a2e] bg-[#0d0d14]/90 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <Link
              href="/projects/dialogue-forge-interactive-narrative-builder"
              className="inline-flex items-center gap-2 rounded-full border border-[#2a2a3e] px-3 py-1.5 text-sm text-gray-300 transition hover:border-[#e94560] hover:text-white"
            >
              <ArrowLeft size={16} />
              <span>Back to Project</span>
            </Link>
            <input
              type="text"
              value={dialogueTree.title}
              onChange={(e) => {
                updateDialogueTree((prev) => ({ ...prev, title: e.target.value }));
              }}
              className="border-b border-transparent bg-transparent text-lg font-semibold text-white outline-none hover:border-[#2a2a3e] focus:border-[#e94560]"
            />
            {hasChanges ? <span className="text-xs text-yellow-500">•</span> : null}
          </div>

          <div className="flex items-center gap-0.5 rounded-lg bg-[#1a1a2e] p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('graph')}
              className={`flex items-center gap-1 rounded px-3 py-1 text-sm ${viewMode === 'graph' ? 'bg-[#e94560] text-white' : 'text-gray-400'}`}
              title="Graph"
            >
              <GitBranch size={14} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('yarn')}
              className={`flex items-center gap-1 rounded px-3 py-1 text-sm ${viewMode === 'yarn' ? 'bg-[#e94560] text-white' : 'text-gray-400'}`}
              title="Yarn"
            >
              <Code size={14} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('play')}
              className={`flex items-center gap-1 rounded px-3 py-1 text-sm ${viewMode === 'play' ? 'bg-[#e94560] text-white' : 'text-gray-400'}`}
              title="Play"
            >
              <Play size={14} />
            </button>
          </div>

          <div className="w-24" aria-hidden />
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden">
        <DialogueEditorV2
          key={viewMode}
          dialogue={dialogueTree}
          onChange={(updated) => {
            updateDialogueTree(() => updated);
          }}
          flagSchema={flagSchema}
          initialViewMode={viewMode}
          onExportYarn={viewMode !== 'play' ? handleExportYarn : undefined}
          layoutStrategy={isGraph ? layoutStrategy : undefined}
          onLayoutStrategyChange={isGraph ? setLayoutStrategy : undefined}
          onOpenFlagManager={isGraph ? () => setShowFlagManager(true) : undefined}
          onOpenGuide={isGraph ? () => setShowGuide(true) : undefined}
          onLoadExampleDialogue={isGraph ? loadExampleDialogue : undefined}
          onLoadExampleFlags={isGraph ? loadExampleFlags : undefined}
          className="h-full w-full"
        />
      </div>

      <GuidePanel isOpen={showGuide} onClose={() => setShowGuide(false)} />

      {showFlagManager ? (
        <FlagManager
          flagSchema={flagSchema}
          dialogue={dialogueTree}
          onUpdate={(updated) => {
            setFlagSchema(updated);
            setHasChanges(true);
          }}
          onClose={() => setShowFlagManager(false)}
        />
      ) : null}
    </div>
  );
}
