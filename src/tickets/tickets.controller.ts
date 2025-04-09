// src/tickets/tickets.controller.ts
import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Query,
    HttpCode,
    HttpStatus,
    UseGuards,
    NotImplementedException,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { BaseCrudController } from '../common/controller/base-crud.controller';
import { UserId } from '../user/decorators/user.decorator';

@Controller('tickets')
export class TicketsController extends BaseCrudController<
    Ticket,
    CreateTicketDto,
    UpdateTicketDto
> {
    constructor(private readonly ticketsService: TicketsService) {
        super();
    }

    @Get()
    findAll(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('eventId') eventId?: number,
    ) {
        throw new NotImplementedException('findAll tickets is not implemented');
        // return this.ticketsService.findAll({
        //   page: page ? parseInt(page.toString(), 10) : undefined,
        //   limit: limit ? parseInt(limit.toString(), 10) : undefined,
        //   eventId: eventId ? parseInt(eventId.toString(), 10) : undefined,
        //   status,
        // });
    }

    @Get(':id')
    async getById(
        @Param('id') id: number,
        @UserId() userId: number,
    ): Promise<Ticket> {
        throw new NotImplementedException('getById tickets is not implemented');
        // return super.getById(id, userId);
    }

    @Post()
    // @UseGuards(EventCreatorGuard)//TODO: EventCreatorGuard
    async create(
        @Body() dto: CreateTicketDto,
        @UserId() userId: number,
    ): Promise<Ticket> {
        throw new NotImplementedException('create tickets is not implemented');
        // return super.create(dto, userId);
    }

    @Patch(':id')
    // @UseGuards(EventCreatorGuard)
    async update(
        @Param('id') id: number,
        @Body() dto: UpdateTicketDto,
        @UserId() userId: number,
    ): Promise<Ticket> {
        throw new NotImplementedException('update tickets is not implemented');
        // return super.update(id, dto, userId);
    }

    @Delete(':id')
    // @UseGuards(EventCreatorGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(
        @Param('id') id: number,
        @UserId() userId: number,
    ): Promise<void> {
        throw new NotImplementedException('Delete tickets is not implemented');
        // return super.delete(id, userId);
    }

    protected async findById(id: number, userId: number): Promise<Ticket> {
        return this.ticketsService.findOne(id, userId);
    }

    protected async createEntity(
        dto: CreateTicketDto,
        userId: number,
    ): Promise<Ticket> {
        return this.ticketsService.create(dto, userId);
    }

    protected async updateEntity(
        id: number,
        dto: UpdateTicketDto,
        userId: number,
    ): Promise<Ticket> {
        return this.ticketsService.update(id, dto, userId);
    }

    protected async deleteEntity(id: number, userId: number): Promise<void> {
        await this.ticketsService.delete(id, userId);
    }
}
