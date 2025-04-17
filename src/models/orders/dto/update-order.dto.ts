import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus } from '@prisma/client';
import { IsEnumValue } from '../../../common/validators/enum.validator';

export class UpdateOrderDto {
    @ApiPropertyOptional({
        description: 'Payment status of the orders',
        enum: PaymentStatus,
        example: PaymentStatus.PAID,
    })
    @IsEnumValue(PaymentStatus, true)
    paymentStatus?: PaymentStatus;
}
