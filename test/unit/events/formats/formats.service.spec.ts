// test/unit/formats/formats.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { EventFormatsService } from '../../../../src/models/events/formats/event-formats.service';
import { EventFormatsRepository } from '../../../../src/models/events/formats/event-formats.repository';
import { EventFormat } from '../../../../src/models/events/formats/entities/event-format.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateEventFormatDto } from '../../../../src/models/events/formats/dto/create-event-format.dto';

// TODO: Створити фабрику для генерації тестових даних форматів
// - Створити файл fake-formats.ts
// - Додати генерацію різних варіантів тестових даних
// - Використовувати faker для генерації даних

// TODO: Додати тести для перевірки бізнес-логіки:
// - Валідація унікальності формату
// - Перевірка зв'язків з подіями
// - Обробка залежностей при видаленні

describe('FormatsService', () => {
  let service: EventFormatsService;
  let repository: EventFormatsRepository;

  const mockFormat: Partial<EventFormat> = {
    id: 1,
    title: 'Conference'
  };

  // TODO: Додати більше варіантів тестових даних:
  // const mockFormatWithEvents = { ...mockFormat, events: [] };
  // const mockFormatWithDuplicateTitle = { title: 'Conference' };

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
        // TODO: Додати моки для інших залежностей:
        // - EventsService (якщо є зв'язок)
        // - CacheService (якщо використовується)
      ],
    }).compile();

    service = module.get<EventFormatsService>(EventFormatsService);
    repository = module.get<EventFormatsRepository>(EventFormatsRepository);
  });

  describe('findAll', () => {
    // TODO: Додати тести для перевірки:
    // - Фільтрації результатів
    // - Сортування
    // - Кешування
    // - Обробки помилок від репозиторію

    it('should return all formats', async () => {
        const allFormats = [mockFormat];
        jest.spyOn(repository, 'findAll').mockResolvedValue(allFormats as EventFormat[]);

        const result = await service.findAll();

        expect(result).toEqual(allFormats);
        expect(repository.findAll).toHaveBeenCalled();
    });

    // TODO: Додати тест для перевірки порожнього результату
    // TODO: Додати тест для перевірки помилки бази даних
  });

  describe('findById', () => {
    // TODO: Додати тести для перевірки:
    // - Валідації id
    // - Кешування результату
    // - Обробки різних помилок

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

    // TODO: Додати тест для перевірки некоректного формату id
    // TODO: Додати тест для перевірки помилки бази даних
  });

  describe('create', () => {
    // TODO: Додати тести для перевірки:
    // - Валідації вхідних даних
    // - Унікальності назви формату
    // - Обробки помилок створення

    it('should create a new format', async () => {
      const createFormatDto: CreateEventFormatDto = { title: 'Conference' };
      jest.spyOn(repository, 'create').mockResolvedValue(mockFormat);

      const result = await service.create(createFormatDto);

      expect(result).toEqual(mockFormat);
      expect(repository.create).toHaveBeenCalledWith(createFormatDto);
    });

    // TODO: Додати тест для перевірки дублювання назви
    // TODO: Додати тест для перевірки невалідних даних
    // TODO: Додати тест для перевірки помилки бази даних
  });

  // TODO: Додати тести для інших методів сервісу:
  // - update
  // - delete
  // - bulk operations
});

