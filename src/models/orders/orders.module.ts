import { forwardRef, Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrderItemsModule } from './order-items/order-items.module';
import { TicketsModule } from '../tickets/tickets.module';
import { OrdersRepository } from './orders.repository';
import { DatabaseModule } from '../../db/database.module';
import { UsersModule } from '../users/users.module';
import { PromoCodesModule } from '../promo-codes/promo-codes.module';
import { ConfigModule } from '@nestjs/config';
import appConfig from '../../config/app.config';
import { EmailModule } from '../../email/email.module';

@Module({
    imports: [
        DatabaseModule,
        PromoCodesModule,
        forwardRef(() => UsersModule),
        forwardRef(() => OrderItemsModule),
        forwardRef(() => TicketsModule),
        forwardRef(() => EmailModule),
        ConfigModule.forFeature(appConfig),
    ],
    controllers: [OrdersController],
    providers: [OrdersService, OrdersRepository],
    exports: [OrdersService, OrdersRepository],
})
export class OrdersModule {}
