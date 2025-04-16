// src/models/promo-codes/promo-codes.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { PromoCodesService } from './promo-codes.service';
import { PromoCodesController } from './promo-codes.controller';
import { PromoCodesRepository } from './promo-codes.repository';
import { HashingPromoCodesService } from './hashing-promo-codes.service';
import { HashingService } from '../../common/services/hashing.service';
import { UsersModule } from '../users/users.module';
import { EventsModule } from '../events/events.module';

@Module({
    imports: [forwardRef(() => UsersModule), forwardRef(() => EventsModule)],    controllers: [PromoCodesController],
    providers: [
        PromoCodesService,
        PromoCodesRepository,
        HashingPromoCodesService,
        HashingService,
    ],
    exports: [PromoCodesService],
})
export class PromoCodesModule {}
