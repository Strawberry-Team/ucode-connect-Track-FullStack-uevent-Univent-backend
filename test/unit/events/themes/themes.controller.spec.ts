// test/unit/events/themes/themes.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ThemesController } from '../../../../src/models/events/themes/themes.controller';
import { ThemesService } from 'src/models/events/themes/themes.service';
import { EventTheme } from 'src/models/events/themes/entities/theme.entity';
import { NotFoundException } from '@nestjs/common';

describe('ThemesController', () => {
  let controller: ThemesController;
  let service: ThemesService;

  const mockTheme: Partial<EventTheme> = {
    id: 1,
    title: 'Gaming',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ThemesController],
      providers: [
        {
          provide: ThemesService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([mockTheme]),
            findById: jest.fn().mockResolvedValue(mockTheme),
          },
        },
      ],
    }).compile();

    controller = module.get<ThemesController>(ThemesController);
    service = module.get<ThemesService>(ThemesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all formats', async () => {
      const result = await controller.findAll();

      expect(result).toEqual([mockTheme]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a format by ID', async () => {
      const result = await controller.findOne(1);

      expect(result).toEqual(mockTheme);
      expect(service.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when theme is not found', async () => {
      jest.spyOn(service, 'findById').mockRejectedValue(new NotFoundException('Theme not found'));

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
      expect(service.findById).toHaveBeenCalledWith(999);
    });
  });
});
