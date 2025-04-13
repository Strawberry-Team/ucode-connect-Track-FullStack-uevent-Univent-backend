// src/models/news/guards/news-owner.guard.ts
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
} from '@nestjs/common';
import { NewsService } from '../news.service';

@Injectable()
export class NewsOwnerGuard implements CanActivate {
    constructor(private readonly newsService: NewsService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.userId;
        const newsItemId: number = +request.params?.id || +request.params?.newsId;

        const newsItem = await this.newsService.findById(newsItemId);

        if (!newsItem) {
            throw new ForbiddenException(
                'News item not found or access denied',
            );
        }

        if (newsItem.authorId !== userId) {
            throw new ForbiddenException(
                'Only the company owner has access to it',
            );
        }

        return true;
    }
}
