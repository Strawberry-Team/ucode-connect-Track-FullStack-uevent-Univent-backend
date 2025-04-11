// test/unit/formats/formats.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { EventFormatsService } from '../../../../src/models/events/formats/event-formats.service';
import { EventFormatsRepository } from '../../../../src/models/events/formats/event-formats.repository';
import { EventFormat } from '../../../../src/models/events/formats/entities/event-format.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateEventFormatDto } from '../../../../src/models/events/formats/dto/create-event-format.dto';

describe('FormatsService', () => {
  let service: EventFormatsService;
  let repository: EventFormatsRepository;

  const mockFormat: Partial<EventFormat> = {
    id: 1,
    title: 'Conference'
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventFormatsService,
        {
          provide: EventFormatsRepository,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EventFormatsService>(EventFormatsService);
    repository = module.get<EventFormatsRepository>(EventFormatsRepository);
  });

  describe('findAll', () => {
    it('should return all formats', async () => {
        const allFormats = [mockFormat];
        jest.spyOn(repository, 'findAll').mockResolvedValue(allFormats as EventFormat[]);

        const result = await service.findAll();

        expect(result).toEqual(allFormats);
        expect(repository.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return format by id', async () => {
      const format = { ...mockFormat, id: 1 };
      jest.spyOn(repository, 'findById').mockResolvedValue(format);

      const result = await service.findById(1);

      expect(result).toEqual(format);
      expect(repository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when format is not found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      await expect(service.findById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new format', async () => {
      const createFormatDto: CreateEventFormatDto = { title: 'Conference' };
      jest.spyOn(repository, 'create').mockResolvedValue(mockFormat);

      const result = await service.create(createFormatDto);

      expect(result).toEqual(mockFormat);
      expect(repository.create).toHaveBeenCalledWith(createFormatDto);
    });
  });
});

