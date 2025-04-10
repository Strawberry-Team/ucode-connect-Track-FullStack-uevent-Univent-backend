// test/unit/formats/formats.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { FormatsService } from '../../../src/models/formats/formats.service';
import { FormatsRepository } from '../../../src/models/formats/formats.repository';
import { Format } from '../../../src/models/formats/entities/format.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateFormatDto } from '../../../src/models/formats/dto/create-format.dto';

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

        const result = await service.findAllFormats();

        expect(result).toEqual(allFormats);
        expect(repository.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return format by id', async () => {
      const format = { ...mockFormat, id: 1 };
      jest.spyOn(repository, 'findById').mockResolvedValue(format);

      const result = await service.findFormatById(1);

      expect(result).toEqual(format);
      expect(repository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when format is not found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      await expect(service.findFormatById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new format', async () => {
      const createFormatDto: CreateFormatDto = { title: 'Conference' };
      jest.spyOn(repository, 'create').mockResolvedValue(mockFormat);

      const result = await service.createFormat(createFormatDto);

      expect(result).toEqual(mockFormat);
      expect(repository.create).toHaveBeenCalledWith(createFormatDto);
    });
  });
});

