// src/models/promo-codes/promo-codes.controller.ts
import {
    Controller,
    Get,
    Body,
    Patch,
    Param,
    UseGuards,
} from '@nestjs/common';
import { PromoCodesService } from './promo-codes.service';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
import { PromoCode } from './entities/promo-code.entity';
import { JwtAuthGuard } from '../auth/guards/auth.guards';

@Controller('promo-codes')
@UseGuards(JwtAuthGuard)
export class PromoCodesController {
    constructor(private readonly promoCodesService: PromoCodesService) {}

    @Get(':id')
    async findOne(@Param('id') id: number): Promise<PromoCode> {
        return await this.promoCodesService.findOne(id);
    }

    @Patch(':id')
    async update(
        @Param('id') id: number,
        @Body() dto: UpdatePromoCodeDto,
    ): Promise<PromoCode> {
        return await this.promoCodesService.update(id, dto);
    }
}
