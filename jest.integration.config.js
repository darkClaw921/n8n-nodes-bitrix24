/** @type {import('jest').Config} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/tests/integration'],
	testMatch: ['**/*.test.ts'],
	globalSetup: '<rootDir>/tests/integration/setup-global.ts',
	testTimeout: 30000,
	verbose: true,
	// Forced sequential execution (Bitrix24 rate limits)
	maxWorkers: 1,
	transform: {
		'^.+\\.ts$': ['ts-jest', { diagnostics: false }],
	},
};
