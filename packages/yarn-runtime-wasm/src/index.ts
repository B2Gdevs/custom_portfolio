/**
 * @magicborn/yarn-runtime-wasm
 * 
 * Yarn Spinner runtime for browser.
 * 
 * This package provides:
 * - TypeScriptRuntime: A pure TypeScript VM that interprets DialogueTree directly
 * - (Future) WasmRuntime: A WASM-based VM for compiled .yarnc programs
 * 
 * The TypeScript runtime is recommended for development and simpler use cases.
 * The WASM runtime provides full Yarn Spinner parity for production.
 */

export { TypeScriptRuntime, type TypeScriptRuntimeOptions } from './ts-runtime';
export { 
  type DialogueRuntime, 
  type RuntimeEvent, 
  type RuntimeEventType,
  type LineEvent,
  type OptionsEvent,
  type CommandEvent,
  type NodeStartEvent,
  type NodeCompleteEvent,
  type DialogueCompleteEvent,
  type OptionInfo,
} from './types';
export { VariableStorage, InMemoryVariableStorage, type VariableValue } from './variable-storage';

