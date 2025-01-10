import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class Bitrix24Api implements ICredentialType {
	name = 'bitrix24Api';
	displayName = 'Bitrix24 API';
	documentationUrl = 'https://dev.1c-bitrix.ru/rest_help/';
	properties: INodeProperties[] = [
		{
			displayName: 'Webhook URL',
			name: 'webhookUrl',
			type: 'string',
			default: '',
			placeholder: 'https://your-domain.bitrix24.ru/rest/1/your-webhook-code/',
			required: true,
			description: 'Webhook URL from your Bitrix24 account (e.g. https://your-domain.bitrix24.ru/rest/1/your-webhook-code/)',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'Content-Type': 'application/json',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.webhookUrl}}',
			url: 'profile/',
			method: 'GET',
		},
	};
} 