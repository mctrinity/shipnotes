export type Social = { twitter: string; linkedin: string };

export type Sections = {
	features: string[];
	fixes: string[];
	performance: string[];
	chores: string[];
};

export interface NotesResult {
	summary: string;
	sections: Sections;
	releaseNotes: string;
	markdown: string;
	html: string;
	text: string;
	social: Social;
}

export type GenerateNotesRequest = {
	raw: string;
	style?: "formal" | "casual";
	productName?: string;
	version?: string;
};


