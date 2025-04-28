import {
    Body,
    Controller,
    Delete,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { Ticket } from './entities/ticket.entity';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { UserId } from '../../common/decorators/user.decorator';
import {
    ApiBearerAuth,
    ApiBody,
    ApiExcludeEndpoint,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { VerifyTicketDto } from './dto/verify-ticket.dto';

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
        description: 'Ticket ID',
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
        description: 'Ticket ID',
        example: 123,
    })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'Ticket successfully deleted',
    })
    async remove(@Param('id') id: number): Promise<void> {
        return await this.ticketsService.deleteTicket(id);
    }

    @Post('verify')
    // @UseGuards(StaffGuard) // TODO: Protect this endpoint with Guard for personnel/API keys
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Verify a ticket using its unique number',
    })
    @ApiParam({
        name: 'ticketNumber',
        type: String,
        format: 'uuid',
        description: 'Ticket number in a specific format',
        example: 'TICKET-1-1744358896023',
    })
    @ApiResponse({
        status: 200,
        description: 'Ticket verified successfully. Returns ticket details.',
        type: Ticket,
    })
    @ApiResponse({ status: 404, description: 'Ticket not found.' })
    @ApiResponse({
        status: 422,
        description: 'Cannot check in ticket (e.g., order not completed).',
    })
    async verifyTicket(
        @Body() verifyTicketDto: VerifyTicketDto,
    ): Promise<Ticket> {
        return await this.ticketsService.verifyTicket(verifyTicketDto);
    }
}
