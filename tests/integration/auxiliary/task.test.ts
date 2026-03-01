import { callBitrix24, callBitrix24Result } from '../helpers/bitrix24-api';
import { testName, TEST_PREFIX, delay } from '../helpers/test-config';
import { safeDelete } from '../helpers/cleanup';

describe('Task CRUD', () => {
	let taskId: number;

	afterAll(async () => {
		if (taskId) {
			await safeDelete('tasks.task.delete', taskId, 'taskId');
		}
	});

	it('should create a task', async () => {
		const result = await callBitrix24Result('tasks.task.add', {
			fields: {
				TITLE: testName('Task'),
				RESPONSIBLE_ID: 1, // admin/webhook owner
				CREATED_BY: 1, // must match webhook user for delete permissions
				DESCRIPTION: 'Integration test task',
				PRIORITY: '1', // medium
			},
		});

		// tasks.task.add returns result.task with id
		expect(result.task).toBeDefined();
		expect(result.task.id).toBeDefined();
		expect(Number(result.task.id)).toBeGreaterThan(0);

		taskId = Number(result.task.id);
	});

	it('should get the created task by ID', async () => {
		expect(taskId).toBeDefined();

		const result = await callBitrix24Result('tasks.task.get', {
			taskId,
		});

		// tasks.task.get returns result.task
		expect(result.task).toBeDefined();
		expect(Number(result.task.id)).toBe(taskId);
		// Response fields are camelCase: title, responsibleId
		expect(result.task.title).toContain(TEST_PREFIX);
		// responsibleId may be string or number
		expect(Number(result.task.responsibleId)).toBe(1);
	});

	it('should list tasks containing the created one', async () => {
		expect(taskId).toBeDefined();

		const result = await callBitrix24Result('tasks.task.list', {
			filter: { ID: taskId },
			select: ['ID', 'TITLE', 'PRIORITY'],
		});

		// tasks.task.list returns result.tasks (array)
		expect(result.tasks).toBeDefined();
		expect(Array.isArray(result.tasks)).toBe(true);
		expect(result.tasks.length).toBeGreaterThanOrEqual(1);

		const found = result.tasks.find(
			(t: { id: string }) => Number(t.id) === taskId,
		);
		expect(found).toBeDefined();
	});

	it('should update the task', async () => {
		expect(taskId).toBeDefined();

		// Extra delay before update to avoid rate limiting
		await delay(2000);

		const result = await callBitrix24Result('tasks.task.update', {
			taskId,
			fields: {
				TITLE: testName('TaskUpdated'),
				PRIORITY: '2', // high
			},
		});

		// tasks.task.update returns result.task (boolean true or object)
		expect(result).toBeDefined();
	}, 60000);

	it('should verify the task was updated', async () => {
		expect(taskId).toBeDefined();

		const result = await callBitrix24Result('tasks.task.get', {
			taskId,
		});

		expect(result.task).toBeDefined();
		expect(result.task.title).toContain('TaskUpdated');
		expect(String(result.task.priority)).toBe('2');
	}, 60000);

	it('should delete the task', async () => {
		expect(taskId).toBeDefined();

		const result = await callBitrix24Result('tasks.task.delete', {
			taskId,
		});

		// tasks.task.delete returns result.task = true
		expect(result).toBeDefined();
	});

	it('should verify the task was deleted', async () => {
		expect(taskId).toBeDefined();

		// tasks.task.get for a deleted task returns empty array
		const result = await callBitrix24Result('tasks.task.get', {
			taskId,
		});

		// Bitrix24 returns empty array for deleted tasks
		expect(Array.isArray(result) && result.length === 0).toBe(true);

		// Prevent afterAll from trying to delete again
		taskId = 0;
	});
});
