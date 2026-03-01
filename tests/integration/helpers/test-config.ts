import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

export const WEBHOOK_URL = (() => {
	const url = process.env.BITRIX24_WEBHOOK_URL;
	if (!url) throw new Error('BITRIX24_WEBHOOK_URL is not set. Create .env.test file from .env.test.example');
	return url.endsWith('/') ? url : url + '/';
})();

export const TEST_PREFIX = `TEST_${Date.now()}_`;
export const API_DELAY = Number(process.env.API_DELAY) || 500;

export const delay = (ms: number = API_DELAY) =>
	new Promise(resolve => setTimeout(resolve, ms));

export const testName = (suffix: string) => `${TEST_PREFIX}${suffix}`;
