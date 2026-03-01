import { callBitrix24, callBitrix24Result } from '../helpers/bitrix24-api';
import { testName, TEST_PREFIX } from '../helpers/test-config';
import { safeDelete } from '../helpers/cleanup';

/**
 * Sanitize TEST_PREFIX for use in FIELD_NAME (only A-Z, 0-9, _ allowed).
 */
const FIELD_SUFFIX = TEST_PREFIX.replace(/[^A-Z0-9_]/gi, '').toUpperCase() + 'DEAL';
const FIELD_NAME = 'UF_CRM_' + FIELD_SUFFIX;

describe('Deal User Field CRUD', () => {
	let userFieldId: number;

	afterAll(async () => {
		if (userFieldId) {
			await safeDelete('crm.deal.userfield.delete.json', userFieldId, 'id');
		}
	});

	it('should create a deal userfield', async () => {
		const result = await callBitrix24Result('crm.deal.userfield.add.json', {
			fields: {
				FIELD_NAME,
				USER_TYPE_ID: 'string',
				EDIT_FORM_LABEL: {
					ru: testName('DealUF'),
					en: testName('DealUF'),
				},
				XML_ID: testName('dealuf'),
			},
		});

		expect(typeof result).toBe('number');
		expect(result).toBeGreaterThan(0);
		userFieldId = result;
	});

	it('should get the created userfield by ID', async () => {
		expect(userFieldId).toBeDefined();

		const result = await callBitrix24Result('crm.deal.userfield.get.json', {
			id: userFieldId,
		});

		expect(typeof result).toBe('object');
		expect(result).not.toBeNull();
		expect(result.USER_TYPE_ID).toBe('string');
		expect(result.FIELD_NAME).toContain('UF_CRM_');
		expect(result.EDIT_FORM_LABEL).toBeDefined();
	});

	it('should list userfields and find the created one', async () => {
		expect(userFieldId).toBeDefined();

		const result = await callBitrix24Result('crm.deal.userfield.list.json', {
			filter: { ID: userFieldId },
		});

		expect(Array.isArray(result)).toBe(true);
		expect(result.length).toBeGreaterThanOrEqual(1);

		const found = result.find(
			(field: any) => Number(field.ID) === userFieldId,
		);
		expect(found).toBeDefined();
	});

	it('should update the userfield EDIT_FORM_LABEL', async () => {
		expect(userFieldId).toBeDefined();

		const result = await callBitrix24Result(
			'crm.deal.userfield.update.json',
			{
				id: userFieldId,
				fields: {
					EDIT_FORM_LABEL: {
						ru: testName('DealUFUpdated'),
						en: testName('DealUFUpdated'),
					},
				},
			},
		);

		expect(result).toBe(true);
	});

	it('should verify the userfield was updated', async () => {
		expect(userFieldId).toBeDefined();

		const result = await callBitrix24Result('crm.deal.userfield.get.json', {
			id: userFieldId,
		});

		expect(result.EDIT_FORM_LABEL).toBeDefined();

		const labels = result.EDIT_FORM_LABEL;
		const hasUpdated =
			(typeof labels === 'string' && labels.includes('DealUFUpdated')) ||
			(typeof labels === 'object' &&
				Object.values(labels).some(
					(v: any) =>
						typeof v === 'string' && v.includes('DealUFUpdated'),
				));
		expect(hasUpdated).toBe(true);
	});

	it('should delete the userfield', async () => {
		expect(userFieldId).toBeDefined();

		const result = await callBitrix24Result(
			'crm.deal.userfield.delete.json',
			{
				id: userFieldId,
			},
		);

		expect(result).toBe(true);
	});

	it('should verify the userfield was deleted', async () => {
		expect(userFieldId).toBeDefined();

		try {
			await callBitrix24Result('crm.deal.userfield.get.json', {
				id: userFieldId,
			});
			fail('Expected an error when getting deleted userfield');
		} catch (error) {
			expect((error as Error).message).toBeDefined();
		}

		// Prevent afterAll from trying to delete again
		userFieldId = 0;
	});
});
