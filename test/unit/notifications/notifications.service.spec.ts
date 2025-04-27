import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from '../../../src/models/notifications/notifications.service';
import { NotificationsRepository } from '../../../src/models/notifications/notifications.repository';
import { NotFoundException } from '@nestjs/common';
import { SubscriptionsService } from '../../../src/models/subscriptions/subscriptions.service';
import { EventStatusChangedEvent } from '../../../src/common/events/notification-events.interface';
import { EntityType } from '../../../src/models/subscriptions/dto/create-subscription.dto';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let repository: NotificationsRepository;
  let subscriptionsService: SubscriptionsService;

  const mockNotification = {
    id: 1,
    userId: 1,
    title: 'Test notification',
    content: 'This is a test notification',
    eventId: 1,
    companyId: null,
    readAt: null,
    hiddenAt: null,
    createdAt: new Date('2025-04-22T11:49:40.728Z'),
  };

  // Мок події зміни статусу
  const mockEventStatusChangedEvent = {
    eventId: 1,
    title: 'Test Event',
    companyId: 1,
    newStatus: 'PUBLISHED',
    oldStatus: 'DRAFT',
  };

  // Мок події створення новини
  const mockNewsCreatedEvent = {
    newsId: 1,
    title: 'Test News',
    authorId: 1,
    eventId: 1,
    companyId: undefined,
  };

  // Мок списку підписників
  const mockSubscribers = [1, 2]; // Змінено на масив ID користувачів

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: NotificationsRepository,
          useValue: {
            create: jest.fn().mockResolvedValue(mockNotification),
            findAll: jest.fn().mockResolvedValue([mockNotification]),
            findById: jest.fn().mockResolvedValue(mockNotification),
            update: jest.fn().mockResolvedValue({...mockNotification, readAt: new Date()}),
          },
        },
        {
          provide: SubscriptionsService,
          useValue: {
            findAllUserIdsByEventId: jest.fn().mockResolvedValue(mockSubscribers),
            findAllUserIdsByCompanyId: jest.fn().mockResolvedValue(mockSubscribers),
            findAllUserIdsByEntityId: jest.fn().mockResolvedValue(mockSubscribers),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    repository = module.get<NotificationsRepository>(NotificationsRepository);
    subscriptionsService = module.get<SubscriptionsService>(SubscriptionsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all notifications for a user', async () => {
      const result = await service.findAll(1);
      expect(result).toEqual([mockNotification]);
      expect(repository.findAll).toHaveBeenCalledWith(1);
    });
  });

  describe('findById', () => {
    it('should return a notification by id', async () => {
      const result = await service.findById(1);
      expect(result).toEqual(mockNotification);
      expect(repository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when notification not found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createEventStatusNotification', () => {
    it('should create notifications for all subscribers', async () => {
      const result = await service.createEventStatusNotification(mockEventStatusChangedEvent as EventStatusChangedEvent);
      
      expect(subscriptionsService.findAllUserIdsByEventId).toHaveBeenCalledWith(1);
      expect(repository.create).toHaveBeenCalledTimes(2); // по одному для кожного підписника
      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
        userId: expect.any(Number),
        title: 'Event status updated',
        content: expect.any(String),
        eventId: mockEventStatusChangedEvent.eventId,
        companyId: null
      }));
    });

    it('should not create notifications when there are no subscribers', async () => {
      jest.spyOn(subscriptionsService, 'findAllUserIdsByEventId').mockResolvedValue([]);
      
      await service.createEventStatusNotification(mockEventStatusChangedEvent as EventStatusChangedEvent);
      
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('createNewsNotification', () => {
    it('should create notifications for event subscribers', async () => {
      await service.createNewsNotification({
        ...mockNewsCreatedEvent,
        eventTitle: 'Test Event',
        companyTitle: undefined
      });
      
      expect(subscriptionsService.findAllUserIdsByEntityId).toHaveBeenCalledWith(1, EntityType.EVENT);
      expect(repository.create).toHaveBeenCalledTimes(2); // по одному для кожного підписника
      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
        userId: expect.any(Number),
        title: 'Event news published',
        content: expect.stringContaining('Test Event'),
        eventId: mockNewsCreatedEvent.eventId,
        companyId: null
      }));
    });

    it('should create notifications for company subscribers', async () => {
      const companyNews = { 
        ...mockNewsCreatedEvent, 
        eventId: undefined, 
        companyId: 1,
        eventTitle: undefined,
        companyTitle: 'Test Company'
      };
      
      await service.createNewsNotification(companyNews);
      
      expect(subscriptionsService.findAllUserIdsByEntityId).toHaveBeenCalledWith(1, EntityType.COMPANY);
      expect(repository.create).toHaveBeenCalledTimes(2); // по одному для кожного підписника
      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
        userId: expect.any(Number),
        title: 'Company news published',
        content: expect.stringContaining('Test Company'),
        eventId: null,
        companyId: companyNews.companyId
      }));
    });

    it('should not create notifications when source is not specified', async () => {
      const invalidNews = { 
        ...mockNewsCreatedEvent, 
        eventId: undefined, 
        companyId: undefined,
        eventTitle: undefined,
        companyTitle: undefined
      };
      
      await service.createNewsNotification(invalidNews);
      
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('updateNotification: markAsRead', () => {
    it('should mark notification as read', async () => {
      const result = await service.updateNotification(1, 1, { action: 'read' });
      expect(repository.update).toHaveBeenCalledWith(1, { readAt: expect.any(Date) });
    });

    it('should throw NotFoundException when notification not found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(null);
      await expect(service.updateNotification(999, 1, { action: 'read' })).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when notification does not belong to user', async () => {
      await expect(service.updateNotification(1, 999, { action: 'read' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateNotification: markAsHidden', () => {
    it('should mark notification as hidden', async () => {
      const result = await service.updateNotification(1, 1, { action: 'hide' });
      expect(repository.update).toHaveBeenCalledWith(1, { hiddenAt: expect.any(Date) });
    });

    it('should throw NotFoundException when notification not found', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue(null);
      await expect(service.updateNotification(999, 1, { action: 'hide' })).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when notification does not belong to user', async () => {
      await expect(service.updateNotification(1, 999, { action: 'hide' })).rejects.toThrow(NotFoundException);
    });
  });
});
