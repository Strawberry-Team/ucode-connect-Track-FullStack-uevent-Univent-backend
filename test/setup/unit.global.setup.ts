// test/unit.global.setup.ts
import {loadEnvironment, resetTestDatabase} from './global.setup';

export default async (): Promise<void> => {
    loadEnvironment();
}
