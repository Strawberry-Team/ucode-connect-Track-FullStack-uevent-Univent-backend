import {forwardRef, Module} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrderItemsModule } from './order-items/order-items.module';
import { TicketsModule } from '../tickets/tickets.module';
import {CompaniesModule} from "../companies/companies.module";
import {OrdersRepository} from "./orders.repository";
import {DatabaseModule} from "../../db/database.module";
import {UsersModule} from "../users/users.module";

@Module({
    imports: [TicketsModule,
              DatabaseModule,
              forwardRef(() => UsersModule),
              forwardRef(() => OrderItemsModule)],
    controllers: [OrdersController],
    providers: [OrdersService, OrdersRepository],
    exports: [OrdersService, OrdersRepository],
})
export class OrdersModule {}
