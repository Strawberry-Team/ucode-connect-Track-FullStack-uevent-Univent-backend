// src/models/subscriptions/test/subscriptions.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import {
    ConflictException,
    NotFoundException,
    forwardRef,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { SubscriptionsService } from '../../../src/models/subscriptions/subscriptions.service';
import { SubscriptionsRepository } from '../../../src/models/subscriptions/subscriptions.repository';
import { EventsService } from '../../../src/models/events/events.service';
import { CompaniesService } from '../../../src/models/companies/companies.service';
import { SubscriptionsTestUtils } from '../../fake-data/fake-subscriptions';
import {
    EntityType,
    CreateSubscriptionDto,
} from '../../../src/models/subscriptions/dto/create-subscription.dto';
import {
    SERIALIZATION_GROUPS,
    Subscription,
    SubscriptionWithConfidentialWithoutCompanyId,
    SubscriptionWithConfidentialWithoutEventId,
} from '../../../src/models/subscriptions/entities/subscription.entity';
import { SubscriptionInfoDto } from '../../../src/models/subscriptions/dto/subscription-info.dto';
import { faker } from '@faker-js/faker/.';

describe('SubscriptionsService', () => {
    let service: SubscriptionsService;
    let repository: jest.Mocked<SubscriptionsRepository>;
    let eventsService: jest.Mocked<EventsService>;
    let companiesService: jest.Mocked<CompaniesService>;

    beforeEach(async () => {
        const repositoryMock = {
            create: jest.fn(),
            findOneByUserIdAndEntityId: jest.fn(),
            findAllByUserIdForEvents: jest.fn(),
            findAllByUserIdForCompanies: jest.fn(),
            countByEntityId: jest.fn(),
            findAllUserIdsByEntityId: jest.fn(),
            findOneById: jest.fn(),
            delete: jest.fn(),
        };

        const eventsServiceMock = {
            findById: jest.fn(),
        };

        const companiesServiceMock = {
            findById: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SubscriptionsService,
                { provide: SubscriptionsRepository, useValue: repositoryMock },
                { provide: EventsService, useValue: eventsServiceMock },
                { provide: CompaniesService, useValue: companiesServiceMock },
            ],
        }).compile();

        service = module.get<SubscriptionsService>(SubscriptionsService);
        repository = module.get(
            SubscriptionsRepository,
        ) as jest.Mocked<SubscriptionsRepository>;
        eventsService = module.get(EventsService) as jest.Mocked<EventsService>;
        companiesService = module.get(
            CompaniesService,
        ) as jest.Mocked<CompaniesService>;
    });

    describe('create', () => {
        const userId = 1;
        const eventId = 10;
        const companyId = 5;

        it('should create a subscription for an event', async () => {
            const dto: CreateSubscriptionDto = {
                entityId: eventId,
                entityType: EntityType.EVENT,
            };
            const fakeEvent = SubscriptionsTestUtils.generateFakeEvent({
                id: eventId,
            });
            const fakeSubscription = SubscriptionsTestUtils.generateFakeSubscription({
                userId,
                eventId,
                companyId: null,
            });

            eventsService.findById.mockResolvedValue(fakeEvent);
            repository.findOneByUserIdAndEntityId.mockResolvedValue(null);
            repository.create.mockResolvedValue(fakeSubscription);

            const result = await service.create(dto, userId);

            expect(eventsService.findById).toHaveBeenCalledWith(eventId);
            expect(companiesService.findById).not.toHaveBeenCalled();
            expect(repository.findOneByUserIdAndEntityId).toHaveBeenCalledWith(
                userId,
                eventId,
                EntityType.EVENT,
            );
            expect(repository.create).toHaveBeenCalledWith(
                userId,
                eventId,
                EntityType.EVENT,
            );
            expect(result).toBeInstanceOf(
                SubscriptionWithConfidentialWithoutCompanyId,
            );
            expect(result).toEqual(
                plainToInstance(
                    SubscriptionWithConfidentialWithoutCompanyId,
                    fakeSubscription,
                    {
                        groups: SERIALIZATION_GROUPS.CONFIDENTIAL,
                        excludeExtraneousValues: true,
                    },
                ),
            );
        });

        it('should create a subscription for a company', async () => {
            const dto: CreateSubscriptionDto = {
                entityId: companyId,
                entityType: EntityType.COMPANY,
            };
            const fakeCompany = SubscriptionsTestUtils.generateFakeCompany({
                id: companyId,
            });
            const fakeSubscription = SubscriptionsTestUtils.generateFakeSubscription({
                userId,
                companyId,
                eventId: null,
            });

            companiesService.findById.mockResolvedValue(fakeCompany);
            repository.findOneByUserIdAndEntityId.mockResolvedValue(null);
            repository.create.mockResolvedValue(fakeSubscription);

            const result = await service.create(dto, userId);

            expect(companiesService.findById).toHaveBeenCalledWith(companyId);
            expect(eventsService.findById).not.toHaveBeenCalled();
            expect(repository.findOneByUserIdAndEntityId).toHaveBeenCalledWith(
                userId,
                companyId,
                EntityType.COMPANY,
            );
            expect(repository.create).toHaveBeenCalledWith(
                userId,
                companyId,
                EntityType.COMPANY,
            );
            expect(result).toBeInstanceOf(SubscriptionWithConfidentialWithoutEventId);
            expect(result).toEqual(
                plainToInstance(
                    SubscriptionWithConfidentialWithoutEventId,
                    fakeSubscription,
                    {
                        groups: SERIALIZATION_GROUPS.CONFIDENTIAL,
                        excludeExtraneousValues: true,
                    },
                ),
            );
        });

        it('should throw NotFoundException if event does not exist', async () => {
            const dto: CreateSubscriptionDto = {
                entityId: eventId,
                entityType: EntityType.EVENT,
            };
            eventsService.findById.mockRejectedValue(new NotFoundException());

            await expect(service.create(dto, userId)).rejects.toThrow(
                NotFoundException,
            );
            expect(repository.findOneByUserIdAndEntityId).not.toHaveBeenCalled();
            expect(repository.create).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException if company does not exist', async () => {
            const dto: CreateSubscriptionDto = {
                entityId: companyId,
                entityType: EntityType.COMPANY,
            };
            companiesService.findById.mockRejectedValue(new NotFoundException());

            await expect(service.create(dto, userId)).rejects.toThrow(
                NotFoundException,
            );
            expect(repository.findOneByUserIdAndEntityId).not.toHaveBeenCalled();
            expect(repository.create).not.toHaveBeenCalled();
        });

        it('should throw ConflictException if user is already subscribed', async () => {
            const dto: CreateSubscriptionDto = {
                entityId: eventId,
                entityType: EntityType.EVENT,
            };
            const fakeEvent = SubscriptionsTestUtils.generateFakeEvent({
                id: eventId,
            });
            const existingSubscription =
                SubscriptionsTestUtils.generateFakeSubscription({
                    userId,
                    eventId,
                });

            eventsService.findById.mockResolvedValue(fakeEvent);
            repository.findOneByUserIdAndEntityId.mockResolvedValue(
                existingSubscription,
            );

            await expect(service.create(dto, userId)).rejects.toThrow(
                ConflictException,
            );
            expect(repository.create).not.toHaveBeenCalled();
        });
    });

    describe('findAllByUserIdForEvents', () => {
        it('should return user subscriptions for events', async () => {
            const userId = 1;
            // Создаем подписки с гарантированным свойством event
            const fakeSubscriptions = SubscriptionsTestUtils.generateFakeSubscriptions(2, {
                userId,
                eventId: faker.number.int({ min: 1, max: 10 }),
                companyId: null,
            }).map(sub => ({
                ...sub,
                event: SubscriptionsTestUtils.generateFakeEvent(), // Гарантируем наличие event
                company: null // Гарантируем, что company равен null, а не undefined
            }));

            repository.findAllByUserIdForEvents.mockResolvedValue(fakeSubscriptions);

            const result = await service.findAllByUserIdForEvents(userId);

            expect(repository.findAllByUserIdForEvents).toHaveBeenCalledWith(userId);
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual(
                plainToInstance(Subscription, fakeSubscriptions[0], {
                    groups: SERIALIZATION_GROUPS.EVENTS,
                }),
            );
        });
    });

    describe('findAllByUserIdForCompanies', () => {
        it('should return user subscriptions for companies', async () => {
            const userId = 1;
            // Создаем подписки с гарантированным свойством company
            const fakeSubscriptions = SubscriptionsTestUtils.generateFakeSubscriptions(2, {
                userId,
                companyId: faker.number.int({ min: 1, max: 10 }),
                eventId: null,
            }).map(sub => ({
                ...sub,
                company: SubscriptionsTestUtils.generateFakeCompany(), // Гарантируем наличие company
                event: null // Гарантируем, что event равен null, а не undefined
            }));

            repository.findAllByUserIdForCompanies.mockResolvedValue(fakeSubscriptions);

            const result = await service.findAllByUserIdForCompanies(userId);

            expect(repository.findAllByUserIdForCompanies).toHaveBeenCalledWith(userId);
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual(
                plainToInstance(Subscription, fakeSubscriptions[0], {
                    groups: SERIALIZATION_GROUPS.COMPANIES,
                }),
            );
        });
    });

    describe('getSubscriptionInfo', () => {
        const eventId = 10;
        const companyId = 5;
        const userId = 1;

        it('should return info for an event when user is subscribed', async () => {
            const fakeEvent = SubscriptionsTestUtils.generateFakeEvent({
                id: eventId,
            });
            const fakeSubscription = SubscriptionsTestUtils.generateFakeSubscription({
                id: 123,
                userId,
                eventId,
            });
            eventsService.findById.mockResolvedValue(fakeEvent);
            repository.countByEntityId.mockResolvedValue(42);
            repository.findOneByUserIdAndEntityId.mockResolvedValue(fakeSubscription);

            const result = await service.getSubscriptionInfo(
                EntityType.EVENT,
                eventId,
                userId,
            );

            expect(eventsService.findById).toHaveBeenCalledWith(eventId);
            expect(repository.countByEntityId).toHaveBeenCalledWith(
                eventId,
                EntityType.EVENT,
            );
            expect(repository.findOneByUserIdAndEntityId).toHaveBeenCalledWith(
                userId,
                eventId,
                EntityType.EVENT,
            );
            expect(result).toEqual({
                subscribersCount: 42,
                subscriptionId: 123,
            });
        });

        it('should return info for a company when user is not subscribed', async () => {
            const fakeCompany = SubscriptionsTestUtils.generateFakeCompany({
                id: companyId,
            });
            companiesService.findById.mockResolvedValue(fakeCompany);
            repository.countByEntityId.mockResolvedValue(15);
            repository.findOneByUserIdAndEntityId.mockResolvedValue(null);

            const result = await service.getSubscriptionInfo(
                EntityType.COMPANY,
                companyId,
                userId,
            );

            expect(companiesService.findById).toHaveBeenCalledWith(companyId);
            expect(repository.countByEntityId).toHaveBeenCalledWith(
                companyId,
                EntityType.COMPANY,
            );
            expect(repository.findOneByUserIdAndEntityId).toHaveBeenCalledWith(
                userId,
                companyId,
                EntityType.COMPANY,
            );
            expect(result).toEqual({ subscribersCount: 15 });
            expect(result.subscriptionId).toBeUndefined();
        });

        it('should return info for an event when no user is provided', async () => {
            const fakeEvent = SubscriptionsTestUtils.generateFakeEvent({
                id: eventId,
            });
            eventsService.findById.mockResolvedValue(fakeEvent);
            repository.countByEntityId.mockResolvedValue(50);

            const result = await service.getSubscriptionInfo(
                EntityType.EVENT,
                eventId,
                null,
            ); // Pass null for userId

            expect(eventsService.findById).toHaveBeenCalledWith(eventId);
            expect(repository.countByEntityId).toHaveBeenCalledWith(
                eventId,
                EntityType.EVENT,
            );
            expect(repository.findOneByUserIdAndEntityId).not.toHaveBeenCalled();
            expect(result).toEqual({ subscribersCount: 50 });
            expect(result.subscriptionId).toBeUndefined();
        });

        it('should throw NotFoundException if event does not exist', async () => {
            eventsService.findById.mockRejectedValue(new NotFoundException());
            await expect(
                service.getSubscriptionInfo(EntityType.EVENT, eventId, userId),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('findAllUserIdsByEventId', () => {
        it('should return user IDs subscribed to an event', async () => {
            const eventId = 10;
            const userIds = [1, 5, 10];
            const fakeEvent = SubscriptionsTestUtils.generateFakeEvent({
                id: eventId,
            });
            eventsService.findById.mockResolvedValue(fakeEvent);
            repository.findAllUserIdsByEntityId.mockResolvedValue(userIds);

            const result = await service.findAllUserIdsByEventId(eventId);

            expect(eventsService.findById).toHaveBeenCalledWith(eventId);
            expect(repository.findAllUserIdsByEntityId).toHaveBeenCalledWith(
                eventId,
                EntityType.EVENT,
            );
            expect(result).toEqual(userIds);
        });

        it('should throw NotFoundException if event does not exist', async () => {
            const eventId = 99;
            eventsService.findById.mockRejectedValue(new NotFoundException());
            await expect(service.findAllUserIdsByEventId(eventId)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('findAllUserIdsByCompanyId', () => {
        it('should return user IDs subscribed to a company', async () => {
            const companyId = 5;
            const userIds = [2, 8];
            const fakeCompany = SubscriptionsTestUtils.generateFakeCompany({
                id: companyId,
            });
            companiesService.findById.mockResolvedValue(fakeCompany);
            repository.findAllUserIdsByEntityId.mockResolvedValue(userIds);

            const result = await service.findAllUserIdsByCompanyId(companyId);

            expect(companiesService.findById).toHaveBeenCalledWith(companyId);
            expect(repository.findAllUserIdsByEntityId).toHaveBeenCalledWith(
                companyId,
                EntityType.COMPANY,
            );
            expect(result).toEqual(userIds);
        });

        it('should throw NotFoundException if company does not exist', async () => {
            const companyId = 99;
            companiesService.findById.mockRejectedValue(new NotFoundException());
            await expect(service.findAllUserIdsByCompanyId(companyId)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    // Optional: Direct test for findAllUserIdsByEntityId if needed,
    // but it's covered by the two methods above.

    describe('delete', () => {
        it('should delete a subscription if found', async () => {
            const subscriptionId = 123;
            const fakeSubscription = SubscriptionsTestUtils.generateFakeSubscription({
                id: subscriptionId,
            });
            repository.findOneById.mockResolvedValue(fakeSubscription);
            repository.delete.mockResolvedValue(fakeSubscription);

            await service.delete(subscriptionId);

            expect(repository.findOneById).toHaveBeenCalledWith(subscriptionId);
            expect(repository.delete).toHaveBeenCalledWith(subscriptionId);
        });

        it('should throw NotFoundException if subscription is not found', async () => {
            const subscriptionId = 999;
            repository.findOneById.mockResolvedValue(null);

            await expect(service.delete(subscriptionId)).rejects.toThrow(
                NotFoundException,
            );
            expect(repository.findOneById).toHaveBeenCalledWith(subscriptionId);
            expect(repository.delete).not.toHaveBeenCalled();
        });
    });
});

