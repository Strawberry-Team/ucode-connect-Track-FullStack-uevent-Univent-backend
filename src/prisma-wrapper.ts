import * as dotenv from 'dotenv';
import * as path from 'path';
import { execSync } from 'child_process';

dotenv.config({ path: path.resolve(__dirname, '../.env.development') });

const args = process.argv.slice(2).join(' ');

try {
    execSync(`npx prisma ${args}`, { stdio: 'inherit' });
} catch (error) {
    console.error('Ошибка выполнения команды Prisma:', error);
    process.exit(1);
}
