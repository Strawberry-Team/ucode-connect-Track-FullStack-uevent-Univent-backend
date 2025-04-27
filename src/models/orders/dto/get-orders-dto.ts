import { ApiProperty } from '@nestjs/swagger';

class EventDto {
    @ApiProperty({
        description: 'Unique identifier of the event',
        example: 27,
    })
    id: number;

    @ApiProperty({
        description: 'Title of the event',
        example: 'Monitored',
    })
    title: string;

    @ApiProperty({
        description: 'Start date and time of the event',
        example: '2025-04-29T13:00:00.000Z',
    })
    startedAt: string;

    @ApiProperty({
        description: 'End date and time of the event',
        example: '2025-04-29T15:00:00.000Z',
    })
    endedAt: string;

    @ApiProperty({
        description: 'Venue of the event',
        example: `Ukraine, Kyiv, Architect's house`,
    })
    venue: string;

    @ApiProperty({
        description: 'Name of the event poster image',
        example: 'default-poster.png',
    })
    posterName: string;
}

class TicketDto {
    @ApiProperty({
        description: 'Unique identifier of the ticket',
        example: 1397,
    })
    id: number;

    @ApiProperty({
        description: 'Title of the ticket (e.g., ticket type)',
        example: 'VIP',
    })
    title: string;

    @ApiProperty({
        description: 'Price of the ticket',
        example: 1300.01,
    })
    price: number;

    @ApiProperty({
        description: 'Unique ticket number',
        example: 'TICKET-27-20250419T114317-0d6c7b21',
    })
    number: string;

    @ApiProperty({
        description: 'Event associated with the ticket',
        type: EventDto,
    })
    event: EventDto;
}

class OrderItemDto {
    @ApiProperty({
        description: 'Unique identifier of the order item',
        example: 92,
    })
    id: number;

    @ApiProperty({
        description: 'Final price of the order item',
        example: 1300.01,
    })
    finalPrice: number;

    @ApiProperty({
        description: 'Ticket associated with the order item',
        type: TicketDto,
    })
    ticket: TicketDto;
}

export class OrderDto {
    @ApiProperty({
        description: 'Unique identifier of the order',
        example: 17,
    })
    id: number;

    @ApiProperty({
        description: 'Total amount of the order',
        example: 14993.44,
    })
    totalAmount: number;

    @ApiProperty({
        description: 'Payment status of the order',
        example: 'PENDING',
        enum: ['PENDING', 'SUCCEEDED', 'FAILED', 'CANCELED'],
    })
    paymentStatus: string;

    @ApiProperty({
        description: 'Payment method used for the order',
        example: 'STRIPE',
    })
    paymentMethod: string;

    @ApiProperty({
        description: 'Date and time when the order was created',
        example: '2025-04-19T11:43:32.000Z',
    })
    createdAt: string;

    @ApiProperty({
        description: 'List of items in the order',
        type: [OrderItemDto],
    })
    orderItems: OrderItemDto[];
}
