# Tab-complete pnpm script names from the repo root package.json (colon segments: vendor:grimetime:…).
# Install (bash): add to ~/.bashrc (after pnpm is on PATH):
#   source /path/to/custom_portfolio/completions/pnpm-workspace.bash
# Or from repo root:
#   source "$(git rev-parse --show-toplevel)/completions/pnpm-workspace.bash"

# Common pnpm subcommands — merged with workspace scripts so `pnpm install` still completes.
__PNPM_TOPLEVEL_BUILTINS=(
  add audit bin cat config create dedupe deploy dlx doctor env exec fetch help import init install
  install-test licenses link list mcp migrate outdated pack patch publish prune rb rebuild remove
  restart root run setup shell store test unlink update version why workspace
)

_pnpm_workspace_find_root() {
  local d="$PWD"
  while [[ "$d" != "/" ]]; do
    if [[ -f "$d/package.json" ]]; then
      if [[ -f "$d/pnpm-workspace.yaml" || -f "$d/pnpm-workspace.yml" ]]; then
        echo "$d"
        return 0
      fi
      if grep -q '"workspaces"' "$d/package.json" 2>/dev/null; then
        echo "$d"
        return 0
      fi
    fi
    d=$(dirname "$d")
  done
  if git rev-parse --show-toplevel &>/dev/null; then
    local g
    g=$(git rev-parse --show-toplevel)
    if [[ -f "$g/package.json" ]] && { [[ -f "$g/pnpm-workspace.yaml" ]] || grep -q '"workspaces"' "$g/package.json" 2>/dev/null; }; then
      echo "$g"
      return 0
    fi
  fi
  return 1
}

_pnpm_workspace_script_words() {
  local root="$1"
  local cur="$2"
  local script
  if ! script=$(node "${root}/scripts/pnpm-workspace-script-completions.mjs" "$root" "$cur" 2>/dev/null); then
    script=""
  fi
  echo "$script"
}

# Complete first argument after `pnpm`: builtins + package.json scripts (colon-aware).
_pnpm_workspace() {
  local cur="${COMP_WORDS[COMP_CWORD]}"
  local prev="${COMP_WORDS[COMP_CWORD - 1]}"
  local root
  local merged
  local line
  local builtins
  local scripts

  case "${COMP_CWORD}" in
  1)
    # Let pnpm / shell handle flags (-C, --dir, …)
    if [[ "$cur" == -* ]]; then
      COMPREPLY=()
      return
    fi
    if ! root=$(_pnpm_workspace_find_root); then
      COMPREPLY=()
      return
    fi
    builtins=$(printf '%s ' "${__PNPM_TOPLEVEL_BUILTINS[@]}")
    scripts=$(_pnpm_workspace_script_words "$root" "$cur" | tr '\n' ' ')
    merged="${builtins} ${scripts}"
    while IFS= read -r line; do
      [[ -n "$line" ]] && COMPREPLY+=("$line")
    done < <(compgen -W "$merged" -- "$cur")
    ;;
  2)
    # pnpm run <script>
    if [[ "$prev" == "run" ]]; then
      if ! root=$(_pnpm_workspace_find_root); then
        COMPREPLY=()
        return
      fi
      merged=$(_pnpm_workspace_script_words "$root" "$cur" | tr '\n' ' ')
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

# -o default: if no matches, fall back to normal completion (paths, etc.)
complete -o default -F _pnpm_workspace pnpm
