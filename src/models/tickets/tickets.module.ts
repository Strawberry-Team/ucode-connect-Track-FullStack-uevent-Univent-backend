// src/models/events/constants/event.constants.ts
import { forwardRef, Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsRepository } from './tickets.repository';
import { TicketsController } from './tickets.controller';
import { UsersModule } from '../users/users.module';
import { CompaniesModule } from '../companies/companies.module';
import { EventsModule } from '../events/events.module';
import { ConfigModule } from '@nestjs/config';
import storageConfig from '../../config/storage.config';
import { OrderItemsModule } from '../orders/order-items/order-items.module';
import { TicketGenerationService } from './ticket-generation.service';
import appConfig from '../../config/app.config';

@Module({
    imports: [
        forwardRef(() => UsersModule),
        forwardRef(() => CompaniesModule),
        forwardRef(() => EventsModule),
        forwardRef(() => OrderItemsModule),
        ConfigModule.forFeature(storageConfig),
        ConfigModule.forFeature(appConfig),
    ],
    controllers: [TicketsController],
    providers: [TicketsService, TicketsRepository, TicketsController, TicketGenerationService],
    exports: [TicketsService, TicketsRepository, TicketGenerationService],
})
export class TicketsModule {}
