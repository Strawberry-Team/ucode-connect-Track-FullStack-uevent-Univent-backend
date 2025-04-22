import { Test, TestingModule } from '@nestjs/testing';
import { NewsController } from '../../../src/models/news/news.controller';
import { NewsService } from '../../../src/models/news/news.service';
import { NotFoundException } from '@nestjs/common';
import { generateFakeNews, generateFakeCreateNewsDto } from '../../fake-data/fake-news';
import { UpdateNewsDto } from '../../../src/models/news/dto/update-news.dto';
import { NewsOwnerGuard } from '../../../src/models/news/guards/news-owner.guard';
import { JwtAuthGuard } from '../../../src/models/auth/guards/auth.guards';

describe('NewsController', () => {
    let controller: NewsController;
    let newsService: jest.Mocked<NewsService>;

    const mockNewsService = {
        findById: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [NewsController],
            providers: [
                {
                    provide: NewsService,
                    useValue: mockNewsService,
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: () => true })
            .overrideGuard(NewsOwnerGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<NewsController>(NewsController);
        newsService = module.get(NewsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findOne', () => {
        const fakeNews = generateFakeNews(1);

        it('should return a news item by id', async () => {
            newsService.findById.mockResolvedValue(fakeNews);

            const result = await controller.findOne(fakeNews.id);

            expect(result).toEqual(fakeNews);
            expect(newsService.findById).toHaveBeenCalledWith(fakeNews.id);
        });

        it('should throw NotFoundException when news not found', async () => {
            const newsId = -1;
            newsService.findById.mockRejectedValue(new NotFoundException('News item not found'));

            await expect(controller.findOne(newsId)).rejects.toThrow(NotFoundException);
            expect(newsService.findById).toHaveBeenCalledWith(newsId);
        });
    });

    describe('update', () => {
        const fakeNews = generateFakeNews(1);
        const updateNewsDto: UpdateNewsDto = {
            title: 'Updated Title',
            description: 'Updated Description',
        };

        it('should update news and return updated data', async () => {
            const updatedNews = { ...fakeNews, ...updateNewsDto };
            newsService.update.mockResolvedValue(updatedNews);

            const result = await controller.update(fakeNews.id, updateNewsDto);

            expect(result).toEqual(updatedNews);
            expect(newsService.update).toHaveBeenCalledWith(fakeNews.id, updateNewsDto);
        });

        it('should throw NotFoundException when news not found', async () => {
            const newsId = -1;
            newsService.update.mockRejectedValue(new NotFoundException('News not found'));

            await expect(controller.update(newsId, updateNewsDto)).rejects.toThrow(NotFoundException);
            expect(newsService.update).toHaveBeenCalledWith(newsId, updateNewsDto);
        });

        it('should throw NotFoundException when user is not the owner', async () => {
            const module: TestingModule = await Test.createTestingModule({
                controllers: [NewsController],
                providers: [
                    {
                        provide: NewsService,
                        useValue: mockNewsService,
                    },
                ],
            })
                .overrideGuard(JwtAuthGuard)
                .useValue({ canActivate: () => true })
                .overrideGuard(NewsOwnerGuard)
                .useValue({ canActivate: () => {
                    throw new NotFoundException('Only the news owner has access to it');
                }})
                .compile();

            const controllerWithGuard = module.get<NewsController>(NewsController);

            await expect(controllerWithGuard.update(fakeNews.id, updateNewsDto))
                .rejects.toThrow(NotFoundException);
        });
    });

    describe('delete', () => {
        const fakeNews = generateFakeNews(1);

        it('should delete news and return success message', async () => {
            const successMessage = { message: 'News item successfully deleted' };
            newsService.delete.mockResolvedValue(successMessage);

            const result = await controller.delete(fakeNews.id);

            expect(result).toEqual(successMessage);
            expect(newsService.delete).toHaveBeenCalledWith(fakeNews.id);
        });

        it('should throw NotFoundException when news not found', async () => {
            const newsId = -1;
            newsService.delete.mockRejectedValue(new NotFoundException('News not found'));

            await expect(controller.delete(newsId)).rejects.toThrow(NotFoundException);
            expect(newsService.delete).toHaveBeenCalledWith(newsId);
        });

        it('should throw NotFoundException when user is not the owner', async () => {
            const module: TestingModule = await Test.createTestingModule({
                controllers: [NewsController],
                providers: [
                    {
                        provide: NewsService,
                        useValue: mockNewsService,
                    },
                ],
            })
                .overrideGuard(JwtAuthGuard)
                .useValue({ canActivate: () => true })
                .overrideGuard(NewsOwnerGuard)
                .useValue({ canActivate: () => {
                    throw new NotFoundException('Only the news owner has access to it');
                }})
                .compile();

            const controllerWithGuard = module.get<NewsController>(NewsController);

            await expect(controllerWithGuard.delete(fakeNews.id))
                .rejects.toThrow(NotFoundException);
        });
    });
});
