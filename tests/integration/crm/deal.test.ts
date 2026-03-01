import { callBitrix24, callBitrix24Result } from '../helpers/bitrix24-api';
import { testName, TEST_PREFIX, delay } from '../helpers/test-config';
import { safeDelete } from '../helpers/cleanup';

describe('Deal CRUD', () => {
	let createdId: number;

	afterAll(async () => {
		if (createdId) {
			await safeDelete('crm.deal.delete.json', createdId);
		}
	});

	it('should create a deal', async () => {
		const result = await callBitrix24Result('crm.deal.add.json', {
			fields: {
				TITLE: testName('Deal'),
				STAGE_ID: 'NEW',
				OPPORTUNITY: '10000',
				CURRENCY_ID: 'RUB',
			},
		});

		expect(typeof result).toBe('number');
		expect(result).toBeGreaterThan(0);
		createdId = result;
	});

	it('should get the created deal by ID', async () => {
		expect(createdId).toBeDefined();

		const result = await callBitrix24Result('crm.deal.list.json', {
			filter: { ID: createdId },
			select: ['ID', 'TITLE', 'STAGE_ID', 'OPPORTUNITY', 'CURRENCY_ID'],
		});

		expect(Array.isArray(result)).toBe(true);
		expect(result).toHaveLength(1);
		expect(result[0].TITLE).toContain(TEST_PREFIX);
		expect(result[0].STAGE_ID).toBe('NEW');
		// OPPORTUNITY may be returned as string with decimals
		expect(Number(result[0].OPPORTUNITY)).toBe(10000);
		expect(result[0].CURRENCY_ID).toBe('RUB');
	});

	it('should list deals filtered by TEST_PREFIX', async () => {
		expect(createdId).toBeDefined();

		const response = await callBitrix24('crm.deal.list.json', {
			filter: { '%TITLE': TEST_PREFIX },
			select: ['ID', 'TITLE'],
		});

		expect(Array.isArray(response.result)).toBe(true);
		expect(response.result.length).toBeGreaterThanOrEqual(1);
		expect(typeof response.total).toBe('number');
	});

	it('should update the deal', async () => {
		expect(createdId).toBeDefined();

		const result = await callBitrix24Result('crm.deal.update.json', {
			ID: createdId,
			fields: {
				TITLE: testName('DealUpdated'),
				STAGE_ID: 'PREPARATION',
				OPPORTUNITY: '20000',
			},
		});

		expect(result).toBe(true);
	});

	it('should verify the deal was updated', async () => {
		expect(createdId).toBeDefined();

		const result = await callBitrix24Result('crm.deal.list.json', {
			filter: { ID: createdId },
			select: ['ID', 'TITLE', 'STAGE_ID', 'OPPORTUNITY'],
		});

		expect(Array.isArray(result)).toBe(true);
		expect(result).toHaveLength(1);
		expect(result[0].TITLE).toContain('DealUpdated');
		expect(result[0].STAGE_ID).toBe('PREPARATION');
		expect(Number(result[0].OPPORTUNITY)).toBe(20000);
	});

	it('should delete the deal', async () => {
		expect(createdId).toBeDefined();

		const result = await callBitrix24Result('crm.deal.delete.json', {
			ID: createdId,
		});

		expect(result).toBe(true);
	});

	it('should verify the deal was deleted', async () => {
		expect(createdId).toBeDefined();

		const result = await callBitrix24Result('crm.deal.list.json', {
			filter: { ID: createdId },
			select: ['ID'],
		});

		expect(Array.isArray(result)).toBe(true);
		expect(result).toHaveLength(0);

		// Prevent afterAll from trying to delete again
		createdId = 0;
	});
});
