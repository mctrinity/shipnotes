import MarkdownClient from "./MarkdownClient";

export default async function ChangelogPage({ searchParams }: { searchParams: Promise<{ md?: string }> }) {
	const params = await searchParams;
	let decoded = "";
	try {
		decoded = params?.md ? decodeURIComponent(params.md) : "";
	} catch {
		decoded = "";
	}

	return (
		<div className="max-w-3xl mx-auto px-6 py-10">
			<h1 className="text-2xl font-semibold mb-6">Changelog</h1>
			<MarkdownClient content={decoded} />
		</div>
	);
}


