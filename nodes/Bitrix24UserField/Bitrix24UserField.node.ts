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

export class Bitrix24UserField implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Bitrix24 User Field',
		name: 'bitrix24UserField',
		icon: 'file:bitrix24.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: getTranslation('userField.description', lang),
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
						description: getTranslation('userField.operations.create.description', lang),
						action: getTranslation('userField.operations.create.action', lang),
					},
					{
						name: 'Update',
						value: 'update',
						description: getTranslation('userField.operations.update.description', lang),
						action: getTranslation('userField.operations.update.action', lang),
					},
					{
						name: 'Get',
						value: 'get',
						description: getTranslation('userField.operations.get.description', lang),
						action: getTranslation('userField.operations.get.action', lang),
					},
					{
						name: 'Get All',
						value: 'getAll',
						description: getTranslation('userField.operations.getAll.description', lang),
						action: getTranslation('userField.operations.getAll.action', lang),
					},
					{
						name: 'Delete',
						value: 'delete',
						description: getTranslation('userField.operations.delete.description', lang),
						action: getTranslation('userField.operations.delete.action', lang),
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
				description: getTranslation('userField.fields.fieldIdDescription', lang),
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
				description: getTranslation('userField.fields.fieldNameDescription', lang),
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
				description: getTranslation('userField.fields.fieldLabelDescription', lang),
			},
			{
				displayName: 'Field Type',
				name: 'userTypeId',
				type: 'options',
				options: [
					{
						name: getTranslation('userField.fieldTypes.string', lang),
						value: 'string',
					},
					{
						name: getTranslation('userField.fieldTypes.integer', lang),
						value: 'integer',
					},
					{
						name: getTranslation('userField.fieldTypes.double', lang),
						value: 'double',
					},
					{
						name: getTranslation('userField.fieldTypes.boolean', lang),
						value: 'boolean',
					},
					{
						name: getTranslation('userField.fieldTypes.enumeration', lang),
						value: 'enumeration',
					},
					{
						name: getTranslation('userField.fieldTypes.date', lang),
						value: 'date',
					},
					{
						name: getTranslation('userField.fieldTypes.datetime', lang),
						value: 'datetime',
					},
					{
						name: getTranslation('userField.fieldTypes.file', lang),
						value: 'file',
					},
					{
						name: getTranslation('userField.fieldTypes.money', lang),
						value: 'money',
					},
					{
						name: getTranslation('userField.fieldTypes.url', lang),
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
				description: getTranslation('userField.fields.fieldTypeDescription', lang),
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
				description: getTranslation('userField.fields.listValuesDescription', lang),
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
								description: getTranslation('userField.fields.valueDescription', lang),
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
				description: getTranslation('userField.fields.multipleDescription', lang),
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
				description: getTranslation('userField.fields.mandatoryDescription', lang),
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
				description: getTranslation('userField.fields.showFilterDescription', lang),
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
				description: getTranslation('userField.fields.showInListDescription', lang),
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

						const response = await bitrix24ApiRequest.call(this, 'POST', `crm.${resource}.userfield.add`, params);
						returnData.push(response);
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

						const response = await bitrix24ApiRequest.call(this, 'POST', `crm.${resource}.userfield.update`, params);
						returnData.push(response);
					}

					if (operation === 'get') {
						const fieldId = this.getNodeParameter('fieldId', i) as string;
						const response = await bitrix24ApiRequest.call(this, 'POST', `crm.${resource}.userfield.get`, { id: fieldId });
						returnData.push(response);
					}

					if (operation === 'getAll') {
						const response = await bitrix24ApiRequest.call(this, 'POST', `crm.${resource}.userfield.list`);
						returnData.push(...response.result);
					}

					if (operation === 'delete') {
						const fieldId = this.getNodeParameter('fieldId', i) as string;
						const response = await bitrix24ApiRequest.call(this, 'POST', `crm.${resource}.userfield.delete`, { id: fieldId });
						returnData.push(response);
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
