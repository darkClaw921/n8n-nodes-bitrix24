import { callBitrix24, callBitrix24Result } from '../helpers/bitrix24-api';
import { testName, TEST_PREFIX, delay } from '../helpers/test-config';
import { safeDelete } from '../helpers/cleanup';

describe('Company CRUD', () => {
	let createdId: number;

	afterAll(async () => {
		if (createdId) {
			await safeDelete('crm.company.delete.json', createdId);
		}
	});

	it('should create a company', async () => {
		const result = await callBitrix24Result('crm.company.add.json', {
			fields: {
				TITLE: testName('Company'),
				COMPANY_TYPE: 'CUSTOMER',
			},
		});

		expect(typeof result).toBe('number');
		expect(result).toBeGreaterThan(0);
		createdId = result;
	});

	it('should get the created company by ID', async () => {
		expect(createdId).toBeDefined();

		const result = await callBitrix24Result('crm.company.list.json', {
			filter: { ID: createdId },
			select: ['ID', 'TITLE', 'COMPANY_TYPE'],
		});

		expect(Array.isArray(result)).toBe(true);
		expect(result).toHaveLength(1);
		expect(result[0].TITLE).toContain(TEST_PREFIX);
		expect(result[0].COMPANY_TYPE).toBe('CUSTOMER');
	});

	it('should list companies filtered by TEST_PREFIX', async () => {
		expect(createdId).toBeDefined();

		const response = await callBitrix24('crm.company.list.json', {
			filter: { '%TITLE': TEST_PREFIX },
			select: ['ID', 'TITLE'],
		});

		expect(Array.isArray(response.result)).toBe(true);
		expect(response.result.length).toBeGreaterThanOrEqual(1);
		expect(typeof response.total).toBe('number');
	});

	it('should update the company', async () => {
		expect(createdId).toBeDefined();

		const result = await callBitrix24Result('crm.company.update.json', {
			ID: createdId,
			fields: {
				TITLE: testName('CompanyUpdated'),
				COMPANY_TYPE: 'SUPPLIER',
			},
		});

		expect(result).toBe(true);
	});

	it('should verify the company was updated', async () => {
		expect(createdId).toBeDefined();

		const result = await callBitrix24Result('crm.company.list.json', {
			filter: { ID: createdId },
			select: ['ID', 'TITLE', 'COMPANY_TYPE'],
		});

		expect(Array.isArray(result)).toBe(true);
		expect(result).toHaveLength(1);
		expect(result[0].TITLE).toContain('CompanyUpdated');
		expect(result[0].COMPANY_TYPE).toBe('SUPPLIER');
	});

	it('should delete the company', async () => {
		expect(createdId).toBeDefined();

		const result = await callBitrix24Result('crm.company.delete.json', {
			ID: createdId,
		});

		expect(result).toBe(true);
	});

	it('should verify the company was deleted', async () => {
		expect(createdId).toBeDefined();

		const result = await callBitrix24Result('crm.company.list.json', {
			filter: { ID: createdId },
			select: ['ID'],
		});

		expect(Array.isArray(result)).toBe(true);
		expect(result).toHaveLength(0);

		// Prevent afterAll from trying to delete again
		createdId = 0;
	});
});
