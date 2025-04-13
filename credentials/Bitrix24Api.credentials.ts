import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	IDataObject,
} from 'n8n-workflow';

export class Bitrix24Api implements ICredentialType {
	name = 'bitrix24Api';
	displayName = 'Bitrix24 API';
	documentationUrl = 'https://dev.1c-bitrix.ru/rest_help/';
	
	constructor() {
		// Устанавливаем русский язык по умолчанию при создании экземпляра учетных данных
		process.env.N8N_DEFAULT_LANGUAGE = 'ru';
		console.log('Установлен язык по умолчанию (конструктор): ru');
	}
	
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
		{
			displayName: 'Язык интерфейса',
			name: 'language',
			type: 'options',
			default: 'ru',
			options: [
				{
					name: 'Русский',
					value: 'ru',
				},
				{
					name: 'English',
					value: 'en',
				},
			],
		},
	
	];

	// Метод для установки языка
	setLanguage(language: string) {
		process.env.N8N_DEFAULT_LANGUAGE = language;
		console.log(`Установлен язык: ${language}`);
	}

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'Content-Type': 'application/json',
			},
		},
	};

	// Метод применяется перед проверкой учетных данных
	async preAuthentication(credentials: IDataObject) {
		// Установка языка из учетных данных
		if (credentials.language) {
			this.setLanguage(credentials.language as string);
		} else {
			// По умолчанию устанавливаем русский
			this.setLanguage('ru');
		}
		
		return {};
	}

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.webhookUrl}}',
			url: 'profile/',
			method: 'GET',
		},
	};
} 