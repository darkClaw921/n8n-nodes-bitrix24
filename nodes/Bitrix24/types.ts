import { IDataObject } from 'n8n-workflow';

export interface IBitrix24Field {
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

export interface IEnumValue {
	name: string;
	value: string;
}

export type BitrixResourceType = 'lead' | 'deal' | 'contact' | 'company';

export interface IFieldCollection {
	fieldName: string;
	fieldValue: string;
	fieldValueType?: string;
	resource?: BitrixResourceType;
	field?: IBitrix24Field;
}

export enum CommunicationType {
	WORK = 'WORK',
	MOBILE = 'MOBILE',
	HOME = 'HOME',
	FAX = 'FAX',
	OTHER = 'OTHER',
	TELEGRAM = 'TELEGRAM',
	WHATSAPP = 'WHATSAPP',
	VIBER = 'VIBER',
	FACEBOOK = 'FACEBOOK',
	SKYPE = 'SKYPE',
}

// Формат для коммуникационных полей в сущности Contact
export const formatContactCommunicationField = (value: string, type: string = CommunicationType.WORK): { VALUE: string; VALUE_TYPE: string }[] => {
	return [{ VALUE: value, VALUE_TYPE: type }];
};

// Формат для коммуникационных полей для всех других сущностей
export const formatCommunicationField = (value: string, type: string = CommunicationType.WORK): { VALUE: string; TYPE: string }[] => {
	return [{ VALUE: value, TYPE: type }];
};

export const processFormFields = (fieldsCollection: Array<IFieldCollection>): IDataObject => {
	const fields: IDataObject = {};
	
	for (const field of fieldsCollection) {
		// Проверяем, является ли это полем связи (PHONE или EMAIL)
		if (field.fieldName.includes('PHONE') || field.fieldName.includes('EMAIL')) {
			const valueType = field.fieldValueType || CommunicationType.WORK;
			
			// Для полей контакта нужна специальная обработка
			if (field.resource === 'contact') {
				// Используем специальный формат для контактов
				fields[field.fieldName] = formatContactCommunicationField(field.fieldValue, valueType);
			} else {
				// Для других сущностей используем стандартный формат
				fields[field.fieldName] = formatCommunicationField(field.fieldValue, valueType);
			}
		} else if (field.field?.type === 'enumeration' && field.field.items && Array.isArray(field.field.items)) {
			const selectedOption = field.field.items.find(item => item.VALUE === field.fieldValue);
			if (selectedOption) {
				fields[field.fieldName] = selectedOption.ID;
			}
		} else {
			fields[field.fieldName] = field.fieldValue;
		}
	}
	
	return fields;
};

export const getAllItems = async (
	endpoint: string,
	params: IDataObject,
	maxBatchSize: number = 50
): Promise<IDataObject[]> => {
	const allItems: IDataObject[] = [];
	let start = 0;
	let hasMore = true;

	while (hasMore) {
		const batchParams = {
			...params,
			start,
		};

		const response = await fetch(endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(batchParams),
		});
		
		const data = await response.json();
		const items = data.result;

		if (!Array.isArray(items) || items.length === 0) {
			hasMore = false;
			break;
		}

		allItems.push(...items);

		if (items.length < maxBatchSize) {
			hasMore = false;
		} else {
			start += maxBatchSize;
			await new Promise(resolve => setTimeout(resolve, 1000));
		}
	}

	return allItems;
}; 