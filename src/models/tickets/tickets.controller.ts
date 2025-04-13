import {
    Controller,
    Patch,
    Delete,
    Param,
    Body,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { Ticket } from './entities/ticket.entity';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { UserId } from '../../common/decorators/user.decorator';
import {
    ApiOperation,
    ApiParam,
    ApiBody,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import {ApiExcludeEndpoint} from "@nestjs/swagger";

@ApiTags('Tickets')
@Controller('tickets')
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService) {}

    @Patch(':id')
    @ApiOperation({ summary: 'Update ticket data' })
    @ApiParam({
        name: 'id',
        required: true,
        type: Number,
        description: 'Ticket identifier',
        example: 123,
    })
    @ApiBody({
        required: true,
        type: UpdateTicketDto,
        description: 'Ticket update data',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Ticket successfully updated',
        type: Ticket,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error',
    })
    @ApiExcludeEndpoint()
    // @UseGuards(EventCreatorGuard)
    async update(
        @Param('id') id: number,
        @Body() dto: UpdateTicketDto,
        @UserId() userId: number,
    ): Promise<Ticket> {
        return await this.ticketsService.updateTicket(id, dto);
    }


    @Delete(':id')
    @ApiExcludeEndpoint()
    // @UseGuards(EventCreatorGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete ticket' })
    @ApiParam({
        name: 'id',
        required: true,
        type: Number,
        description: 'Ticket identifier',
        example: 123,
    })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'Ticket successfully deleted',
    })
    async remove(
        @Param('id') id: number,
    ): Promise<void> {
        return await this.ticketsService.deleteTicket(id);
    }
}
