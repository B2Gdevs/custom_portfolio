/**
 * zsh / fish snippets for `magicborn completion <zsh|fish>`.
 * Bash script lives in `completions/magicborn.bash` (printed by `magicborn completion bash`).
 */

/** zsh: bash completion + optional menu for readable lists */
export const ZSH_COMPLETION = `# magicborn --help colors (stdout): yellow=asset/repo (book, planning-pack, listen);
# cyan=Payload catalog (app, project, payload); green=vendor; blue=OpenAI; magenta=model/style; gray=shell tools.
# Descriptions: dim magenta. Warnings: magicborn portfolio runs use stderr when MAGICBORN_CLI=1.
#
# zsh: use bash completion via bashcompinit
# autoload -Uz bashcompinit && bashcompinit
# source <(magicborn completion bash)
#
# Optional — fuller lists (arrow keys), closer to "vertical picker" UX:
# zstyle ':completion:*' menu select=2
# zstyle ':completion:*' list-rows-first yes
# bindkey '^I' menu-complete
`;

export const FISH_COMPLETION = `# fish completion for magicborn
# Help color key: yellow=asset/repo · cyan=Payload · green=vendor · blue=OpenAI · magenta=model/style · gray=shell (see magicborn --help).
# Fish shows multi-match completions in a pager (often friendlier than bash’s grid).
# set -g fish_pager_color_prefix cyan
#
complete -c magicborn -f -n "__fish_use_subcommand" -a book -d "Book media & scenes"
complete -c magicborn -f -n "__fish_use_subcommand" -a app -d "Site apps"
complete -c magicborn -f -n "__fish_use_subcommand" -a project -d "Projects"
complete -c magicborn -f -n "__fish_use_subcommand" -a planning-pack -d "Planning packs"
complete -c magicborn -f -n "__fish_use_subcommand" -a listen -d "Listen / BandLab"
complete -c magicborn -f -n "__fish_use_subcommand" -a style -d "Magicborn style block"
complete -c magicborn -f -n "__fish_use_subcommand" -a model -d "CLI model preferences"
complete -c magicborn -f -n "__fish_use_subcommand" -a openai -d "OpenAI account / models"
complete -c magicborn -f -n "__fish_use_subcommand" -a chat -d "Chat stub (assistant-ui path)"
complete -c magicborn -f -n "__fish_use_subcommand" -a payload -d "Payload CMS discovery"
complete -c magicborn -f -n "__fish_use_subcommand" -a pnpm -d "pnpm passthrough (nearest package.json)"
complete -c magicborn -f -n "__fish_use_subcommand" -a vendor -d "Vendor repos"
complete -c magicborn -f -n "__fish_use_subcommand" -a shell-init -d "PATH + completion for shell rc"
complete -c magicborn -f -n "__fish_use_subcommand" -a completion -d "Shell completion"
complete -c magicborn -f -n "__fish_use_subcommand" -a update -d "pnpm install + rebuild CLI"
complete -c magicborn -f -n '__fish_seen_subcommand_from_path book' -a "generate gen scenes"
complete -c magicborn -f -n '__fish_seen_subcommand_from_path book scenes' -a "list extract"
complete -c magicborn -f -n '__fish_seen_subcommand_from_path app' -a "list generate gen"
complete -c magicborn -f -n '__fish_seen_subcommand_from_path project' -a "list generate gen"
complete -c magicborn -f -n '__fish_seen_subcommand_from_path vendor' -a "add list use clear scope --id -i"
complete -c magicborn -f -n '__fish_seen_subcommand_from_path payload' -a "collections app"
complete -c magicborn -f -n '__fish_seen_subcommand_from_path payload app' -a "generate gen"
`;
