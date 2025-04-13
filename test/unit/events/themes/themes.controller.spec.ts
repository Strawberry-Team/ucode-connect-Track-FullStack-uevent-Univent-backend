// test/unit/events/themes/themes.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { EventThemesController } from '../../../../src/models/events/themes/event-themes.controller';
import { EventThemesService } from 'src/models/events/themes/event-themes.service';
import { EventTheme } from 'src/models/events/themes/entities/event-theme.entity';
import { NotFoundException } from '@nestjs/common';

// TODO: Створити фабрику для генерації тестових даних тем
// - Перенести mockTheme в окремий файл fake-themes.ts
// - Додати генерацію різних варіантів тестових даних

// TODO: Додати тести для перевірки валідації:
// - Унікальність назви теми
// - Обмеження на довжину назви
// - Формат назви (якщо є обмеження)

// TODO: Додати тести для перевірки прав доступу:
// - Перевірка ролей користувача
// - Перевірка власника теми
// - Перевірка публічного доступу

describe('ThemesController', () => {
  let controller: EventThemesController;
  let service: EventThemesService;

  const mockTheme: Partial<EventTheme> = {
    id: 1,
    title: 'Gaming',
  };

  // TODO: Додати більше тестових даних:
  // const invalidTheme = { title: '' };
  // const duplicateTheme = { title: 'Gaming' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventThemesController],
      providers: [
        {
          provide: EventThemesService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([mockTheme]),
            findById: jest.fn().mockResolvedValue(mockTheme),
          },
        },
        // TODO: Додати провайдери для:
        // - Guards (AuthGuard, RolesGuard)
        // - Interceptors (TransformInterceptor, CacheInterceptor)
        // - Pipes (ValidationPipe)
      ],
    }).compile();

    controller = module.get<EventThemesController>(EventThemesController);
    service = module.get<EventThemesService>(EventThemesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    // TODO: Додати тести для перевірки:
    // - Пагінації результатів
    // - Фільтрації за параметрами
    // - Сортування результатів
    // - Кешування результатів

    it('should return all formats', async () => {
      const result = await controller.findAll();

      expect(result).toEqual([mockTheme]);
      expect(service.findAll).toHaveBeenCalled();
    });

    // TODO: Додати тести для перевірки помилок:
    // - Помилка бази даних
    // - Помилка сервісу
    // - Таймаут запиту
  });

  describe('findById', () => {
    // TODO: Додати тести для перевірки:
    // - Валідації параметра id
    // - Обробки некоректного формату id
    // - Кешування результату

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

    // TODO: Додати тести для інших типів помилок:
    // - Помилка валідації
    // - Помилка авторизації
    // - Помилка бази даних
  });

  // TODO: Додати тести для інших методів контролера:
  // - create
  // - update
  // - delete
  // - bulk operations (якщо є)
});
