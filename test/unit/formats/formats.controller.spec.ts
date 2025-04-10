// test/unit/formats/formats.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { FormatsController } from '../../../src/models/formats/formats.controller';
import { FormatsService } from '../../../src/models/formats/formats.service';
import { Format } from '../../../src/models/formats/entities/format.entity';
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
      expect(formatsService.findAllFormats).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a format by ID', async () => {
      const result = await controller.findOne(1);

      expect(result).toEqual(mockFormat);
      expect(formatsService.findFormatById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when format is not found', async () => {
      jest.spyOn(formatsService, 'findFormatById').mockRejectedValue(new NotFoundException('Format not found'));

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
      expect(formatsService.findFormatById).toHaveBeenCalledWith(999);
    });
  });
});
