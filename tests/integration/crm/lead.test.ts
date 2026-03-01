import { callBitrix24, callBitrix24Result } from '../helpers/bitrix24-api';
import { testName, TEST_PREFIX, delay } from '../helpers/test-config';
import { safeDelete } from '../helpers/cleanup';

describe('Lead CRUD', () => {
	let createdId: number;

	afterAll(async () => {
		if (createdId) {
			await safeDelete('crm.lead.delete.json', createdId);
		}
	});

	it('should create a lead', async () => {
		const result = await callBitrix24Result('crm.lead.add.json', {
			fields: {
				TITLE: testName('Lead'),
				NAME: 'Test',
				LAST_NAME: 'Lead',
				STATUS_ID: 'NEW',
			},
		});

		expect(typeof result).toBe('number');
		expect(result).toBeGreaterThan(0);
		createdId = result;
	});

	it('should get the created lead by ID', async () => {
		expect(createdId).toBeDefined();

		const result = await callBitrix24Result('crm.lead.list.json', {
			filter: { ID: createdId },
			select: ['ID', 'TITLE', 'NAME', 'LAST_NAME', 'STATUS_ID'],
		});

		expect(Array.isArray(result)).toBe(true);
		expect(result).toHaveLength(1);
		expect(result[0].TITLE).toContain(TEST_PREFIX);
		expect(result[0].NAME).toBe('Test');
		expect(result[0].LAST_NAME).toBe('Lead');
		expect(result[0].STATUS_ID).toBe('NEW');
	});

	it('should list leads filtered by TEST_PREFIX', async () => {
		expect(createdId).toBeDefined();

		const response = await callBitrix24('crm.lead.list.json', {
			filter: { '%TITLE': TEST_PREFIX },
			select: ['ID', 'TITLE'],
		});

		expect(Array.isArray(response.result)).toBe(true);
		expect(response.result.length).toBeGreaterThanOrEqual(1);
		expect(typeof response.total).toBe('number');
	});

	it('should update the lead', async () => {
		expect(createdId).toBeDefined();

		const result = await callBitrix24Result('crm.lead.update.json', {
			ID: createdId,
			fields: {
				TITLE: testName('LeadUpdated'),
				STATUS_ID: 'IN_PROCESS',
			},
		});

		expect(result).toBe(true);
	});

	it('should verify the lead was updated', async () => {
		expect(createdId).toBeDefined();

		const result = await callBitrix24Result('crm.lead.list.json', {
			filter: { ID: createdId },
			select: ['ID', 'TITLE', 'STATUS_ID'],
		});

		expect(Array.isArray(result)).toBe(true);
		expect(result).toHaveLength(1);
		expect(result[0].TITLE).toContain('LeadUpdated');
		expect(result[0].STATUS_ID).toBe('IN_PROCESS');
	});

	it('should delete the lead', async () => {
		expect(createdId).toBeDefined();

		const result = await callBitrix24Result('crm.lead.delete.json', {
			ID: createdId,
		});

		expect(result).toBe(true);
	});

	it('should verify the lead was deleted', async () => {
		expect(createdId).toBeDefined();

		const result = await callBitrix24Result('crm.lead.list.json', {
			filter: { ID: createdId },
			select: ['ID'],
		});

		expect(Array.isArray(result)).toBe(true);
		expect(result).toHaveLength(0);

		// Prevent afterAll from trying to delete again
		createdId = 0;
	});
});
