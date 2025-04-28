import { TicketStatus,
        Ticket as PrismaTicket} from '@prisma/client';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export const SERIALIZATION_GROUPS = {
    BASIC: ['basic'],
    SYSTEMIC: ['basic', 'systemic'],
};

type TicketWithNumberPrice = Omit<PrismaTicket, 'price'> & {
    price: number;
};

export class Ticket implements TicketWithNumberPrice{
    @ApiProperty({
        description: 'Unique identifier of the ticket',
        nullable: false,
        type: 'number',
        example: 1,
    })
    @Expose({ groups: ['basic'] })
    id: number;

    @ApiProperty({
        description: 'Identifier of the associated event',
        nullable: false,
        type: 'number',
        example: 100,
    })
    @Expose({ groups: ['basic'] })
    eventId: number;

    @ApiProperty({
        description: 'Title of the ticket',
        nullable: false,
        type: 'string',
        example: 'Concert Ticket',
    })
    @Expose({ groups: ['basic'] })
    title: string;

    @ApiProperty({
        description: 'Ticket number in a specific format',
        nullable: false,
        type: 'string',
        example: 'TICKET-1-1744358896023',
    })
    @Expose({ groups: ['basic'] })
    number: string;

    @ApiProperty({
        description: 'Price of the ticket',
        nullable: false,
        type: 'string',
        example: 99.99,
    })
    @Expose({ groups: ['basic'] })
    price: number;

    @ApiProperty({
        description: 'Status of the ticket',
        nullable: false,
        enum: TicketStatus,
        example: TicketStatus.AVAILABLE,
    })
    @Expose({ groups: ['basic'] })
    status: TicketStatus;

    @ApiProperty({
        description: 'Ticket create date',
        nullable: false,
        type: 'string',
        example: '2025-04-08T08:54:45.000Z',
    })
    @Expose({ groups: ['systemic'] })
    createdAt: Date;

    @ApiProperty({
        description: 'Last update of the ticket',
        nullable: false,
        type: 'string',
        example: '2025-04-08T08:54:45.000Z'
    })
    @Expose({ groups: ['systemic'] })
    updatedAt: Date;
}
