// test/unit/formats/formats.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { EventFormatsController } from '../../../../src/models/events/formats/event-formats.controller';
import { EventFormatsService } from '../../../../src/models/events/formats/event-formats.service';
import { EventFormat } from '../../../../src/models/events/formats/entities/event-format.entity';
import { NotFoundException } from '@nestjs/common';

describe('FormatsController', () => {
  let controller: EventFormatsController;
  let service: EventFormatsService;

  const mockFormat: Partial<EventFormat> = {
    id: 1,
    title: 'Conference',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventFormatsController],
      providers: [
        {
          provide: EventFormatsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([mockFormat]),
            findById: jest.fn().mockResolvedValue(mockFormat),
          },
        },
      ],
    }).compile();

    controller = module.get<EventFormatsController>(EventFormatsController);
    service = module.get<EventFormatsService>(EventFormatsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all formats', async () => {
      const result = await controller.findAll();

      expect(result).toEqual([mockFormat]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a format by ID', async () => {
      const result = await controller.findOne(1);

      expect(result).toEqual(mockFormat);
      expect(service.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when format is not found', async () => {
      jest.spyOn(service, 'findById').mockRejectedValue(new NotFoundException('Format not found'));

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
      expect(service.findById).toHaveBeenCalledWith(999);
    });
  });
});
