import { IExecuteFunctions } from 'n8n-core';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

// Импорт общих утилит
import { bitrix24ApiRequest } from '../shared/GenericFunctions';
import { detectLanguage, getTranslation } from '../Bitrix24/translations';

const lang = detectLanguage();

export class Bitrix24Auxiliary implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Bitrix24 Auxiliary',
		name: 'bitrix24Auxiliary',
		icon: 'file:bitrix24.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: getTranslation('auxiliary.description', lang),
		defaults: {
			name: 'Bitrix24 Auxiliary',
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
						name: getTranslation('auxiliary.resources.category', lang),
						value: 'category',
					},
					{
						name: getTranslation('auxiliary.resources.status', lang),
						value: 'status',
					},
					{
						name: getTranslation('smartProcess.resources.type', lang),
						value: 'smartProcessType',
					},
				],
				default: 'category',
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
						description: getTranslation('auxiliary.operations.create.description', lang),
						action: getTranslation('auxiliary.operations.create.action', lang),
					},
					{
						name: 'Update',
						value: 'update',
						description: getTranslation('auxiliary.operations.update.description', lang),
						action: getTranslation('auxiliary.operations.update.action', lang),
					},
					{
						name: 'Get',
						value: 'get',
						description: getTranslation('auxiliary.operations.get.description', lang),
						action: getTranslation('auxiliary.operations.get.action', lang),
					},
					{
						name: 'Get All',
						value: 'getAll',
						description: getTranslation('auxiliary.operations.getAll.description', lang),
						action: getTranslation('auxiliary.operations.getAll.action', lang),
					},
					{
						name: 'Delete',
						value: 'delete',
						description: getTranslation('auxiliary.operations.delete.description', lang),
						action: getTranslation('auxiliary.operations.delete.action', lang),
					},
				],
				default: 'create',
			},
			// Поля для воронки продаж
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['category'],
						operation: ['update', 'get', 'delete'],
					},
				},
				description: getTranslation('auxiliary.fields.idDescription', lang),
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['category'],
						operation: ['create', 'update'],
					},
				},
				description: getTranslation('auxiliary.fields.nameDescription', lang),
			},
			{
				displayName: 'Sort',
				name: 'sort',
				type: 'number',
				default: 100,
				displayOptions: {
					show: {
						resource: ['category'],
						operation: ['create', 'update'],
					},
				},
				description: getTranslation('auxiliary.fields.sortDescription', lang),
			},
			{
				displayName: 'Is Default',
				name: 'isDefault',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['category'],
						operation: ['create', 'update'],
					},
				},
				description: getTranslation('auxiliary.fields.isDefaultDescription', lang),
			},
			// Поля для статусов воронки
			{
				displayName: 'Category ID',
				name: 'categoryId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['status'],
						operation: ['create', 'update', 'delete', 'getAll'],
					},
				},
				description: getTranslation('auxiliary.fields.categoryIdDescription', lang),
			},
			{
				displayName: 'Status Name',
				name: 'statusName',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['status'],
						operation: ['create', 'update'],
					},
				},
				description: getTranslation('auxiliary.fields.statusNameDescription', lang),
			},
			{
				displayName: 'Status Sort',
				name: 'statusSort',
				type: 'number',
				default: 100,
				displayOptions: {
					show: {
						resource: ['status'],
						operation: ['create', 'update'],
					},
				},
				description: getTranslation('auxiliary.fields.statusSortDescription', lang),
			},
			{
				displayName: 'Status Color',
				name: 'statusColor',
				type: 'string',
				default: '#00FF00',
				displayOptions: {
					show: {
						resource: ['status'],
						operation: ['create', 'update'],
					},
				},
				description: getTranslation('auxiliary.fields.statusColorDescription', lang),
			},
			{
				displayName: 'Status Semantic',
				name: 'statusSemantic',
				type: 'options',
				options: [
					{
						name: getTranslation('auxiliary.semantics.process', lang),
						value: 'P',
					},
					{
						name: getTranslation('auxiliary.semantics.success', lang),
						value: 'S',
					},
					{
						name: getTranslation('auxiliary.semantics.failure', lang),
						value: 'F',
					},
				],
				default: 'P',
				displayOptions: {
					show: {
						resource: ['status'],
						operation: ['create', 'update'],
					},
				},
				description: getTranslation('auxiliary.fields.statusSemanticDescription', lang),
			},
			// Общие поля для массового создания
			{
				displayName: 'Multiple Items',
				name: 'multipleItems',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						operation: ['create', 'update'],
					},
				},
				description: getTranslation('auxiliary.fields.multipleItemsDescription', lang),
			},
			{
				displayName: 'Items',
				name: 'items',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					sortable: true,
				},
				displayOptions: {
					show: {
						operation: ['create', 'update'],
						multipleItems: [true],
						resource: ['category'],
					},
				},
				description: getTranslation('auxiliary.fields.itemsDescription', lang),
				default: {},
				options: [
					{
						name: 'categories',
						displayName: 'Categories',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								description: getTranslation('auxiliary.fields.nameDescription', lang),
							},
							{
								displayName: 'Sort',
								name: 'sort',
								type: 'number',
								default: 100,
								description: getTranslation('auxiliary.fields.sortDescription', lang),
							},
							{
								displayName: 'Is Default',
								name: 'isDefault',
								type: 'boolean',
								default: false,
								description: getTranslation('auxiliary.fields.isDefaultDescription', lang),
							},
						],
					},
				],
			},
			{
				displayName: 'Items',
				name: 'statusItems',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					sortable: true,
				},
				displayOptions: {
					show: {
						operation: ['create', 'update'],
						multipleItems: [true],
						resource: ['status'],
					},
				},
				description: getTranslation('auxiliary.fields.statusItemsDescription', lang),
				default: {},
				options: [
					{
						name: 'statuses',
						displayName: 'Statuses',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								description: getTranslation('auxiliary.fields.statusNameDescription', lang),
							},
							{
								displayName: 'Sort',
								name: 'sort',
								type: 'number',
								default: 100,
								description: getTranslation('auxiliary.fields.sortDescription', lang),
							},
							{
								displayName: 'Color',
								name: 'color',
								type: 'string',
								default: '#00FF00',
								description: getTranslation('auxiliary.fields.statusColorDescription', lang),
							},
							{
								displayName: 'Semantic',
								name: 'semantic',
								type: 'options',
								options: [
									{
										name: getTranslation('auxiliary.semantics.process', lang),
										value: 'P',
									},
									{
										name: getTranslation('auxiliary.semantics.success', lang),
										value: 'S',
									},
									{
										name: getTranslation('auxiliary.semantics.failure', lang),
										value: 'F',
									},
								],
								default: 'P',
								description: getTranslation('auxiliary.fields.statusSemanticDescription', lang),
							},
						],
					},
				],
			},
			// ===== Поля для Типа смарт-процесса =====
			{
				displayName: getTranslation('smartProcess.fields.id', lang),
				name: 'smartProcessId',
				type: 'number',
				default: 0,
				required: true,
				displayOptions: {
					show: {
						resource: ['smartProcessType'],
						operation: ['get', 'update', 'delete'],
					},
				},
				description: getTranslation('smartProcess.fields.idDescription', lang),
			},
			{
				displayName: getTranslation('smartProcess.fields.title', lang),
				name: 'smartProcessTitle',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['smartProcessType'],
						operation: ['create'],
					},
				},
				description: getTranslation('smartProcess.fields.titleDescription', lang),
			},
			{
				displayName: getTranslation('smartProcess.fields.title', lang),
				name: 'smartProcessTitle',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['smartProcessType'],
						operation: ['update'],
					},
				},
				description: getTranslation('smartProcess.fields.titleDescription', lang),
			},
			{
				displayName: getTranslation('smartProcess.fields.isStagesEnabled', lang),
				name: 'isStagesEnabled',
				type: 'boolean',
				default: false,
				displayOptions: { show: { resource: ['smartProcessType'], operation: ['create', 'update'] } },
				description: getTranslation('smartProcess.fields.isStagesEnabledDescription', lang),
			},
			{
				displayName: getTranslation('smartProcess.fields.isCategoriesEnabled', lang),
				name: 'isCategoriesEnabled',
				type: 'boolean',
				default: false,
				displayOptions: { show: { resource: ['smartProcessType'], operation: ['create', 'update'] } },
				description: getTranslation('smartProcess.fields.isCategoriesEnabledDescription', lang),
			},
			{
				displayName: getTranslation('smartProcess.fields.isClientEnabled', lang),
				name: 'isClientEnabled',
				type: 'boolean',
				default: false,
				displayOptions: { show: { resource: ['smartProcessType'], operation: ['create', 'update'] } },
				description: getTranslation('smartProcess.fields.isClientEnabledDescription', lang),
			},
			{
				displayName: getTranslation('smartProcess.fields.isBeginCloseDatesEnabled', lang),
				name: 'isBeginCloseDatesEnabled',
				type: 'boolean',
				default: false,
				displayOptions: { show: { resource: ['smartProcessType'], operation: ['create', 'update'] } },
				description: getTranslation('smartProcess.fields.isBeginCloseDatesEnabledDescription', lang),
			},
			{
				displayName: getTranslation('smartProcess.fields.isLinkWithProductsEnabled', lang),
				name: 'isLinkWithProductsEnabled',
				type: 'boolean',
				default: false,
				displayOptions: { show: { resource: ['smartProcessType'], operation: ['create', 'update'] } },
				description: getTranslation('smartProcess.fields.isLinkWithProductsEnabledDescription', lang),
			},
			{
				displayName: getTranslation('smartProcess.fields.isObserversEnabled', lang),
				name: 'isObserversEnabled',
				type: 'boolean',
				default: false,
				displayOptions: { show: { resource: ['smartProcessType'], operation: ['create', 'update'] } },
				description: getTranslation('smartProcess.fields.isObserversEnabledDescription', lang),
			},
			{
				displayName: getTranslation('smartProcess.fields.isSourceEnabled', lang),
				name: 'isSourceEnabled',
				type: 'boolean',
				default: false,
				displayOptions: { show: { resource: ['smartProcessType'], operation: ['create', 'update'] } },
				description: getTranslation('smartProcess.fields.isSourceEnabledDescription', lang),
			},
			{
				displayName: getTranslation('smartProcess.fields.isAutomationEnabled', lang),
				name: 'isAutomationEnabled',
				type: 'boolean',
				default: false,
				displayOptions: { show: { resource: ['smartProcessType'], operation: ['create', 'update'] } },
				description: getTranslation('smartProcess.fields.isAutomationEnabledDescription', lang),
			},
			{
				displayName: getTranslation('smartProcess.fields.isBizProcEnabled', lang),
				name: 'isBizProcEnabled',
				type: 'boolean',
				default: false,
				displayOptions: { show: { resource: ['smartProcessType'], operation: ['create', 'update'] } },
				description: getTranslation('smartProcess.fields.isBizProcEnabledDescription', lang),
			},
			{
				displayName: getTranslation('smartProcess.fields.isDocumentsEnabled', lang),
				name: 'isDocumentsEnabled',
				type: 'boolean',
				default: false,
				displayOptions: { show: { resource: ['smartProcessType'], operation: ['create', 'update'] } },
				description: getTranslation('smartProcess.fields.isDocumentsEnabledDescription', lang),
			},
			{
				displayName: getTranslation('smartProcess.fields.isRecyclebinEnabled', lang),
				name: 'isRecyclebinEnabled',
				type: 'boolean',
				default: false,
				displayOptions: { show: { resource: ['smartProcessType'], operation: ['create', 'update'] } },
				description: getTranslation('smartProcess.fields.isRecyclebinEnabledDescription', lang),
			},
			{
				displayName: getTranslation('smartProcess.fields.isMycompanyEnabled', lang),
				name: 'isMycompanyEnabled',
				type: 'boolean',
				default: false,
				displayOptions: { show: { resource: ['smartProcessType'], operation: ['create', 'update'] } },
				description: getTranslation('smartProcess.fields.isMycompanyEnabledDescription', lang),
			},
			// ===== Создание пользовательских полей при создании смарт-процесса =====
			{
				displayName: getTranslation('smartProcess.fields.createFields', lang),
				name: 'createFields',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['smartProcessType'],
						operation: ['create'],
					},
				},
				description: getTranslation('smartProcess.fields.createFieldsDescription', lang),
			},
			{
				displayName: getTranslation('smartProcess.fields.customFields', lang),
				name: 'customFields',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					sortable: true,
				},
				displayOptions: {
					show: {
						resource: ['smartProcessType'],
						operation: ['create'],
						createFields: [true],
					},
				},
				description: getTranslation('smartProcess.fields.customFieldsDescription', lang),
				default: {},
				options: [
					{
						name: 'fields',
						displayName: getTranslation('smartProcess.fields.customFields', lang),
						values: [
							{
								displayName: getTranslation('smartProcess.fields.ufFieldName', lang),
								name: 'fieldName',
								type: 'string',
								default: '',
								required: true,
								description: getTranslation('smartProcess.fields.ufFieldNameDescription', lang),
							},
							{
								displayName: getTranslation('smartProcess.fields.ufFieldLabel', lang),
								name: 'fieldLabel',
								type: 'string',
								default: '',
								required: true,
								description: getTranslation('smartProcess.fields.ufFieldLabelDescription', lang),
							},
							{
								displayName: getTranslation('smartProcess.fields.ufFieldType', lang),
								name: 'userTypeId',
								type: 'options',
								options: [
									{ name: getTranslation('userField.fieldTypes.string', lang), value: 'string' },
									{ name: getTranslation('userField.fieldTypes.integer', lang), value: 'integer' },
									{ name: getTranslation('userField.fieldTypes.double', lang), value: 'double' },
									{ name: getTranslation('userField.fieldTypes.boolean', lang), value: 'boolean' },
									{ name: getTranslation('userField.fieldTypes.enumeration', lang), value: 'enumeration' },
									{ name: getTranslation('userField.fieldTypes.date', lang), value: 'date' },
									{ name: getTranslation('userField.fieldTypes.datetime', lang), value: 'datetime' },
									{ name: getTranslation('userField.fieldTypes.file', lang), value: 'file' },
									{ name: getTranslation('userField.fieldTypes.money', lang), value: 'money' },
									{ name: getTranslation('userField.fieldTypes.url', lang), value: 'url' },
								],
								default: 'string',
								description: getTranslation('smartProcess.fields.ufFieldTypeDescription', lang),
							},
							{
								displayName: getTranslation('smartProcess.fields.ufMultiple', lang),
								name: 'multiple',
								type: 'boolean',
								default: false,
								description: getTranslation('smartProcess.fields.ufMultipleDescription', lang),
							},
							{
								displayName: getTranslation('smartProcess.fields.ufMandatory', lang),
								name: 'mandatory',
								type: 'boolean',
								default: false,
								description: getTranslation('smartProcess.fields.ufMandatoryDescription', lang),
							},
							{
								displayName: getTranslation('smartProcess.fields.ufShowFilter', lang),
								name: 'showFilter',
								type: 'boolean',
								default: true,
								description: getTranslation('smartProcess.fields.ufShowFilterDescription', lang),
							},
							{
								displayName: getTranslation('smartProcess.fields.ufListValues', lang),
								name: 'listValues',
								type: 'string',
								default: '',
								description: getTranslation('smartProcess.fields.ufListValuesDescription', lang),
							},
						],
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		try {
			for (let i = 0; i < items.length; i++) {
				try {
					if (resource === 'category') {
						if (operation === 'create' || operation === 'update') {
							const multipleItems = this.getNodeParameter('multipleItems', i) as boolean;

							if (multipleItems) {
								const itemsData = this.getNodeParameter('items.categories', i, []) as IDataObject[];
								for (const item of itemsData) {
									const params = {
										entityTypeId: 2,
										fields: {
											name: item.name,
											sort: item.sort || 100,
											isDefault: item.isDefault ? 'Y' : 'N',
										},
									} as {
										entityTypeId: number;
										fields: {
											name: string;
											sort: number;
											isDefault: string;
										};
										id?: string;
									};

									const response = await bitrix24ApiRequest.call(
										this,
										'POST',
										`crm.category.${operation === 'create' ? 'add' : 'update'}`,
										params as unknown as IDataObject,
									);
									if (response && response.result) {
										returnData.push({
											success: true,
											id: response.result,
											...params.fields,
										});
									}
								}
							} else {
								const name = this.getNodeParameter('name', i) as string;
								const sort = this.getNodeParameter('sort', i) as number;
								const isDefault = this.getNodeParameter('isDefault', i) as boolean;

								const params = {
									entityTypeId: 2,
									fields: {
										name: name,
										sort: sort,
										isDefault: isDefault ? 'Y' : 'N',
									},
								} as {
									entityTypeId: number;
									fields: {
										name: string;
										sort: number;
										isDefault: string;
									};
									id?: string;
								};

								if (operation === 'update') {
									params.id = this.getNodeParameter('id', i) as string;
								}

								const response = await bitrix24ApiRequest.call(
									this,
									'POST',
									`crm.category.${operation === 'create' ? 'add' : 'update'}`,
									params as unknown as IDataObject,
								);
								if (response && response.result) {
									returnData.push({
										success: true,
										id: response.result,
										...params.fields,
									});
								}
							}
						}

						if (operation === 'get') {
							const categoryId = this.getNodeParameter('id', i) as string;
							const response = await bitrix24ApiRequest.call(this, 'POST', 'crm.category.get', {
								entityTypeId: 2,
								id: categoryId,
							});
							if (response && response.result) {
								returnData.push(response.result as IDataObject);
							}
						}

						if (operation === 'getAll') {
							const response = await bitrix24ApiRequest.call(this, 'POST', 'crm.category.list', {
								entityTypeId: 2,
							});
							if (response && response.result) {
								const categories = Array.isArray(response.result) ? response.result : [response.result];
								returnData.push(...categories.map((category: IDataObject) => ({
									...category,
									id: category.ID,
								})));
							}
						}

						if (operation === 'delete') {
							const categoryId = this.getNodeParameter('id', i) as string;
							const response = await bitrix24ApiRequest.call(this, 'POST', 'crm.category.delete', {
								entityTypeId: 2,
								id: categoryId,
							});
							if (response && response.result) {
								returnData.push({ success: true, id: categoryId });
							}
						}
					}

					if (resource === 'status') {
						if (operation === 'create' || operation === 'update') {
							const multipleItems = this.getNodeParameter('multipleItems', i) as boolean;
							const categoryId = this.getNodeParameter('categoryId', i) as string;

							if (multipleItems) {
								const itemsData = this.getNodeParameter('statusItems.statuses', i, []) as IDataObject[];
								for (const item of itemsData) {
									const params = {
										fields: {
											NAME: item.name,
											SORT: item.sort || 100,
											COLOR: item.color || '#00FF00',
											SEMANTIC_INFO: { CODE: item.semantic || 'P' },
											CATEGORY_ID: categoryId,
											ENTITY_ID: `DEAL_STAGE_${categoryId}`,
											STATUS_ID: `${categoryId}_${item.sort || 100}`,
										},
									} as { fields: IDataObject; id?: string };

									if (operation === 'update' && item.id) {
										params.id = item.id as string;
									}

									const response = await bitrix24ApiRequest.call(
										this,
										'POST',
										`crm.status.${operation === 'create' ? 'add' : 'update'}`,
										params as unknown as IDataObject,
									);
									if (response && response.result) {
										returnData.push({
											success: true,
											id: response.result,
											...params.fields,
										});
									}
								}
							} else {
								const statusName = this.getNodeParameter('statusName', i) as string;
								const statusSort = this.getNodeParameter('statusSort', i) as number;
								const statusColor = this.getNodeParameter('statusColor', i) as string;
								const statusSemantic = this.getNodeParameter('statusSemantic', i) as string;

								const params = {
									fields: {
										NAME: statusName,
										SORT: statusSort,
										COLOR: statusColor,
										SEMANTIC_INFO: { CODE: statusSemantic },
										CATEGORY_ID: categoryId,
										ENTITY_ID: `DEAL_STAGE_${categoryId}`,
										STATUS_ID: `${categoryId}_${statusSort}`,
									},
								} as { fields: IDataObject; id?: string };

								if (operation === 'update') {
									const statusId = this.getNodeParameter('id', i) as string;
									params.id = statusId;
								}

								const response = await bitrix24ApiRequest.call(
									this,
									'POST',
									`crm.status.${operation === 'create' ? 'add' : 'update'}`,
									params as unknown as IDataObject,
								);
								if (response && response.result) {
									returnData.push({
										success: true,
										id: response.result,
										...params.fields,
									});
								}
							}
						}

						if (operation === 'get') {
							const statusId = this.getNodeParameter('id', i) as string;
							const response = await bitrix24ApiRequest.call(this, 'POST', 'crm.status.get', { id: statusId });
							returnData.push(response);
						}

						if (operation === 'getAll') {
							const categoryId = this.getNodeParameter('categoryId', i) as string;
							const entityId = categoryId === '0' ? 'DEAL_STAGE' : `DEAL_STAGE_${categoryId}`;

							const response = await bitrix24ApiRequest.call(this, 'POST', 'crm.status.list', {
								filter: {
									ENTITY_ID: entityId,
								},
							});
							if (response && response.result) {
								returnData.push(...response.result);
							}
						}

						if (operation === 'delete') {
							const statusId = this.getNodeParameter('id', i) as string;
							const response = await bitrix24ApiRequest.call(this, 'POST', 'crm.status.delete', { id: statusId });
							returnData.push(response);
						}
					}

					if (resource === 'smartProcessType') {
						if (operation === 'create' || operation === 'update') {
							const fields: IDataObject = {};
							const title = this.getNodeParameter('smartProcessTitle', i, '') as string;
							if (title) {
								fields.title = title;
							}

							const toggles = [
								'isStagesEnabled', 'isCategoriesEnabled', 'isClientEnabled',
								'isBeginCloseDatesEnabled', 'isLinkWithProductsEnabled', 'isObserversEnabled',
								'isSourceEnabled', 'isAutomationEnabled', 'isBizProcEnabled',
								'isDocumentsEnabled', 'isRecyclebinEnabled', 'isMycompanyEnabled',
							];
							for (const toggle of toggles) {
								const val = this.getNodeParameter(toggle, i, false) as boolean;
								fields[toggle] = val ? 'Y' : 'N';
							}

							if (operation === 'create') {
								const response = await bitrix24ApiRequest.call(this, 'POST', 'crm.type.add', { fields });
								if (response && response.result) {
									const createdType = response.result.type || response.result;
									const typeId = createdType.id;

									// Create user fields if enabled
									const createFields = this.getNodeParameter('createFields', i, false) as boolean;
									if (createFields && typeId) {
										const customFieldsData = this.getNodeParameter('customFields.fields', i, []) as IDataObject[];
										const createdFields: IDataObject[] = [];

										for (const uf of customFieldsData) {
											const fieldCode = `UF_CRM_${typeId}_${(uf.fieldName as string).toUpperCase()}`;
											const ufParams: IDataObject = {
												moduleId: 'crm',
												field: {
													entityId: `CRM_${typeId}`,
													fieldName: fieldCode,
													userTypeId: uf.userTypeId || 'string',
													multiple: uf.multiple ? 'Y' : 'N',
													mandatory: uf.mandatory ? 'Y' : 'N',
													showFilter: uf.showFilter !== false ? 'Y' : 'N',
													editFormLabel: { ru: uf.fieldLabel, en: uf.fieldLabel },
												} as IDataObject,
											};

											// Handle enumeration type
											if (uf.userTypeId === 'enumeration' && uf.listValues) {
												const values = (uf.listValues as string).split(',').map((v: string) => v.trim());
												((ufParams.field as IDataObject).enum as IDataObject[]) = values.map((val: string, idx: number) => ({
													value: val,
													def: 'N',
													sort: (idx + 1) * 100,
												}));
											}

											let ufResponse: any;
											for (let attempt = 0; attempt < 4; attempt++) {
												try {
													ufResponse = await bitrix24ApiRequest.call(
														this, 'POST', 'userfieldconfig.add', ufParams,
													);
													break;
												} catch (err) {
													if (attempt < 2) {
														await new Promise(resolve => setTimeout(resolve, 3000));
													} else {
														throw err;
													}
												}
											}
											createdFields.push(ufResponse.result || ufResponse);
										}

										returnData.push({
											...createdType,
											createdFields,
										});
									} else {
										returnData.push(createdType);
									}
								}
							} else {
								const id = this.getNodeParameter('smartProcessId', i) as number;
								const response = await bitrix24ApiRequest.call(this, 'POST', 'crm.type.update', { id, fields });
								if (response && response.result) {
									returnData.push(response.result.type || response.result);
								}
							}
						}

						if (operation === 'get') {
							const id = this.getNodeParameter('smartProcessId', i) as number;
							const response = await bitrix24ApiRequest.call(this, 'POST', 'crm.type.get', { id });
							if (response && response.result) {
								returnData.push(response.result.type || response.result);
							}
						}

						if (operation === 'getAll') {
							const response = await bitrix24ApiRequest.call(this, 'POST', 'crm.type.list', {});
							if (response && response.result && response.result.types) {
								returnData.push(...response.result.types);
							} else if (response && response.result) {
								returnData.push(...(Array.isArray(response.result) ? response.result : [response.result]));
							}
						}

						if (operation === 'delete') {
							const id = this.getNodeParameter('smartProcessId', i) as number;
							const response = await bitrix24ApiRequest.call(this, 'POST', 'crm.type.delete', { id });
							returnData.push(response && response.result ? response.result : { success: true });
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
			throw new NodeOperationError(this.getNode(), `Bitrix24 API error: ${(error as Error).message}`);
		}
	}
}
