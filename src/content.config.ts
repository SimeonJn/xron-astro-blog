import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string().nullable().optional().transform(v => v || "Untitled"),
		description: z.string().nullable().optional().transform(v => v || ""),
		// Transform string to Date object
		pubDate: z.coerce.date().nullable().optional(),
		date: z.coerce.date().nullable().optional(),
		updatedDate: z.coerce.date().nullable().optional(),
		heroImage: z.string().nullable().optional(),
		cover: z.string().nullable().optional(),
		references: z.array(z.string()).optional(),
		tags: z.array(z.string()).optional(),
	}).transform((data) => ({
		...data,
		pubDate: data.pubDate || data.date || new Date(),
		heroImage: data.heroImage || data.cover || undefined
	}))
});

export const collections = { blog };
