/**
 * zsh / fish snippets for `magicborn completion <zsh|fish>`.
 * Bash script lives in `completions/magicborn.bash` (printed by `magicborn completion bash`).
 */

/** Minimal zsh hint — full tab completion: use \`eval "$(magicborn completion bash)"\` with bashcompinit, or install bash completion. */
export const ZSH_COMPLETION = `# zsh: use bash completion via bashcompinit
# autoload -Uz bashcompinit && bashcompinit
# source <(magicborn completion bash)
`;

export const FISH_COMPLETION = `# fish completion for magicborn
complete -c magicborn -f -n "__fish_use_subcommand" -a book -d "Book media & scenes"
complete -c magicborn -f -n "__fish_use_subcommand" -a app -d "Site apps"
complete -c magicborn -f -n "__fish_use_subcommand" -a project -d "Projects"
complete -c magicborn -f -n "__fish_use_subcommand" -a planning-pack -d "Planning packs"
complete -c magicborn -f -n "__fish_use_subcommand" -a listen -d "Listen / BandLab"
complete -c magicborn -f -n "__fish_use_subcommand" -a openai -d "OpenAI account / models"
complete -c magicborn -f -n "__fish_use_subcommand" -a vendor -d "Vendor repos"
complete -c magicborn -f -n "__fish_use_subcommand" -a completion -d "Shell completion"
complete -c magicborn -f -n '__fish_seen_subcommand_from_path book' -a "generate gen scenes"
complete -c magicborn -f -n '__fish_seen_subcommand_from_path book scenes' -a "list extract"
complete -c magicborn -f -n '__fish_seen_subcommand_from_path app' -a "list generate gen"
complete -c magicborn -f -n '__fish_seen_subcommand_from_path project' -a "list generate gen"
`;
