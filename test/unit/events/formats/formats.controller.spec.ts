// test/unit/formats/formats.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { EventFormatsController } from '../../../../src/models/events/formats/event-formats.controller';
import { EventFormatsService } from '../../../../src/models/events/formats/event-formats.service';
import { EventFormat } from '../../../../src/models/events/formats/entities/event-format.entity';
import { NotFoundException } from '@nestjs/common';
// TODO: Додати імпорт `CreateEventFormatDto` та фабрику `generateFakeCreateEventFormatDto`, якщо буде тестуватися метод `create`.
// TODO: Додати імпорт фабрики `generateFakeFormat` або схожої.

describe('FormatsController', () => {
  let controller: EventFormatsController;
  let service: jest.Mocked<EventFormatsService>; // TODO: Типізувати мок сервісу.

  const mockFormat: Partial<EventFormat> = {
    id: 1,
    title: 'Conference',
  };
  // TODO: Використовувати фабрику для генерації mockFormat.
  // const mockFormat: EventFormat = generateFakeFormat();
  // TODO: Визначити mockCreateDto, якщо є метод create.
  // const mockCreateDto: CreateEventFormatDto = generateFakeCreateEventFormatDto();

  const mockEventFormatsService = {
      findAll: jest.fn().mockResolvedValue([mockFormat]),
      findById: jest.fn().mockResolvedValue(mockFormat),
      // TODO: Додати мок для методу `create`, якщо він є.
      // create: jest.fn().mockResolvedValue(mockFormat),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventFormatsController],
      providers: [
        {
          provide: EventFormatsService,
          // useValue: { // TODO: Замінити на явний мок.
          //   findAll: jest.fn().mockResolvedValue([mockFormat]),
          //   findById: jest.fn().mockResolvedValue(mockFormat),
          // },
          useValue: mockEventFormatsService,
        },
        // TODO: Додати Guard/Reflector моки, якщо вони потрібні для цього контролера.
      ],
    }).compile();

    controller = module.get<EventFormatsController>(EventFormatsController);
    service = module.get(EventFormatsService); // TODO: Присвоїти типізований мок.
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    // TODO: Уточнити назву тесту.
    it('should return all formats', async () => {
      const result = await controller.findAll();

      expect(result).toEqual([mockFormat]); // TODO: Перевірити результат.
      expect(service.findAll).toHaveBeenCalled(); // TODO: Перевірити виклик сервісу.
       // TODO: Додати тест на випадок помилки від сервісу.
    });
  });

  describe('findById', () => { // TODO: `findOne` у коді, `findById` тут?
    // TODO: Уточнити назву тесту.
    it('should return a format by ID', async () => {
      const formatId = 1;
      const result = await controller.findOne(formatId);

      expect(result).toEqual(mockFormat); // TODO: Перевірити результат.
      expect(service.findById).toHaveBeenCalledWith(formatId); // TODO: Перевірити виклик сервісу.
    });

    // TODO: Уточнити назву тесту.
    it('should throw NotFoundException when format is not found', async () => {
      const formatId = 999;
      // jest.spyOn(service, 'findById').mockRejectedValue(new NotFoundException('Format not found')); // Не потрібно
      mockEventFormatsService.findById.mockRejectedValue(new NotFoundException('Format not found')); // Мокуємо помилку

      await expect(controller.findOne(formatId)).rejects.toThrow(NotFoundException);
      expect(service.findById).toHaveBeenCalledWith(formatId); // TODO: Перевірити виклик сервісу.
    });
     // TODO: Додати тест на прокидання інших помилок від сервісу.
  });

   // TODO: Додати тести для методу `create`, якщо він існує.
   // describe('create', () => {
   //     it('should call service.create with dto and return result', async () => {
   //         const result = await controller.create(mockCreateDto);
   //         expect(result).toEqual(mockFormat);
   //         expect(service.create).toHaveBeenCalledWith(mockCreateDto);
   //     });
   //     // TODO: Тест на обробку помилок від service.create
   // });
});
