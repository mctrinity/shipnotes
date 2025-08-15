import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { notesResultSchema } from "@/lib/notesSchema";

const requestSchema = z.object({
	raw: z.string().min(1),
	style: z.enum(["formal", "casual"]).optional(),
	productName: z.string().optional(),
	version: z.string().optional(),
});

export async function POST(req: NextRequest) {
	const apiKey = process.env.OPENAI_API_KEY;
	if (!apiKey) {
		return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
	}

	let body: unknown;
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	const parsed = requestSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json({ error: "Invalid request" }, { status: 400 });
	}

	const { raw, style, productName, version } = parsed.data;

	const systemPrompt = `You are a release notes generator. Return ONLY valid JSON matching this exact structure:

{
  "summary": "Brief 1-2 sentence summary of the release",
  "sections": {
    "features": ["New feature 1", "New feature 2"],
    "fixes": ["Bug fix 1", "Bug fix 2"],
    "performance": ["Performance improvement 1"],
    "chores": ["Maintenance task 1"]
  },
  "releaseNotes": "Polished prose version of the release notes",
  "markdown": "# Release Notes\\n\\n## Features\\n- Feature 1\\n- Feature 2",
  "html": "<h1>Release Notes</h1><h2>Features</h2><ul><li>Feature 1</li></ul>",
  "text": "Plain text version of release notes",
  "social": {
    "twitter": "Tweet about the release (max 280 chars)",
    "linkedin": "LinkedIn post about the release"
  }
}

Do not include any markdown formatting, code fences, or extra text. Only return the JSON object.`;

	const userPrompt = [
		`Raw commits:\n${raw}`,
		style ? `Tone: ${style}` : undefined,
		productName ? `Product: ${productName}` : undefined,
		version ? `Version: ${version}` : undefined,
	]
		.filter(Boolean)
		.join("\n");

	try {
		// Use the OpenAI responses API (compatible with Next.js Edge or Node runtimes)
		const response = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				model: "gpt-4o-mini",
				messages: [
					{ role: "system", content: systemPrompt },
					{ role: "user", content: userPrompt },
				],
				temperature: 0.3,
			}),
		});

		if (!response.ok) {
			const text = await response.text();
			console.error("OpenAI API error:", text);
			return NextResponse.json({ error: "AI request failed" }, { status: 500 });
		}

		const data = await response.json();
		let rawText: string = data?.choices?.[0]?.message?.content ?? "";

		// If the model wrapped JSON in ``` fences, strip them
		rawText = rawText.trim();
		if (rawText.startsWith("```")) {
			const match = rawText.match(/^```[a-zA-Z]*\n([\s\S]*?)\n```$/);
			if (match && match[1]) {
				rawText = match[1];
			}
		}

		let json: unknown;
		try {
			json = JSON.parse(rawText);
		} catch (_e) {
			console.log("Raw AI text (JSON.parse failed):", rawText);
			return NextResponse.json({ error: "Invalid JSON from AI" }, { status: 500 });
		}

		const result = notesResultSchema.safeParse(json);
		if (!result.success) {
			console.log("Raw AI text (schema failed):", rawText);
			return NextResponse.json({ error: "Invalid JSON from AI" }, { status: 500 });
		}

		return NextResponse.json(result.data);
	} catch (err) {
		console.error(err);
		return NextResponse.json({ error: "Server error" }, { status: 500 });
	}
}


