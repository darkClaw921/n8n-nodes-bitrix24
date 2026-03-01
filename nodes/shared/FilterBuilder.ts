import { IDataObject } from 'n8n-workflow';

export interface IFilterField {
	fieldName: string;
	operation: string;
	value: string;
}

/**
 * Build a Bitrix24-compatible filter object from an array of filter field definitions.
 *
 * - 'equals' operation maps the field name as-is (no prefix).
 * - '@' and '!@' operators split the comma-separated value into an array.
 * - All other operators prefix the field name with the operator symbol.
 */
export function buildBitrixFilter(filterFields: IFilterField[]): IDataObject {
	const filter: IDataObject = {};

	for (const field of filterFields) {
		let value: string | string[] = field.value;

		// List operators: split comma-separated values into an array
		if (field.operation === '@' || field.operation === '!@') {
			value = value.split(',').map(item => item.trim());
		}

		// 'equals' uses the bare field name; other operators prefix the key
		if (field.operation === 'equals') {
			filter[field.fieldName] = value;
		} else {
			filter[field.operation + field.fieldName] = value;
		}
	}

	return filter;
}
