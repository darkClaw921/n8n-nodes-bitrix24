import { callBitrix24, callBitrix24Result } from '../helpers/bitrix24-api';
import { testName, TEST_PREFIX } from '../helpers/test-config';
import { safeDelete } from '../helpers/cleanup';

describe('Smart Process Item CRUD', () => {
	/**
	 * Internal ID of the created Smart Process Type (used for crm.type.delete).
	 * This is NOT the same as entityTypeId.
	 */
	let typeId: number;

	/**
	 * The entityTypeId assigned by Bitrix24 when the Smart Process Type is created.
	 * Required for all crm.item.* operations.
	 */
	let entityTypeId: number;

	/**
	 * ID of the created Smart Process Item (used for get/update/delete).
	 */
	let itemId: number;

	beforeAll(async () => {
		// Create a Smart Process Type for testing.
		// entityTypeId is auto-assigned by Bitrix24 (>= 128, even number).
		const result = await callBitrix24Result('crm.type.add', {
			fields: {
				title: testName('SPType'),
			},
		});

		expect(result.type).toBeDefined();
		expect(result.type.entityTypeId).toBeDefined();
		expect(result.type.id).toBeDefined();

		typeId = result.type.id;
		entityTypeId = result.type.entityTypeId;
	}, 60000);

	afterAll(async () => {
		// Safety cleanup: delete the item first (if it still exists)
		if (itemId && entityTypeId) {
			try {
				await callBitrix24('crm.item.delete', {
					entityTypeId,
					id: itemId,
				});
			} catch {
				// Item may already be deleted by the test -- ignore
			}
		}

		// Delete the Smart Process Type.
		// crm.type.delete requires no items attached, so we delete the item first.
		if (typeId) {
			try {
				await callBitrix24('crm.type.delete', { id: typeId });
			} catch (error) {
				console.warn(
					`Cleanup warning: failed to delete SP Type id=${typeId}:`,
					(error as Error).message,
				);
			}
		}
	}, 60000);

	it('should create a smart process item', async () => {
		expect(entityTypeId).toBeDefined();

		const result = await callBitrix24Result('crm.item.add', {
			entityTypeId,
			fields: {
				title: testName('SPItem'),
			},
		});

		// crm.item.add returns { item: { id, title, ... } }
		expect(result.item).toBeDefined();
		expect(result.item.id).toBeDefined();
		expect(typeof result.item.id).toBe('number');
		expect(result.item.id).toBeGreaterThan(0);

		itemId = result.item.id;
	});

	it('should get the created item by ID', async () => {
		expect(itemId).toBeDefined();
		expect(entityTypeId).toBeDefined();

		const result = await callBitrix24Result('crm.item.get', {
			entityTypeId,
			id: itemId,
		});

		// crm.item.get returns { item: { id, title, ... } }
		expect(result.item).toBeDefined();
		expect(result.item.id).toBe(itemId);
		expect(result.item.title).toContain(TEST_PREFIX);
	});

	it('should list items filtered by id', async () => {
		expect(itemId).toBeDefined();
		expect(entityTypeId).toBeDefined();

		const result = await callBitrix24Result('crm.item.list', {
			entityTypeId,
			filter: { '>=id': itemId },
			select: ['id', 'title'],
		});

		// crm.item.list returns { items: [...] }
		expect(result.items).toBeDefined();
		expect(Array.isArray(result.items)).toBe(true);
		expect(result.items.length).toBeGreaterThanOrEqual(1);

		const found = result.items.find(
			(item: { id: number }) => item.id === itemId,
		);
		expect(found).toBeDefined();
	});

	it('should update the item', async () => {
		expect(itemId).toBeDefined();
		expect(entityTypeId).toBeDefined();

		const result = await callBitrix24Result('crm.item.update', {
			entityTypeId,
			id: itemId,
			fields: {
				title: testName('SPItemUpdated'),
			},
		});

		// crm.item.update returns { item: { id, title, ... } }
		expect(result.item).toBeDefined();
		expect(result.item.title).toContain('SPItemUpdated');
	});

	it('should verify the item was updated', async () => {
		expect(itemId).toBeDefined();
		expect(entityTypeId).toBeDefined();

		const result = await callBitrix24Result('crm.item.get', {
			entityTypeId,
			id: itemId,
		});

		expect(result.item).toBeDefined();
		expect(result.item.id).toBe(itemId);
		expect(result.item.title).toContain('SPItemUpdated');
	});

	it('should delete the item', async () => {
		expect(itemId).toBeDefined();
		expect(entityTypeId).toBeDefined();

		const result = await callBitrix24Result('crm.item.delete', {
			entityTypeId,
			id: itemId,
		});

		// crm.item.delete returns an empty array [] on success
		expect(Array.isArray(result)).toBe(true);
		expect(result).toHaveLength(0);
	});

	it('should verify the item was deleted', async () => {
		expect(itemId).toBeDefined();
		expect(entityTypeId).toBeDefined();

		// crm.item.get for a deleted item should throw a NOT_FOUND error
		await expect(
			callBitrix24Result('crm.item.get', {
				entityTypeId,
				id: itemId,
			}),
		).rejects.toThrow();

		// Prevent afterAll from trying to delete the item again
		itemId = 0;
	});
});
