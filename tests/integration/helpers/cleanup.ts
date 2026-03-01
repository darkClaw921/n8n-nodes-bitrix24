import { callBitrix24 } from './bitrix24-api';

/**
 * Safely delete a single test entity. Used in afterAll hooks.
 * Never throws -- logs a warning on failure so tests don't fail during cleanup.
 *
 * @param endpoint - Full API method name (e.g. 'crm.lead.delete')
 * @param id - ID of the entity to delete
 * @param idField - Name of the ID parameter (default 'ID', some APIs use 'id')
 * @returns true if deleted successfully, false otherwise
 */
export async function safeDelete(
	endpoint: string,
	id: number | string,
	idField: string = 'ID',
): Promise<boolean> {
	try {
		await callBitrix24(endpoint, { [idField]: id });
		return true;
	} catch (error) {
		console.warn(
			`Cleanup warning: failed to delete ${endpoint} ${idField}=${id}:`,
			(error as Error).message,
		);
		return false;
	}
}

/**
 * Safely delete multiple test entities sequentially.
 * Sequential execution avoids Bitrix24 rate limiting.
 *
 * @param endpoint - Full API method name (e.g. 'crm.lead.delete')
 * @param ids - Array of entity IDs to delete
 * @param idField - Name of the ID parameter (default 'ID')
 * @returns Number of successfully deleted entities
 */
export async function safeDeleteMultiple(
	endpoint: string,
	ids: (number | string)[],
	idField: string = 'ID',
): Promise<number> {
	let deleted = 0;
	for (const id of ids) {
		if (await safeDelete(endpoint, id, idField)) {
			deleted++;
		}
	}
	return deleted;
}
