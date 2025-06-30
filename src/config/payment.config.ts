// src/config/payment.config.ts
import * as dotenv from 'dotenv';
import { validateEnv } from '../common/utils/env.utils';

// Dynamically load the configuration based on NODE_ENV
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

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
