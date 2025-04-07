// src/tickets/tickets.service.ts
import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { TicketsRepository } from './tickets.repository';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket, TicketStatus } from './entities/ticket.entity';

@Injectable()
export class TicketsService {
    constructor(private readonly ticketsRepository: TicketsRepository) { }

    async create(
        createTicketDto: CreateTicketDto,
        userId: number,
    ): Promise<Ticket> {
        const existingTicket = await this.ticketsRepository.findByNumber(
            createTicketDto.number,
        );

        if (existingTicket) {
            throw new ConflictException(
                `A ticket with the number ${createTicketDto.number} already exists`,
            );
        }

        return this.ticketsRepository.create(createTicketDto);
    }

    async findAll(params?: {
        //TODO: Remove pagination for tickets
        page?: number;
        limit?: number;
        eventId?: number;
        status?: TicketStatus;
    }): Promise<{
        items: Ticket[];
        total: number;
        page: number;
        limit: number;
    }> {
        const { page = 1, limit = 10, eventId, status } = params || {};

        if (page < 1) {
            throw new BadRequestException(
                'The page number must be greater than 0',
            );
        }

        if (limit < 1 || limit > 100) {
            throw new BadRequestException(
                'The limit should be between 1 and 100',
            );
        }

        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            this.ticketsRepository.findAll({
                skip,
                take: limit,
                eventId,
                status,
            }),
            this.ticketsRepository.count({ eventId, status }),
        ]);

        return {
            items,
            total,
            page,
            limit,
        };
    }

    async findOne(id: number, userId?: number): Promise<Ticket> {
        const ticket = await this.ticketsRepository.findOne(id);

        if (!ticket) {
            throw new NotFoundException(`Ticket ID ${id} not found`);
        }

        return ticket;
    }

    async update(
        id: number,
        updateTicketDto: UpdateTicketDto,
        userId: number,
    ): Promise<Ticket> {
        const ticket = await this.findOne(id);

        if (!ticket) {
            throw new NotFoundException(`Ticket ID ${id} not found`);
        }

        return this.ticketsRepository.update(id, updateTicketDto);
    }

    async remove(id: number, userId: number): Promise<void> {
        const ticket = await this.findOne(id);

        if (!ticket) {
            throw new NotFoundException(`Ticket ID ${id} not found`);
        }

        await this.ticketsRepository.remove(id);
    }
}
