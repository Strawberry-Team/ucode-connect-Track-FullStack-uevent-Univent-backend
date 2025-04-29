// src/payment/stripe/stripe.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { OrdersModule } from '../../models/orders/orders.module';
import { UsersService } from '../../models/users/users.service';
import { UsersRepository } from '../../models/users/users.repository';
import paymentConfig from '../../config/payment.config';
import { UsersModule } from '../../models/users/users.module';
import appConfig from '../../config/app.config';

@Module({
    imports: [
        ConfigModule,
        forwardRef(() => OrdersModule),
        forwardRef(() => UsersModule),
        ConfigModule.forFeature(paymentConfig),
    ],
    controllers: [StripeController],
    providers: [StripeService],
    exports: [StripeService],
})
export class StripeModule {}
