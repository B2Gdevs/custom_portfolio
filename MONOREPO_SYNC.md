# Monorepo Auto-Sync

This monorepo automatically syncs changed packages to their GitHub repositories when you push to `main`.

## How It Works

When you push to the `main` branch, a git `post-push` hook automatically:
1. Detects which packages have changes in the commit
2. Syncs only those packages to their GitHub repos
3. Handles pull/rebase if needed

## Disabling Auto-Sync

If you want to disable automatic syncing, you have two options:

### Option 1: Environment Variable (Temporary)
```bash
MONOREPO_AUTO_SYNC=false git push origin main
```

### Option 2: Create a Disable File (Permanent)
```bash
touch .monorepo-no-sync
git add .monorepo-no-sync
git commit -m "Disable auto-sync"
```

To re-enable, just delete the file:
```bash
rm .monorepo-no-sync
```

## Manual Syncing

You can always sync packages manually:

### Sync a specific package:
```bash
./scripts/sync-package-to-repo.sh dialogue-forge
```

### Sync all packages:
```bash
npm run package:sync:all
# or
./scripts/sync-all-packages.sh
```

### Sync via package manager script:
```bash
npm run package:sync dialogue-forge
# or sync all
npm run package:sync
```

## Best Practices

- **Auto-sync is enabled by default** - packages stay in sync automatically
- **Only syncs on `main` branch** - feature branches won't trigger syncs
- **Only syncs changed packages** - efficient and fast
- **Can be disabled** - when you need manual control

## Troubleshooting

If a package sync fails:
1. Check the error message in the hook output
2. Manually sync the package: `./scripts/sync-package-to-repo.sh <package-name>`
3. If there are conflicts, the script will try to pull/rebase automatically


