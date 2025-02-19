import { IExecuteFunctions } from 'n8n-core';
import {
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
	formLabel?: string;
	listLabel?: string;
	filterLabel?: string;
	items?: Array<{
		ID: string;
		VALUE: string;
		DEF: string;
		SORT: string;
	}>;
	settings?: {
		DISPLAY?: string;
		LIST_HEIGHT?: number;
		CAPTION_NO_VALUE?: string;
		SHOW_NO_VALUE?: string;
		SIZE?: number;
		ROWS?: number;
		REGEXP?: string;
		MIN_LENGTH?: number;
		MAX_LENGTH?: number;
		DEFAULT_VALUE?: string | null;
	};
	[key: string]: unknown;
}

interface IEnumValue {
	name: string;
	value: string;
}

export class Bitrix24 implements INodeType {
	private static formatCommunicationField(value: string, type: string): { VALUE: string; TYPE: string }[] {
		return [{ VALUE: value, TYPE: type }];
	}

	private static processFormFields(fieldsCollection: Array<{ fieldName: string; fieldValue: string; field?: IBitrix24Field }>): IDataObject {
		const fields: IDataObject = {};
		
		for (const field of fieldsCollection) {
			if (field.fieldName === 'PHONE') {
				fields[field.fieldName] = Bitrix24.formatCommunicationField(field.fieldValue, 'WORK');
			} else if (field.fieldName === 'EMAIL') {
				fields[field.fieldName] = Bitrix24.formatCommunicationField(field.fieldValue, 'WORK');
			} else if (field.field?.type === 'enumeration' && field.field.items && Array.isArray(field.field.items)) {
				// Для полей типа enumeration передаем ID выбранного значения
				const selectedOption = field.field.items.find(item => item.VALUE === field.fieldValue);
				if (selectedOption) {
					fields[field.fieldName] = selectedOption.ID;
				}
			} else {
				fields[field.fieldName] = field.fieldValue;
			}
		}
		
		return fields;
	}

