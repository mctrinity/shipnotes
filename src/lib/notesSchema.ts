import { z } from "zod";

export const socialSchema = z.object({
	twitter: z.string(),
	linkedin: z.string(),
});

export const sectionsSchema = z.object({
	features: z.array(z.string()),
	fixes: z.array(z.string()),
	performance: z.array(z.string()),
	chores: z.array(z.string()),
});

export const notesResultSchema = z.object({
	summary: z.string(),
	sections: sectionsSchema,
	releaseNotes: z.string(),
	markdown: z.string(),
	html: z.string(),
	text: z.string(),
	social: socialSchema,
});

export type NotesResultSchema = z.infer<typeof notesResultSchema>;


