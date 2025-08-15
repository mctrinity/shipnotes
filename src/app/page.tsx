import Link from "next/link";

export default function Home() {
	return (
		<div className="max-w-4xl mx-auto px-6 py-20">
			<h1 className="text-4xl font-semibold mb-4 text-black dark:text-neutral-100">ShipNotes</h1>
			<p className="text-black dark:text-neutral-300 mb-8">
				Turn commit messages into polished release notes, markdown, and social posts.
			</p>
			<div className="flex gap-3">
				<Link href="/dashboard" className="rounded-2xl px-5 py-3 bg-black text-white">Open Dashboard</Link>
				<Link href="/about" className="rounded-2xl px-5 py-3 border">About</Link>
			</div>
		</div>
	);
}
