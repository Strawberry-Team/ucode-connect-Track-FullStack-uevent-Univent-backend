// test/unit/events/themes/themes.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ThemesService } from '../../../../src/models/events/themes/themes.service';
import { EventThemesRepository } from '../../../../src/models/events/themes/themes.repository';
import { EventTheme } from 'src/models/events/themes/entities/theme.entity';

describe('ThemesService', () => {
  let service: ThemesService;
  let repository: EventThemesRepository;

  const mockTheme: Partial<EventTheme> = {
    id: 1,
    title: 'Gaming',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThemesService,
        {
          provide: EventThemesRepository,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ThemesService>(ThemesService);
    repository = module.get<EventThemesRepository>(EventThemesRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all themes', async () => {
      const allThemes = [mockTheme];
      jest.spyOn(repository, 'findAll').mockResolvedValue(allThemes as EventTheme[]);

      const result = await service.findAll();

      expect(result).toEqual(allThemes);
      expect(repository.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return theme by id', async () => {
      const theme = { ...mockTheme, id: 1 };
      jest.spyOn(repository, 'findById').mockResolvedValue(theme as EventTheme);

      const result = await service.findById(1);

      expect(result).toEqual(theme);
      expect(repository.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a new theme', async () => {
      const newTheme = { ...mockTheme, id: 2 };
      jest.spyOn(repository, 'create').mockResolvedValue(newTheme as EventTheme);

      const result = await service.create(newTheme as EventTheme);

      expect(result).toEqual(newTheme);
      expect(repository.create).toHaveBeenCalledWith(newTheme);
    });
  });
});