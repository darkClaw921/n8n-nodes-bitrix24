import { callBitrix24, callBitrix24Result } from '../helpers/bitrix24-api';
import { testName, TEST_PREFIX } from '../helpers/test-config';
import { safeDelete } from '../helpers/cleanup';

describe('Department CRUD', () => {
	let departmentId: number;

	/**
	 * The root department ID to use as PARENT.
	 * department.get without filters returns all departments;
	 * we pick the first one as the parent for our test department.
	 */
	let parentId: number;

	beforeAll(async () => {
		// Find an existing department to use as parent
		// (only one top-level department is allowed in Bitrix24)
		const response = await callBitrix24('department.get', {});
		expect(Array.isArray(response.result)).toBe(true);
		expect(response.result.length).toBeGreaterThanOrEqual(1);

		// Use the first department (typically the root/company department)
		parentId = Number(response.result[0].ID);
	}, 60000);

	afterAll(async () => {
		if (departmentId) {
			await safeDelete('department.delete', departmentId);
		}
	});

	it('should create a department', async () => {
		expect(parentId).toBeDefined();

		// Department API uses flat parameters (NOT nested in fields: {})
		const result = await callBitrix24Result('department.add', {
			NAME: testName('Department'),
			SORT: 100,
			PARENT: parentId,
		});

		// department.add returns a number (ID)
		expect(typeof result).toBe('number');
		expect(result).toBeGreaterThan(0);

		departmentId = result;
	});

	it('should get the created department by ID', async () => {
		expect(departmentId).toBeDefined();

		// department.get returns an array (even when filtering by single ID)
		const response = await callBitrix24('department.get', {
			ID: departmentId,
		});

		expect(Array.isArray(response.result)).toBe(true);
		expect(response.result.length).toBe(1);

		const dept = response.result[0];
		expect(dept.NAME).toContain(TEST_PREFIX);
		// ID and PARENT may be returned as strings
		expect(Number(dept.ID)).toBe(departmentId);
		expect(Number(dept.PARENT)).toBe(parentId);
	});

	it('should list departments containing the created one', async () => {
		expect(departmentId).toBeDefined();

		// department.get without ID returns all departments
		const response = await callBitrix24('department.get', {});

		expect(Array.isArray(response.result)).toBe(true);
		expect(response.result.length).toBeGreaterThanOrEqual(1);

		const found = response.result.find(
			(d: { ID: string }) => Number(d.ID) === departmentId,
		);
		expect(found).toBeDefined();
	});

	it('should update the department', async () => {
		expect(departmentId).toBeDefined();

		// Flat parameters (not fields: {})
		const result = await callBitrix24Result('department.update', {
			ID: departmentId,
			NAME: testName('DeptUpdated'),
			SORT: 200,
		});

		// department.update returns true on success
		expect(result).toBe(true);
	});

	it('should verify the department was updated', async () => {
		expect(departmentId).toBeDefined();

		const response = await callBitrix24('department.get', {
			ID: departmentId,
		});

		expect(Array.isArray(response.result)).toBe(true);
		expect(response.result.length).toBe(1);

		const dept = response.result[0];
		expect(dept.NAME).toContain('DeptUpdated');
		expect(Number(dept.SORT)).toBe(200);
	});

	it('should delete the department', async () => {
		expect(departmentId).toBeDefined();

		const result = await callBitrix24Result('department.delete', {
			ID: departmentId,
		});

		// department.delete returns true on success
		expect(result).toBe(true);
	});

	it('should verify the department was deleted', async () => {
		expect(departmentId).toBeDefined();

		const response = await callBitrix24('department.get', {
			ID: departmentId,
		});

		// department.get returns an empty array for a non-existent ID
		expect(Array.isArray(response.result)).toBe(true);
		expect(response.result).toHaveLength(0);

		// Prevent afterAll from trying to delete again
		departmentId = 0;
	});
});
