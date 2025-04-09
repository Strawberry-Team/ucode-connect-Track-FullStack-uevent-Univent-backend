// src/tickets/tickets.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { TicketsRepository } from './tickets.repository';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { generateFakeTicket } from './utils/fake-ticket';
import { plainToInstance } from 'class-transformer';
import { SERIALIZATION_GROUPS } from './entities/ticket.entity';

describe('TicketsService', () => {
    let service: TicketsService;
    let repository: TicketsRepository;

    const fakeTicket: Ticket = generateFakeTicket();
    const fakeCreateTicketDto: CreateTicketDto = {
        eventId: fakeTicket.eventId,
        title: fakeTicket.title,
        number: fakeTicket.number,
        price: fakeTicket.price,
        status: fakeTicket.status,
    };

    const fakeUpdateTicketDto: UpdateTicketDto = {
        title: `Updated ${fakeTicket.title}`,
    };

    const fakeUpdatedTicket: Ticket = {
        ...fakeTicket,
        title: `Updated ${fakeTicket.title}`,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TicketsService,
                {
                    provide: TicketsRepository,
                    useValue: {
                        create: jest.fn().mockResolvedValue(fakeTicket),
                        findAll: jest.fn().mockResolvedValue([]),
                        count: jest.fn().mockResolvedValue(0),
                        findOne: jest.fn().mockResolvedValue(fakeTicket),
                        findByNumber: jest.fn().mockResolvedValue(null),
                        update: jest.fn().mockResolvedValue(fakeUpdatedTicket),
                        delete: jest.fn().mockResolvedValue(undefined),
                    },
                },
            ],
        }).compile();

        service = module.get<TicketsService>(TicketsService);
        repository = module.get<TicketsRepository>(TicketsRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Create Ticket', () => {
        it('Should create a Ticket', async () => {
            jest.spyOn(repository, 'findByNumber').mockResolvedValue(null);
            jest.spyOn(repository, 'create').mockResolvedValue(fakeTicket);

            const result = await service.create(fakeCreateTicketDto, 1);
            expect(repository.findByNumber).toHaveBeenCalledWith(
                fakeTicket.number,
            );
            expect(repository.create).toHaveBeenCalledWith(fakeCreateTicketDto);
            expect(result).toEqual(
                plainToInstance(Ticket, fakeTicket, {
                    groups: SERIALIZATION_GROUPS.BASIC,
                }),
            );
        });

        it('Should throw ConflictException when ticket number already exists', async () => {
            jest.spyOn(repository, 'findByNumber').mockResolvedValue(
                fakeTicket,
            );

            await expect(
                service.create(fakeCreateTicketDto, 1),
            ).rejects.toThrow(ConflictException);
        });
    });

    describe('Find All Tickets', () => {
        it('Should return a list of Tickets with total count', async () => {
            const fakeTickets: Ticket[] = [fakeTicket];
            const serializedTickets = plainToInstance(Ticket, fakeTickets, {
                groups: SERIALIZATION_GROUPS.BASIC,
            });

            jest.spyOn(repository, 'findAll').mockResolvedValue(fakeTickets);
            jest.spyOn(repository, 'count').mockResolvedValue(
                fakeTickets.length,
            );

            const params = {
                eventId: fakeTicket.eventId,
                title: fakeTicket.title,
                status: fakeTicket.status,
            };
            const result = await service.findAll(params);

            expect(repository.findAll).toHaveBeenCalledWith(params);
            expect(repository.count).toHaveBeenCalledWith(params);
            expect(result).toEqual({
                items: serializedTickets,
                total: fakeTickets.length,
            });
        });
    });

    describe('Find One Ticket', () => {
        it('Should return a Ticket when found', async () => {
            jest.spyOn(repository, 'findOne').mockResolvedValue(fakeTicket);

            const result = await service.findOne(fakeTicket.id);
            expect(repository.findOne).toHaveBeenCalledWith(fakeTicket.id);
            expect(result).toEqual(
                plainToInstance(Ticket, fakeTicket, {
                    groups: SERIALIZATION_GROUPS.BASIC,
                }),
            );
        });

        it('Should throw NotFoundException when Ticket not found', async () => {
            jest.spyOn(repository, 'findOne').mockResolvedValue(null);

            await expect(service.findOne(9999)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('Update Ticket', () => {
        it('Should update a Ticket successfully', async () => {
            jest.spyOn(repository, 'findOne').mockResolvedValue(fakeTicket);
            jest.spyOn(repository, 'update').mockResolvedValue(
                fakeUpdatedTicket,
            );

            const result = await service.update(
                fakeTicket.id,
                fakeUpdateTicketDto,
                1,
            );
            expect(repository.findOne).toHaveBeenCalledWith(fakeTicket.id);
            expect(repository.update).toHaveBeenCalledWith(
                fakeTicket.id,
                fakeUpdateTicketDto,
            );
            expect(result).toEqual(
                plainToInstance(Ticket, fakeUpdatedTicket, {
                    groups: SERIALIZATION_GROUPS.BASIC,
                }),
            );
        });

        it('Should throw NotFoundException when Ticket not found on update', async () => {
            jest.spyOn(repository, 'findOne').mockResolvedValue(null);

            await expect(
                service.update(fakeTicket.id, fakeUpdateTicketDto, 1),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('delete Ticket', () => {
        it('Should delete a Ticket successfully', async () => {
            jest.spyOn(repository, 'findOne').mockResolvedValue(fakeTicket);
            jest.spyOn(repository, 'delete');

            await service.delete(fakeTicket.id, 1);
            expect(repository.findOne).toHaveBeenCalledWith(fakeTicket.id);
            expect(repository.delete).toHaveBeenCalledWith(fakeTicket.id);
        });

        it('Should throw NotFoundException when Ticket not found on removal', async () => {
            jest.spyOn(repository, 'findOne').mockResolvedValue(null);

            await expect(service.delete(fakeTicket.id, 1)).rejects.toThrow(
                NotFoundException,
            );
        });
    });
});
