"use client";
import ReactMarkdown from "react-markdown";

export default function MarkdownClient({ content }: { content: string }) {
	return (
		<div className="prose dark:prose-invert">
			<ReactMarkdown>{content}</ReactMarkdown>
		</div>
	);
}


