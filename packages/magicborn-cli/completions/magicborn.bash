# magicborn completion (bash) — install: eval "$(magicborn completion bash)"
# Requires: magicborn on PATH (pnpm install at repo root → node_modules/.bin, or shell-init).

# `magicborn pnpm …` reuses pnpm workspace script completion (nearest package.json from $PWD).
if [[ -z "${__MAGICBORN_PNPM_COMPLETION_LOADED:-}" ]]; then
  __mb_pn_top=""
  if [[ -n "${MAGICBORN_REPO:-}" && -f "$MAGICBORN_REPO/completions/pnpm-workspace.bash" ]]; then
    __mb_pn_top="$MAGICBORN_REPO"
  else
    __mb_pn_top=$(git rev-parse --show-toplevel 2>/dev/null)
  fi
  if [[ -n "$__mb_pn_top" && -f "$__mb_pn_top/completions/pnpm-workspace.bash" ]]; then
    # shellcheck source=/dev/null
    source "$__mb_pn_top/completions/pnpm-workspace.bash"
  fi
  __MAGICBORN_PNPM_COMPLETION_LOADED=1
fi

_magicborn() {
  local cur="${COMP_WORDS[COMP_CWORD]}"
  local prev="${COMP_WORDS[COMP_CWORD-1]}"
  local first="${COMP_WORDS[1]}"
  local second="${COMP_WORDS[2]}"
  local w
  local i
  local ctx

  if command -v magicborn >/dev/null 2>&1; then
    case "$prev" in
      --seed)
        COMPREPLY=( $(compgen -W "$(magicborn __complete seed-keys 2>/dev/null | tr '\n' ' ')" -- "$cur") )
        return
        ;;
      --slug)
        ctx=""
        for ((i=1; i<COMP_CWORD; i++)); do
          w="${COMP_WORDS[i]}"
          [[ "$w" == "listen" ]] && ctx=listen
          [[ "$w" == "book" ]] && ctx=book
        done
        if [[ "$ctx" == "listen" ]]; then
          COMPREPLY=( $(compgen -W "$(magicborn __complete listen-slugs 2>/dev/null | tr '\n' ' ')" -- "$cur") )
          return
        fi
        if [[ "$ctx" == "book" ]]; then
          COMPREPLY=( $(compgen -W "$(magicborn __complete book-slugs 2>/dev/null | tr '\n' ' ')" -- "$cur") )
          return
        fi
        ;;
      --id)
        ctx=""
        for ((i=1; i<COMP_CWORD; i++)); do
          w="${COMP_WORDS[i]}"
          [[ "$w" == "app" ]] && ctx=app
          [[ "$w" == "project" ]] && ctx=project
        done
        if [[ "$ctx" == "app" ]]; then
          COMPREPLY=( $(compgen -W "$(magicborn __complete app-ids 2>/dev/null | tr '\n' ' ')" -- "$cur") )
          return
        fi
        if [[ "$ctx" == "project" ]]; then
          COMPREPLY=( $(compgen -W "$(magicborn __complete project-slugs 2>/dev/null | tr '\n' ' ')" -- "$cur") )
          return
        fi
        ;;
    esac
  fi

  if [[ "${COMP_WORDS[1]}" == "pnpm" ]] && [[ ${COMP_CWORD} -ge 2 ]] && type _pnpm_workspace &>/dev/null; then
    local _mb_save=("${COMP_WORDS[@]}")
    local _mb_sc=$COMP_CWORD
    COMP_WORDS=( "${COMP_WORDS[@]:1}" )
    ((COMP_CWORD--))
    _pnpm_workspace
    COMP_WORDS=("${_mb_save[@]}")
    COMP_CWORD=$_mb_sc
    return
  fi

  if [[ ${COMP_CWORD} -eq 1 ]]; then
    COMPREPLY=( $(compgen -W "book app project planning-pack listen style model openai pnpm vendor completion shell-init update" -- "$cur") )
    return
  fi

  case "$first" in
    book)
      if [[ ${COMP_CWORD} -eq 2 ]]; then
        COMPREPLY=( $(compgen -W "generate gen scenes" -- "$cur") )
        return
      fi
      if [[ "$second" == "scenes" && ${COMP_CWORD} -eq 3 ]]; then
        COMPREPLY=( $(compgen -W "list extract" -- "$cur") )
        return
      fi
      if [[ "$second" == "generate" || "$second" == "gen" ]]; then
        COMPREPLY=( $(compgen -W "--slug --prompt --seed --scene-key --scene-text --dry-run --print-prompt --raw --size --slot --json" -- "$cur") )
        return
      fi
      ;;
    app|project)
      if [[ ${COMP_CWORD} -eq 2 ]]; then
        COMPREPLY=( $(compgen -W "list generate gen" -- "$cur") )
        return
      fi
      if [[ "$second" == "generate" || "$second" == "gen" ]]; then
        COMPREPLY=( $(compgen -W "--id --prompt --seed --scene-key --dry-run --print-prompt --raw --size --slot --json" -- "$cur") )
        return
      fi
      ;;
    planning-pack|listen)
      if [[ ${COMP_CWORD} -eq 2 ]]; then
        COMPREPLY=( $(compgen -W "generate gen" -- "$cur") )
        return
      fi
      if [[ "$second" == "generate" || "$second" == "gen" ]]; then
        if [[ "$first" == "planning-pack" ]]; then
          COMPREPLY=( $(compgen -W "--pack --prompt --seed --scene-key --dry-run --print-prompt --raw --size --slot --json" -- "$cur") )
        else
          COMPREPLY=( $(compgen -W "--slug --prompt --seed --scene-key --dry-run --print-prompt --raw --size --slot --json" -- "$cur") )
        fi
        return
      fi
      ;;
    vendor)
      if [[ ${COMP_CWORD} -eq 2 ]]; then
        COMPREPLY=( $(compgen -W "add" -- "$cur") )
        return
      fi
      ;;
    completion)
      if [[ ${COMP_CWORD} -eq 2 ]]; then
        COMPREPLY=( $(compgen -W "bash zsh fish" -- "$cur") )
        return
      fi
      ;;
    shell-init)
      if [[ ${COMP_CWORD} -eq 2 ]]; then
        COMPREPLY=( $(compgen -W "bash zsh fish" -- "$cur") )
        return
      fi
      ;;
    style)
      if [[ ${COMP_CWORD} -eq 2 ]]; then
        COMPREPLY=( $(compgen -W "show set clear reset suggest" -- "$cur") )
        return
      fi
      if [[ "$second" == "suggest" && ${COMP_CWORD} -eq 3 ]]; then
        COMPREPLY=( $(compgen -W "--book --query --model --cheap --json --save" -- "$cur") )
        return
      fi
      ;;
    model)
      if [[ ${COMP_CWORD} -eq 2 ]]; then
        COMPREPLY=( $(compgen -W "get set recommend list config" -- "$cur") )
        return
      fi
      if [[ "$second" == "set" && ${COMP_CWORD} -eq 3 ]]; then
        COMPREPLY=( $(compgen -W "image chat embedding video" -- "$cur") )
        return
      fi
      if [[ "$second" == "recommend" && ${COMP_CWORD} -eq 3 ]]; then
        COMPREPLY=( $(compgen -W "image chat embedding video" -- "$cur") )
        return
      fi
      if [[ "$second" == "list" && ${COMP_CWORD} -eq 3 ]]; then
        COMPREPLY=( $(compgen -W "--live" -- "$cur") )
        return
      fi
      if [[ "$second" == "config" && ${COMP_CWORD} -eq 3 ]]; then
        COMPREPLY=( $(compgen -W "--rag-enabled --rag-book --rag-max-hits --rag-auto-book --suggest-model --cheap-suggest-model" -- "$cur") )
        return
      fi
      ;;
    openai)
      if [[ ${COMP_CWORD} -eq 2 ]]; then
        COMPREPLY=( $(compgen -W "$(magicborn __complete openai 2>/dev/null | tr '\n' ' ')" -- "$cur") )
        return
      fi
      if [[ "$second" == "status" && ${COMP_CWORD} -eq 3 ]]; then
        COMPREPLY=( $(compgen -W "--json" -- "$cur") )
        return
      fi
      if [[ "$second" == "models" && ${COMP_CWORD} -eq 3 ]]; then
        COMPREPLY=( $(compgen -W "--json --category" -- "$cur") )
        return
      fi
      if [[ "$second" == "projects" && ${COMP_CWORD} -eq 3 ]]; then
        COMPREPLY=( $(compgen -W "--json --include-archived --limit" -- "$cur") )
        return
      fi
      ;;
    update)
      if [[ ${COMP_CWORD} -eq 2 ]]; then
        COMPREPLY=( $(compgen -W "--pull" -- "$cur") )
        return
      fi
      ;;
  esac
  COMPREPLY=()
}

complete -F _magicborn magicborn
