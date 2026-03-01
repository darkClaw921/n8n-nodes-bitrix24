import axios, { AxiosError } from 'axios';
import { WEBHOOK_URL, delay } from './test-config';

export interface BitrixResponse {
	result: any;
	total?: number;
	next?: number;
	error?: string;
	error_description?: string;
}

/**
 * Make an API request to Bitrix24 via webhook URL.
 * Replicates the retry logic from GenericFunctions.ts but uses axios
 * instead of n8n's httpRequest helper.
 *
 * Retries up to 2 times on transient network errors.
 * Automatically adds a delay after each successful call to avoid rate limiting.
 */
export async function callBitrix24(
	endpoint: string,
	params: Record<string, any> = {},
	method: 'GET' | 'POST' = 'POST',
): Promise<BitrixResponse> {
	const url = `${WEBHOOK_URL}${endpoint}`;
	const maxRetries = 2;
	let lastError: Error | undefined;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			const response = await axios({
				url,
				method,
				data: method === 'POST' ? params : undefined,
				params: method === 'GET' ? params : undefined,
				headers: { 'Content-Type': 'application/json' },
				timeout: 30000,
			});

			const data = response.data as BitrixResponse;

			if (data.error) {
				throw new Error(
					`Bitrix24 API error: ${data.error_description || data.error}`,
				);
			}

			await delay();
			return data;
		} catch (error) {
			// Don't retry Bitrix24 API-level errors (thrown above)
			if (error instanceof Error && error.message.startsWith('Bitrix24 API error:')) {
				throw error;
			}

			lastError = error as Error;
			const msg = lastError.message || '';

			// Don't retry HTTP client errors (4xx)
			if (error instanceof AxiosError && error.response) {
				const status = error.response.status;
				if (status >= 400 && status < 500) {
					throw new Error(
						`Bitrix24 HTTP ${status}: ${error.response.data?.error_description || error.response.data?.error || msg}`,
					);
				}
			}

			const isTransient =
				msg.includes('ECONNRESET') ||
				msg.includes('ECONNREFUSED') ||
				msg.includes('ETIMEDOUT') ||
				msg.includes('socket disconnected') ||
				msg.includes('TLS') ||
				msg.includes('ENOTFOUND') ||
				msg.includes('socket hang up');

			if (!isTransient || attempt >= maxRetries) {
				throw error;
			}

			// Exponential backoff: 1s, 2s
			await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
		}
	}

	throw lastError || new Error('Unknown error in callBitrix24');
}

/**
 * Convenience wrapper that returns only response.result.
 */
export async function callBitrix24Result(
	endpoint: string,
	params: Record<string, any> = {},
): Promise<any> {
	const response = await callBitrix24(endpoint, params);
	return response.result;
}
