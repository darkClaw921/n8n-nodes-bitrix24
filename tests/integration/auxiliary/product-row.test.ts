import { callBitrix24, callBitrix24Result } from '../helpers/bitrix24-api';
import { testName, TEST_PREFIX } from '../helpers/test-config';
import { safeDelete } from '../helpers/cleanup';

describe('Product Row CRUD', () => {
	let dealId: number;
	let productRowId: number;

	beforeAll(async () => {
		// Create a Deal to serve as the owner of product rows
		const result = await callBitrix24Result('crm.deal.add.json', {
			fields: {
				TITLE: testName('ProdRowDeal'),
				STAGE_ID: 'NEW',
			},
		});

		expect(typeof result).toBe('number');
		expect(result).toBeGreaterThan(0);

		dealId = result;
	}, 60000);

	afterAll(async () => {
		// Clean up product row first, then deal
		if (productRowId) {
			await safeDelete('crm.item.productrow.delete', productRowId, 'id');
		}
		if (dealId) {
			await safeDelete('crm.deal.delete.json', dealId);
		}
	}, 60000);

	it('should create a product row', async () => {
		expect(dealId).toBeDefined();

		const result = await callBitrix24Result('crm.item.productrow.add', {
			fields: {
				ownerId: dealId,
				ownerType: 'D', // Deal
				productName: testName('ProductRow'),
				price: 1000,
				quantity: 2,
				discountSum: 100,
			},
		});

		// result.productRow is an object with id
		expect(result.productRow).toBeDefined();
		expect(typeof result.productRow.id).toBe('number');
		expect(result.productRow.id).toBeGreaterThan(0);
		expect(result.productRow.productName).toContain(TEST_PREFIX);
		expect(Number(result.productRow.quantity)).toBe(2);

		productRowId = result.productRow.id;
	});

	it('should get the created product row by ID', async () => {
		expect(productRowId).toBeDefined();

		const result = await callBitrix24Result('crm.item.productrow.get', {
			id: productRowId,
		});

		// result.productRow contains the product row object
		expect(result.productRow).toBeDefined();
		expect(result.productRow.id).toBe(productRowId);
		expect(result.productRow.productName).toContain(TEST_PREFIX);
		expect(Number(result.productRow.price)).toBe(1000);
		expect(Number(result.productRow.quantity)).toBe(2);
		expect(result.productRow.ownerType).toBe('D');
		expect(Number(result.productRow.ownerId)).toBe(dealId);
	});

	it('should list product rows for the deal', async () => {
		expect(productRowId).toBeDefined();
		expect(dealId).toBeDefined();

		const result = await callBitrix24Result('crm.item.productrow.list', {
			filter: {
				'=ownerType': 'D',
				'=ownerId': dealId,
			},
		});

		// result.productRows is an array
		expect(result.productRows).toBeDefined();
		expect(Array.isArray(result.productRows)).toBe(true);
		expect(result.productRows.length).toBeGreaterThanOrEqual(1);

		const found = result.productRows.find(
			(pr: { id: number }) => pr.id === productRowId,
		);
		expect(found).toBeDefined();
	});

	it('should update the product row', async () => {
		expect(productRowId).toBeDefined();

		const result = await callBitrix24Result('crm.item.productrow.update', {
			id: productRowId,
			fields: {
				productName: testName('ProdRowUpdated'),
				price: 1500,
				quantity: 3,
			},
		});

		// result.productRow contains the updated product row
		expect(result.productRow).toBeDefined();
	});

	it('should verify the product row was updated', async () => {
		expect(productRowId).toBeDefined();

		const result = await callBitrix24Result('crm.item.productrow.get', {
			id: productRowId,
		});

		expect(result.productRow).toBeDefined();
		expect(result.productRow.id).toBe(productRowId);
		expect(result.productRow.productName).toContain('ProdRowUpdated');
		expect(Number(result.productRow.price)).toBe(1500);
		expect(Number(result.productRow.quantity)).toBe(3);
	});

	it('should delete the product row', async () => {
		expect(productRowId).toBeDefined();

		const response = await callBitrix24('crm.item.productrow.delete', {
			id: productRowId,
		});

		// crm.item.productrow.delete returns result: null on success
		expect(response.result).toBeNull();
	});

	it('should verify the product row was deleted', async () => {
		expect(productRowId).toBeDefined();

		// crm.item.productrow.get for a deleted row should throw NOT_FOUND
		await expect(
			callBitrix24Result('crm.item.productrow.get', {
				id: productRowId,
			}),
		).rejects.toThrow();

		// Prevent afterAll from trying to delete again
		productRowId = 0;
	});
});
