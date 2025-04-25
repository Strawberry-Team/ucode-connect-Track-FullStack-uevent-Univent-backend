// test/unit/companies/companies.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from '../../../src/models/companies/companies.controller';
import { CompaniesService } from '../../../src/models/companies/companies.service';
import { User } from '../../../src/models/users/entities/user.entity';
import { Company } from '../../../src/models/companies/entities/company.entity';
import { CreateCompanyDto } from '../../../src/models/companies/dto/create-company.dto';
import { UpdateCompanyDto } from '../../../src/models/companies/dto/update-company.dto';
import {
    generateFakeCompany,
    generateFakeLogoName,
    pickCompanyFields,
} from '../../fake-data/fake-companies';
import { generateFakeUser } from '../../fake-data/fake-users';
import { CompanyOwnerGuard } from '../../../src/models/companies/guards/company-owner.guard';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../../src/models/users/users.service';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '../../../src/models/auth/guards/auth.guards';
import { NotFoundException } from '@nestjs/common';
import { EventsService } from '../../../src/models/events/events.service';
import { NewsService } from '../../../src/models/news/news.service';
import { SubscriptionsService } from '../../../src/models/subscriptions/subscriptions.service';
import { ad } from '@faker-js/faker/dist/airline-CBNP41sR';
import { News } from 'src/models/news/entities/news.entity';
import { AttendeeVisibility, EventStatus } from '@prisma/client';

class MockJwtAuthGuard {
    canActivate() {
        return true;
    }
}

