import { callBitrix24, callBitrix24Result } from '../helpers/bitrix24-api';
import { testName, TEST_PREFIX } from '../helpers/test-config';

describe('Smart Process Type CRUD', () => {
	/**
	 * Internal ID of the created Smart Process Type (used for get/update/delete).
	 */
	let typeId: number;

	/**
	 * The entityTypeId assigned by Bitrix24 (auto-assigned >= 128).
	 */
	let entityTypeId: number;

	afterAll(async () => {
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

	it('should create a smart process type', async () => {
		const result = await callBitrix24Result('crm.type.add', {
			fields: {
				title: testName('SPType'),
				isStagesEnabled: 'Y',
				isCategoriesEnabled: 'N',
				isClientEnabled: 'Y',
				isAutomationEnabled: 'N',
			},
		});

		// result.type is an object with id, entityTypeId, title, etc.
		expect(result.type).toBeDefined();
		expect(typeof result.type.id).toBe('number');
		expect(result.type.id).toBeGreaterThan(0);
		expect(typeof result.type.entityTypeId).toBe('number');
		expect(result.type.entityTypeId).toBeGreaterThanOrEqual(128);
		expect(result.type.title).toContain(TEST_PREFIX);

		typeId = result.type.id;
		entityTypeId = result.type.entityTypeId;
	});

	it('should get the created type by ID', async () => {
		expect(typeId).toBeDefined();

		const result = await callBitrix24Result('crm.type.get', {
			id: typeId,
		});

		// result.type contains the type object
		expect(result.type).toBeDefined();
		expect(result.type.id).toBe(typeId);
		expect(result.type.entityTypeId).toBe(entityTypeId);
		expect(result.type.title).toContain(TEST_PREFIX);
		expect(result.type.isStagesEnabled).toBe('Y');
		expect(result.type.isCategoriesEnabled).toBe('N');
		expect(result.type.isClientEnabled).toBe('Y');
		expect(result.type.isAutomationEnabled).toBe('N');
	});

	it('should list smart process types', async () => {
		expect(typeId).toBeDefined();

		const result = await callBitrix24Result('crm.type.list', {});

		// result.types is an array
		expect(result.types).toBeDefined();
		expect(Array.isArray(result.types)).toBe(true);
		expect(result.types.length).toBeGreaterThanOrEqual(1);

		const found = result.types.find(
			(t: { id: number }) => t.id === typeId,
		);
		expect(found).toBeDefined();
	});

	it('should update the smart process type', async () => {
		expect(typeId).toBeDefined();

		const result = await callBitrix24Result('crm.type.update', {
			id: typeId,
			fields: {
				title: testName('SPTypeUpdated'),
				isAutomationEnabled: 'Y',
			},
		});

		// result.type contains the updated type object
		expect(result.type).toBeDefined();
	});

	it('should verify the type was updated', async () => {
		expect(typeId).toBeDefined();

		const result = await callBitrix24Result('crm.type.get', {
			id: typeId,
		});

		expect(result.type).toBeDefined();
		expect(result.type.id).toBe(typeId);
		expect(result.type.title).toContain('SPTypeUpdated');
		expect(result.type.isAutomationEnabled).toBe('Y');
	});

	it('should delete the smart process type', async () => {
		expect(typeId).toBeDefined();

		const response = await callBitrix24('crm.type.delete', {
			id: typeId,
		});

		// crm.type.delete returns result as empty or null
		expect(response).toBeDefined();
	});

	it('should verify the type was deleted', async () => {
		expect(typeId).toBeDefined();

		// crm.type.get for a deleted type should throw NOT_FOUND
		await expect(
			callBitrix24Result('crm.type.get', {
				id: typeId,
			}),
		).rejects.toThrow();

		// Prevent afterAll from trying to delete again
		typeId = 0;
	});
});
