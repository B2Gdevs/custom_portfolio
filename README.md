# Portfolio V2 - Monorepo

A monorepo containing a sleek portfolio site and publishable npm packages. Built with Next.js, MDX, SQLite, and Drizzle ORM.

## 🏗️ Monorepo Structure

```
portfolio-v2/
├── apps/
│   └── portfolio/          # Main portfolio site
├── packages/
│   └── dialogue-forge/    # Visual dialogue editor package
│       ├── src/           # Library source
│       ├── demo/          # Standalone demo app
│       └── bin/           # npx executable
└── packages-shared/
    └── server-template/   # Reusable demo server template
```

## 🚀 Quick Start

### Install Dependencies

```bash
npm install
```

### Run Portfolio App

```bash
npm run dev
# or
cd apps/portfolio && npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your portfolio.

### Run Package Demos

```bash
# Dialogue Forge demo
cd packages/dialogue-forge/demo && npm run dev

# Or after publishing, users can run:
npx @portfolio/dialogue-forge
```

## 📦 Packages

### @portfolio/dialogue-forge

Visual node-based dialogue editor with Yarn Spinner support.

**Install:**
```bash
npm install @portfolio/dialogue-forge
```

**Run Demo:**
```bash
npx @portfolio/dialogue-forge
```

**Use in Code:**
```tsx
import { DialogueEditorV2 } from '@portfolio/dialogue-forge';
```

See [packages/dialogue-forge/README.md](packages/dialogue-forge/README.md) for full documentation.

## 🎨 Portfolio App Features

- 🎨 **Neobrutal Design** - Bold, animated, fun design system
- 📝 **MDX Support** - Write content in Markdown/MDX
- 🗄️ **SQLite Database** - Simple, local database with Drizzle ORM
- 🔐 **Admin Interface** - Content management (development only)
- 📚 **Documentation** - GitBook-style documentation pages
- 🚀 **Projects Showcase** - Display your work beautifully
- ✍️ **Blog** - Share your thoughts and learnings

## 📚 Documentation

- [Monorepo Plan](MONOREPO_PLAN.md) - Architecture overview
- [Implementation Guide](IMPLEMENTATION_GUIDE.md) - Setup details
- [Quick Start](QUICK_START.md) - Package development guide

## 🔧 Development

### Workspace Scripts

```bash
# Run portfolio app
npm run dev

# Build portfolio
npm run build

# Lint
npm run lint
```

### Package Development

```bash
# Build a package
cd packages/dialogue-forge
npm run build

# Test a package
npm run test
```

## 📝 Publishing

Packages are published to npm under the `@portfolio` scope.

**Publisher:** [@magicborn](https://www.npmjs.com/~magicborn)

See [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) for publishing workflow.

## Database Commands

```bash
# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate

# Open Drizzle Studio
npm run db:studio
```

## Admin Interface

The admin interface is **only available in development mode** for security. In production, it will be disabled.

Access it at `/admin` when running in development.

## Content Management

### Adding Content

1. **Markdown Files**: Add `.md` or `.mdx` files to `content/docs`, `content/projects`, or `content/blog`
2. **Frontmatter**: Use YAML frontmatter for metadata:

```markdown
---
title: My Project
description: A cool project
date: 2024-01-01
tags: [react, nextjs]
---

# My Project

Content goes here...
```

### Database Content

Use the admin interface or directly interact with the database to manage content stored in SQLite.

## Deployment

The admin interface is automatically disabled in production. Make sure to:

1. Build the project: `npm run build`
2. Set environment variables if needed
3. Deploy to your hosting platform (Vercel, etc.)

## License

MIT
