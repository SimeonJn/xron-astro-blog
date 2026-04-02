# Project Guidelines

## Code Style
- **Astro & TypeScript**: This is an Astro 5.x project using TypeScript.
- **Styling**: Use vanilla CSS only (scoped in `.astro` files or global in `src/styles/global.css`). Do not introduce Tailwind or other CSS frameworks unless explicitly requested.
- **Visual Direction**: Keep the site minimalist. Prefer points, lines, whitespace, and subtle motion over decorative or flashy effects.
- **Animation Style**: Use lightweight, meaningful animations (entry, stagger, hover feedback). Avoid heavy parallax, large blur/glow stacks, or overly busy transitions.
- **Content**: Uses Astro 5.x Content Collections (`src/content.config.ts`) with the `glob` loader. Content is stored in `src/content/blog/` as `.md` or `.mdx`.

## Architecture
- **Framework**: Astro SSG/SSR blog template.
- **Cloudflare Workers Integration**: Deeply integrated with Cloudflare Workers/Pages. Uses `@astrojs/cloudflare` adapter with `platformProxy` enabled for local dev.
- **Runtime**: Deploys via `wrangler.json` using the `nodejs_compat` compatibility flag.
- **File Structure**: Markdown/MDX in `src/content/blog/`, layouts in `src/layouts/`, and pages in `src/pages/`.

## Build and Test
- **Install**: `npm install`
- **Dev Server**: `npm run dev`
- **Build**: `npm run build`
- **Check**: `npm run check`
- **Preview**: `npm run preview` (runs `astro build && wrangler dev`)
- **Deploy**: `npm run deploy`
- **Typegen**: `npm run cf-typegen` (generates `worker-configuration.d.ts` for Cloudflare bindings).

## Conventions
- **Cloudflare Bound**: When adding server-side APIs or endpoints in `src/pages/`, ensure they fit Cloudflare Worker runtime limits.
- **Bindings Access**: Access runtime bindings through `Astro.locals`/locals proxy, not `process.env` or `import.meta.env`.
- **Content Frontmatter**: Follow schema in `src/content.config.ts` (`title`, `pubDate`/`date`, optional `description`, `tags`, `references`, etc.).
- **Generated Types**: After changing Cloudflare bindings or `wrangler.json`, run `npm run cf-typegen`.
- **Design Consistency**: Match existing theme tokens and primitives in `src/styles/global.css` (dot matrix background, line dividers, monochrome palette).
- **Docs Reference**: Link to `README.md` for general project structure and command details instead of duplicating docs.
