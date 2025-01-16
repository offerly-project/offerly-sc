export class URLS<T extends string = string> {
	baseUrl: string;
	paths: Record<T, string>;
	constructor(baseUrl: string, urls: Record<T, string>) {
		this.baseUrl = baseUrl;
		this.paths = urls;
	}
	getPath = (key: T) => {
		return this.baseUrl + this.paths[key];
	};
}
