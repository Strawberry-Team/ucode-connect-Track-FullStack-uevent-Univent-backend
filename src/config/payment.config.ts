// src/config/payment.config.ts
import * as dotenv from 'dotenv';
import { validateEnv } from '../common/utils/env.utils';

dotenv.config({ path: '.env.development' });

export default () => {
    return {
        payment: {
            stripe: {
                secretKey: String(validateEnv('STRIPE_SECRET_KEY')),
                publishableKey: String(validateEnv('STRIPE_PUBLISHABLE_KEY')),
                apiVersion: '2025-03-31.basil',
            },
        },
    };
};
