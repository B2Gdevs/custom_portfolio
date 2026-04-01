# Tab-complete pnpm script names from the nearest package.json (walk up from $PWD; colon segments).
# Used by: `pnpm` and `magicborn pnpm` (see packages/magicborn-cli/completions/magicborn.bash).
# Standalone install:
#   source "$(git rev-parse --show-toplevel)/completions/pnpm-workspace.bash"

# Common pnpm subcommands — merged with package.json scripts so `pnpm install` still completes.
__PNPM_TOPLEVEL_BUILTINS=(
  add audit bin cat config create dedupe deploy dlx doctor env exec fetch help import init install
  install-test licenses link list mcp migrate outdated pack patch publish prune rb rebuild remove
  restart root run setup shell store test unlink update version why workspace
)

_pnpm_completions_repo_root() {
  if [[ -n "${MAGICBORN_REPO:-}" ]] && [[ -f "$MAGICBORN_REPO/scripts/pnpm-workspace-script-completions.mjs" ]]; then
    echo "$MAGICBORN_REPO"
    return 0
  fi
  git rev-parse --show-toplevel 2>/dev/null
}

_pnpm_workspace_script_words() {
  local cur="$1"
  local top
  top=$(_pnpm_completions_repo_root) || return
  node "${top}/scripts/pnpm-workspace-script-completions.mjs" "$PWD" "$cur" 2>/dev/null
}

# Complete first argument after `pnpm`: builtins + package.json scripts (colon-aware).
_pnpm_workspace() {
  local cur="${COMP_WORDS[COMP_CWORD]}"
  local prev="${COMP_WORDS[COMP_CWORD - 1]}"
  local builtins
  local scripts
  local top

  case "${COMP_CWORD}" in
  1)
    if [[ "$cur" == -* ]]; then
      COMPREPLY=()
      return
    fi
    builtins=$(printf '%s ' "${__PNPM_TOPLEVEL_BUILTINS[@]}")
    scripts=""
    if top=$(_pnpm_completions_repo_root); then
      scripts=$(_pnpm_workspace_script_words "$cur" | tr '\n' ' ')
    fi
    while IFS= read -r line; do
      [[ -n "$line" ]] && COMPREPLY+=("$line")
    done < <(compgen -W "${builtins} ${scripts}" -- "$cur")
    ;;
  2)
    if [[ "$prev" == "run" ]]; then
      merged=""
      if top=$(_pnpm_completions_repo_root); then
        merged=$(_pnpm_workspace_script_words "$cur" | tr '\n' ' ')
      fi
      while IFS= read -r line; do
        [[ -n "$line" ]] && COMPREPLY+=("$line")
      done < <(compgen -W "$merged" -- "$cur")
    else
      COMPREPLY=()
    fi
    ;;
  *)
    COMPREPLY=()
    ;;
  esac
}

complete -o default -F _pnpm_workspace pnpm
