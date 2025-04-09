import { Test, TestingModule } from '@nestjs/testing';
import { FormatsService } from './formats.service';
import { FormatsRepository } from './formats.repository';
import { Format } from './entities/formats.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateFormatDto } from './dto/create-format.dto';

describe('FormatsService', () => {
  let service: FormatsService;
  let repository: FormatsRepository;

  const mockFormat: Partial<Format> = {
    id: 1,
    title: 'Conference'
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FormatsService,
        {
          provide: FormatsRepository,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FormatsService>(FormatsService);
    repository = module.get<FormatsRepository>(FormatsRepository);
  });

  describe('findAll', () => {
    it('should return all formats', async () => {
        const allFormats = [mockFormat];
        jest.spyOn(repository, 'findAll').mockResolvedValue(allFormats);

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
      const createFormatDto: CreateFormatDto = { title: 'Conference' };
      jest.spyOn(repository, 'create').mockResolvedValue(mockFormat);

      const result = await service.create(createFormatDto);

      expect(result).toEqual(mockFormat);
      expect(repository.create).toHaveBeenCalledWith(createFormatDto);
    });
  });
});

