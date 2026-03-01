import { IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-core';
import {
	IDataObject,
	IHttpRequestOptions,
	NodeOperationError,
} from 'n8n-workflow';

/**
 * Get and validate Bitrix24 credentials.
 * Returns the normalized webhookUrl (with trailing slash) and language.
 */
export async function getValidatedCredentials(
	this: IExecuteFunctions | ILoadOptionsFunctions,
): Promise<{ webhookUrl: string; language: string }> {
	const credentials = await this.getCredentials('bitrix24Api');
	if (!credentials) {
		throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
	}

	let webhookUrl = credentials.webhookUrl as string;
	if (!webhookUrl) {
		throw new NodeOperationError(this.getNode(), 'Webhook URL is required!');
	}

	// Normalize: ensure trailing slash
	if (!webhookUrl.endsWith('/')) {
		webhookUrl += '/';
	}

	const language = (credentials.language as string) || 'ru';

	return { webhookUrl, language };
}

/**
 * Make an API request to Bitrix24 using n8n's built-in httpRequest helper.
 * Returns the parsed JSON response body directly (no .data wrapper).
 * Retries on transient network errors (TLS, ECONNRESET, etc.) up to maxRetries times.
 */
export async function bitrix24ApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: 'GET' | 'POST',
	endpoint: string,
	body?: IDataObject,
): Promise<any> {
	const { webhookUrl } = await getValidatedCredentials.call(this);

	const options: IHttpRequestOptions = {
		url: `${webhookUrl}${endpoint}`,
		method,
		headers: {
			'Content-Type': 'application/json',
		},
		timeout: 30000,
	};

	if (body !== undefined && Object.keys(body).length > 0) {
		options.body = body as unknown as IHttpRequestOptions['body'];
	} else if (method === 'POST') {
		options.body = {} as unknown as IHttpRequestOptions['body'];
	}

	const maxRetries = 2;
	let lastError: Error | undefined;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			const response = await this.helpers.httpRequest(options);

			// Check for Bitrix24 API-level errors in the response
			if (response && response.error) {
				const errorMessage = response.error_description || response.error;
				throw new NodeOperationError(
					this.getNode(),
					`Bitrix24 API error: ${errorMessage}`,
				);
			}

			return response;
		} catch (error) {
			// Don't retry Bitrix24 API-level errors
			if (error instanceof NodeOperationError) {
				throw error;
			}

			lastError = error as Error;
			const msg = lastError.message || '';

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

	throw lastError || new Error('Unknown error in bitrix24ApiRequest');
}

/**
 * Fetch all items from a Bitrix24 list endpoint using pagination.
 * Replaces the old getAllItems() function from types.ts that used raw fetch().
 * Uses batches of `batchSize` items with a 1-second delay between requests.
 */
export async function bitrix24ApiRequestAllItems(
	this: IExecuteFunctions,
	endpoint: string,
	params: IDataObject,
	batchSize: number = 50,
): Promise<IDataObject[]> {
	const allItems: IDataObject[] = [];
	let start = 0;
	let hasMore = true;

	while (hasMore) {
		const batchParams: IDataObject = {
			...params,
			start,
		};

		const response = await bitrix24ApiRequest.call(this, 'POST', endpoint, batchParams);
		const items = response.result;

		if (!Array.isArray(items) || items.length === 0) {
			hasMore = false;
			break;
		}

		allItems.push(...items);

		if (items.length < batchSize) {
			hasMore = false;
		} else {
			start += batchSize;
			// Rate-limit delay between batches
			await new Promise(resolve => setTimeout(resolve, 1000));
		}
	}

	return allItems;
}
