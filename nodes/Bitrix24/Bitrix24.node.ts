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

// Импорт типов и сущностей
import { IBitrix24Field, processFormFields, getAllItems, CommunicationType, BitrixResourceType } from './types';
import { Lead } from './Lead';
import { Deal } from './Deal';
import { Contact } from './Contact';
import { Company } from './Company';
// Импорт модуля переводов
import { applyTranslations, detectLanguage, getTranslation } from './translations';

export class Bitrix24 implements INodeType {
	description: INodeTypeDescription = applyTranslations({
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
					Lead.getDescription(),
					Deal.getDescription(),
					Contact.getDescription(),
					Company.getDescription(),
				],
				default: 'lead',
				required: true,
			},
			{
				displayName: getTranslation('operation'),
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Create',
						value: 'create',
						description: getTranslation('operation.create'),
						action: 'Create a record',
					},
					{
						name: 'Get',
						value: 'get',
						description: getTranslation('operation.get'),
						action: 'Get a record',
					},
					{
						name: 'List',
						value: 'list',
						description: getTranslation('operation.list'),
						action: 'Get list of records',
					},
					{
						name: 'Update',
						value: 'update',
						description: getTranslation('operation.update'),
						action: 'Update a record',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: getTranslation('operation.delete'),
						action: 'Delete a record',
					},
				],
				default: 'create',
				required: true,
			},
			// ID поле
			{
				displayName: getTranslation('getByOptions.getBy'),
				name: 'getBy',
				type: 'options',
				options: [
					{
						name: 'ID',
						value: 'id',
						description: getTranslation('getByOptions.getById'),
					},
					{
						name: 'Filter',
						value: 'filter',
						description: getTranslation('getByOptions.getByFilter'),
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
				description: getTranslation('fields.idDescription'),
			},
			{
				displayName: getTranslation('fields.filterFields'),
				name: 'filterFields',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					sortable: true,
				},
				placeholder: getTranslation('fields.filterFieldsPlaceholder'),
				default: {},
				options: [
					{
						name: 'field',
						displayName: getTranslation('fields.fields'),
						values: [
							{
								displayName: getTranslation('fields.fieldName'),
								name: 'fieldName',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getFields',
								},
								default: '',
								description: getTranslation('fields.filterFieldNameDescription'),
							},
							{
								displayName: getTranslation('fields.filterOperation'),
								name: 'operation',
								type: 'options',
								options: [
									{ name: getTranslation('filterOperations.equals'), value: 'equals' },
									{ name: getTranslation('filterOperations.notEquals'), value: '!=' },
									{ name: getTranslation('filterOperations.greaterThan'), value: '>' },
									{ name: getTranslation('filterOperations.greaterThanOrEqual'), value: '>=' },
									{ name: getTranslation('filterOperations.lessThan'), value: '<' },
									{ name: getTranslation('filterOperations.lessThanOrEqual'), value: '<=' },
									{ name: getTranslation('filterOperations.contains'), value: '%' },
									{ name: getTranslation('filterOperations.notContains'), value: '!%' },
									{ name: getTranslation('filterOperations.startsWith'), value: '=%' },
									{ name: getTranslation('filterOperations.endsWith'), value: '%=' },
									{ name: getTranslation('filterOperations.inList'), value: '@' },
									{ name: getTranslation('filterOperations.notInList'), value: '!@' },
								],
								default: 'equals',
								description: getTranslation('filterOperations.operationDescription'),
							},
							{
								displayName: getTranslation('fields.filterValue'),
								name: 'value',
								type: 'string',
								default: '',
								description: getTranslation('fields.filterValueDescription'),
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
				description: getTranslation('fields.idDescription'),
			},
			// Выбор формата ввода полей
			{
				displayName: getTranslation('fields.inputFormat'),
				name: 'inputFormat',
				type: 'options',	
				options: [
					{
						name: getTranslation('inputFormat.form'),
						value: 'form',
						description: getTranslation('inputFormat.formDescription'),
					},
					{
						name: getTranslation('inputFormat.json'),
						value: 'json',
						description: getTranslation('inputFormat.jsonDescription'),
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
				displayName: getTranslation('fields.fieldsJson'),
				name: 'fieldsJson',
				type: 'json',
				default: '{}',
				description: getTranslation('fields.fieldsJsonDescription'),
				displayOptions: {
					show: {
						operation: ['create', 'update'],
						inputFormat: ['json'],
					},
				},
			},
			// Поля для создания и обновления
			{
				displayName: getTranslation('fields.fields'),
				name: 'fields',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					sortable: true,
				},
				placeholder: getTranslation('fields.fieldsPlaceholder'),
				default: {},
				options: [
					{
						name: 'field',
						displayName: getTranslation('fields.fields'),
						values: [
							{
								displayName: getTranslation('fields.fieldName'),
								name: 'fieldName',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getFields',
								},
								default: '',
								description: getTranslation('fields.fieldNameDescription'),
							},
							{
								displayName: getTranslation('fields.fieldValueType'),
								name: 'fieldValueType',
								type: 'options',
								options: Contact.communicationTypes,
								default: CommunicationType.WORK,
								description: getTranslation('fields.fieldValueTypeDescription'),
								displayOptions: {
									show: {
										'/resource': ['contact'],
										'fieldName': ['PHONE', 'EMAIL', 'PHONE_MOBILE', 'PHONE_WORK', 'PHONE_HOME', 'EMAIL_HOME', 'EMAIL_WORK'],
									},
								},
							},
							{
								displayName: getTranslation('fields.fieldValue'),
								name: 'fieldValue',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getEnumValues',
									loadOptionsDependsOn: ['fieldName'],
								},
								displayOptions: {
									show: {
										'/operation': ['create', 'update'],
										fieldValueType: ['enumeration'],
									},
								},
								default: '',
								description: getTranslation('fields.fieldValueDescription'),
							},
							{
								displayName: getTranslation('fields.fieldValue'),
								name: 'fieldValue',
								type: 'string',
								displayOptions: {
									hide: {
										fieldValueType: ['enumeration'],
									},
								},
								default: '',
								description: getTranslation('fields.fieldValueDescription'),
							},
						],
					},
				],
				description: getTranslation('fields.fieldsDescription'),
				displayOptions: {
					show: {
						operation: ['create', 'update'],
						inputFormat: ['form'],
					},
				},
			},
			// Поля для получения списка записей
			{
				displayName: getTranslation('fields.returnAll'),
				name: 'returnAll',
				type: 'boolean',
				default: false,
				description: getTranslation('fields.returnAllDescription'),
				displayOptions: {
					show: {
						operation: ['list'],
					},
				},
			},
			{
				displayName: getTranslation('fields.limit'),
				name: 'limit',
				type: 'number',
				default: 50,
				description: getTranslation('fields.limitDescription'),
				displayOptions: {
					show: {
						operation: ['list'],
						returnAll: [false],
					},
				},
			},
			{
				displayName: getTranslation('fields.useFilter'),
				name: 'useFilter',
				type: 'boolean',
				default: false,
				description: getTranslation('fields.useFilterDescription'),
				displayOptions: {
					show: {
						operation: ['list'],
					},
				},
			},
			{
				displayName: getTranslation('fields.filterFields'),
				name: 'filterFields',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					sortable: true,
				},
				placeholder: getTranslation('fields.filterFieldsPlaceholder'),
				default: {},
				options: [
					{
						name: 'field',
						displayName: getTranslation('fields.fields'),
						values: [
							{
								displayName: getTranslation('fields.fieldName'),
								name: 'fieldName',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getFields',
								},
								default: '',
								description: getTranslation('fields.filterFieldNameDescription'),
							},
							{
								displayName: getTranslation('fields.filterOperation'),
								name: 'operation',
								type: 'options',
								options: [
									{ name: getTranslation('filterOperations.equals'), value: 'equals' },
									{ name: getTranslation('filterOperations.notEquals'), value: '!=' },
									{ name: getTranslation('filterOperations.greaterThan'), value: '>' },
									{ name: getTranslation('filterOperations.greaterThanOrEqual'), value: '>=' },
									{ name: getTranslation('filterOperations.lessThan'), value: '<' },
									{ name: getTranslation('filterOperations.lessThanOrEqual'), value: '<=' },
									{ name: getTranslation('filterOperations.contains'), value: '%' },
									{ name: getTranslation('filterOperations.notContains'), value: '!%' },
									{ name: getTranslation('filterOperations.startsWith'), value: '=%' },
									{ name: getTranslation('filterOperations.endsWith'), value: '%=' },
									{ name: getTranslation('filterOperations.inList'), value: '@' },
									{ name: getTranslation('filterOperations.notInList'), value: '!@' },
								],
								default: 'equals',
								description: getTranslation('filterOperations.operationDescription'),
							},
							{
								displayName: getTranslation('fields.filterValue'),
								name: 'value',
								type: 'string',
								default: '',
								description: getTranslation('fields.filterValueDescription'),
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
				displayName: getTranslation('fields.selectFields'),
				name: 'selectFields',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getFields',
				},
				default: [],
				description: getTranslation('fields.selectFieldsDescription'),
				displayOptions: {
					show: {
						operation: ['get', 'list'],
					},
				},
			},
		],
	}, detectLanguage());

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
					
					// Логируем поля телефона и email для диагностики
					console.log('Поля сущности:', resource);
					
					console.log('Язык:', process.env.N8N_DEFAULT_LANGUAGE);
					// console.log('Поля:', fields);
					Object.keys(fields).forEach(key => {
						if (key.includes('PHONE') || key.includes('EMAIL')) {
							console.log(`Поле: ${key}, Тип: ${fields[key].type}`);
						}
					});
					
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

					// Устанавливаем тип поля для текущего элемента в коллекции
					if (field.type === 'enumeration') {
						// Проверяем, что это поле типа перечисление
						// Возвращаем список значений для выбора
						if (field.items && Array.isArray(field.items)) {
							return field.items.map((item: { ID: string; VALUE: string }) => ({
								name: item.VALUE,
								value: item.VALUE,
								description: `ID: ${item.ID}`,
							}));
						}
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
			
			// Установка языка из учетных данных
			if (credentials.language) {
				process.env.N8N_DEFAULT_LANGUAGE = credentials.language as string;
				console.log(`Установлен язык из учетных данных: ${credentials.language}`);
			} else {
				// По умолчанию устанавливаем русский
				process.env.N8N_DEFAULT_LANGUAGE = 'ru';
				console.log('Установлен язык по умолчанию: ru');
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

							// Получаем коллекцию полей
							const fieldsCollection = this.getNodeParameter('fields.field', i, []) as Array<{
								fieldName: string;
								fieldValue: string;
								fieldValueType?: string;
							}>;

							// Добавляем информацию о поле и ресурсе к каждому элементу коллекции
							const enrichedFieldsCollection = fieldsCollection.map(field => {
								const fieldInfo = fieldsInfo[field.fieldName];
								// Определяем тип поля на основе данных из API
								let updatedFieldValueType = field.fieldValueType;
								
								// Если поле типа enumeration, устанавливаем соответствующий тип
								if (fieldInfo && fieldInfo.type === 'enumeration') {
									updatedFieldValueType = 'enumeration';
								}
								
								return {
									...field,
									fieldValueType: updatedFieldValueType,
									resource: resource as BitrixResourceType,
									field: fieldInfo,
								};
							});

							// Логируем поля для контакта и телефона/email
							if (resource === 'contact') {
								const phoneEmailFields = enrichedFieldsCollection.filter(
									field => field.fieldName.includes('PHONE') || field.fieldName.includes('EMAIL')
								);
								if (phoneEmailFields.length > 0) {
									console.log('Поля связи для контакта:', phoneEmailFields);
								}
							}

							fields = processFormFields(enrichedFieldsCollection);
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
						} else {
							// Использовать стандартные поля для сущности, если не выбраны конкретные поля
							switch(resource) {
								case Lead.resource:
									params.select = Lead.getDefaultFields();
									break;
								case Deal.resource:
									params.select = Deal.getDefaultFields();
									break;
								case Contact.resource:
									params.select = Contact.getDefaultFields();
									break;
								case Company.resource:
									params.select = Company.getDefaultFields();
									break;
							}
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
						} else {
							// Использовать стандартные поля для сущности, если не выбраны конкретные поля
							switch(resource) {
								case Lead.resource:
									params.select = Lead.getDefaultFields();
									break;
								case Deal.resource:
									params.select = Deal.getDefaultFields();
									break;
								case Contact.resource:
									params.select = Contact.getDefaultFields();
									break;
								case Company.resource:
									params.select = Company.getDefaultFields();
									break;
							}
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
							const allItems = await getAllItems(endpoint, params);
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