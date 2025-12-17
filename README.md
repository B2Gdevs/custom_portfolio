# Portfolio V2

A sleek, neobrutal portfolio site built with Next.js, MDX, SQLite, and Drizzle ORM. Focused on software architecture documentation, project showcases, and blog content.

## Features

- 🎨 **Neobrutal Design** - Bold, animated, fun design system
- 📝 **MDX Support** - Write content in Markdown/MDX
- 🗄️ **SQLite Database** - Simple, local database with Drizzle ORM
- 🔐 **Admin Interface** - Content management (development only)
- 📚 **Documentation** - GitBook-style documentation pages
- 🚀 **Projects Showcase** - Display your work beautifully
- ✍️ **Blog** - Share your thoughts and learnings

## Tech Stack

- **Framework**: Next.js 16
- **Styling**: Tailwind CSS
- **Database**: SQLite + Drizzle ORM
- **Content**: MDX/Markdown files
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Generate database migrations
npm run db:generate

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your site.

## Project Structure

```
portfolio-v2/
├── app/                    # Next.js app directory
│   ├── admin/              # Admin interface (dev only)
│   ├── docs/               # Documentation pages
│   ├── projects/           # Project showcase
│   ├── blog/               # Blog posts
│   └── page.tsx            # Home page
├── components/             # React components
│   ├── layout/            # Layout components
│   ├── ui/                # UI components
│   └── admin/             # Admin components
├── content/                # MDX/Markdown files
│   ├── docs/              # Documentation content
│   ├── projects/          # Project content
│   └── blog/              # Blog content
├── lib/                    # Utilities
│   ├── db/                # Database schema & connection
│   ├── content.ts         # Content file utilities
│   └── mdx.tsx            # MDX components
└── styles/                 # Additional styles
```

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
