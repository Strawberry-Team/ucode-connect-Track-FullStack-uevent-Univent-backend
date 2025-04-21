// import { Test, TestingModule } from '@nestjs/testing';
// import { NotificationsService } from './notifications.service';
// import { NotificationsRepository } from './notifications.repository';
// // import { SubscriptionsService } from '../subscriptions-old/subscriptions.service';
// import { NotFoundException } from '@nestjs/common';

// describe('NotificationsService', () => {
//   let service: NotificationsService;
//   let repository: NotificationsRepository;
//   // let subscriptionsService: SubscriptionsService;

//   // Тестові дані
//   const mockNotification = {
//     id: 1,
//     userId: 1,
//     title: 'Test notification',
//     content: 'This is a test notification',
//     eventId: 1,
//     companyId: null,
//     readAt: null,
//     hiddenAt: null,
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   };

//   // Мок події зміни статусу
//   const mockEventStatusChangedEvent = {
//     eventId: 1,
//     title: 'Test Event',
//     companyId: 1,
//     newStatus: 'PUBLISHED',
//     oldStatus: 'DRAFT',
//   };

//   // Мок події створення новини
//   const mockNewsCreatedEvent = {
//     newsId: 1,
//     title: 'Test News',
//     authorId: 1,
//     eventId: 1,
//     companyId: undefined,
//   };

//   // Мок списку підписників
//   const mockSubscribers = [{ userId: 1 }, { userId: 2 }];

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         NotificationsService,
//         {
//           provide: NotificationsRepository,
//           useValue: {
//             create: jest.fn().mockResolvedValue(mockNotification),
//             findAll: jest.fn().mockResolvedValue([mockNotification]),
//             findById: jest.fn().mockResolvedValue(mockNotification),
//             update: jest.fn().mockResolvedValue({...mockNotification, readAt: new Date()}),
//           },
//         },
//         {
//           provide: SubscriptionsService,
//           useValue: {
//             findSubscribers: jest.fn().mockResolvedValue(mockSubscribers),
//           },
//         },
//       ],
//     }).compile();

//     service = module.get<NotificationsService>(NotificationsService);
//     repository = module.get<NotificationsRepository>(NotificationsRepository);
//     subscriptionsService = module.get<SubscriptionsService>(SubscriptionsService);
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   describe('findAll', () => {
//     it('should return all notifications for a user', async () => {
//       const result = await service.findAll(1);
//       expect(result).toEqual([mockNotification]);
//       expect(repository.findAll).toHaveBeenCalledWith(1);
//     });
//   });

//   describe('findById', () => {
//     it('should return a notification by id', async () => {
//       const result = await service.findById(1);
//       expect(result).toEqual(mockNotification);
//       expect(repository.findById).toHaveBeenCalledWith(1);
//     });

//     it('should throw NotFoundException when notification not found', async () => {
//       jest.spyOn(repository, 'findById').mockResolvedValue(null);
//       await expect(service.findById(999)).rejects.toThrow(NotFoundException);
//     });
//   });

//   describe('create', () => {
//     it('should create a notification', async () => {
//       const result = await service.create({
//         userId: 1,
//         title: 'Test notification',
//         content: 'This is a test notification',
//       });
//       expect(result).toEqual(mockNotification);
//       expect(repository.create).toHaveBeenCalledWith({
//         userId: 1,
//         title: 'Test notification',
//         content: 'This is a test notification',
//       });
//     });
//   });

//   describe('createEventStatusNotification', () => {
//     it('should create notifications for all subscribers', async () => {
//       const createSpy = jest.spyOn(service, 'create');
      
//       await service.createEventStatusNotification(mockEventStatusChangedEvent);
      
//       expect(subscriptionsService.findSubscribers).toHaveBeenCalledWith('event', 1);
//       expect(createSpy).toHaveBeenCalledTimes(2); // по одному для кожного підписника
//     });

//     it('should not create notifications when there are no subscribers', async () => {
//       jest.spyOn(subscriptionsService, 'findSubscribers').mockResolvedValue([]);
//       const createSpy = jest.spyOn(service, 'create');
      
//       await service.createEventStatusNotification(mockEventStatusChangedEvent);
      
//       expect(createSpy).not.toHaveBeenCalled();
//     });
//   });

//   describe('createNewsNotification', () => {
//     it('should create notifications for event subscribers', async () => {
//       const createSpy = jest.spyOn(service, 'create');
      
//       await service.createNewsNotification(mockNewsCreatedEvent);
      
//       expect(subscriptionsService.findSubscribers).toHaveBeenCalledWith('event', 1);
//       expect(createSpy).toHaveBeenCalledTimes(2); // по одному для кожного підписника
//     });

//     it('should create notifications for company subscribers', async () => {
//       const companyNews = { ...mockNewsCreatedEvent, eventId: undefined, companyId: 1 };
//       const createSpy = jest.spyOn(service, 'create');
      
//       await service.createNewsNotification(companyNews);
      
//       expect(subscriptionsService.findSubscribers).toHaveBeenCalledWith('company', 1);
//       expect(createSpy).toHaveBeenCalledTimes(2); // по одному для кожного підписника
//     });

//     it('should not create notifications when source is not specified', async () => {
//       const invalidNews = { ...mockNewsCreatedEvent, eventId: undefined, companyId: undefined };
//       const createSpy = jest.spyOn(service, 'create');
      
//       await service.createNewsNotification(invalidNews);
      
//       expect(createSpy).not.toHaveBeenCalled();
//     });
//   });

//   describe('updateNotification: markAsRead', () => {
//     it('should mark notification as read', async () => {
//       const result = await service.updateNotification(1, 1, { action: 'read' });
//       expect(repository.update).toHaveBeenCalledWith(1, { readAt: expect.any(Date) });
//     });

//     it('should throw NotFoundException when notification not found', async () => {
//       jest.spyOn(repository, 'findById').mockResolvedValue(null);
//       await expect(service.updateNotification(999, 1, { action: 'read' })).rejects.toThrow(NotFoundException);
//     });

//     it('should throw NotFoundException when notification does not belong to user', async () => {
//       await expect(service.updateNotification(1, 999, { action: 'read' })).rejects.toThrow(NotFoundException);
//     });
//   });

//   describe('updateNotification: markAsHidden', () => {
//     it('should mark notification as hidden', async () => {
//       const result = await service.updateNotification(1, 1, { action: 'hide' });
//       expect(repository.update).toHaveBeenCalledWith(1, { hiddenAt: expect.any(Date) });
//     });

//     it('should throw NotFoundException when notification not found', async () => {
//       jest.spyOn(repository, 'findById').mockResolvedValue(null);
//       await expect(service.updateNotification(999, 1, { action: 'hide' })).rejects.toThrow(NotFoundException);
//     });

//     it('should throw NotFoundException when notification does not belong to user', async () => {
//       await expect(service.updateNotification(1, 999, { action: 'hide' })).rejects.toThrow(NotFoundException);
//     });
//   });
// });
