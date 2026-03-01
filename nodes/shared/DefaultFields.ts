import { Lead } from '../Bitrix24/Lead';
import { Deal } from '../Bitrix24/Deal';
import { Contact } from '../Bitrix24/Contact';
import { Company } from '../Bitrix24/Company';

/**
 * Map of resource identifiers to their default field arrays.
 * Pre-computed at module load time for O(1) lookups.
 */
const DEFAULT_FIELDS: Record<string, string[]> = {
	[Lead.resource]: Lead.getDefaultFields(),
	[Deal.resource]: Deal.getDefaultFields(),
	[Contact.resource]: Contact.getDefaultFields(),
	[Company.resource]: Company.getDefaultFields(),
};

/**
 * Return the default select-fields for a given Bitrix24 CRM resource.
 * Falls back to an empty array for unknown resource types.
 */
export function getDefaultFieldsForResource(resource: string): string[] {
	return DEFAULT_FIELDS[resource] || [];
}
