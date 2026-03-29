// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { remarkAlert } from "remark-github-blockquote-alert";
import { remarkHexoTags } from "./src/scripts/remark-hexo-tags.mjs";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
        site: "https://example.com",
        integrations: [mdx(), sitemap()],
        markdown: {
                remarkPlugins: [remarkAlert, remarkHexoTags]
        },
        adapter: cloudflare({
                platformProxy: {
                        enabled: true,
                },
        })
});
