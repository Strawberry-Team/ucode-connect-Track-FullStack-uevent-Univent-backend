import {
    Controller,
    Patch,
    Delete,
    Param,
    Body,
    HttpCode,
    HttpStatus,
    Post,
    NotFoundException,
    BadRequestException,
    UnprocessableEntityException, ConflictException, InternalServerErrorException,
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
    ApiTags, ApiBearerAuth,
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
    async remove(
        @Param('id') id: number,
    ): Promise<void> {
        return await this.ticketsService.deleteTicket(id);
    }

    @Post('check-in')
    // @UseGuards(StaffGuard) // <--- !!! ВАЖНО: Защитить этот эндпоинт Guard'ом для персонала/API ключей !!!
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Check-in a ticket using its unique number (file key)' })
    @ApiParam({ name: 'ticketNumber', description: 'The unique UUID (ticketFileKey) of the ticket to check in', type: String, format: 'uuid' })
    @ApiResponse({ status: 200, description: 'Ticket checked in successfully. Returns ticket details.', type: Ticket })
    @ApiResponse({ status: 404, description: 'Ticket not found.' })
    @ApiResponse({ status: 422, description: 'Cannot check in ticket (e.g., order not completed).' })
    @ApiResponse({ status: 409, description: 'Ticket already checked in.' })
    @ApiResponse({ status: 401, description: 'Unauthorized (Missing or invalid staff credentials/token).' })
    @ApiResponse({ status: 500, description: 'Internal server error during check-in.' })
    async checkInTicket(
        @Body('ticketNumber') ticketNumber: string,
    ): Promise<Ticket> {
        if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(ticketNumber)) {
            throw new BadRequestException('Invalid ticket number format.');
        }

        try {
            const checkedInTicket = await this.ticketsService.checkInTicket(ticketNumber);
            return checkedInTicket;
        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof UnprocessableEntityException ||
                error instanceof ConflictException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }
            throw new InternalServerErrorException('An unexpected error occurred during check-in.');
        }
    }
}
