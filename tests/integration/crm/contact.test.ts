import { callBitrix24, callBitrix24Result } from '../helpers/bitrix24-api';
import { testName, TEST_PREFIX, delay } from '../helpers/test-config';
import { safeDelete } from '../helpers/cleanup';

describe('Contact CRUD', () => {
	let createdId: number;

	afterAll(async () => {
		if (createdId) {
			await safeDelete('crm.contact.delete.json', createdId);
		}
	});

	it('should create a contact with phone and email', async () => {
		const result = await callBitrix24Result('crm.contact.add.json', {
			fields: {
				NAME: testName('Contact'),
				LAST_NAME: 'TestLastName',
				PHONE: [{ VALUE: '+71234567890', VALUE_TYPE: 'WORK' }],
				EMAIL: [{ VALUE: 'test@example.com', VALUE_TYPE: 'WORK' }],
			},
		});

		expect(typeof result).toBe('number');
		expect(result).toBeGreaterThan(0);
		createdId = result;
	});

	it('should get the created contact by ID with communication fields', async () => {
		expect(createdId).toBeDefined();

		const result = await callBitrix24Result('crm.contact.list.json', {
			filter: { ID: createdId },
			select: ['ID', 'NAME', 'LAST_NAME', 'PHONE', 'EMAIL'],
		});

		expect(Array.isArray(result)).toBe(true);
		expect(result).toHaveLength(1);

		const contact = result[0];
		expect(contact.NAME).toContain(TEST_PREFIX);
		expect(contact.LAST_NAME).toBe('TestLastName');

		// PHONE is an array of { ID, VALUE, VALUE_TYPE } objects
		expect(Array.isArray(contact.PHONE)).toBe(true);
		expect(contact.PHONE.length).toBeGreaterThanOrEqual(1);
		const workPhone = contact.PHONE.find(
			(p: any) => p.VALUE === '+71234567890',
		);
		expect(workPhone).toBeDefined();
		expect(workPhone.VALUE_TYPE).toBe('WORK');

		// EMAIL is an array of { ID, VALUE, VALUE_TYPE } objects
		expect(Array.isArray(contact.EMAIL)).toBe(true);
		expect(contact.EMAIL.length).toBeGreaterThanOrEqual(1);
		const workEmail = contact.EMAIL.find(
			(e: any) => e.VALUE === 'test@example.com',
		);
		expect(workEmail).toBeDefined();
	});

	it('should list contacts filtered by TEST_PREFIX', async () => {
		expect(createdId).toBeDefined();

		const response = await callBitrix24('crm.contact.list.json', {
			filter: { '%NAME': TEST_PREFIX },
			select: ['ID', 'NAME'],
		});

		expect(Array.isArray(response.result)).toBe(true);
		expect(response.result.length).toBeGreaterThanOrEqual(1);
		expect(typeof response.total).toBe('number');
	});

	it('should update the contact with a second phone number', async () => {
		expect(createdId).toBeDefined();

		// Bitrix24 replaces the entire PHONE array on update,
		// so we must include all phone numbers (old + new)
		const result = await callBitrix24Result('crm.contact.update.json', {
			ID: createdId,
			fields: {
				NAME: testName('ContactUpdated'),
				PHONE: [
					{ VALUE: '+71234567890', VALUE_TYPE: 'WORK' },
					{ VALUE: '+79876543210', VALUE_TYPE: 'MOBILE' },
				],
			},
		});

		expect(result).toBe(true);
	});

	it('should verify the contact was updated with two phone numbers', async () => {
		expect(createdId).toBeDefined();

		const result = await callBitrix24Result('crm.contact.list.json', {
			filter: { ID: createdId },
			select: ['ID', 'NAME', 'PHONE'],
		});

		expect(Array.isArray(result)).toBe(true);
		expect(result).toHaveLength(1);

		const contact = result[0];
		expect(contact.NAME).toContain('ContactUpdated');

		// Should have 2 phone entries
		expect(Array.isArray(contact.PHONE)).toBe(true);
		expect(contact.PHONE.length).toBeGreaterThanOrEqual(2);

		const workPhone = contact.PHONE.find(
			(p: any) => p.VALUE_TYPE === 'WORK',
		);
		const mobilePhone = contact.PHONE.find(
			(p: any) => p.VALUE_TYPE === 'MOBILE',
		);
		expect(workPhone).toBeDefined();
		expect(workPhone.VALUE).toBe('+71234567890');
		expect(mobilePhone).toBeDefined();
		expect(mobilePhone.VALUE).toBe('+79876543210');
	});

	it('should delete the contact', async () => {
		expect(createdId).toBeDefined();

		const result = await callBitrix24Result('crm.contact.delete.json', {
			ID: createdId,
		});

		expect(result).toBe(true);
	});

	it('should verify the contact was deleted', async () => {
		expect(createdId).toBeDefined();

		const result = await callBitrix24Result('crm.contact.list.json', {
			filter: { ID: createdId },
			select: ['ID'],
		});

		expect(Array.isArray(result)).toBe(true);
		expect(result).toHaveLength(0);

		// Prevent afterAll from trying to delete again
		createdId = 0;
	});
});
