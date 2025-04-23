// test/unit/news/news.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { NewsService } from '../../../src/models/news/news.service';
import { NewsRepository } from '../../../src/models/news/news.repository';
import { UsersService } from '../../../src/models/users/users.service';
import { CompaniesService } from '../../../src/models/companies/companies.service';
import { EventsService } from '../../../src/models/events/events.service';
import { CreateNewsDto } from '../../../src/models/news/dto/create-news.dto';
import { UpdateNewsDto } from '../../../src/models/news/dto/update-news.dto';
import { NotFoundException } from '@nestjs/common';
import { Company } from '../../../src/models/companies/entities/company.entity';
import { Event, EventWithRelations } from '../../../src/models/events/entities/event.entity';
import { User } from '../../../src/models/users/entities/user.entity';
import { UserRole } from '@prisma/client';
import { 
  generateFakeCreateNewsDto, 
  generateFakeNews, 
  generateFakeCompanyNewsList,
  generateFakeEventNewsList 
} from '../../fake-data/fake-news';
import { generateFakeUser } from '../../fake-data/fake-users';
import { generateFakeCompany } from '../../fake-data/fake-companies';
import { generateFakeEventWithRelations } from '../../fake-data/fake-events';
import { faker } from '@faker-js/faker';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('NewsService', () => {
  let newsService: NewsService;
  let newsRepository: jest.Mocked<NewsRepository>;
  let usersService: jest.Mocked<UsersService>;
  let companiesService: jest.Mocked<CompaniesService>;
  let eventsService: jest.Mocked<EventsService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const fakeUser = generateFakeUser();
  const fakeCompany = generateFakeCompany(fakeUser.id);
  const fakeEvent = generateFakeEventWithRelations();
  const createNewsDto = generateFakeCreateNewsDto();
  const fakeCompanyNews = generateFakeNews(fakeUser.id, fakeCompany.id, null);
  const fakeEventNews = generateFakeNews(fakeUser.id, null, fakeEvent.id);
  const fakeCompanyNewsList = generateFakeCompanyNewsList(
    undefined, 
    fakeUser.id, 
    fakeCompany.id
  );
  const fakeEventNewsList = generateFakeEventNewsList(
    undefined, 
    fakeUser.id, 
    fakeEvent.id
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsService,
        {
          provide: NewsRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            findByAuthorId: jest.fn(),
            findByCompanyId: jest.fn(),
            findByEventId: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findUserById: jest.fn(),
          },
        },
        {
          provide: CompaniesService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: EventsService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    newsService = module.get<NewsService>(NewsService);
    newsRepository = module.get(NewsRepository);
    usersService = module.get(UsersService);
    companiesService = module.get(CompaniesService);
    eventsService = module.get(EventsService);
    eventEmitter = module.get(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Create News item', () => {    
    it('Should create company news item successfully', async () => {
      companiesService.findById.mockResolvedValue(fakeCompany);
      newsRepository.create.mockResolvedValue(fakeCompanyNews);

      const result = await newsService.create(createNewsDto, fakeUser.id, fakeCompany.id, undefined);

	  expect(result).toEqual(fakeCompanyNews);
      expect(companiesService.findById).toHaveBeenCalledWith(fakeCompany.id);
      expect(newsRepository.create).toHaveBeenCalled();
    });

	it('Should create event news item successfully', async () => {
		eventsService.findById.mockResolvedValue(fakeEvent);
		newsRepository.create.mockResolvedValue(fakeEventNews);
  
		const result = await newsService.create(createNewsDto, fakeUser.id, undefined, fakeEvent.id);
  
		expect(result).toEqual(fakeEventNews);
		expect(eventsService.findById).toHaveBeenCalledWith(fakeEvent.id);
		expect(newsRepository.create).toHaveBeenCalled();
	  });

    it('Should throw NotFoundException when neither companyId nor eventId provided', async () => {
      const createNewsDto = generateFakeCreateNewsDto();
      await expect(newsService.create(createNewsDto, fakeUser.id, undefined, undefined))
        .rejects
        .toThrow(NotFoundException);
    });

    it('Should throw NotFoundException when company not found', async () => {
      companiesService.findById.mockResolvedValue(null as unknown as Company);

      await expect(
        newsService.create(createNewsDto, fakeUser.id, fakeCompany.id, undefined)
      ).rejects.toThrow(NotFoundException);
      expect(companiesService.findById).toHaveBeenCalledWith(fakeCompany.id);
    });

    it('Should throw NotFoundException when event not found', async () => {
      eventsService.findById.mockResolvedValue(null as unknown as EventWithRelations);

      await expect(
        newsService.create(createNewsDto, fakeUser.id, undefined, fakeEvent.id)
      ).rejects.toThrow(NotFoundException);
      expect(eventsService.findById).toHaveBeenCalledWith(fakeEvent.id);
    });
  });

  describe('Find one News item by its id', () => {
    it('Should return company news item by id', async () => {
      newsRepository.findById.mockResolvedValue(fakeCompanyNews);

      const result = await newsService.findById(fakeCompanyNews.id);

      expect(result).toEqual(fakeCompanyNews);
      expect(newsRepository.findById).toHaveBeenCalledWith(fakeCompanyNews.id);
    });

	it('Should return event news item by id', async () => {
		newsRepository.findById.mockResolvedValue(fakeEventNews);
  
		const result = await newsService.findById(fakeEventNews.id);
  
		expect(result).toEqual(fakeEventNews);
		expect(newsRepository.findById).toHaveBeenCalledWith(fakeEventNews.id);
	  });

    it('Should throw NotFoundException when news not found', async () => {
      newsRepository.findById.mockResolvedValue(null);

      await expect(newsService.findById(-1)).rejects.toThrow(NotFoundException);
      expect(newsRepository.findById).toHaveBeenCalledWith(-1);
    });
  });

  describe('Find all news by author id', () => {
    it('Should return all news by author id', async () => {      
      usersService.findUserById.mockResolvedValue(fakeUser);
      newsRepository.findByAuthorId.mockResolvedValue(fakeCompanyNewsList);

      const result = await newsService.findByAuthorId(fakeUser.id);

      expect(result).toEqual(fakeCompanyNewsList);
      expect(result).toHaveLength(fakeCompanyNewsList.length);
      expect(usersService.findUserById).toHaveBeenCalledWith(fakeUser.id);
      expect(newsRepository.findByAuthorId).toHaveBeenCalledWith(fakeUser.id);
    });

    it('Should throw NotFoundException when author not found', async () => {
      usersService.findUserById.mockResolvedValue(null as unknown as User);

      await expect(newsService.findByAuthorId(-1)).rejects.toThrow(NotFoundException);
      expect(usersService.findUserById).toHaveBeenCalledWith(-1);
      expect(newsRepository.findByAuthorId).not.toHaveBeenCalled();
    });
  });

  describe('Find all news by company id', () => {
    it('Should return news by company id', async () => {
      companiesService.findById.mockResolvedValue(fakeCompany);
      newsRepository.findByCompanyId.mockResolvedValue(fakeCompanyNewsList);

      const result = await newsService.findByCompanyId(fakeCompany.id);

      expect(result).toEqual(fakeCompanyNewsList);
      expect(result).toHaveLength(fakeCompanyNewsList.length);
      expect(companiesService.findById).toHaveBeenCalledWith(fakeCompany.id);
      expect(newsRepository.findByCompanyId).toHaveBeenCalledWith(fakeCompany.id);
    });

    it('Should throw NotFoundException when company not found', async () => {
      companiesService.findById.mockResolvedValue(null as unknown as Company);

      await expect(newsService.findByCompanyId(-1)).rejects.toThrow(NotFoundException);
      expect(companiesService.findById).toHaveBeenCalledWith(-1);
      expect(newsRepository.findByCompanyId).not.toHaveBeenCalled();
    });
  });

  describe('Find all news by event id', () => {
    it('Should return news by event id', async () => {
      eventsService.findById.mockResolvedValue(fakeEvent);
      newsRepository.findByEventId.mockResolvedValue(fakeEventNewsList);

      const result = await newsService.findByEventId(fakeEvent.id);

      expect(result).toEqual(fakeEventNewsList);
      expect(result).toHaveLength(fakeEventNewsList.length);
      expect(eventsService.findById).toHaveBeenCalledWith(fakeEvent.id);
      expect(newsRepository.findByEventId).toHaveBeenCalledWith(fakeEvent.id);
    });

    it('Should throw NotFoundException when event not found', async () => {
      eventsService.findById.mockResolvedValue(null as unknown as EventWithRelations);

      await expect(newsService.findByEventId(-1)).rejects.toThrow(NotFoundException);
      expect(eventsService.findById).toHaveBeenCalledWith(-1);
      expect(newsRepository.findByEventId).not.toHaveBeenCalled();
    });
  });

  describe('Update News item', () => {
    const updateNewsDto: UpdateNewsDto = {
      title: faker.lorem.sentence(),
    };

    it('Should update company news item successfully', async () => {
      newsRepository.findById.mockResolvedValue(fakeCompanyNews);
      newsRepository.update.mockResolvedValue({ ...fakeCompanyNews, ...updateNewsDto });

      const result = await newsService.update(fakeCompanyNews.id, updateNewsDto);

      expect(result).toEqual({ ...fakeCompanyNews, ...updateNewsDto });
      expect(newsRepository.update).toHaveBeenCalledWith(fakeCompanyNews.id, updateNewsDto);
    });

	it('Should update event news item successfully', async () => {
		newsRepository.findById.mockResolvedValue(fakeEventNews);
		newsRepository.update.mockResolvedValue({ ...fakeEventNews, ...updateNewsDto });
  
		const result = await newsService.update(fakeEventNews.id, updateNewsDto);
  
		expect(result).toEqual({ ...fakeEventNews, ...updateNewsDto });
		expect(newsRepository.update).toHaveBeenCalledWith(fakeEventNews.id, updateNewsDto);
	  });

    it('Should throw NotFoundException when news not found', async () => {
      newsRepository.findById.mockResolvedValue(null);

      await expect(newsService.update(-1, {})).rejects.toThrow(NotFoundException);
      expect(newsRepository.findById).toHaveBeenCalledWith(-1);
      expect(newsRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('Delete News item', () => {
    it('Should delete company news item successfully', async () => {
      newsRepository.findById.mockResolvedValue(fakeCompanyNews);
      newsRepository.delete.mockResolvedValue(undefined);

      const result = await newsService.delete(fakeCompanyNews.id);

      expect(result).toEqual({ message: 'News item successfully deleted' });
      expect(newsRepository.delete).toHaveBeenCalledWith(fakeCompanyNews.id);
    });

	it('Should delete event news item successfully', async () => {
		newsRepository.findById.mockResolvedValue(fakeEventNews);
		newsRepository.delete.mockResolvedValue(undefined);
  
		const result = await newsService.delete(fakeEventNews.id);
  
		expect(result).toEqual({ message: 'News item successfully deleted' });
		expect(newsRepository.delete).toHaveBeenCalledWith(fakeEventNews.id);
	  });

    it('Should throw NotFoundException when news not found', async () => {
      newsRepository.findById.mockResolvedValue(null);

      await expect(newsService.delete(-1)).rejects.toThrow(NotFoundException);
      expect(newsRepository.findById).toHaveBeenCalledWith(-1);
      expect(newsRepository.delete).not.toHaveBeenCalled();
    });
  });
});
