import axios from 'axios';
import * as dotenv from 'dotenv';

export default async function globalSetup(): Promise<void> {
	dotenv.config({ path: '.env.test' });

	const webhookUrl = process.env.BITRIX24_WEBHOOK_URL;
	if (!webhookUrl) {
		throw new Error(
			'BITRIX24_WEBHOOK_URL is not set. Create .env.test file from .env.test.example',
		);
	}

	const url = webhookUrl.endsWith('/') ? webhookUrl : webhookUrl + '/';

	try {
		const response = await axios.get(`${url}profile.json`, { timeout: 30000 });
		if (response.data?.error) {
			throw new Error(
				`Webhook error: ${response.data.error_description || response.data.error}`,
			);
		}
		console.log(
			`\nBitrix24 webhook verified. User: ${response.data?.result?.NAME || 'Unknown'}\n`,
		);
	} catch (error) {
		if ((error as any).response?.status) {
			throw new Error(
				`Webhook check failed with HTTP ${(error as any).response.status}. Check BITRIX24_WEBHOOK_URL in .env.test`,
			);
		}
		throw new Error(
			`Cannot connect to Bitrix24: ${(error as Error).message}`,
		);
	}
}
