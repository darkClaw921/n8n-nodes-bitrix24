import { callBitrix24, callBitrix24Result } from '../helpers/bitrix24-api';
import { testName, TEST_PREFIX, delay } from '../helpers/test-config';
import { safeDelete } from '../helpers/cleanup';

describe('Product CRUD', () => {
	let createdId: number;

	afterAll(async () => {
		if (createdId) {
			await safeDelete('crm.product.delete.json', createdId);
		}
	});

	it('should create a product', async () => {
		const result = await callBitrix24Result('crm.product.add.json', {
			fields: {
				NAME: testName('Product'),
				PRICE: 1500,
				CURRENCY_ID: 'RUB',
			},
		});

		expect(typeof result).toBe('number');
		expect(result).toBeGreaterThan(0);
		createdId = result;
	});

	it('should get the created product by ID', async () => {
		expect(createdId).toBeDefined();

		const result = await callBitrix24Result('crm.product.list.json', {
			filter: { ID: createdId },
			select: ['ID', 'NAME', 'PRICE', 'CURRENCY_ID'],
		});

		expect(Array.isArray(result)).toBe(true);
		expect(result).toHaveLength(1);
		expect(result[0].NAME).toContain(TEST_PREFIX);
		// PRICE may be returned as string with decimals (e.g. '1500.00')
		expect(Number(result[0].PRICE)).toBe(1500);
		expect(result[0].CURRENCY_ID).toBe('RUB');
	});

	it('should list products filtered by TEST_PREFIX', async () => {
		expect(createdId).toBeDefined();

		const response = await callBitrix24('crm.product.list.json', {
			filter: { '%NAME': TEST_PREFIX },
			select: ['ID', 'NAME'],
		});

		expect(Array.isArray(response.result)).toBe(true);
		expect(response.result.length).toBeGreaterThanOrEqual(1);
		expect(typeof response.total).toBe('number');
	});

	it('should update the product', async () => {
		expect(createdId).toBeDefined();

		const result = await callBitrix24Result('crm.product.update.json', {
			ID: createdId,
			fields: {
				NAME: testName('ProductUpdated'),
				PRICE: 2500,
			},
		});

		expect(result).toBe(true);
	});

	it('should verify the product was updated', async () => {
		expect(createdId).toBeDefined();

		const result = await callBitrix24Result('crm.product.list.json', {
			filter: { ID: createdId },
			select: ['ID', 'NAME', 'PRICE'],
		});

		expect(Array.isArray(result)).toBe(true);
		expect(result).toHaveLength(1);
		expect(result[0].NAME).toContain('ProductUpdated');
		// PRICE may be returned as string with decimals (e.g. '2500.00')
		expect(Number(result[0].PRICE)).toBe(2500);
	});

	it('should delete the product', async () => {
		expect(createdId).toBeDefined();

		const result = await callBitrix24Result('crm.product.delete.json', {
			ID: createdId,
		});

		expect(result).toBe(true);
	});

	it('should verify the product was deleted', async () => {
		expect(createdId).toBeDefined();

		const result = await callBitrix24Result('crm.product.list.json', {
			filter: { ID: createdId },
			select: ['ID'],
		});

		expect(Array.isArray(result)).toBe(true);
		expect(result).toHaveLength(0);

		// Prevent afterAll from trying to delete again
		createdId = 0;
	});
});
