"use client";
import { useMemo, useState } from "react";
import type { NotesResult } from "@/types/notes";

function CharacterCounter({ text, limit }: { text: string; limit: number }) {
	const count = text.length;
	const over = count > limit;
	return (
		<div className={`text-sm ${over ? "text-red-500" : "text-neutral-500"}`}>
			{count}/{limit}
		</div>
	);
}

export default function DashboardPage() {
	const [raw, setRaw] = useState("");
	const [productName, setProductName] = useState("");
	const [version, setVersion] = useState("");
	const [style, setStyle] = useState<"formal" | "casual" | "">("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<NotesResult | null>(null);
	const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

	const tweet = useMemo(() => result?.social.twitter ?? "", [result]);
	const linkedIn = useMemo(() => result?.social.linkedin ?? "", [result]);

	async function onGenerate() {
		setLoading(true);
		setError(null);
		setResult(null);
		try {
			const res = await fetch("/api/generateNotes", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ raw, productName: productName || undefined, version: version || undefined, style: (style || undefined) as "formal" | "casual" | undefined }),
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data?.error || "Failed to generate notes");
			}
			const data = (await res.json()) as NotesResult;
			setResult(data);
		} catch (e) {
			const message = e instanceof Error ? e.message : "Something went wrong";
			setError(message);
		} finally {
			setLoading(false);
		}
	}

	async function copy(text: string, label: string) {
		if (!text) return;
		
		try {
			await navigator.clipboard.writeText(text);
			setCopyFeedback(`Copied ${label}!`);
			setTimeout(() => setCopyFeedback(null), 2000);
		} catch (err) {
			console.error("Failed to copy:", err);
			setCopyFeedback(`Failed to copy ${label}`);
			setTimeout(() => setCopyFeedback(null), 2000);
		}
	}

	function downloadMarkdown() {
		if (!result?.markdown) return;
		const blob = new Blob([result.markdown], { type: "text/markdown;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${productName || "release-notes"}-${version || "latest"}.md`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	return (
		<div className="min-h-[70vh] grid md:grid-cols-2 gap-6 p-6 text-black dark:text-neutral-100">
			<div className="space-y-4">
				<h1 className="text-2xl font-semibold text-black dark:text-neutral-100">Dashboard</h1>
				<textarea
					value={raw}
					onChange={(e) => setRaw(e.target.value)}
					placeholder="Paste commit messages here..."
					className="w-full h-64 rounded-2xl shadow-sm backdrop-blur bg-white border border-neutral-200/60 dark:bg-neutral-900/40 dark:border-neutral-800/60 p-4 focus:outline-none text-black dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400"
				/>
				<div className="grid sm:grid-cols-3 gap-3">
					<input
						value={productName}
						onChange={(e) => setProductName(e.target.value)}
						placeholder="Product Name (optional)"
						className="rounded-2xl shadow-sm backdrop-blur bg-white border border-neutral-200/60 dark:bg-neutral-900/40 dark:border-neutral-800/60 p-3 focus:outline-none text-black dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400"
					/>
					<input
						value={version}
						onChange={(e) => setVersion(e.target.value)}
						placeholder="Version (optional)"
						className="rounded-2xl shadow-sm backdrop-blur bg-white border border-neutral-200/60 dark:bg-neutral-900/40 dark:border-neutral-800/60 p-3 focus:outline-none text-black dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400"
					/>
					<select
						value={style}
						onChange={(e) => setStyle(e.target.value as "formal" | "casual" | "")}
						className="rounded-2xl shadow-sm backdrop-blur bg-white border border-neutral-200/60 dark:bg-neutral-900/40 dark:border-neutral-800/60 p-3 focus:outline-none text-black dark:text-neutral-100"
					>
						<option value="">Tone (optional)</option>
						<option value="formal">Formal</option>
						<option value="casual">Casual</option>
					</select>
				</div>
				<button
					onClick={onGenerate}
					disabled={loading || !raw}
					className="rounded-2xl px-5 py-3 bg-black text-white disabled:opacity-50"
				>
					{loading ? "Generating..." : "Generate Notes"}
				</button>
				{error ? <p className="text-red-600 dark:text-red-400">{error}</p> : null}
			</div>

			<div className="space-y-4">
				{/* Copy feedback */}
				{copyFeedback && (
					<div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
						{copyFeedback}
					</div>
				)}

				{/* A) Release Notes */}
				<div className="rounded-2xl shadow-sm backdrop-blur bg-white border border-neutral-200/60 dark:bg-neutral-900/40 dark:border-neutral-800/60 p-4">
					<h2 className="font-medium mb-2 text-black dark:text-neutral-100">Release Notes</h2>
					<pre className="whitespace-pre-wrap text-sm text-black dark:text-neutral-100">
						{result?.releaseNotes || "Results will appear here after generation."}
					</pre>
				</div>

				{/* B) Tabs for Markdown / HTML / Text */}
				<div className="rounded-2xl shadow-sm backdrop-blur bg-white border border-neutral-200/60 dark:bg-neutral-900/40 dark:border-neutral-800/60 p-4">
					<div className="flex gap-2 mb-3 flex-wrap">
						<button 
							onClick={() => result?.markdown && copy(result.markdown, "Markdown")} 
							className="px-3 py-1 rounded-xl border hover:bg-neutral-100 dark:hover:bg-neutral-800 text-black dark:text-neutral-100"
							disabled={!result?.markdown}
						>
							Copy Markdown
						</button>
						<button 
							onClick={() => result?.html && copy(result.html, "HTML")} 
							className="px-3 py-1 rounded-xl border hover:bg-neutral-100 dark:hover:bg-neutral-800 text-black dark:text-neutral-100"
							disabled={!result?.html}
						>
							Copy HTML
						</button>
						<button 
							onClick={() => result?.text && copy(result.text, "Text")} 
							className="px-3 py-1 rounded-xl border hover:bg-neutral-100 dark:hover:bg-neutral-800 text-black dark:text-neutral-100"
							disabled={!result?.text}
						>
							Copy Text
						</button>
						<button 
							onClick={downloadMarkdown} 
							className="px-3 py-1 rounded-xl border hover:bg-neutral-100 dark:hover:bg-neutral-800 text-black dark:text-neutral-100"
							disabled={!result?.markdown}
						>
							Download Markdown
						</button>
					</div>
					<div className="grid md:grid-cols-3 gap-3 text-sm">
						<div>
							<h3 className="font-medium mb-1 text-black dark:text-neutral-100">Markdown</h3>
							<pre className="whitespace-pre-wrap h-48 overflow-auto p-2 border rounded-xl bg-white dark:bg-neutral-900 text-black dark:text-neutral-100">{result?.markdown || ""}</pre>
						</div>
						<div>
							<h3 className="font-medium mb-1 text-black dark:text-neutral-100">HTML</h3>
							<pre className="whitespace-pre-wrap h-48 overflow-auto p-2 border rounded-xl bg-white dark:bg-neutral-900 text-black dark:text-neutral-100">{result?.html || ""}</pre>
						</div>
						<div>
							<h3 className="font-medium mb-1 text-black dark:text-neutral-100">Text</h3>
							<pre className="whitespace-pre-wrap h-48 overflow-auto p-2 border rounded-xl bg-white dark:bg-neutral-900 text-black dark:text-neutral-100">{result?.text || ""}</pre>
						</div>
					</div>
				</div>

				{/* C) Social */}
				<div className="rounded-2xl shadow-sm backdrop-blur bg-white border border-neutral-200/60 dark:bg-neutral-900/40 dark:border-neutral-800/60 p-4">
					<div className="flex items-center justify-between mb-2">
						<h2 className="font-medium text-black dark:text-neutral-100">Social</h2>
						<div className="flex gap-2">
							<button 
								onClick={() => copy(tweet, "Tweet")} 
								className="px-3 py-1 rounded-xl border hover:bg-neutral-100 dark:hover:bg-neutral-800 text-black dark:text-neutral-100"
								disabled={!tweet}
							>
								Copy Tweet
							</button>
							<button 
								onClick={() => copy(linkedIn, "LinkedIn Post")} 
								className="px-3 py-1 rounded-xl border hover:bg-neutral-100 dark:hover:bg-neutral-800 text-black dark:text-neutral-100"
								disabled={!linkedIn}
							>
								Copy LinkedIn
							</button>
						</div>
					</div>
					<div className="grid sm:grid-cols-2 gap-3 text-sm">
						<div>
							<div className="flex items-center justify-between mb-1">
								<h3 className="font-medium text-black dark:text-neutral-100">Tweet</h3>
								<CharacterCounter text={tweet} limit={280} />
							</div>
							<pre className="whitespace-pre-wrap h-32 overflow-auto p-2 border rounded-xl bg-white dark:bg-neutral-900 text-black dark:text-neutral-100">{tweet}</pre>
						</div>
						<div>
							<div className="flex items-center justify-between mb-1">
								<h3 className="font-medium text-black dark:text-neutral-100">LinkedIn</h3>
								<CharacterCounter text={linkedIn} limit={3000} />
							</div>
							<pre className="whitespace-pre-wrap h-32 overflow-auto p-2 border rounded-xl bg-white dark:bg-neutral-900 text-black dark:text-neutral-100">{linkedIn}</pre>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}


