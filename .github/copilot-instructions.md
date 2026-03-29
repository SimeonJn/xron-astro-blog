# Project Guidelines

## Code Style
- **Astro & TypeScript**: This is an Astro 5.x project using TypeScript.
- **Styling**: Uses vanilla CSS (scoped in `.astro` files or global in `src/styles/global.css`). Do not use Tailwind or other CSS frameworks unless requested.
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
- **Preview**: `npm run preview` (runs `astro build && wrangler dev`)
- **Deploy**: `npm run deploy`
- **Typegen**: `npm run cf-typegen` (generates `worker-configuration.d.ts` for Cloudflare bindings).

## Conventions
- **Cloudflare Bound**: When adding server-side APIs or endpoints in `src/pages/`, ensure they conform to Cloudflare Worker runtime limits. Access bindings via the locals proxy rather than standard `process.env` or `import.meta.env`.
- **Docs Reference**: See [README.md](../README.md) for more general details on project structure.
