import { callBitrix24, callBitrix24Result } from '../helpers/bitrix24-api';
import { testName, TEST_PREFIX } from '../helpers/test-config';
import { safeDelete } from '../helpers/cleanup';

describe('Status CRUD', () => {
	let categoryId: number;
	let entityId: string;
	let statusId: number;

	beforeAll(async () => {
		// Create a Deal category to hold statuses
		const catResult = await callBitrix24Result('crm.category.add', {
			entityTypeId: 2,
			fields: {
				name: testName('StatusTestCat'),
				sort: 500,
			},
		});

		expect(catResult.category).toBeDefined();
		expect(catResult.category.id).toBeGreaterThan(0);

		categoryId = catResult.category.id;
		// Status ENTITY_ID format for non-default Deal categories: DEAL_STAGE_{categoryId}
		entityId = `DEAL_STAGE_${categoryId}`;
	}, 60000);

	afterAll(async () => {
		// Clean up status first, then category
		if (statusId) {
			await safeDelete('crm.status.delete', statusId, 'id');
		}
		if (categoryId) {
			// crm.category.delete requires entityTypeId
			try {
				await callBitrix24('crm.category.delete', {
					entityTypeId: 2,
					id: categoryId,
				});
			} catch (error) {
				console.warn(
					`Cleanup warning: failed to delete category id=${categoryId}:`,
					(error as Error).message,
				);
			}
		}
	}, 60000);

	it('should create a status', async () => {
		expect(entityId).toBeDefined();

		// STATUS_ID must be short (Bitrix24 limit), use a compact unique code
		const shortId = `T${Date.now() % 100000}`;
		const result = await callBitrix24Result('crm.status.add', {
			fields: {
				ENTITY_ID: entityId,
				STATUS_ID: shortId,
				NAME: testName('StatusName'),
				SORT: 10,
				COLOR: '#FF0000',
			},
		});

		// crm.status.add returns a number (ID)
		expect(typeof result).toBe('number');
		expect(result).toBeGreaterThan(0);

		statusId = result;
	});

	it('should get the created status by ID', async () => {
		expect(statusId).toBeDefined();

		const result = await callBitrix24Result('crm.status.get', {
			id: statusId,
		});

		// crm.status.get returns flat object with uppercase fields
		expect(result).toBeDefined();
		expect(result.NAME).toContain(TEST_PREFIX);
		expect(result.ENTITY_ID).toBe(entityId);
		expect(result.COLOR).toBe('#FF0000');
	});

	it('should list statuses for the category', async () => {
		expect(statusId).toBeDefined();

		const response = await callBitrix24('crm.status.list', {
			filter: { ENTITY_ID: entityId },
		});

		// crm.status.list returns flat array in result
		expect(Array.isArray(response.result)).toBe(true);
		expect(response.result.length).toBeGreaterThanOrEqual(1);

		const found = response.result.find(
			(s: { ID: string }) => String(s.ID) === String(statusId),
		);
		expect(found).toBeDefined();
	});

	it('should update the status', async () => {
		expect(statusId).toBeDefined();

		const result = await callBitrix24Result('crm.status.update', {
			id: statusId,
			fields: {
				NAME: testName('StatusUpdated'),
				COLOR: '#00FF00',
			},
		});

		// crm.status.update returns true on success
		expect(result).toBe(true);
	});

	it('should verify the status was updated', async () => {
		expect(statusId).toBeDefined();

		const result = await callBitrix24Result('crm.status.get', {
			id: statusId,
		});

		expect(result).toBeDefined();
		expect(result.NAME).toContain('StatusUpdated');
		expect(result.COLOR).toBe('#00FF00');
	});

	it('should delete the status', async () => {
		expect(statusId).toBeDefined();

		const result = await callBitrix24Result('crm.status.delete', {
			id: statusId,
		});

		// crm.status.delete returns true on success
		expect(result).toBe(true);
	});

	it('should verify the status was deleted', async () => {
		expect(statusId).toBeDefined();

		// crm.status.get for a deleted status should throw
		await expect(
			callBitrix24Result('crm.status.get', {
				id: statusId,
			}),
		).rejects.toThrow();

		// Prevent afterAll from trying to delete again
		statusId = 0;
	});
});
