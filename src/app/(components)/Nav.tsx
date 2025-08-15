import Link from "next/link";

export default function Nav() {
	return (
		<header className="w-full border-b border-neutral-200/60 dark:border-neutral-800/60 bg-white/60 dark:bg-neutral-900/40 backdrop-blur">
			<div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
				<Link href="/" className="font-semibold text-neutral-900 dark:text-neutral-100">ShipNotes</Link>
				<nav className="flex items-center gap-4 text-sm">
					<Link href="/dashboard" className="hover:underline text-neutral-900 dark:text-neutral-100">Dashboard</Link>
					<Link href="/about" className="hover:underline text-neutral-900 dark:text-neutral-100">About</Link>
				</nav>
			</div>
		</header>
	);
}


