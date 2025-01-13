interface IDelta {
	delta_added: string[];
	delta_removed: string[];
}

export interface IScrapper {
	getDelta(): Promise<IDelta>;
}
