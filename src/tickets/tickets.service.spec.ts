// src/tickets/tickets.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { TicketsRepository } from './tickets.repository';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Ticket, TicketStatus } from './entities/ticket.entity';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { Prisma } from '@prisma/client';

// Объявляем mockRepository вне хуков, чтобы переиспользовать его в каждом тесте
const mockRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  count: jest.fn(),
  findOne: jest.fn(),
  findByNumber: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('TicketsService', () => {
  let service: TicketsService;
  let repository: TicketsRepository;
  let moduleRef: TestingModule;

  const generateMockTicket = (): Ticket => ({
    id: faker.number.int({ min: 1, max: 1000 }),
    eventId: faker.number.int({ min: 1, max: 100 }),
    title: faker.lorem.words(3),
    number: `TICKET-${faker.string.uuid().slice(0, 8)}`,
    price: new Prisma.Decimal(faker.finance.amount({ min: 5, max: 100, dec: 2 })),
    status: faker.helpers.arrayElement(Object.values(TicketStatus)),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  });

  const mockRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    count: jest.fn(),
    findOne: jest.fn(),
    findByNumber: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        TicketsService,
        { provide: TicketsRepository, useValue: mockRepository },
      ],
    }).compile();

    service = moduleRef.get<TicketsService>(TicketsService);
    repository = moduleRef.get<TicketsRepository>(TicketsRepository);
  });

  afterEach(async () => {
    if (moduleRef) {
      await moduleRef.close();
    }
  });

  describe('create', () => {
    it('should create a ticket successfully', async () => {
      const mockTicket = generateMockTicket();
      const createTicketDto: CreateTicketDto = {
        eventId: mockTicket.eventId,
        title: mockTicket.title,
        number: mockTicket.number,
        price: mockTicket.price.toNumber(),
        status: mockTicket.status,
      };

      mockRepository.findByNumber.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockTicket);

      const result = await service.create(createTicketDto, faker.number.int());
      expect(result).toEqual(mockTicket);
      expect(mockRepository.findByNumber).toHaveBeenCalledWith(mockTicket.number);
      expect(mockRepository.create).toHaveBeenCalledWith(createTicketDto);
    });

    it('should throw ConflictException if ticket number already exists', async () => {
      const mockTicket = generateMockTicket();
      const createTicketDto: CreateTicketDto = {
        eventId: mockTicket.eventId,
        title: mockTicket.title,
        number: mockTicket.number,
        price: mockTicket.price.toNumber(),
        status: mockTicket.status,
      };

      mockRepository.findByNumber.mockResolvedValue(mockTicket);

      await expect(service.create(createTicketDto, faker.number.int())).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('Minimal Test', () => {
    it('should pass without memory issues', () => {
      expect(1 + 1).toBe(2);
    });
  });

  describe('findAll', () => {
    it('should return a list of tickets with pagination', async () => {
      const mockTickets = [generateMockTicket(), generateMockTicket()];
      const params = {
        page: faker.number.int({ min: 1, max: 5 }),
        limit: faker.number.int({ min: 5, max: 20 }),
        eventId: faker.number.int({ min: 1, max: 100 }),
        status: faker.helpers.arrayElement(Object.values(TicketStatus)),
      };

      mockRepository.findAll.mockResolvedValue(mockTickets);
      mockRepository.count.mockResolvedValue(mockTickets.length);

      const result = await service.findAll(params);
      expect(result).toEqual({
        items: mockTickets,
        total: mockTickets.length,
        page: params.page,
        limit: params.limit,
      });
      expect(mockRepository.findAll).toHaveBeenCalledWith({
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        eventId: params.eventId,
        status: params.status,
      });
      expect(mockRepository.count).toHaveBeenCalledWith({
        eventId: params.eventId,
        status: params.status,
      });
    });

    it('should throw BadRequestException for invalid page', async () => {
      await expect(service.findAll({ page: 0 })).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid limit', async () => {
      await expect(service.findAll({ limit: 101 })).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return a ticket by id', async () => {
      const mockTicket = generateMockTicket();
      mockRepository.findOne.mockResolvedValue(mockTicket);

      const result = await service.findOne(mockTicket.id);
      expect(result).toEqual(mockTicket);
      expect(mockRepository.findOne).toHaveBeenCalledWith(mockTicket.id);
    });

    it('should throw NotFoundException if ticket not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(faker.number.int())).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a ticket successfully', async () => {
      const mockTicket = generateMockTicket();
      const updateTicketDto: UpdateTicketDto = { title: faker.lorem.words(3) };
      mockRepository.findOne.mockResolvedValue(mockTicket);
      mockRepository.update.mockResolvedValue({ ...mockTicket, ...updateTicketDto });

      const result = await service.update(mockTicket.id, updateTicketDto, faker.number.int());
      expect(result).toEqual({ ...mockTicket, ...updateTicketDto });
      expect(mockRepository.update).toHaveBeenCalledWith(mockTicket.id, updateTicketDto);
    });
  });

  describe('remove', () => {
    it('should remove a ticket successfully', async () => {
      const mockTicket = generateMockTicket();
      mockRepository.findOne.mockResolvedValue(mockTicket);
      mockRepository.remove.mockResolvedValue(mockTicket);

      await service.remove(mockTicket.id, faker.number.int());
      expect(mockRepository.remove).toHaveBeenCalledWith(mockTicket.id);
    });
  });
});