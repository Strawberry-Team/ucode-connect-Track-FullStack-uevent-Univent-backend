import { Test, TestingModule } from '@nestjs/testing';
import { FormatsController } from './formats.controller';
import { FormatsService } from './formats.service';
import { Format } from './entities/formats.entity';
import { NotFoundException } from '@nestjs/common';
describe('FormatsController', () => {
  let controller: FormatsController;
  let formatsService: FormatsService;

  const mockFormat: Partial<Format> = {
    id: 1,
    title: 'Conference',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FormatsController],
      providers: [
        {
          provide: FormatsService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([mockFormat]),
            findById: jest.fn().mockResolvedValue(mockFormat),
          },
        },
      ],
    }).compile();

    controller = module.get<FormatsController>(FormatsController);
    formatsService = module.get<FormatsService>(FormatsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all formats', async () => {
      const result = await controller.findAll();

      expect(result).toEqual([mockFormat]);
      expect(formatsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a format by ID', async () => {
      const result = await controller.findById(1);

      expect(result).toEqual(mockFormat);
      expect(formatsService.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when format is not found', async () => {
      jest.spyOn(formatsService, 'findById').mockRejectedValue(new NotFoundException('Format not found'));

      await expect(controller.findById(999)).rejects.toThrow(NotFoundException);
      expect(formatsService.findById).toHaveBeenCalledWith(999);
    });
  });
});
