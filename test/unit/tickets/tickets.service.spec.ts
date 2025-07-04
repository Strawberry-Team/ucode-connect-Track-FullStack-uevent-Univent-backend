// test/unit/tickets/tickets.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from '../../../src/models/tickets/tickets.service';
import { TicketsRepository } from '../../../src/models/tickets/tickets.repository';
import { Ticket } from '../../../src/models/tickets/entities/ticket.entity';
import { CreateTicketDto } from '../../../src/models/tickets/dto/create-ticket.dto';
import { UpdateTicketDto } from '../../../src/models/tickets/dto/update-ticket.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { generateFakeTicket, generateFakeTicketTypes } from '../../fake-data/fake-tickets';
import { plainToInstance } from 'class-transformer';
import { SERIALIZATION_GROUPS } from '../../../src/models/tickets/entities/ticket.entity';
import { EventsRepository } from "../../../src/models/events/events.repository";
import { Prisma } from '@prisma/client';
import { TicketTypeDto } from '../../../src/models/tickets/dto/ticket-type.dto';

describe('TicketsService', () => {
    let service: TicketsService;
    let repository: TicketsRepository;


    const fakeTicket: Ticket = generateFakeTicket();
    const fakeCreateTicketDto: CreateTicketDto = {
        title: fakeTicket.title,
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
                        findById: jest.fn().mockResolvedValue(fakeTicket),
                        findByNumber: jest.fn().mockResolvedValue(null),
                        update: jest.fn().mockResolvedValue(fakeUpdatedTicket),
                        delete: jest.fn().mockResolvedValue(undefined),
                        findAllTicketTypes: jest.fn().mockResolvedValue({
                            items: [],
                            total: 0
                        }),
                    },
                },
                {
                    provide: EventsRepository,
                    useValue: {},
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
            jest.spyOn(service, 'generateTicketNumber').mockReturnValue(fakeTicket.number);

            jest.spyOn(repository, 'findByNumber').mockResolvedValue(null);
            jest.spyOn(repository, 'create').mockResolvedValue(fakeTicket);

            const result = await service.createTicket(fakeCreateTicketDto, fakeTicket.eventId);

            expect(repository.findByNumber).toHaveBeenCalledWith(fakeTicket.number);

            expect(repository.create).toHaveBeenCalledWith({
                ...fakeCreateTicketDto,
                number: fakeTicket.number,
                eventId: fakeTicket.eventId
            });

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
                service.createTicket(fakeCreateTicketDto, 1),
            ).rejects.toThrow(ConflictException);
        });
    });

    describe('Find All Tickets', () => {
        it('Should return a list of Tickets with total count', async () => {
            // Arrange
            const fakeTickets: Ticket[] = [fakeTicket];
            const serializedTickets: Ticket[] = plainToInstance(Ticket, fakeTickets, {
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

            // Act
            const result = await service.findAllTickets(params);

            // Assert
            expect(repository.findAll).toHaveBeenCalledWith(params, undefined);
            expect(repository.count).toHaveBeenCalledWith(params, undefined);
            expect(result).toEqual({
                items: serializedTickets,
                total: fakeTickets.length,
            });
        });

        it('Should handle transaction parameter correctly', async () => {
            // Arrange
            const fakeTickets: Ticket[] = [fakeTicket];
            const serializedTickets: Ticket[] = plainToInstance(Ticket, fakeTickets, {
                groups: SERIALIZATION_GROUPS.BASIC,
            });
            const mockTx = {} as Prisma.TransactionClient;

            jest.spyOn(repository, 'findAll').mockResolvedValue(fakeTickets);
            jest.spyOn(repository, 'count').mockResolvedValue(fakeTickets.length);

            const params = {
                eventId: fakeTicket.eventId,
                title: fakeTicket.title,
                status: fakeTicket.status,
            };

            // Act
            const result = await service.findAllTickets(params, mockTx);

            // Assert
            expect(repository.findAll).toHaveBeenCalledWith(params, mockTx);
            expect(repository.count).toHaveBeenCalledWith(params, mockTx);
            expect(result).toEqual({
                items: serializedTickets,
                total: fakeTickets.length,
            });
        });
    });

    describe('Find One Ticket', () => {
        it('Should return a Ticket when found', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(fakeTicket);

            const result = await service.findOneTicket(fakeTicket.id);
            expect(repository.findById).toHaveBeenCalledWith(fakeTicket.id);
            expect(result).toEqual(
                plainToInstance(Ticket, fakeTicket, {
                    groups: SERIALIZATION_GROUPS.BASIC,
                }),
            );
        });

        it('Should throw NotFoundException when Ticket not found', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(null);

            await expect(service.findOneTicket(9999)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('Update Ticket', () => {
        it('Should update a Ticket successfully', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(fakeTicket);
            jest.spyOn(repository, 'update').mockResolvedValue(
                fakeUpdatedTicket,
            );

            const result = await service.updateTicket(
                fakeTicket.id,
                fakeUpdateTicketDto
            );
            expect(repository.findById).toHaveBeenCalledWith(fakeTicket.id);
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
            jest.spyOn(repository, 'findById').mockResolvedValue(null);

            await expect(
                service.updateTicket(fakeTicket.id, fakeUpdateTicketDto),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('delete Ticket', () => {
        it('Should delete a Ticket successfully', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(fakeTicket);
            jest.spyOn(repository, 'delete');

            await service.deleteTicket(fakeTicket.id);
            expect(repository.findById).toHaveBeenCalledWith(fakeTicket.id);
            expect(repository.delete).toHaveBeenCalledWith(fakeTicket.id);
        });

        it('Should throw NotFoundException when Ticket not found on removal', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(null);

            await expect(service.deleteTicket(fakeTicket.id)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('Find All Ticket Types', () => {
        it('should return ticket types with total count', async () => {
            // Arrange
            const fakeTicketTypes = generateFakeTicketTypes();
            const expectedResponse = {
                items: fakeTicketTypes,
                total: fakeTicketTypes.length
            };

            jest.spyOn(repository, 'findAllTicketTypes').mockResolvedValue(expectedResponse);

            // Act
            const result = await service.findAllTicketTypes({ eventId: 1 });

            // Assert
            expect(repository.findAllTicketTypes).toHaveBeenCalledWith({ eventId: 1 }, undefined);
            expect(result).toEqual(expectedResponse);
            expect(result.items).toHaveLength(3);
            expect(result.total).toBe(3);
        });

        it('should handle empty ticket types', async () => {
            // Arrange
            const expectedResponse = {
                items: [],
                total: 0
            };

            jest.spyOn(repository, 'findAllTicketTypes').mockResolvedValue(expectedResponse);

            // Act
            const result = await service.findAllTicketTypes({ eventId: 1 });

            // Assert
            expect(repository.findAllTicketTypes).toHaveBeenCalledWith({ eventId: 1 }, undefined);
            expect(result.items).toEqual([]);
            expect(result.total).toBe(0);
        });

        it('should handle transaction parameter correctly', async () => {
            // Arrange
            const fakeTicketTypes = generateFakeTicketTypes();
            const expectedResponse = {
                items: fakeTicketTypes,
                total: fakeTicketTypes.length
            };
            const mockTx = {} as Prisma.TransactionClient;

            jest.spyOn(repository, 'findAllTicketTypes').mockResolvedValue(expectedResponse);

            // Act
            const result = await service.findAllTicketTypes({ eventId: 1 }, mockTx);

            // Assert
            expect(repository.findAllTicketTypes).toHaveBeenCalledWith({ eventId: 1 }, mockTx);
            expect(result).toEqual(expectedResponse);
        });

        it('should return sorted ticket types by price', async () => {
            // Arrange
            const fakeTicketTypes = [
                { title: 'Economy', price: 50, count: 100 },
                { title: 'VIP', price: 200, count: 50 },
                { title: 'Standard', price: 100, count: 75 },                
            ];
            const expectedResponse = {
                items: fakeTicketTypes,
                total: fakeTicketTypes.length
            };

            jest.spyOn(repository, 'findAllTicketTypes').mockResolvedValue(expectedResponse);

            // Act
            const result = await service.findAllTicketTypes({ eventId: 1 });

            fakeTicketTypes.sort((a, b) => a.price - b.price);

            // Assert
            expect(result.items[0].price).toBeLessThanOrEqual(result.items[1].price);
            expect(result.items[1].price).toBeLessThanOrEqual(result.items[2].price);
            expect(result.items).toEqual(fakeTicketTypes);
        });
    });
});
