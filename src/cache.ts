class CacheService {
	private cache: Map<string, any> = new Map();

	public set(key: string, value: any) {
		this.cache.set(key, value);
	}

	public get(key: string) {
		return this.cache.get(key);
	}

	public delete(key: string) {
		this.cache.delete(key);
	}

	public clear() {
		this.cache.clear();
	}
}

export const cacheService = new CacheService();
