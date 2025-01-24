import type { IExecuteFunctions } from 'n8n-core';
import type {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import axios, { AxiosError } from 'axios';

export class Bitrix24Auxiliary implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Bitrix24 Auxiliary',
		name: 'bitrix24Auxiliary',
		icon: 'file:bitrix24.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Управление вспомогательными сущностями в Bitrix24',
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
						name: 'Воронка продаж',
						value: 'category',
					},
					{
						name: 'Статус воронки',
						value: 'status',
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
						description: 'Создать элемент',
						action: 'Create an item',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Обновить элемент',
						action: 'Update an item',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Получить элемент',
						action: 'Get an item',
					},
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Получить все элементы',
						action: 'Get all items',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Удалить элемент',
						action: 'Delete an item',
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
				description: 'ID воронки продаж',
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
				description: 'Название воронки продаж',
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
				description: 'Сортировка воронки',
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
				description: 'Воронка по умолчанию',
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
				description: 'ID воронки продаж',
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
				description: 'Название статуса',
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
				description: 'Сортировка статуса',
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
				description: 'Цвет статуса в формате HEX',
			},
			{
				displayName: 'Status Semantic',
				name: 'statusSemantic',
				type: 'options',
				options: [
					{
						name: 'Процесс',
						value: 'P',
					},
					{
						name: 'Успех',
						value: 'S',
					},
					{
						name: 'Неудача',
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
				description: 'Семантика статуса (P - процесс, S - успех, F - неудача)',
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
				description: 'Создать несколько элементов',
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
				description: 'Список воронок для создания',
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
								description: 'Название воронки',
							},
							{
								displayName: 'Sort',
								name: 'sort',
								type: 'number',
								default: 100,
								description: 'Сортировка',
							},
							{
								displayName: 'Is Default',
								name: 'isDefault',
								type: 'boolean',
								default: false,
								description: 'Воронка по умолчанию',
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
				description: 'Список статусов для создания',
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
								description: 'Название статуса',
							},
							{
								displayName: 'Sort',
								name: 'sort',
								type: 'number',
								default: 100,
								description: 'Сортировка',
							},
							{
								displayName: 'Color',
								name: 'color',
								type: 'string',
								default: '#00FF00',
								description: 'Цвет статуса',
							},
							{
								displayName: 'Semantic',
								name: 'semantic',
								type: 'options',
								options: [
									{
										name: 'Процесс',
										value: 'P',
									},
									{
										name: 'Успех',
										value: 'S',
									},
									{
										name: 'Неудача',
										value: 'F',
									},
								],
								default: 'P',
								description: 'Семантика статуса',
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
			const credentials = await this.getCredentials('bitrix24Api');
			if (!credentials) {
				throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
			}

			const webhookUrl = credentials.webhookUrl as string;
			if (!webhookUrl) {
				throw new NodeOperationError(this.getNode(), 'Webhook URL is required!');
			}

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

									const endpoint = `${webhookUrl}crm.category.${operation === 'create' ? 'add' : 'update'}`;
									const response = await axios.post(endpoint, params);
									if (response.data && response.data.result) {
										returnData.push({
											success: true,
											id: response.data.result,
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

								const endpoint = `${webhookUrl}crm.category.${operation === 'create' ? 'add' : 'update'}`;
								const response = await axios.post(endpoint, params);
								if (response.data && response.data.result) {
									returnData.push({
										success: true,
										id: response.data.result,
										...params.fields,
									});
								}
							}
						}

						if (operation === 'get') {
							const categoryId = this.getNodeParameter('id', i) as string;
							const endpoint = `${webhookUrl}crm.category.get`;
							const response = await axios.post(endpoint, { 
								entityTypeId: 2,
								id: categoryId
							});
							if (response.data && response.data.result) {
								returnData.push(response.data.result);
							}
						}

						if (operation === 'getAll') {
							const endpoint = `${webhookUrl}crm.category.list`;
							const response = await axios.post(endpoint, {
								entityTypeId: 2
							});
							if (response.data && response.data.result) {
								const categories = Array.isArray(response.data.result) ? response.data.result : [response.data.result];
								returnData.push(...categories.map((category: IDataObject) => ({
									...category,
									id: category.ID,
								})));
							}
						}

						if (operation === 'delete') {
							const categoryId = this.getNodeParameter('id', i) as string;
							const endpoint = `${webhookUrl}crm.category.delete`;
							const response = await axios.post(endpoint, { 
								entityTypeId: 2,
								id: categoryId
							});
							if (response.data && response.data.result) {
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

									const endpoint = `${webhookUrl}crm.status.${operation === 'create' ? 'add' : 'update'}`;
									const response = await axios.post(endpoint, params);
									if (response.data && response.data.result) {
										returnData.push({
											success: true,
											id: response.data.result,
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

								const endpoint = `${webhookUrl}crm.status.${operation === 'create' ? 'add' : 'update'}`;
								const response = await axios.post(endpoint, params);
								if (response.data && response.data.result) {
									returnData.push({
										success: true,
										id: response.data.result,
										...params.fields,
									});
								}
							}
						}

						if (operation === 'get') {
							const statusId = this.getNodeParameter('id', i) as string;
							const endpoint = `${webhookUrl}crm.status.get`;
							const response = await axios.post(endpoint, { id: statusId });
							returnData.push(response.data);
						}

						if (operation === 'getAll') {
							const categoryId = this.getNodeParameter('categoryId', i) as string;
							const entityId = categoryId === '0' ? 'DEAL_STAGE' : `DEAL_STAGE_${categoryId}`;
							
							const endpoint = `${webhookUrl}crm.status.list`;
							const response = await axios.post(endpoint, { 
								filter: { 
									ENTITY_ID: entityId
								} 
							});
							if (response.data && response.data.result) {
								returnData.push(...response.data.result);
							}
						}

						if (operation === 'delete') {
							const statusId = this.getNodeParameter('id', i) as string;
							const endpoint = `${webhookUrl}crm.status.delete`;
							const response = await axios.post(endpoint, { id: statusId });
							returnData.push(response.data);
						}
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
			if (error instanceof AxiosError && error.response) {
				const message = error.response.data.error_description || error.response.data.error;
				throw new NodeOperationError(this.getNode(), `Bitrix24 API error: ${message}`);
			}
			throw error;
		}
	}
} 