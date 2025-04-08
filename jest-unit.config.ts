import type { Config } from 'jest';
import baseConfig from './jest.config.base';

const config: Config = {
    ...baseConfig,
    displayName: 'unit',
    testMatch: ['<rootDir>/test/unit/**/*.spec.ts'],
    setupFilesAfterEnv: ['<rootDir>/test/unit.setup.ts'],
    // testMatch: ['<rootDir>/src/**/*.spec.ts'],
    maxWorkers: 1,
};

export default config;
