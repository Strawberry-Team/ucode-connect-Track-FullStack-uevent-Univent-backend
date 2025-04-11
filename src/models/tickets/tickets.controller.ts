// src/models/events/constants/event.constants.ts
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
    NotImplementedException,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { BaseCrudController } from '../../common/controller/base-crud.controller';
import { UserId } from '../../common/decorators/user.decorator';
import {ApiExcludeEndpoint} from "@nestjs/swagger";

@Controller('tickets')
export class TicketsController extends BaseCrudController<
    Ticket,
    CreateTicketDto,
    UpdateTicketDto
> {
    constructor(private readonly ticketsService: TicketsService) {
        super();
    }


    protected async createEntity(
        dto: CreateTicketDto,
        userId: number,
    ): Promise<Ticket> {
        return this.ticketsService.createTicket(dto, userId);
    }


    protected async findById(id: number, userId: number): Promise<Ticket> {
        return this.ticketsService.findOneTicket(id, userId);
    }

    protected async updateEntity(
        id: number,
        dto: UpdateTicketDto,
        userId: number,
    ): Promise<Ticket> {
        return this.ticketsService.updateTicket(id, dto, userId);
    }

    protected async deleteEntity(id: number, userId: number): Promise<void> {
        await this.ticketsService.deleteTicket(id, userId);
    }


    @Post()
    @ApiExcludeEndpoint()
    // @UseGuards(EventCreatorGuard)//TODO: EventCreatorGuard
    async create(
        @Body() dto: CreateTicketDto,
        @UserId() userId: number,
    ): Promise<Ticket> {
        // throw new NotImplementedException('create tickets is not implemented');
        return super.create(dto, userId);
    }


    @Get()
    @ApiExcludeEndpoint()
    async findAll(
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
    @ApiExcludeEndpoint()
    async findOne(
        @Param('id') id: number,
        @UserId() userId: number,
    ): Promise<Ticket> {
        throw new NotImplementedException('getById tickets is not implemented');
        // return super.getById(id, userId);
    }


    @Patch(':id')
    @ApiExcludeEndpoint()
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
    @ApiExcludeEndpoint()
    // @UseGuards(EventCreatorGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(
        @Param('id') id: number,
        @UserId() userId: number,
    ): Promise<void> {
        throw new NotImplementedException('Delete tickets is not implemented');
        // return super.delete(id, userId);
    }
}
