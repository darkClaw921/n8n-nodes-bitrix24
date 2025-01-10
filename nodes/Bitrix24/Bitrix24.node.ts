import type { IExecuteFunctions } from 'n8n-core';
import type {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	INodePropertyOptions,
	ILoadOptionsFunctions,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import axios, { AxiosError } from 'axios';

interface IBitrix24Field {
	type: string;
	isRequired: boolean;
	isReadOnly: boolean;
	isImmutable: boolean;
	isMultiple: boolean;
	isDynamic: boolean;
	title: string;
	statusType?: string;
	[key: string]: unknown;
}

export class Bitrix24 implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Bitrix24',
		name: 'bitrix24',
		icon: 'file:bitrix24.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Работа с Bitrix24 API',
		defaults: {
			name: 'Bitrix24',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'bitrix24Api',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Lead',
						value: 'lead',
					},
					{
						name: 'Deal',
						value: 'deal',
					},
					{
						name: 'Contact',
						value: 'contact',
					},
					{
						name: 'Company',
						value: 'company',
					},
				],
				default: 'lead',
				required: true,
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a record',
						action: 'Create a record',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a record',
						action: 'Get a record',
					},
					{
						name: 'List',
						value: 'list',
						description: 'Get list of records',
						action: 'Get list of records',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update a record',
						action: 'Update a record',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a record',
						action: 'Delete a record',
					},
				],
				default: 'create',
				required: true,
			},
			// ID поле
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['get', 'update', 'delete'],
					},
				},
				description: 'ID записи',
			},
			// Поля для создания и обновления
			{
				displayName: 'Fields',
				name: 'fields',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					sortable: true,
				},
				placeholder: 'Add Field',
				default: {},
				options: [
					{
						name: 'field',
						displayName: 'Field',
						values: [
							{
								displayName: 'Field Name',
								name: 'fieldName',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getFields',
								},
								default: '',
								description: 'Имя поля для обновления',
							},
							{
								displayName: 'Field Value',
								name: 'fieldValue',
								type: 'string',
								default: '',
								description: 'Значение поля',
							},
						],
					},
				],
				description: 'Поля для создания/обновления',
				displayOptions: {
					show: {
						operation: ['create', 'update'],
					},
				},
			},
			// Поля для получения списка записей
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				default: false,
				description: 'Получить все записи',
				displayOptions: {
					show: {
						operation: ['list'],
					},
				},
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 50,
				description: 'Максимальное количество записей',
				displayOptions: {
					show: {
						operation: ['list'],
						returnAll: [false],
					},
				},
			},
			// Выбор полей для получения
			{
				displayName: 'Select Fields',
				name: 'selectFields',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getFields',
				},
				default: [],
				description: 'Выберите поля для получения',
				displayOptions: {
					show: {
						operation: ['get', 'list'],
					},
				},
			},
		],
	};

	methods = {
		loadOptions: {
			async getFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const credentials = await this.getCredentials('bitrix24Api');
					if (!credentials) {
						throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
					}

					const resource = this.getCurrentNodeParameter('resource') as string;
					const webhookUrl = credentials.webhookUrl as string;
					
					if (!webhookUrl) {
						throw new NodeOperationError(this.getNode(), 'Webhook URL is required!');
					}
					
					const endpoint = `${webhookUrl}crm.${resource}.fields.json`;
					const response = await axios.get(endpoint);
					
					if (!response.data || !response.data.result) {
						throw new NodeOperationError(this.getNode(), 'Invalid response from Bitrix24!');
					}

					const fields = response.data.result as Record<string, IBitrix24Field>;
					const options: INodePropertyOptions[] = [];
					
					for (const [key, value] of Object.entries(fields)) {
						const description = [
							`Тип: ${value.type}`,
							value.isRequired ? 'Обязательное' : 'Необязательное',
							value.isReadOnly ? 'Только для чтения' : 'Для чтения/записи',
							value.isMultiple ? 'Множественное' : 'Одиночное',
						].join(', ');

						options.push({
							name: value.title,
							value: key,
							description,
						});
					}
					
					return options;
				} catch (error) {
					if (error instanceof NodeOperationError) {
						throw error;
					}
					throw new NodeOperationError(this.getNode(), 'Failed to load fields: ' + (error as Error).message);
				}
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		try {
			const credentials = await this.getCredentials('bitrix24Api');
			if (!credentials) {
				throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
			}

			const webhookUrl = credentials.webhookUrl as string;
			if (!webhookUrl) {
				throw new NodeOperationError(this.getNode(), 'Webhook URL is required!');
			}

			const items = this.getInputData();
			const returnData: IDataObject[] = [];
			const resource = this.getNodeParameter('resource', 0) as string;
			const operation = this.getNodeParameter('operation', 0) as string;

			for (let i = 0; i < items.length; i++) {
				try {
					if (operation === 'create') {
						const endpoint = `${webhookUrl}crm.${resource}.add.json`;
						const fieldsCollection = this.getNodeParameter('fields.field', i, []) as Array<{
							fieldName: string;
							fieldValue: string;
						}>;
						
						const fields: IDataObject = {};
						for (const field of fieldsCollection) {
							fields[field.fieldName] = field.fieldValue;
						}
						
						const response = await axios.post(endpoint, { fields });
						returnData.push(response.data);
					}
					
					if (operation === 'get') {
						const id = this.getNodeParameter('id', i) as string;
						const selectFields = this.getNodeParameter('selectFields', i, []) as string[];
						const endpoint = `${webhookUrl}crm.${resource}.get.json`;
						
						const params: IDataObject = { id };
						if (selectFields.length > 0) {
							params.select = selectFields;
						}
						
						const response = await axios.post(endpoint, params);
						returnData.push(response.data);
					}

					if (operation === 'list') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const selectFields = this.getNodeParameter('selectFields', i, []) as string[];
						const endpoint = `${webhookUrl}crm.${resource}.list.json`;
						
						const params: IDataObject = {};
						if (selectFields.length > 0) {
							params.select = selectFields;
						}
						
						if (!returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							params.start = 0;
							params.limit = limit;
						}
						
						const response = await axios.post(endpoint, params);
						returnData.push(...response.data.result);
					}
					
					if (operation === 'update') {
						const id = this.getNodeParameter('id', i) as string;
						const fieldsCollection = this.getNodeParameter('fields.field', i, []) as Array<{
							fieldName: string;
							fieldValue: string;
						}>;
						
						const fields: IDataObject = {};
						for (const field of fieldsCollection) {
							fields[field.fieldName] = field.fieldValue;
						}
						
						const endpoint = `${webhookUrl}crm.${resource}.update.json`;
						const response = await axios.post(endpoint, { id, fields });
						returnData.push(response.data);
					}
					
					if (operation === 'delete') {
						const id = this.getNodeParameter('id', i) as string;
						const endpoint = `${webhookUrl}crm.${resource}.delete.json`;
						
						const response = await axios.post(endpoint, { id });
						returnData.push(response.data);
					}
				} catch (error) {
					if (this.continueOnFail()) {
						if (error instanceof AxiosError) {
							returnData.push({ error: error.message });
						} else {
							returnData.push({ error: 'An unknown error occurred' });
						}
						continue;
					}
					throw error;
				}
			}
			
			return [this.helpers.returnJsonArray(returnData)];
		} catch (error) {
			if (error instanceof NodeOperationError) {
				throw error;
			}
			throw new NodeOperationError(this.getNode(), 'Failed to execute node: ' + (error as Error).message);
		}
	}
} 