describe('CompaniesController', () => {
    let controller: CompaniesController;
    let companiesService: CompaniesService;
    let eventsService: EventsService;
    let newsService: NewsService;
    let subscriptionsService: SubscriptionsService;

    const fakeUser: User = generateFakeUser();
    const fakeCompany: Company = generateFakeCompany(fakeUser.id);
    const fakeCreateCompanyDto: CreateCompanyDto = pickCompanyFields(
        fakeCompany,
        ['email', 'title', 'description'],
    );
    const fakeUpdateCompanyDto: UpdateCompanyDto = pickCompanyFields(
        generateFakeCompany(fakeUser.id),
        ['title', 'description'],
    );
    const fakeUpdatedCompany: Company = {
        ...fakeCompany,
        ...fakeUpdateCompanyDto,
    };
    const mockFrontUrl = 'http://localhost:3000';

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CompaniesController],
            providers: [
                {
                    provide: CompaniesService,
                    useValue: {
                        create: jest.fn().mockResolvedValue(null),
                        findAll: jest.fn().mockResolvedValue([]),
                        findById: jest.fn().mockResolvedValue(null),
                        findByOwnerId: jest.fn().mockResolvedValue(null),
                        findByEmail: jest.fn().mockResolvedValue(null),
                        update: jest.fn().mockResolvedValue(null),
                        updateLogo: jest.fn().mockResolvedValue(null),
                        delete: jest.fn().mockResolvedValue(undefined),
                    },
                },
                {
                    provide: EventsService,
                    useValue: {
                        findById: jest.fn().mockResolvedValue(null),
                        findByCompanyId: jest.fn().mockImplementation((companyId) => {
                            if (companyId === -1) throw new NotFoundException('Company not found');
                            return Promise.resolve([]);
                        }),
                    },
                },
                {
                    provide: NewsService,
                    useValue: {
                        create: jest.fn().mockImplementation((dto, userId, companyId) => {
                            if (companyId === -1) throw new NotFoundException('Company not found');
                            return Promise.resolve({
                                id: 1,
                                ...dto,
                                authorId: userId,
                                companyId: companyId,
                                eventId: null,
                                createdAt: new Date(),
                                updatedAt: new Date()
                            });
                        }),
                        findByCompanyId: jest.fn().mockImplementation((companyId) => {
                            if (companyId === -1) throw new NotFoundException('Company not found');
                            return Promise.resolve([]);
                        }),
                    },
                },
                {
                    provide: SubscriptionsService,
                    useValue: {
                        getSubscriptionInfo: jest.fn().mockImplementation((type, id) => {
                            if (id === -1) throw new NotFoundException('Company not found');
                            return Promise.resolve({
                                isSubscribed: true,
                                subscribersCount: 10
                            });
                        }),
                    },
                },
                {
                    provide: CompanyOwnerGuard,
                    useValue: {
                        canActivate: jest.fn().mockReturnValue(true),
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue(mockFrontUrl),
                    },
                },
                {
                    provide: UsersService,
                    useValue: {
                        findById: jest.fn().mockResolvedValue(fakeUser),
                    },
                },
                {
                    provide: Reflector,
                    useValue: {
                        get: jest.fn().mockReturnValue(true),
                        getAllAndOverride: jest.fn().mockReturnValue(true),
                    },
                },
            ],
        })
        .overrideGuard(JwtAuthGuard).useClass(MockJwtAuthGuard)
        .overrideGuard(CompanyOwnerGuard).useValue({ canActivate: () => true })
        .compile();

        controller = module.get<CompaniesController>(CompaniesController);
        companiesService = module.get<CompaniesService>(CompaniesService);
        eventsService = module.get<EventsService>(EventsService);
        newsService = module.get<NewsService>(NewsService);
        subscriptionsService = module.get<SubscriptionsService>(SubscriptionsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Create Company', () => {
        it('Should create a company', async () => {
            jest.spyOn(companiesService, 'create').mockResolvedValue(
                fakeCompany,
            );

            const result = await controller.create(
                fakeCreateCompanyDto,
                fakeUser.id,
            );
            expect(result).toEqual(fakeCompany);
            expect(companiesService.create).toHaveBeenCalledWith(
                fakeCreateCompanyDto,
                fakeUser.id,
            );
        });
    });

    describe('Find All Companies', () => {
        it('Should return all companies', async () => {
            const expectedResponse = {
                items: [fakeCompany],
                count: 1,
                total: 1
            };
            jest.spyOn(companiesService, 'findAll').mockResolvedValue(expectedResponse);

            const result = await controller.findAll();
            expect(result).toEqual(expectedResponse);
            expect(companiesService.findAll).toHaveBeenCalled();
        });
    });

    describe('Find One Company by ID', () => {
        it('Should return a company by ID', async () => {
            jest.spyOn(companiesService, 'findById').mockResolvedValue(
                fakeCompany,
            );

            const result = await controller.findOne(fakeCompany.id);
            expect(result).toEqual(fakeCompany);
            expect(companiesService.findById).toHaveBeenCalledWith(
                fakeCompany.id,
            );
        });
    });

    describe('Update Company', () => {
        it('Should update a company', async () => {
            jest.spyOn(companiesService, 'update').mockResolvedValue(
                fakeUpdatedCompany,
            );

            const result = await controller.update(
                fakeCompany.id,
                fakeUpdateCompanyDto,
            );
            expect(result).toEqual(fakeUpdatedCompany);
            expect(companiesService.update).toHaveBeenCalledWith(
                fakeCompany.id,
                fakeUpdateCompanyDto,
            );
        });
    });

    describe('Upload Logo', () => {
        it('Should upload a company logo successfully', async () => {
            const logoName = generateFakeLogoName();
            const mockFile = { filename: logoName } as Express.Multer.File;
            jest.spyOn(companiesService, 'updateLogo').mockResolvedValue(
                {
                    ...fakeCompany,
                    logoName,
                },
            );

            const result = await controller.updateLogo(
                fakeCompany.id,
                mockFile,
            );
            expect(result).toEqual({ server_filename: logoName });
            expect(companiesService.updateLogo).toHaveBeenCalledWith(
                fakeCompany.id,
                logoName,
            );
        });
    });

    describe('Remove Company', () => {
        it('Should remove a company', async () => {
            const deleteMessage = { message: 'Company successfully deleted' };
            jest.spyOn(companiesService, 'delete').mockResolvedValue(deleteMessage);

            const result = await controller.delete(fakeCompany.id);
            expect(result).toEqual(deleteMessage);
            expect(companiesService.delete).toHaveBeenCalledWith(fakeCompany.id);
        });
    });

    describe('Create Company News', () => {
        const fakeNewsDto = {
            title: 'Test News',
            description: 'Test Description'
        };

        const fakeNews = {
            id: 1,
            authorId: fakeUser.id,
            companyId: fakeCompany.id,
            eventId: null,
            title: fakeNewsDto.title,
            description: fakeNewsDto.description,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        it('Should create news for company', async () => {
            jest.spyOn(newsService, 'create').mockResolvedValue(fakeNews);

            const result = await controller.createNews(fakeCompany.id, fakeNewsDto, fakeUser.id);
            expect(result).toEqual(fakeNews);
            expect(newsService.create).toHaveBeenCalledWith(fakeNewsDto, fakeUser.id, fakeCompany.id, undefined);
        });

        it('Should throw NotFoundException when company is not found', async () => {
            jest.spyOn(companiesService, 'findById').mockRejectedValue(new NotFoundException('Company not found'));
            await expect(controller.createNews(-1, fakeNewsDto, fakeUser.id)).rejects.toThrow(NotFoundException);
        });
    });

    describe('Find All Company Events', () => {
        const fakeEvents = [
            {
                id: 1,
                companyId: fakeCompany.id,
                title: 'Event 1',
                description: 'Description 1',
                formatId: 1,
                venue: 'Venue 1',
                locationCoordinates: '40.7128,-74.0060',
                startedAt: new Date(),
                endedAt: new Date(),
                publishedAt: new Date(),
                ticketsAvailableFrom: new Date(),
                posterUrl: '',
                posterName: '',
                attendeeVisibility: AttendeeVisibility.EVERYONE,
                status: EventStatus.DRAFT,
                createdAt: new Date(),
                updatedAt: new Date(),
                themes: [],
                news: [],
                tickets: [],
                promoCodes: [],
                attendees: []
            },
            {
                id: 2,
                companyId: fakeCompany.id,
                title: 'Event 2',
                description: 'Description 2',
                formatId: 2,
                venue: 'Venue 2',
                locationCoordinates: '51.5074,-0.1278',
                startedAt: new Date(),
                endedAt: new Date(),
                publishedAt: new Date(),
                ticketsAvailableFrom: new Date(),
                posterUrl: '',
                posterName: '',
                attendeeVisibility: AttendeeVisibility.EVERYONE,
                status: EventStatus.DRAFT,
                createdAt: new Date(),
                updatedAt: new Date(),
                themes: [],
                news: [],
                tickets: [],
                promoCodes: [],
                attendees: []
            }
        ];

        it('Should return all company events', async () => {
            jest.spyOn(eventsService, 'findByCompanyId').mockResolvedValue(fakeEvents);

            const result = await controller.findAllEvents(fakeCompany.id);
            expect(result).toEqual(fakeEvents);
            expect(eventsService.findByCompanyId).toHaveBeenCalledWith(fakeCompany.id);
        });

        it('Should throw NotFoundException when company is not found', async () => {
            jest.spyOn(companiesService, 'findById').mockRejectedValue(new NotFoundException('Company not found'));
            await expect(controller.findAllEvents(-1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('Find All Company News', () => {
        const fakeNewsList = [
            {
                id: 1,
                authorId: fakeUser.id,
                companyId: fakeCompany.id,
                eventId: null,
                title: 'News 1',
                description: 'Description 1',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 2,
                authorId: fakeUser.id,
                companyId: fakeCompany.id,
                eventId: null,
                title: 'News 2',
                description: 'Description 2',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        it('Should return all company news', async () => {
            jest.spyOn(newsService, 'findByCompanyId').mockResolvedValue(fakeNewsList);

            const result = await controller.findAllNews(fakeCompany.id);
            expect(result).toEqual(fakeNewsList);
            expect(newsService.findByCompanyId).toHaveBeenCalledWith(fakeCompany.id);
        });

        it('Should throw NotFoundException when company is not found', async () => {
            jest.spyOn(companiesService, 'findById').mockRejectedValue(new NotFoundException('Company not found'));
            await expect(controller.findAllNews(-1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('Get Company Subscription Info', () => {
        const mockSubscriptionInfo = {
            isSubscribed: true,
            subscribersCount: 10
        };

        it('Should return subscription info for authenticated user', async () => {
            jest.spyOn(subscriptionsService, 'getSubscriptionInfo').mockResolvedValue(mockSubscriptionInfo);

            const result = await controller.getSubscriptionInfo(fakeCompany.id, fakeUser.id);
            expect(result).toEqual(mockSubscriptionInfo);
            expect(subscriptionsService.getSubscriptionInfo).toHaveBeenCalledWith('company', fakeCompany.id, fakeUser.id);
        });

        it('Should return subscription info for unauthenticated user', async () => {
            jest.spyOn(subscriptionsService, 'getSubscriptionInfo').mockResolvedValue(mockSubscriptionInfo);

            const result = await controller.getSubscriptionInfo(fakeCompany.id, null);
            expect(result).toEqual(mockSubscriptionInfo);
            expect(subscriptionsService.getSubscriptionInfo).toHaveBeenCalledWith('company', fakeCompany.id, null);
        });

        it('Should throw NotFoundException when company is not found', async () => {
            jest.spyOn(companiesService, 'findById').mockRejectedValue(new NotFoundException('Company not found'));
            await expect(controller.getSubscriptionInfo(-1, fakeUser.id)).rejects.toThrow(NotFoundException);
        });
    });
});
