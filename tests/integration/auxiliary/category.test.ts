import { callBitrix24, callBitrix24Result } from '../helpers/bitrix24-api';
import { testName, TEST_PREFIX } from '../helpers/test-config';
import { safeDelete } from '../helpers/cleanup';

describe('Category CRUD', () => {
	let categoryId: number;

	afterAll(async () => {
		if (categoryId) {
			// crm.category.delete uses lowercase 'id' parameter
			await safeDelete('crm.category.delete', categoryId, 'id');
		}
	});

	it('should create a category', async () => {
		const result = await callBitrix24Result('crm.category.add', {
			entityTypeId: 2, // Deal
			fields: {
				name: testName('Category'),
				sort: 100,
			},
		});

		// result.category is an object with id, name, sort, entityTypeId
		expect(result.category).toBeDefined();
		expect(typeof result.category.id).toBe('number');
		expect(result.category.id).toBeGreaterThan(0);
		expect(result.category.name).toContain(TEST_PREFIX);
		expect(result.category.entityTypeId).toBe(2);

		categoryId = result.category.id;
	});

	it('should get the created category by ID', async () => {
		expect(categoryId).toBeDefined();

		const result = await callBitrix24Result('crm.category.get', {
			entityTypeId: 2,
			id: categoryId,
		});

		// result.category is the category object
		expect(result.category).toBeDefined();
		expect(result.category.id).toBe(categoryId);
		expect(result.category.name).toContain(TEST_PREFIX);
		expect(result.category.sort).toBe(100);
	});

	it('should list categories for Deal', async () => {
		expect(categoryId).toBeDefined();

		const result = await callBitrix24Result('crm.category.list', {
			entityTypeId: 2,
		});

		// result.categories is an array
		expect(result.categories).toBeDefined();
		expect(Array.isArray(result.categories)).toBe(true);
		expect(result.categories.length).toBeGreaterThanOrEqual(1);

		const found = result.categories.find(
			(cat: { id: number }) => cat.id === categoryId,
		);
		expect(found).toBeDefined();
	});

	it('should update the category', async () => {
		expect(categoryId).toBeDefined();

		const result = await callBitrix24Result('crm.category.update', {
			entityTypeId: 2,
			id: categoryId,
			fields: {
				name: testName('CategoryUpdated'),
				sort: 200,
			},
		});

		// update may return the updated category object or true
		expect(result).toBeDefined();
	});

	it('should verify the category was updated', async () => {
		expect(categoryId).toBeDefined();

		const result = await callBitrix24Result('crm.category.get', {
			entityTypeId: 2,
			id: categoryId,
		});

		expect(result.category).toBeDefined();
		expect(result.category.id).toBe(categoryId);
		expect(result.category.name).toContain('CategoryUpdated');
		expect(result.category.sort).toBe(200);
	});

	it('should delete the category', async () => {
		expect(categoryId).toBeDefined();

		const response = await callBitrix24('crm.category.delete', {
			entityTypeId: 2,
			id: categoryId,
		});

		// crm.category.delete returns result: null on success
		expect(response.result).toBeNull();
	});

	it('should verify the category was deleted', async () => {
		expect(categoryId).toBeDefined();

		// crm.category.get for a deleted category should throw NOT_FOUND
		await expect(
			callBitrix24Result('crm.category.get', {
				entityTypeId: 2,
				id: categoryId,
			}),
		).rejects.toThrow();

		// Prevent afterAll from trying to delete again
		categoryId = 0;
	});
});
