import Redis from "ioredis";
import { env } from "./config";

class CacheService {
	private _redis: Redis;
	constructor() {
		this._redis = new Redis(env.REDIS_URL);
	}

	public set(key: string, value: string, expiration: number) {
		return this._redis.set(key, value, "EX", expiration);
	}

	public async get<T>(key: string) {
		const value = await this._redis.get(key);
		if (value) {
			return JSON.parse(value) as T;
		} else {
			return null;
		}
	}
}

export const cacheService = new CacheService();
