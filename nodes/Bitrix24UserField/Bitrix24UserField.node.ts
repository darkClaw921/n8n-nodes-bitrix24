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

export class Bitrix24UserField implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Bitrix24 User Field',
		name: 'bitrix24UserField',
		icon: 'file:bitrix24.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Работа с пользовательскими полями в Bitrix24',
		defaults: {
			name: 'Bitrix24 User Field',
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
						description: 'Создать пользовательское поле',
						action: 'Create a user field',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Обновить пользовательское поле',
						action: 'Update a user field',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Получить пользовательское поле',
						action: 'Get a user field',
					},
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Получить все пользовательские поля',
						action: 'Get all user fields',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Удалить пользовательское поле',
						action: 'Delete a user field',
					},
				],
				default: 'create',
			},
			// Поле ID для операций update, get и delete
			{
				displayName: 'Field ID',
				name: 'fieldId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['update', 'get', 'delete'],
					},
				},
				description: 'ID пользовательского поля',
			},
			// Поля для создания и обновления
			{
				displayName: 'Field Name',
				name: 'fieldName',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['create'],
					},
				},
				description: 'Название поля (например: UF_CRM_CUSTOM_FIELD)',
			},
			{
				displayName: 'Field Label',
				name: 'fieldLabel',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['create', 'update'],
					},
				},
				description: 'Отображаемое название поля',
			},
			{
				displayName: 'Field Type',
				name: 'userTypeId',
				type: 'options',
				options: [
					{
						name: 'Строка',
						value: 'string',
					},
					{
						name: 'Целое число',
						value: 'integer',
					},
					{
						name: 'Дробное число',
						value: 'double',
					},
					{
						name: 'Да/Нет',
						value: 'boolean',
					},
					{
						name: 'Список',
						value: 'enumeration',
					},
					{
						name: 'Дата',
						value: 'date',
					},
					{
						name: 'Дата и время',
						value: 'datetime',
					},
					{
						name: 'Файл',
						value: 'file',
					},
					{
						name: 'Деньги',
						value: 'money',
					},
					{
						name: 'URL',
						value: 'url',
					},
				],
				default: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['create'],
					},
				},
				description: 'Тип пользовательского поля',
			},
			// Значения для списка
			{
				displayName: 'List Values',
				name: 'listValues',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					sortable: true,
				},
				displayOptions: {
					show: {
						operation: ['create', 'update'],
						userTypeId: ['enumeration'],
					},
				},
				description: 'Значения для списка',
				default: {},
				options: [
					{
						name: 'values',
						displayName: 'Values',
						values: [
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Значение элемента списка',
							},
						],
					},
				],
			},
			// Дополнительные настройки
			{
				displayName: 'Multiple',
				name: 'multiple',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						operation: ['create', 'update'],
					},
				},
				description: 'Множественное поле',
			},
			{
				displayName: 'Mandatory',
				name: 'mandatory',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						operation: ['create', 'update'],
					},
				},
				description: 'Обязательное поле',
			},
			{
				displayName: 'Show Filter',
				name: 'showFilter',
				type: 'boolean',
				default: true,
				displayOptions: {
					show: {
						operation: ['create', 'update'],
					},
				},
				description: 'Показывать в фильтре',
			},
			{
				displayName: 'Show In List',
				name: 'showInList',
				type: 'boolean',
				default: true,
				displayOptions: {
					show: {
						operation: ['create', 'update'],
					},
				},
				description: 'Показывать в списке',
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
					if (operation === 'create') {
						const fieldName = this.getNodeParameter('fieldName', i) as string;
						const fieldLabel = this.getNodeParameter('fieldLabel', i) as string;
						const userTypeId = this.getNodeParameter('userTypeId', i) as string;
						const multiple = this.getNodeParameter('multiple', i) as boolean;
						const mandatory = this.getNodeParameter('mandatory', i) as boolean;
						const showFilter = this.getNodeParameter('showFilter', i) as boolean;
						const showInList = this.getNodeParameter('showInList', i) as boolean;

						const params: IDataObject = {
							fields: {
								FIELD_NAME: fieldName,
								EDIT_FORM_LABEL: fieldLabel,
								LIST_COLUMN_LABEL: fieldLabel,
								USER_TYPE_ID: userTypeId,
								MULTIPLE: multiple ? 'Y' : 'N',
								MANDATORY: mandatory ? 'Y' : 'N',
								SHOW_FILTER: showFilter ? 'Y' : 'N',
								SHOW_IN_LIST: showInList ? 'Y' : 'N',
							},
						};

						if (showFilter) {
							(params.fields as IDataObject).FILTER_LABEL = fieldLabel;
						}

						if (showInList) {
							(params.fields as IDataObject).LIST_FILTER_LABEL = fieldLabel;
						}

						if (userTypeId === 'enumeration') {
							const listValues = this.getNodeParameter('listValues', i) as { values: Array<{ value: string }> };
							if (listValues.values && listValues.values.length > 0) {
								(params.fields as IDataObject).LIST = listValues.values.map((item, index) => ({
									SORT: (index + 1) * 100,
									VALUE: item.value,
								}));
							}
						}

						const endpoint = `${webhookUrl}crm.${resource}.userfield.add`;
						const response = await axios.post(endpoint, params);
						returnData.push(response.data);
					}

					if (operation === 'update') {
						const fieldId = this.getNodeParameter('fieldId', i) as string;
						const fieldLabel = this.getNodeParameter('fieldLabel', i) as string;
						const multiple = this.getNodeParameter('multiple', i) as boolean;
						const mandatory = this.getNodeParameter('mandatory', i) as boolean;
						const showFilter = this.getNodeParameter('showFilter', i) as boolean;
						const showInList = this.getNodeParameter('showInList', i) as boolean;

						const params: IDataObject = {
							id: fieldId,
							fields: {
								EDIT_FORM_LABEL: fieldLabel,
								LIST_COLUMN_LABEL: fieldLabel,
								MULTIPLE: multiple ? 'Y' : 'N',
								MANDATORY: mandatory ? 'Y' : 'N',
								SHOW_FILTER: showFilter ? 'Y' : 'N',
								SHOW_IN_LIST: showInList ? 'Y' : 'N',
							},
						};

						if (showFilter) {
							(params.fields as IDataObject).FILTER_LABEL = fieldLabel;
						}

						if (showInList) {
							(params.fields as IDataObject).LIST_FILTER_LABEL = fieldLabel;
						}

						if (this.getNodeParameter('userTypeId', i, '') === 'enumeration') {
							const listValues = this.getNodeParameter('listValues', i) as { values: Array<{ value: string }> };
							if (listValues.values && listValues.values.length > 0) {
								(params.fields as IDataObject).LIST = listValues.values.map((item, index) => ({
									SORT: (index + 1) * 100,
									VALUE: item.value,
								}));
							}
						}

						const endpoint = `${webhookUrl}crm.${resource}.userfield.update`;
						const response = await axios.post(endpoint, params);
						returnData.push(response.data);
					}

					if (operation === 'get') {
						const fieldId = this.getNodeParameter('fieldId', i) as string;
						const endpoint = `${webhookUrl}crm.${resource}.userfield.get`;
						const response = await axios.post(endpoint, { id: fieldId });
						returnData.push(response.data);
					}

					if (operation === 'getAll') {
						const endpoint = `${webhookUrl}crm.${resource}.userfield.list`;
						const response = await axios.post(endpoint);
						returnData.push(...response.data.result);
					}

					if (operation === 'delete') {
						const fieldId = this.getNodeParameter('fieldId', i) as string;
						const endpoint = `${webhookUrl}crm.${resource}.userfield.delete`;
						const response = await axios.post(endpoint, { id: fieldId });
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
			if (error instanceof AxiosError && error.response) {
				const message = error.response.data.error_description || error.response.data.error;
				throw new NodeOperationError(this.getNode(), `Bitrix24 API error: ${message}`);
			}
			throw error;
		}
	}
} 