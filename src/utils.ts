import { Bank, BANKS } from "./constants";

export const isBankSupported = (bank: string): bank is Bank => {
	return BANKS.includes(bank as Bank);
};
