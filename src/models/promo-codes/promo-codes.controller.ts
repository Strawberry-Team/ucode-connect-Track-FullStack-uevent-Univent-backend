// src/models/promo-codes/promo-codes.controller.ts
import {
    Controller,
    Get,
    Body,
    Patch,
    Param,
    UseGuards,
    HttpStatus,
} from '@nestjs/common';
import { PromoCodesService } from './promo-codes.service';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';
import { PromoCode } from './entities/promo-code.entity';
import { JwtAuthGuard } from '../auth/guards/auth.guards';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('promo-codes')
@UseGuards(JwtAuthGuard)
export class PromoCodesController {
    constructor(private readonly promoCodesService: PromoCodesService) {}

    @Get(':id')
    @ApiOperation({ summary: 'Get promo code by ID' })
    @ApiParam({
        name: 'id',
        required: true,
        type: Number,
        description: 'Promo code identifier',
        example: 1,
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successfully retrieved promo code',
        type: PromoCode,
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Promo code not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Promo code not found',
                },
                error: {
                    type: 'string',
                    description: 'Error type',
                    example: 'Not Found',
                },
                statusCode: {
                    type: 'number',
                    description: 'HTTP status code',
                    example: 404,
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Unauthorized',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 401,
                },
            },
        },
    })
    async findOne(@Param('id') id: number): Promise<PromoCode> {
        return await this.promoCodesService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update promo code' })
    @ApiParam({
        name: 'id',
        required: true,
        type: Number,
        description: 'Promo code identifier',
        example: 1,
    })
    @ApiBody({
        required: true,
        type: UpdatePromoCodeDto,
        description: 'Promo code update data',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Promo code successfully updated',
        type: PromoCode,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'array',
                    description: 'Error messages',
                    example: [
                        'title must be shorter than or equal to 100 characters',
                    ],
                },
                error: {
                    type: 'string',
                    description: 'Error type',
                    example: 'Bad Request',
                },
                statusCode: {
                    type: 'number',
                    description: 'HTTP status code',
                    example: 400,
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Unauthorized',
                },
                statusCode: {
                    type: 'number',
                    description: 'Error code',
                    example: 401,
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Promo code not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Promo code not found',
                },
                error: {
                    type: 'string',
                    description: 'Error type',
                    example: 'Not Found',
                },
                statusCode: {
                    type: 'number',
                    description: 'HTTP status code',
                    example: 404,
                },
            },
        },
    })
    async update(
        @Param('id') id: number,
        @Body() dto: UpdatePromoCodeDto,
    ): Promise<PromoCode> {
        return await this.promoCodesService.update(id, dto);
    }
}
