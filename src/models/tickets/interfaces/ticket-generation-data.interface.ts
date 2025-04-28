// src/models/tickets/ticket-generation-data.interface.ts
export interface TicketGenerationData {
    orderItem: {
        id: number;
        ticketId: number;
        orderId: number;
        finalPrice: number;
        createdAt: Date;
        updatedAt: Date;
        ticket: {
            id: number;
            title: string;
            price: number;
            number: string;
            event: {
                id: number;
                title: string;
                startedAt: Date;
                endedAt: Date;
                venue: string;
            }
        };
        order: {
            id: number;
            createdAt: Date;
            user: {
                id: number;
                firstName: string;
                lastName?: string;
                email: string;
            }
        }
    }
}