	private static async getAllItems(
		endpoint: string,
		params: IDataObject,
		maxBatchSize: number = 50
	): Promise<IDataObject[]> {
		const allItems: IDataObject[] = [];
		let start = 0;
		let hasMore = true;

		while (hasMore) {
			const batchParams = {
				...params,
				start,
			};

			const response = await axios.post(endpoint, batchParams);
			const items = response.data.result;

			if (!Array.isArray(items) || items.length === 0) {
				hasMore = false;
				break;
			}

			allItems.push(...items);

			if (items.length < maxBatchSize) {
				hasMore = false;
			} else {
				start += maxBatchSize;
				// Добавляем задержку между запросами для соблюдения ограничений API
				await new Promise(resolve => setTimeout(resolve, 1000));
			}
		}

		return allItems;
	}

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
				displayName: 'Get By',
				name: 'getBy',
				type: 'options',
				options: [
					{
						name: 'ID',
						value: 'id',
						description: 'Получить по ID',
					},
					{
						name: 'Filter',
						value: 'filter',
						description: 'Получить по фильтру',
					},
				],
				default: 'id',
				displayOptions: {
					show: {
						operation: ['get'],
					},
				},
			},
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['get'],
						getBy: ['id'],
					},
				},
				description: 'ID записи',
			},
			{
				displayName: 'Filter Fields',
				name: 'filterFields',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					sortable: true,
				},
					placeholder: 'Add Filter Field',
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
									description: 'Имя поля для фильтрации',
								},
								{
									displayName: 'Operation',
									name: 'operation',
									type: 'options',
									options: [
										{ name: 'Equals', value: 'equals' },
										{ name: 'Not Equals', value: '!=' },
										{ name: 'Greater Than', value: '>' },
										{ name: 'Greater Than or Equal', value: '>=' },
										{ name: 'Less Than', value: '<' },
										{ name: 'Less Than or Equal', value: '<=' },
										{ name: 'Contains', value: '%' },
										{ name: 'Not Contains', value: '!%' },
										{ name: 'Starts With', value: '=%' },
										{ name: 'Ends With', value: '%=' },
										{ name: 'In List', value: '@' },
										{ name: 'Not In List', value: '!@' },
									],
									default: 'equals',
									description: 'Операция сравнения',
								},
								{
									displayName: 'Value',
									name: 'value',
									type: 'string',
									default: '',
									description: 'Значение для фильтрации',
								},
							],
						},
					],
					displayOptions: {
						show: {
							operation: ['get'],
							getBy: ['filter'],
						},
					},
			},
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['update', 'delete'],
					},
				},
				description: 'ID записи',
			},
			// Выбор формата ввода полей
			{
				displayName: 'Input Format',
				name: 'inputFormat',
				type: 'options',
				options: [
					{
						name: 'Form',
						value: 'form',
						description: 'Использовать форму для ввода полей',
					},
					{
						name: 'JSON',
						value: 'json',
						description: 'Использовать JSON формат для ввода полей',
					},
				],
				default: 'form',
				displayOptions: {
					show: {
						operation: ['create', 'update'],
					},
				},
			},
			// JSON поля
			{
				displayName: 'Fields (JSON)',
				name: 'fieldsJson',
				type: 'json',
				default: '{}',
				description: 'Поля в формате JSON',
				displayOptions: {
					show: {
						operation: ['create', 'update'],
						inputFormat: ['json'],
					},
				},
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
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getEnumValues',
									loadOptionsDependsOn: ['fieldName'],
								},
								displayOptions: {
									show: {
										'/operation': ['create', 'update'],
										'fieldName': ['UF_CRM_1736516348'], // Здесь нужно динамически добавлять все поля типа enumeration
									},
								},
								default: '',
								description: 'Значение поля',
							},
							{
								displayName: 'Field Value',
								name: 'fieldValue',
								type: 'string',
								displayOptions: {
									hide: {
										'fieldName': ['UF_CRM_1736516348'], // Здесь нужно динамически добавлять все поля типа enumeration
									},
								},
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
						inputFormat: ['form'],
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
			{
				displayName: 'Use Filter',
				name: 'useFilter',
				type: 'boolean',
				default: false,
				description: 'Использовать фильтрацию записей',
				displayOptions: {
					show: {
						operation: ['list'],
					},
				},
			},
			{
				displayName: 'Filter Fields',
				name: 'filterFields',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					sortable: true,
				},
				placeholder: 'Add Filter Field',
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
								description: 'Имя поля для фильтрации',
							},
							{
								displayName: 'Operation',
								name: 'operation',
								type: 'options',
								options: [
									{ name: 'Equals', value: 'equals' },
									{ name: 'Not Equals', value: '!=' },
									{ name: 'Greater Than', value: '>' },
									{ name: 'Greater Than or Equal', value: '>=' },
									{ name: 'Less Than', value: '<' },
									{ name: 'Less Than or Equal', value: '<=' },
									{ name: 'Contains', value: '%' },
									{ name: 'Not Contains', value: '!%' },
									{ name: 'Starts With', value: '=%' },
									{ name: 'Ends With', value: '%=' },
									{ name: 'In List', value: '@' },
									{ name: 'Not In List', value: '!@' },
								],
								default: 'equals',
								description: 'Операция сравнения',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Значение для фильтрации',
							},
						],
					},
				],
				displayOptions: {
					show: {
						operation: ['list'],
						useFilter: [true],
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
					
					const endpoint = `${webhookUrl}crm.${resource}.fields`;
					const response = await axios.get(endpoint);
					
					if (!response.data || !response.data.result) {
						throw new NodeOperationError(this.getNode(), 'Invalid response from Bitrix24!');
					}

					const fields = response.data.result as Record<string, IBitrix24Field>;
					const options: INodePropertyOptions[] = [];
					
					for (const [key, value] of Object.entries(fields)) {
						const fieldName = value.formLabel || value.listLabel || value.title || key;
						const description = [
							`Тип: ${value.type}`,
							value.isRequired ? 'Обязательное' : 'Необязательное',
							value.isReadOnly ? 'Только для чтения' : 'Для чтения/записи',
							value.isMultiple ? 'Множественное' : 'Одиночное',
						].join(', ');

						options.push({
							name: fieldName,
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

			async getEnumValues(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const credentials = await this.getCredentials('bitrix24Api');
					if (!credentials) {
						throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
					}

					const resource = this.getCurrentNodeParameter('resource') as string;
					const fieldsData = this.getCurrentNodeParameter('fields') as { field: Array<{ fieldName: string; fieldValue: string }> };
					const fieldName = fieldsData?.field?.[0]?.fieldName;
					const webhookUrl = credentials.webhookUrl as string;
					
					// console.log('Fields:', fieldsData);
					// console.log('Field Name:', fieldName);
					// console.log('Resource:', resource);

					if (!webhookUrl) {
						throw new NodeOperationError(this.getNode(), 'Webhook URL is required!');
					}
					
					if (!fieldName) {
						return [
							{
								name: '- Выберите поле -',
								value: '',
								description: 'Сначала выберите поле',
							},
						];
					}
					
					const endpoint = `${webhookUrl}crm.${resource}.fields`;
					const response = await axios.get(endpoint);
					
					if (!response.data || !response.data.result) {
						throw new NodeOperationError(this.getNode(), 'Invalid response from Bitrix24!');
					}

					const fieldsInfo = response.data.result as Record<string, IBitrix24Field>;
					const field = fieldsInfo[fieldName];

					if (!field) {
						console.log('Field not found in response');
						return [
							{
								name: '- Поле не найдено -',
								value: '',
								description: 'Поле не найдено в ответе Bitrix24',
							},
						];
					}

					if (field.type === 'enumeration' && field.items && Array.isArray(field.items)) {
						return field.items.map((item: { ID: string; VALUE: string }) => ({
							name: item.VALUE,
							value: item.VALUE,
							description: `ID: ${item.ID}`,
						}));
					}

					return [
						{
							name: '- Текстовое поле -',
							value: '',
							description: 'Используйте текстовое поле для ввода значения',
						},
					];
				} catch (error) {
					console.error('Error in getEnumValues:', error);
					if (error instanceof NodeOperationError) {
						throw error;
					}
					throw new NodeOperationError(this.getNode(), 'Failed to load enum values: ' + (error as Error).message);
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
					if (operation === 'create' || operation === 'update') {
						const endpoint = `${webhookUrl}crm.${resource}.${operation === 'create' ? 'add' : 'update'}.json`;
						const inputFormat = this.getNodeParameter('inputFormat', i) as string;
						let fields: IDataObject = {};

						if (inputFormat === 'json') {
							const fieldsJson = this.getNodeParameter('fieldsJson', i) as string;
							fields = JSON.parse(fieldsJson);
						} else {
							// Получаем информацию о полях
							const fieldsEndpoint = `${webhookUrl}crm.${resource}.fields.json`;
							const fieldsResponse = await axios.get(fieldsEndpoint);
							const fieldsInfo = fieldsResponse.data.result as Record<string, IBitrix24Field>;

							const fieldsCollection = this.getNodeParameter('fields.field', i, []) as Array<{
								fieldName: string;
								fieldValue: string;
							}>;

							// Добавляем информацию о поле к каждому элементу коллекции
							const enrichedFieldsCollection = fieldsCollection.map(field => ({
								...field,
								field: fieldsInfo[field.fieldName],
							}));

							fields = Bitrix24.processFormFields(enrichedFieldsCollection);
						}
						
						const params: IDataObject = { fields };
						if (operation === 'update') {
							params.id = this.getNodeParameter('id', i) as string;
						}

						const response = await axios.post(endpoint, params);
						returnData.push(response.data);
					}
					
					if (operation === 'get') {
						const getBy = this.getNodeParameter('getBy', i) as string;
						const endpoint = `${webhookUrl}crm.${resource}.list.json`;
						const selectFields = this.getNodeParameter('selectFields', i, []) as string[];
						
						const params: IDataObject = {};
						if (selectFields.length > 0) {
							params.select = selectFields;
						}

						if (getBy === 'id') {
							const id = this.getNodeParameter('id', i) as string;
							params.filter = { 'ID': id };
						} else {
							const filterFields = this.getNodeParameter('filterFields.field', i, []) as Array<{
								fieldName: string;
								operation: string;
								value: string;
							}>;

							if (filterFields.length > 0) {
								const filter: IDataObject = {};
								
								for (const field of filterFields) {
									let value = field.value;

									// Обработка специальных операторов
									if (field.operation === '@' || field.operation === '!@') {
										value = value.split(',').map(item => item.trim()) as unknown as string;
									}

									// Формируем ключ фильтра в зависимости от операции
									if (field.operation === 'equals') {
										filter[field.fieldName] = value;
									} else {
										filter[field.operation + field.fieldName] = value;
									}
								}

								params.filter = filter;
							}
						}

						const response = await axios.post(endpoint, params);
						if (response.data.result && response.data.result.length > 0) {
							returnData.push(response.data.result[0]);
						} else {
							returnData.push({ error: 'Запись не найдена' });
						}
					}

					if (operation === 'list') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const selectFields = this.getNodeParameter('selectFields', i, []) as string[];
						const useFilter = this.getNodeParameter('useFilter', i) as boolean;
						const endpoint = `${webhookUrl}crm.${resource}.list.json`;
						
						const params: IDataObject = {};
						if (selectFields.length > 0) {
							params.select = selectFields;
						}

						// Добавляем обработку фильтров
						if (useFilter) {
							const filterFields = this.getNodeParameter('filterFields.field', i, []) as Array<{
								fieldName: string;
								operation: string;
								value: string;
							}>;

							if (filterFields.length > 0) {
								const filter: IDataObject = {};
								
								for (const field of filterFields) {
									let value = field.value;

									// Обработка специальных операторов
									if (field.operation === '@' || field.operation === '!@') {
										value = value.split(',').map(item => item.trim()) as unknown as string;
									}

									// Формируем ключ фильтра в зависимости от операции
									if (field.operation === 'equals') {
										filter[field.fieldName] = value;
									} else {
										filter[field.operation + field.fieldName] = value;
									}
								}

								params.filter = filter;
							}
						}
						
						if (!returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							params.start = 0;
							params.limit = limit;
							const response = await axios.post(endpoint, params);
							returnData.push(...response.data.result);
						} else {
							// Получаем все записи с пагинацией
							const allItems = await Bitrix24.getAllItems(endpoint, params);
							returnData.push(...allItems);
						}
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