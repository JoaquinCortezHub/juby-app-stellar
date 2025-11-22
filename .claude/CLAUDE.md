# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
npm run dev          # Start dev server at http://localhost:3000

# Building
npm run build        # Production build
npm start            # Run production server

# Code Quality
npm run lint         # Run ESLint
```

## Architecture Overview

### Next.js App Router (v16)
This project uses the modern App Router in the `app/` directory with file-based routing:
- `app/layout.tsx` - Root layout with metadata and global HTML structure
- `app/page.tsx` - Home page (default route)
- `app/globals.css` - Global styles with Tailwind

All components are React Server Components by default. Use `"use client"` directive when client-side interactivity is needed.

### Styling with Tailwind CSS v4
This project uses Tailwind CSS v4 with the new PostCSS integration (`@tailwindcss/postcss`). Key differences from v3:
- No `tailwind.config.js` file - configuration via CSS
- Dark mode via `@media (prefers-color-scheme: dark)`
- CSS variables defined in `app/globals.css` for theming (zinc color palette)

### TypeScript Configuration
- Path alias `@/*` maps to root directory (e.g., `@/app/layout.tsx`)
- Strict mode enabled
- Use absolute imports with the `@/` prefix for better refactoring

### shadcn Components
The project includes shadcn MCP server integration (see `.mcp.json`). Components can be added using the shadcn CLI when needed.

### React 19
This project uses React 19.2.0. Be aware of:
- Server Components as the default paradigm
- React Compiler optimizations available
- New hooks and APIs (use/useOptimistic/etc.)

## Project Structure

```
app/              - Next.js App Router (layouts, pages, routing)
public/           - Static assets (images, icons)
.mcp.json         - MCP server configuration (shadcn)
```

## Configuration Files

- `next.config.ts` - Next.js configuration (TypeScript)
- `tsconfig.json` - TypeScript compiler options
- `postcss.config.mjs` - PostCSS with Tailwind v4
- `eslint.config.mjs` - ESLint flat config format (v9)
