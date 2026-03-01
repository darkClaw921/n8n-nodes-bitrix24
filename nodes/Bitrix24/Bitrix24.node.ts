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

// Импорт общих утилит
import { bitrix24ApiRequest, bitrix24ApiRequestAllItems } from '../shared/GenericFunctions';
import { buildBitrixFilter } from '../shared/FilterBuilder';
import { getDefaultFieldsForResource } from '../shared/DefaultFields';

// Импорт типов и сущностей
import { IBitrix24Field, processFormFields, CommunicationType, BitrixResourceType } from './types';
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
					{
						name: 'Smart Process',
						value: 'smartProcess',
					},
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
			// Тип смарт-процесса (только для smartProcess)
			{
				displayName: getTranslation('smartProcess.fields.entityTypeId'),
				name: 'entityTypeId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getSmartProcessTypes',
				},
				required: true,
				default: '',
				displayOptions: {
					show: {
						resource: ['smartProcess'],
					},
				},
				description: getTranslation('smartProcess.fields.entityTypeIdDescription'),
			},
			// Получить по ID или фильтру
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
			async getSmartProcessTypes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const response = await bitrix24ApiRequest.call(this, 'POST', 'crm.type.list', {});
					if (!response || !response.result || !response.result.types) {
						return [];
					}
					const types = response.result.types as Array<{ title: string; entityTypeId: number }>;
					return types
						.map((type) => ({
							name: type.title,
							value: type.entityTypeId,
						}))
						.sort((a, b) => (a.name as string).localeCompare(b.name as string));
				} catch (error) {
					if (error instanceof NodeOperationError) {
						throw error;
					}
					throw new NodeOperationError(
						this.getNode(),
						'Failed to load smart process types: ' + (error as Error).message,
					);
				}
			},

			async getFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const resource = this.getCurrentNodeParameter('resource') as string;

					let fieldsData: Record<string, IBitrix24Field>;

					if (resource === 'smartProcess') {
						const entityTypeId = this.getCurrentNodeParameter('entityTypeId') as number;
						if (!entityTypeId) return [];
						const response = await bitrix24ApiRequest.call(this, 'POST', 'crm.item.fields', { entityTypeId });
						if (!response || !response.result || !response.result.fields) return [];
						fieldsData = response.result.fields as Record<string, IBitrix24Field>;
					} else {
						const response = await bitrix24ApiRequest.call(this, 'GET', `crm.${resource}.fields`);
						if (!response || !response.result) {
							throw new NodeOperationError(this.getNode(), 'Invalid response from Bitrix24!');
						}
						fieldsData = response.result as Record<string, IBitrix24Field>;
					}

					const options: INodePropertyOptions[] = [];

					for (const [key, value] of Object.entries(fieldsData)) {
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
					const resource = this.getCurrentNodeParameter('resource') as string;
					const fieldsRaw = this.getCurrentNodeParameter('fields') as { field: Array<{ fieldName: string; fieldValue: string }> };
					const fieldName = fieldsRaw?.field?.[0]?.fieldName;

					if (!fieldName) {
						return [
							{
								name: '- Выберите поле -',
								value: '',
								description: 'Сначала выберите поле',
							},
						];
					}

					let fieldsInfo: Record<string, IBitrix24Field>;

					if (resource === 'smartProcess') {
						const entityTypeId = this.getCurrentNodeParameter('entityTypeId') as number;
						if (!entityTypeId) return [];
						const response = await bitrix24ApiRequest.call(this, 'POST', 'crm.item.fields', { entityTypeId });
						if (!response || !response.result || !response.result.fields) return [];
						fieldsInfo = response.result.fields as Record<string, IBitrix24Field>;
					} else {
						const response = await bitrix24ApiRequest.call(this, 'GET', `crm.${resource}.fields`);
						if (!response || !response.result) {
							throw new NodeOperationError(this.getNode(), 'Invalid response from Bitrix24!');
						}
						fieldsInfo = response.result as Record<string, IBitrix24Field>;
					}

					const field = fieldsInfo[fieldName];

					if (!field) {
						return [
							{
								name: '- Поле не найдено -',
								value: '',
								description: 'Поле не найдено в ответе Bitrix24',
							},
						];
					}

					if (field.type === 'enumeration') {
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
			const items = this.getInputData();
			const returnData: IDataObject[] = [];
			const resource = this.getNodeParameter('resource', 0) as string;
			const operation = this.getNodeParameter('operation', 0) as string;

			for (let i = 0; i < items.length; i++) {
				try {
					if (resource === 'smartProcess') {
						// ===== Smart Process Items (crm.item.*) =====
						const entityTypeId = Number(this.getNodeParameter('entityTypeId', i));

						if (operation === 'create' || operation === 'update') {
							const inputFormat = this.getNodeParameter('inputFormat', i) as string;
							let fields: IDataObject = {};

							if (inputFormat === 'json') {
								fields = JSON.parse(this.getNodeParameter('fieldsJson', i) as string);
							} else {
								const fieldsCollection = this.getNodeParameter('fields.field', i, []) as Array<{
									fieldName: string;
									fieldValue: string;
								}>;
								for (const f of fieldsCollection) {
									fields[f.fieldName] = f.fieldValue;
								}
							}

							const params: IDataObject = { entityTypeId, fields };
							if (operation === 'update') {
								params.id = parseInt(this.getNodeParameter('id', i) as string, 10);
							}

							const endpoint = operation === 'create' ? 'crm.item.add' : 'crm.item.update';
							const response = await bitrix24ApiRequest.call(this, 'POST', endpoint, params);
							if (response?.result?.item) {
								returnData.push(response.result.item);
							} else if (response?.result) {
								returnData.push(response.result);
							}
						}

						if (operation === 'get') {
							const getBy = this.getNodeParameter('getBy', i) as string;
							const selectFields = this.getNodeParameter('selectFields', i, []) as string[];

							if (getBy === 'id') {
								const id = parseInt(this.getNodeParameter('id', i) as string, 10);
								const response = await bitrix24ApiRequest.call(this, 'POST', 'crm.item.get', { entityTypeId, id });
								if (response?.result?.item) {
									returnData.push(response.result.item);
								} else {
									returnData.push({ error: 'Запись не найдена' });
								}
							} else {
								const filterFields = this.getNodeParameter('filterFields.field', i, []) as Array<{
									fieldName: string;
									operation: string;
									value: string;
								}>;
								const params: IDataObject = { entityTypeId };
								if (selectFields.length > 0) {
									params.select = selectFields;
								}
								if (filterFields.length > 0) {
									params.filter = buildBitrixFilter(filterFields);
								}
								const response = await bitrix24ApiRequest.call(this, 'POST', 'crm.item.list', params);
								if (response?.result?.items && response.result.items.length > 0) {
									returnData.push(response.result.items[0]);
								} else {
									returnData.push({ error: 'Запись не найдена' });
								}
							}
						}

						if (operation === 'list') {
							const returnAll = this.getNodeParameter('returnAll', i) as boolean;
							const selectFields = this.getNodeParameter('selectFields', i, []) as string[];
							const useFilter = this.getNodeParameter('useFilter', i) as boolean;

							const params: IDataObject = { entityTypeId };
							if (selectFields.length > 0) {
								params.select = selectFields;
							}
							if (useFilter) {
								const filterFields = this.getNodeParameter('filterFields.field', i, []) as Array<{
									fieldName: string;
									operation: string;
									value: string;
								}>;
								if (filterFields.length > 0) {
									params.filter = buildBitrixFilter(filterFields);
								}
							}

							if (returnAll) {
								// crm.item.list возвращает items в response.result.items
								let start = 0;
								const batchSize = 50;
								let hasMore = true;
								while (hasMore) {
									const batchParams: IDataObject = { ...params, start };
									const response = await bitrix24ApiRequest.call(this, 'POST', 'crm.item.list', batchParams);
									const resultItems = response?.result?.items;
									if (!Array.isArray(resultItems) || resultItems.length === 0) {
										break;
									}
									returnData.push(...resultItems as IDataObject[]);
									if (resultItems.length < batchSize) {
										hasMore = false;
									} else {
										start += batchSize;
										await new Promise(resolve => setTimeout(resolve, 1000));
									}
								}
							} else {
								const limit = this.getNodeParameter('limit', i) as number;
								params.start = 0;
								const response = await bitrix24ApiRequest.call(this, 'POST', 'crm.item.list', params);
								if (response?.result?.items && Array.isArray(response.result.items)) {
									returnData.push(...(response.result.items as IDataObject[]).slice(0, limit));
								}
							}
						}

						if (operation === 'delete') {
							const id = parseInt(this.getNodeParameter('id', i) as string, 10);
							await bitrix24ApiRequest.call(this, 'POST', 'crm.item.delete', { entityTypeId, id });
							returnData.push({ success: true, id });
						}
					} else {
						// ===== Regular CRM entities (lead/deal/contact/company) =====
						if (operation === 'create' || operation === 'update') {
							const inputFormat = this.getNodeParameter('inputFormat', i) as string;
							let fields: IDataObject = {};

							if (inputFormat === 'json') {
								const fieldsJson = this.getNodeParameter('fieldsJson', i) as string;
								fields = JSON.parse(fieldsJson);
							} else {
								const fieldsResponse = await bitrix24ApiRequest.call(this, 'GET', `crm.${resource}.fields.json`);
								const fieldsInfo = fieldsResponse.result as Record<string, IBitrix24Field>;

								const fieldsCollection = this.getNodeParameter('fields.field', i, []) as Array<{
									fieldName: string;
									fieldValue: string;
									fieldValueType?: string;
								}>;

								const enrichedFieldsCollection = fieldsCollection.map(field => {
									const fieldInfo = fieldsInfo[field.fieldName];
									let updatedFieldValueType = field.fieldValueType;
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

								fields = processFormFields(enrichedFieldsCollection);
							}

							const params: IDataObject = { fields };
							if (operation === 'update') {
								params.id = this.getNodeParameter('id', i) as string;
							}

							const response = await bitrix24ApiRequest.call(
								this,
								'POST',
								`crm.${resource}.${operation === 'create' ? 'add' : 'update'}.json`,
								params,
							);
							returnData.push(response);
						}

						if (operation === 'get') {
							const getBy = this.getNodeParameter('getBy', i) as string;
							const selectFields = this.getNodeParameter('selectFields', i, []) as string[];

							const params: IDataObject = {};
							if (selectFields.length > 0) {
								params.select = selectFields;
							} else {
								params.select = getDefaultFieldsForResource(resource);
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
									params.filter = buildBitrixFilter(filterFields);
								}
							}

							const response = await bitrix24ApiRequest.call(this, 'POST', `crm.${resource}.list.json`, params);
							if (response.result && response.result.length > 0) {
								returnData.push(response.result[0]);
							} else {
								returnData.push({ error: 'Запись не найдена' });
							}
						}

						if (operation === 'list') {
							const returnAll = this.getNodeParameter('returnAll', i) as boolean;
							const selectFields = this.getNodeParameter('selectFields', i, []) as string[];
							const useFilter = this.getNodeParameter('useFilter', i) as boolean;

							const params: IDataObject = {};
							if (selectFields.length > 0) {
								params.select = selectFields;
							} else {
								params.select = getDefaultFieldsForResource(resource);
							}

							if (useFilter) {
								const filterFields = this.getNodeParameter('filterFields.field', i, []) as Array<{
									fieldName: string;
									operation: string;
									value: string;
								}>;

								if (filterFields.length > 0) {
									params.filter = buildBitrixFilter(filterFields);
								}
							}

							if (!returnAll) {
								const limit = this.getNodeParameter('limit', i) as number;
								params.start = 0;
								params.limit = limit;
								const response = await bitrix24ApiRequest.call(this, 'POST', `crm.${resource}.list.json`, params);
								returnData.push(...response.result);
							} else {
								const allItems = await bitrix24ApiRequestAllItems.call(
									this,
									`crm.${resource}.list.json`,
									params,
								);
								returnData.push(...allItems);
							}
						}

						if (operation === 'delete') {
							const id = this.getNodeParameter('id', i) as string;

							const response = await bitrix24ApiRequest.call(
								this,
								'POST',
								`crm.${resource}.delete.json`,
								{ id },
							);
							returnData.push(response);
						}
					}
				} catch (error) {
					if (this.continueOnFail()) {
						if (error instanceof Error) {
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
