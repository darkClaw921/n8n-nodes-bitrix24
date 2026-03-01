import { callBitrix24 } from '../helpers/bitrix24-api';

describe('Call Statistic (read-only)', () => {
	it('should get call statistics without filters', async () => {
		const response = await callBitrix24('voximplant.statistic.get', {});

		// result is an array (may be empty if no calls on the portal)
		expect(Array.isArray(response.result)).toBe(true);
	});

	it('should get call statistics with date filter', async () => {
		const response = await callBitrix24('voximplant.statistic.get', {
			FILTER: {
				'>CALL_START_DATE': '2020-01-01T00:00:00',
				'<CALL_START_DATE': new Date().toISOString(),
			},
		});

		expect(Array.isArray(response.result)).toBe(true);

		// If there are results, verify the expected fields exist
		if (response.result.length > 0) {
			const firstCall = response.result[0];
			expect(firstCall.CALL_ID).toBeDefined();
			expect(firstCall.CALL_START_DATE).toBeDefined();
			expect(firstCall.CALL_DURATION).toBeDefined();
		}
	});

	it('should get call statistics with type filter', async () => {
		// CALL_TYPE: 1 = outgoing
		const response = await callBitrix24('voximplant.statistic.get', {
			FILTER: {
				CALL_TYPE: '1',
			},
		});

		expect(Array.isArray(response.result)).toBe(true);

		// If there are results, verify all have the correct CALL_TYPE
		if (response.result.length > 0) {
			for (const call of response.result) {
				expect(String(call.CALL_TYPE)).toBe('1');
			}
		}
	});

	it('should get call statistics with sort', async () => {
		const response = await callBitrix24('voximplant.statistic.get', {
			SORT: 'CALL_START_DATE',
			ORDER: 'DESC',
		});

		expect(Array.isArray(response.result)).toBe(true);
	});
});
