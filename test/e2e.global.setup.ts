import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
import { resolve } from 'path';
import { execSync } from 'child_process';

// Define paths
const envPath = resolve(process.cwd(), '.env');
const testEnvPath = resolve(process.cwd(), '.env.test');

// Load environment variables
function loadEnvironment() {
    // Load main .env with variable expansion
    const mainEnv = dotenv.config({ path: envPath });
    dotenvExpand.expand(mainEnv);

    // Load test-specific env vars with override
    const testEnv = dotenv.config({
        path: testEnvPath,
        override: true
    });
    dotenvExpand.expand(testEnv);

    // Verify we're using test database
    if (!process.env.DB_APP_URL?.includes('_test')) {
        throw new Error('Tests must use a test database! Check your .env.test configuration');
    }
}

// Generate Prisma client - this should be done before any tests run
function generatePrismaClient() {
    try {
        console.log('📦 Generating Prisma client...');
        execSync('npx prisma generate', { stdio: 'inherit' });
        console.log('✅ Prisma client generated successfully');
    } catch (error) {
        console.error('❌ Failed to generate Prisma client:', error);
        process.exit(1);
    }
}

// Reset test database using Prisma migrate
function resetTestDatabase() {
    try {
        console.log('🚀 Setting up test database...');
        execSync('npx prisma migrate reset --force', {
            env: process.env,
            stdio: 'inherit',
        });
        console.log('✅ Test database successfully prepared');
    } catch (error) {
        console.error('❌ Error setting up test database:', error);
        throw error;
    }
}

export default async (): Promise<void> => {
    loadEnvironment();
    resetTestDatabase();
    // generatePrismaClient();
}
