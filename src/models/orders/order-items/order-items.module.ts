import {forwardRef, Module} from '@nestjs/common';
import {OrdersModule} from "../orders.module";
import {OrderItemsRepository} from "./order-items.repository";

@Module({
    imports: [forwardRef(() => OrdersModule)],
    providers: [OrderItemsRepository],
    exports: [OrderItemsRepository],
})
export class OrderItemsModule {}
