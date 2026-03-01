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
					{
						name: getTranslation('auxiliary.resources.department', lang),
						value: 'department',
					},
					{
						name: getTranslation('auxiliary.resources.callStatistic', lang),
						value: 'callStatistic',
					},
					{
						name: getTranslation('auxiliary.resources.task', lang),
						value: 'task',
					},
					{
						name: getTranslation('auxiliary.resources.productRow', lang),
						value: 'productRow',
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
				displayOptions: {
					show: {
						resource: ['category', 'status', 'smartProcessType', 'department', 'task', 'productRow'],
					},
				},
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
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['callStatistic'],
					},
				},
				options: [
					{
						name: 'Get All',
						value: 'getAll',
						description: getTranslation('auxiliary.operations.getAll.description', lang),
						action: getTranslation('auxiliary.operations.getAll.action', lang),
					},
				],
				default: 'getAll',
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
						resource: ['category', 'status'],
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
			// ===== Поля для подразделений =====
			{
				displayName: getTranslation('auxiliary.departmentFields.id', lang),
				name: 'departmentId',
				type: 'number',
				default: 0,
				required: true,
				displayOptions: {
					show: {
						resource: ['department'],
						operation: ['get', 'update', 'delete'],
					},
				},
				description: getTranslation('auxiliary.departmentFields.idDescription', lang),
			},
			{
				displayName: getTranslation('auxiliary.departmentFields.name', lang),
				name: 'departmentName',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['department'],
						operation: ['create'],
					},
				},
				description: getTranslation('auxiliary.departmentFields.nameDescription', lang),
			},
			{
				displayName: getTranslation('auxiliary.departmentFields.name', lang),
				name: 'departmentName',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['department'],
						operation: ['update'],
					},
				},
				description: getTranslation('auxiliary.departmentFields.nameDescription', lang),
			},
			{
				displayName: getTranslation('auxiliary.departmentFields.parent', lang),
				name: 'departmentParent',
				type: 'number',
				default: 1,
				required: true,
				displayOptions: {
					show: {
						resource: ['department'],
						operation: ['create'],
					},
				},
				description: getTranslation('auxiliary.departmentFields.parentDescription', lang),
			},
			{
				displayName: getTranslation('auxiliary.departmentFields.parent', lang),
				name: 'departmentParent',
				type: 'number',
				default: 0,
				displayOptions: {
					show: {
						resource: ['department'],
						operation: ['update'],
					},
				},
				description: getTranslation('auxiliary.departmentFields.parentDescription', lang),
			},
			{
				displayName: getTranslation('auxiliary.departmentFields.sort', lang),
				name: 'departmentSort',
				type: 'number',
				default: 500,
				displayOptions: {
					show: {
						resource: ['department'],
						operation: ['create', 'update'],
					},
				},
				description: getTranslation('auxiliary.departmentFields.sortDescription', lang),
			},
			{
				displayName: getTranslation('auxiliary.departmentFields.head', lang),
				name: 'departmentHead',
				type: 'number',
				default: 0,
				displayOptions: {
					show: {
						resource: ['department'],
						operation: ['create', 'update'],
					},
				},
				description: getTranslation('auxiliary.departmentFields.headDescription', lang),
			},
			// ===== Поля фильтрации статистики звонков =====
			{
				displayName: getTranslation('auxiliary.callFields.filterType', lang),
				name: 'callType',
				type: 'options',
				options: [
					{
						name: getTranslation('auxiliary.callTypes.outbound', lang),
						value: 1,
					},
					{
						name: getTranslation('auxiliary.callTypes.inbound', lang),
						value: 2,
					},
					{
						name: getTranslation('auxiliary.callTypes.inboundRedirect', lang),
						value: 3,
					},
					{
						name: getTranslation('auxiliary.callTypes.callback', lang),
						value: 4,
					},
				],
				default: '',
				displayOptions: {
					show: {
						resource: ['callStatistic'],
						operation: ['getAll'],
					},
				},
				description: getTranslation('auxiliary.callFields.filterTypeDescription', lang),
			},
			{
				displayName: getTranslation('auxiliary.callFields.filterPhone', lang),
				name: 'callPhone',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['callStatistic'],
						operation: ['getAll'],
					},
				},
				description: getTranslation('auxiliary.callFields.filterPhoneDescription', lang),
			},
			{
				displayName: getTranslation('auxiliary.callFields.filterUserId', lang),
				name: 'callUserId',
				type: 'number',
				default: 0,
				displayOptions: {
					show: {
						resource: ['callStatistic'],
						operation: ['getAll'],
					},
				},
				description: getTranslation('auxiliary.callFields.filterUserIdDescription', lang),
			},
			{
				displayName: getTranslation('auxiliary.callFields.filterDateFrom', lang),
				name: 'callDateFrom',
				type: 'dateTime',
				default: '',
				displayOptions: {
					show: {
						resource: ['callStatistic'],
						operation: ['getAll'],
					},
				},
				description: getTranslation('auxiliary.callFields.filterDateFromDescription', lang),
			},
			{
				displayName: getTranslation('auxiliary.callFields.filterDateTo', lang),
				name: 'callDateTo',
				type: 'dateTime',
				default: '',
				displayOptions: {
					show: {
						resource: ['callStatistic'],
						operation: ['getAll'],
					},
				},
				description: getTranslation('auxiliary.callFields.filterDateToDescription', lang),
			},
			{
				displayName: getTranslation('auxiliary.callFields.sortField', lang),
				name: 'callSortField',
				type: 'options',
				options: [
					{
						name: getTranslation('auxiliary.callSortFields.callStartDate', lang),
						value: 'CALL_START_DATE',
					},
					{
						name: getTranslation('auxiliary.callSortFields.callDuration', lang),
						value: 'CALL_DURATION',
					},
					{
						name: getTranslation('auxiliary.callSortFields.cost', lang),
						value: 'COST',
					},
					{
						name: getTranslation('auxiliary.callSortFields.id', lang),
						value: 'ID',
					},
				],
				default: 'CALL_START_DATE',
				displayOptions: {
					show: {
						resource: ['callStatistic'],
						operation: ['getAll'],
					},
				},
				description: getTranslation('auxiliary.callFields.sortFieldDescription', lang),
			},
			{
				displayName: getTranslation('auxiliary.callFields.sortOrder', lang),
				name: 'callSortOrder',
				type: 'options',
				options: [
					{ name: 'ASC', value: 'ASC' },
					{ name: 'DESC', value: 'DESC' },
				],
				default: 'DESC',
				displayOptions: {
					show: {
						resource: ['callStatistic'],
						operation: ['getAll'],
					},
				},
				description: getTranslation('auxiliary.callFields.sortOrderDescription', lang),
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
			// ===== Поля для задач (Task) =====
			{
				displayName: getTranslation('auxiliary.taskFields.id', lang),
				name: 'taskId',
				type: 'number',
				default: 0,
				required: true,
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['get', 'update', 'delete'],
					},
				},
				description: getTranslation('auxiliary.taskFields.idDescription', lang),
			},
			{
				displayName: getTranslation('auxiliary.taskFields.inputFormat', lang),
				name: 'taskInputFormat',
				type: 'options',
				options: [
					{
						name: getTranslation('inputFormats.form', lang),
						value: 'form',
						description: getTranslation('inputFormats.formDescription', lang),
					},
					{
						name: getTranslation('inputFormats.json', lang),
						value: 'json',
						description: getTranslation('inputFormats.jsonDescription', lang),
					},
				],
				default: 'form',
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['create', 'update'],
					},
				},
			},
			{
				displayName: getTranslation('auxiliary.taskFields.fieldsJson', lang),
				name: 'taskFieldsJson',
				type: 'json',
				default: '{}',
				description: getTranslation('auxiliary.taskFields.fieldsJsonDescription', lang),
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['create', 'update'],
						taskInputFormat: ['json'],
					},
				},
			},
			{
				displayName: getTranslation('auxiliary.taskFields.title', lang),
				name: 'taskTitle',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['create'],
						taskInputFormat: ['form'],
					},
				},
				description: getTranslation('auxiliary.taskFields.titleDescription', lang),
			},
			{
				displayName: getTranslation('auxiliary.taskFields.title', lang),
				name: 'taskTitle',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['update'],
						taskInputFormat: ['form'],
					},
				},
				description: getTranslation('auxiliary.taskFields.titleDescription', lang),
			},
			{
				displayName: getTranslation('auxiliary.taskFields.responsibleId', lang),
				name: 'taskResponsibleId',
				type: 'number',
				default: 0,
				required: true,
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['create'],
						taskInputFormat: ['form'],
					},
				},
				description: getTranslation('auxiliary.taskFields.responsibleIdDescription', lang),
			},
			{
				displayName: getTranslation('auxiliary.taskFields.responsibleId', lang),
				name: 'taskResponsibleId',
				type: 'number',
				default: 0,
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['update'],
						taskInputFormat: ['form'],
					},
				},
				description: getTranslation('auxiliary.taskFields.responsibleIdDescription', lang),
			},
			{
				displayName: getTranslation('auxiliary.taskFields.createdBy', lang),
				name: 'taskCreatedBy',
				type: 'number',
				default: 0,
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['create', 'update'],
						taskInputFormat: ['form'],
					},
				},
				description: getTranslation('auxiliary.taskFields.createdByDescription', lang),
			},
			{
				displayName: getTranslation('auxiliary.taskFields.description', lang),
				name: 'taskDescription',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['create', 'update'],
						taskInputFormat: ['form'],
					},
				},
				description: getTranslation('auxiliary.taskFields.descriptionDescription', lang),
			},
			{
				displayName: getTranslation('auxiliary.taskFields.priority', lang),
				name: 'taskPriority',
				type: 'options',
				options: [
					{
						name: getTranslation('auxiliary.taskPriorities.low', lang),
						value: 0,
					},
					{
						name: getTranslation('auxiliary.taskPriorities.medium', lang),
						value: 1,
					},
					{
						name: getTranslation('auxiliary.taskPriorities.high', lang),
						value: 2,
					},
				],
				default: 1,
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['create', 'update'],
						taskInputFormat: ['form'],
					},
				},
				description: getTranslation('auxiliary.taskFields.priorityDescription', lang),
			},
			{
				displayName: getTranslation('auxiliary.taskFields.deadline', lang),
				name: 'taskDeadline',
				type: 'dateTime',
				default: '',
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['create', 'update'],
						taskInputFormat: ['form'],
					},
				},
				description: getTranslation('auxiliary.taskFields.deadlineDescription', lang),
			},
			{
				displayName: getTranslation('auxiliary.taskFields.groupId', lang),
				name: 'taskGroupId',
				type: 'number',
				default: 0,
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['create', 'update'],
						taskInputFormat: ['form'],
					},
				},
				description: getTranslation('auxiliary.taskFields.groupIdDescription', lang),
			},
			{
				displayName: getTranslation('auxiliary.taskFields.ufCrmTask', lang),
				name: 'taskUfCrmTask',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['create', 'update'],
						taskInputFormat: ['form'],
					},
				},
				description: getTranslation('auxiliary.taskFields.ufCrmTaskDescription', lang),
			},
			// Task list fields
			{
				displayName: getTranslation('fields.returnAll', lang),
				name: 'taskReturnAll',
				type: 'boolean',
				default: false,
				description: getTranslation('fields.returnAllDescription', lang),
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['getAll'],
					},
				},
			},
			{
				displayName: getTranslation('fields.limit', lang),
				name: 'taskLimit',
				type: 'number',
				default: 50,
				description: getTranslation('fields.limitDescription', lang),
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['getAll'],
						taskReturnAll: [false],
					},
				},
			},
			{
				displayName: getTranslation('fields.useFilter', lang),
				name: 'taskUseFilter',
				type: 'boolean',
				default: false,
				description: getTranslation('fields.useFilterDescription', lang),
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['getAll'],
					},
				},
			},
			{
				displayName: getTranslation('auxiliary.taskFields.filterFields', lang),
				name: 'taskFilterFields',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					sortable: true,
				},
				placeholder: getTranslation('auxiliary.taskFields.filterFieldsPlaceholder', lang),
				default: {},
				options: [
					{
						name: 'field',
						displayName: getTranslation('fields.fields', lang),
						values: [
							{
								displayName: getTranslation('fields.fieldName', lang),
								name: 'fieldName',
								type: 'string',
								default: '',
								description: getTranslation('fields.filterFieldNameDescription', lang),
							},
							{
								displayName: getTranslation('fields.filterOperation', lang),
								name: 'operation',
								type: 'options',
								options: [
									{ name: getTranslation('filterOperations.equals', lang), value: 'equals' },
									{ name: getTranslation('filterOperations.notEquals', lang), value: '!=' },
									{ name: getTranslation('filterOperations.greaterThan', lang), value: '>' },
									{ name: getTranslation('filterOperations.greaterThanOrEqual', lang), value: '>=' },
									{ name: getTranslation('filterOperations.lessThan', lang), value: '<' },
									{ name: getTranslation('filterOperations.lessThanOrEqual', lang), value: '<=' },
								],
								default: 'equals',
								description: getTranslation('filterOperations.operationDescription', lang),
							},
							{
								displayName: getTranslation('fields.filterValue', lang),
								name: 'value',
								type: 'string',
								default: '',
								description: getTranslation('fields.filterValueDescription', lang),
							},
						],
					},
				],
				displayOptions: {
					show: {
						resource: ['task'],
						operation: ['getAll'],
						taskUseFilter: [true],
					},
				},
			},
			// ===== Поля для товарных позиций (Product Row) =====
			{
				displayName: getTranslation('auxiliary.productRowFields.id', lang),
				name: 'productRowId',
				type: 'number',
				default: 0,
				required: true,
				displayOptions: {
					show: {
						resource: ['productRow'],
						operation: ['get', 'update', 'delete'],
					},
				},
				description: getTranslation('auxiliary.productRowFields.idDescription', lang),
			},
			{
				displayName: getTranslation('auxiliary.productRowFields.ownerType', lang),
				name: 'productRowOwnerType',
				type: 'options',
				options: [
					{
						name: getTranslation('auxiliary.productRowFields.ownerTypeDeal', lang),
						value: 'D',
					},
					{
						name: getTranslation('auxiliary.productRowFields.ownerTypeLead', lang),
						value: 'L',
					},
					{
						name: getTranslation('auxiliary.productRowFields.ownerTypeQuote', lang),
						value: 'Q',
					},
					{
						name: getTranslation('auxiliary.productRowFields.ownerTypeSmartProcess', lang),
						value: 'T',
					},
				],
				default: 'D',
				required: true,
				displayOptions: {
					show: {
						resource: ['productRow'],
						operation: ['create', 'getAll'],
					},
				},
				description: getTranslation('auxiliary.productRowFields.ownerTypeDescription', lang),
			},
			{
				displayName: getTranslation('auxiliary.productRowFields.ownerId', lang),
				name: 'productRowOwnerId',
				type: 'number',
				default: 0,
				required: true,
				displayOptions: {
					show: {
						resource: ['productRow'],
						operation: ['create', 'getAll'],
					},
				},
				description: getTranslation('auxiliary.productRowFields.ownerIdDescription', lang),
			},
			{
				displayName: getTranslation('auxiliary.productRowFields.inputFormat', lang),
				name: 'productRowInputFormat',
				type: 'options',
				options: [
					{
						name: getTranslation('inputFormats.form', lang),
						value: 'form',
						description: getTranslation('inputFormats.formDescription', lang),
					},
					{
						name: getTranslation('inputFormats.json', lang),
						value: 'json',
						description: getTranslation('inputFormats.jsonDescription', lang),
					},
				],
				default: 'form',
				displayOptions: {
					show: {
						resource: ['productRow'],
						operation: ['create', 'update'],
					},
				},
			},
			{
				displayName: getTranslation('auxiliary.productRowFields.fieldsJson', lang),
				name: 'productRowFieldsJson',
				type: 'json',
				default: '{}',
				description: getTranslation('auxiliary.productRowFields.fieldsJsonDescription', lang),
				displayOptions: {
					show: {
						resource: ['productRow'],
						operation: ['create', 'update'],
						productRowInputFormat: ['json'],
					},
				},
			},
			{
				displayName: getTranslation('auxiliary.productRowFields.productId', lang),
				name: 'productRowProductId',
				type: 'number',
				default: 0,
				displayOptions: {
					show: {
						resource: ['productRow'],
						operation: ['create', 'update'],
						productRowInputFormat: ['form'],
					},
				},
				description: getTranslation('auxiliary.productRowFields.productIdDescription', lang),
			},
			{
				displayName: getTranslation('auxiliary.productRowFields.productName', lang),
				name: 'productRowProductName',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						resource: ['productRow'],
						operation: ['create', 'update'],
						productRowInputFormat: ['form'],
					},
				},
				description: getTranslation('auxiliary.productRowFields.productNameDescription', lang),
			},
			{
				displayName: getTranslation('auxiliary.productRowFields.price', lang),
				name: 'productRowPrice',
				type: 'number',
				default: 0,
				typeOptions: {
					numberPrecision: 2,
				},
				displayOptions: {
					show: {
						resource: ['productRow'],
						operation: ['create', 'update'],
						productRowInputFormat: ['form'],
					},
				},
				description: getTranslation('auxiliary.productRowFields.priceDescription', lang),
			},
			{
				displayName: getTranslation('auxiliary.productRowFields.quantity', lang),
				name: 'productRowQuantity',
				type: 'number',
				default: 1,
				typeOptions: {
					numberPrecision: 2,
				},
				displayOptions: {
					show: {
						resource: ['productRow'],
						operation: ['create', 'update'],
						productRowInputFormat: ['form'],
					},
				},
				description: getTranslation('auxiliary.productRowFields.quantityDescription', lang),
			},
			{
				displayName: getTranslation('auxiliary.productRowFields.discountType', lang),
				name: 'productRowDiscountTypeId',
				type: 'options',
				options: [
					{
						name: getTranslation('auxiliary.productRowFields.discountTypeAbsolute', lang),
						value: 1,
					},
					{
						name: getTranslation('auxiliary.productRowFields.discountTypePercent', lang),
						value: 2,
					},
				],
				default: 2,
				displayOptions: {
					show: {
						resource: ['productRow'],
						operation: ['create', 'update'],
						productRowInputFormat: ['form'],
					},
				},
				description: getTranslation('auxiliary.productRowFields.discountTypeDescription', lang),
			},
			{
				displayName: getTranslation('auxiliary.productRowFields.discountRate', lang),
				name: 'productRowDiscountRate',
				type: 'number',
				default: 0,
				typeOptions: {
					numberPrecision: 2,
				},
				displayOptions: {
					show: {
						resource: ['productRow'],
						operation: ['create', 'update'],
						productRowInputFormat: ['form'],
					},
				},
				description: getTranslation('auxiliary.productRowFields.discountRateDescription', lang),
			},
			{
				displayName: getTranslation('auxiliary.productRowFields.taxRate', lang),
				name: 'productRowTaxRate',
				type: 'number',
				default: 0,
				typeOptions: {
					numberPrecision: 2,
				},
				displayOptions: {
					show: {
						resource: ['productRow'],
						operation: ['create', 'update'],
						productRowInputFormat: ['form'],
					},
				},
				description: getTranslation('auxiliary.productRowFields.taxRateDescription', lang),
			},
			{
				displayName: getTranslation('auxiliary.productRowFields.taxIncluded', lang),
				name: 'productRowTaxIncluded',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['productRow'],
						operation: ['create', 'update'],
						productRowInputFormat: ['form'],
					},
				},
				description: getTranslation('auxiliary.productRowFields.taxIncludedDescription', lang),
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

					if (resource === 'department') {
						if (operation === 'create') {
							const name = this.getNodeParameter('departmentName', i) as string;
							const parent = this.getNodeParameter('departmentParent', i) as number;
							const sort = this.getNodeParameter('departmentSort', i) as number;
							const head = this.getNodeParameter('departmentHead', i) as number;

							const params: IDataObject = {
								NAME: name,
								PARENT: parent,
							};
							if (sort) params.SORT = sort;
							if (head) params.UF_HEAD = head;

							const response = await bitrix24ApiRequest.call(this, 'POST', 'department.add', params);
							if (response && response.result !== undefined) {
								returnData.push({ success: true, ID: response.result });
							}
						}

						if (operation === 'update') {
							const id = this.getNodeParameter('departmentId', i) as number;
							const name = this.getNodeParameter('departmentName', i, '') as string;
							const parent = this.getNodeParameter('departmentParent', i, 0) as number;
							const sort = this.getNodeParameter('departmentSort', i, 0) as number;
							const head = this.getNodeParameter('departmentHead', i, 0) as number;

							const params: IDataObject = { ID: id };
							if (name) params.NAME = name;
							if (parent) params.PARENT = parent;
							if (sort) params.SORT = sort;
							if (head) params.UF_HEAD = head;

							const response = await bitrix24ApiRequest.call(this, 'POST', 'department.update', params);
							if (response && response.result !== undefined) {
								returnData.push({ success: true, ID: id });
							}
						}

						if (operation === 'get') {
							const id = this.getNodeParameter('departmentId', i) as number;
							const response = await bitrix24ApiRequest.call(this, 'POST', 'department.get', { ID: id });
							if (response && response.result) {
								const departments = Array.isArray(response.result) ? response.result : [response.result];
								if (departments.length > 0) {
									returnData.push(departments[0] as IDataObject);
								}
							}
						}

						if (operation === 'getAll') {
							const response = await bitrix24ApiRequest.call(this, 'POST', 'department.get', {});
							if (response && response.result) {
								const departments = Array.isArray(response.result) ? response.result : [response.result];
								returnData.push(...departments as IDataObject[]);
							}
						}

						if (operation === 'delete') {
							const id = this.getNodeParameter('departmentId', i) as number;
							const response = await bitrix24ApiRequest.call(this, 'POST', 'department.delete', { ID: id });
							if (response && response.result !== undefined) {
								returnData.push({ success: true, ID: id });
							}
						}
					}

					if (resource === 'callStatistic') {
						if (operation === 'getAll') {
							const callType = this.getNodeParameter('callType', i, '') as number | string;
							const callPhone = this.getNodeParameter('callPhone', i, '') as string;
							const callUserId = this.getNodeParameter('callUserId', i, 0) as number;
							const callDateFrom = this.getNodeParameter('callDateFrom', i, '') as string;
							const callDateTo = this.getNodeParameter('callDateTo', i, '') as string;
							const sortField = this.getNodeParameter('callSortField', i, 'CALL_START_DATE') as string;
							const sortOrder = this.getNodeParameter('callSortOrder', i, 'DESC') as string;

							const filter: IDataObject = {};
							if (callType) filter.CALL_TYPE = callType;
							if (callPhone) filter.PHONE_NUMBER = callPhone;
							if (callUserId) filter.PORTAL_USER_ID = callUserId;
							if (callDateFrom) filter['>CALL_START_DATE'] = callDateFrom;
							if (callDateTo) filter['<CALL_START_DATE'] = callDateTo;

							const params: IDataObject = {
								FILTER: filter,
								SORT: sortField,
								ORDER: sortOrder,
							};

							const response = await bitrix24ApiRequest.call(this, 'POST', 'voximplant.statistic.get', params);
							if (response && response.result) {
								const calls = Array.isArray(response.result) ? response.result : [response.result];
								returnData.push(...calls as IDataObject[]);
							}
						}
					}

					if (resource === 'task') {
						if (operation === 'create' || operation === 'update') {
							const inputFormat = this.getNodeParameter('taskInputFormat', i) as string;
							let fields: IDataObject = {};

							if (inputFormat === 'json') {
								fields = JSON.parse(this.getNodeParameter('taskFieldsJson', i) as string);
							} else {
								const title = this.getNodeParameter('taskTitle', i, '') as string;
								const responsibleId = this.getNodeParameter('taskResponsibleId', i, 0) as number;
								const createdBy = this.getNodeParameter('taskCreatedBy', i, 0) as number;
								const description = this.getNodeParameter('taskDescription', i, '') as string;
								const priority = this.getNodeParameter('taskPriority', i, 1) as number;
								const deadline = this.getNodeParameter('taskDeadline', i, '') as string;
								const groupId = this.getNodeParameter('taskGroupId', i, 0) as number;
								const ufCrmTask = this.getNodeParameter('taskUfCrmTask', i, '') as string;

								if (title) fields.TITLE = title;
								if (responsibleId) fields.RESPONSIBLE_ID = responsibleId;
								if (createdBy) fields.CREATED_BY = createdBy;
								if (description) fields.DESCRIPTION = description;
								fields.PRIORITY = priority;
								if (deadline) fields.DEADLINE = deadline;
								if (groupId) fields.GROUP_ID = groupId;
								if (ufCrmTask) {
									fields.UF_CRM_TASK = ufCrmTask.split(',').map((s: string) => s.trim());
								}
							}

							if (operation === 'create') {
								const response = await bitrix24ApiRequest.call(this, 'POST', 'tasks.task.add', { fields });
								if (response && response.result && response.result.task) {
									returnData.push(response.result.task as IDataObject);
								} else if (response && response.result) {
									returnData.push(response.result as IDataObject);
								}
							} else {
								const taskId = this.getNodeParameter('taskId', i) as number;
								const response = await bitrix24ApiRequest.call(this, 'POST', 'tasks.task.update', { taskId, fields });
								if (response && response.result && response.result.task) {
									returnData.push(response.result.task as IDataObject);
								} else if (response && response.result) {
									returnData.push(response.result as IDataObject);
								}
							}
						}

						if (operation === 'get') {
							const taskId = this.getNodeParameter('taskId', i) as number;
							const response = await bitrix24ApiRequest.call(this, 'POST', 'tasks.task.get', { taskId });
							if (response && response.result && response.result.task) {
								returnData.push(response.result.task as IDataObject);
							} else if (response && response.result) {
								returnData.push(response.result as IDataObject);
							}
						}

						if (operation === 'getAll') {
							const returnAll = this.getNodeParameter('taskReturnAll', i) as boolean;
							const useFilter = this.getNodeParameter('taskUseFilter', i) as boolean;

							const params: IDataObject = {};
							if (useFilter) {
								const filterFields = this.getNodeParameter('taskFilterFields.field', i, []) as Array<{
									fieldName: string;
									operation: string;
									value: string;
								}>;
								if (filterFields.length > 0) {
									const filter: IDataObject = {};
									for (const f of filterFields) {
										if (f.operation === 'equals') {
											filter[f.fieldName] = f.value;
										} else if (f.operation === '!=') {
											filter[`!${f.fieldName}`] = f.value;
										} else {
											filter[`${f.operation}${f.fieldName}`] = f.value;
										}
									}
									params.filter = filter;
								}
							}

							if (returnAll) {
								let start = 0;
								const batchSize = 50;
								let hasMore = true;
								while (hasMore) {
									const batchParams: IDataObject = { ...params, start };
									const response = await bitrix24ApiRequest.call(this, 'POST', 'tasks.task.list', batchParams);
									const tasks = response?.result?.tasks;
									if (!Array.isArray(tasks) || tasks.length === 0) {
										break;
									}
									returnData.push(...tasks as IDataObject[]);
									if (tasks.length < batchSize) {
										hasMore = false;
									} else {
										start += batchSize;
										await new Promise(resolve => setTimeout(resolve, 1000));
									}
								}
							} else {
								const limit = this.getNodeParameter('taskLimit', i) as number;
								params.start = 0;
								const response = await bitrix24ApiRequest.call(this, 'POST', 'tasks.task.list', params);
								if (response?.result?.tasks && Array.isArray(response.result.tasks)) {
									returnData.push(...(response.result.tasks as IDataObject[]).slice(0, limit));
								}
							}
						}

						if (operation === 'delete') {
							const taskId = this.getNodeParameter('taskId', i) as number;
							await bitrix24ApiRequest.call(this, 'POST', 'tasks.task.delete', { taskId });
							returnData.push({ success: true, id: taskId });
						}
					}

					if (resource === 'productRow') {
						if (operation === 'create' || operation === 'update') {
							const inputFormat = this.getNodeParameter('productRowInputFormat', i) as string;
							let fields: IDataObject = {};

							if (inputFormat === 'json') {
								fields = JSON.parse(this.getNodeParameter('productRowFieldsJson', i) as string);
							} else {
								const productId = this.getNodeParameter('productRowProductId', i, 0) as number;
								const productName = this.getNodeParameter('productRowProductName', i, '') as string;
								const price = this.getNodeParameter('productRowPrice', i, 0) as number;
								const quantity = this.getNodeParameter('productRowQuantity', i, 1) as number;
								const discountTypeId = this.getNodeParameter('productRowDiscountTypeId', i, 2) as number;
								const discountRate = this.getNodeParameter('productRowDiscountRate', i, 0) as number;
								const taxRate = this.getNodeParameter('productRowTaxRate', i, 0) as number;
								const taxIncluded = this.getNodeParameter('productRowTaxIncluded', i, false) as boolean;

								if (productId) fields.productId = productId;
								if (productName) fields.productName = productName;
								if (price) fields.price = price;
								fields.quantity = quantity;
								fields.discountTypeId = discountTypeId;
								if (discountRate) fields.discountRate = discountRate;
								if (taxRate) fields.taxRate = taxRate;
								fields.taxIncluded = taxIncluded ? 'Y' : 'N';
							}

							if (operation === 'create') {
								const ownerType = this.getNodeParameter('productRowOwnerType', i) as string;
								const ownerId = this.getNodeParameter('productRowOwnerId', i) as number;
								fields.ownerId = ownerId;
								fields.ownerType = ownerType;

								const response = await bitrix24ApiRequest.call(this, 'POST', 'crm.item.productrow.add', { fields });
								if (response?.result?.productRow) {
									returnData.push(response.result.productRow as IDataObject);
								} else if (response?.result) {
									returnData.push(response.result as IDataObject);
								}
							} else {
								const id = this.getNodeParameter('productRowId', i) as number;
								const response = await bitrix24ApiRequest.call(this, 'POST', 'crm.item.productrow.update', { id, fields });
								if (response?.result?.productRow) {
									returnData.push(response.result.productRow as IDataObject);
								} else if (response?.result) {
									returnData.push(response.result as IDataObject);
								}
							}
						}

						if (operation === 'get') {
							const id = this.getNodeParameter('productRowId', i) as number;
							const response = await bitrix24ApiRequest.call(this, 'POST', 'crm.item.productrow.get', { id });
							if (response?.result?.productRow) {
								returnData.push(response.result.productRow as IDataObject);
							} else if (response?.result) {
								returnData.push(response.result as IDataObject);
							}
						}

						if (operation === 'getAll') {
							const ownerType = this.getNodeParameter('productRowOwnerType', i) as string;
							const ownerId = this.getNodeParameter('productRowOwnerId', i) as number;
							const response = await bitrix24ApiRequest.call(this, 'POST', 'crm.item.productrow.list', {
								filter: {
									'=ownerType': ownerType,
									'=ownerId': ownerId,
								},
							});
							if (response?.result?.productRows && Array.isArray(response.result.productRows)) {
								returnData.push(...response.result.productRows as IDataObject[]);
							} else if (response?.result) {
								const result = Array.isArray(response.result) ? response.result : [response.result];
								returnData.push(...result as IDataObject[]);
							}
						}

						if (operation === 'delete') {
							const id = this.getNodeParameter('productRowId', i) as number;
							await bitrix24ApiRequest.call(this, 'POST', 'crm.item.productrow.delete', { id });
							returnData.push({ success: true, id });
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
