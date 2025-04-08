// src/users/users.repository.ts
import { Injectable } from '@nestjs/common';
import { User } from './entity/user.entity';
import { DatabaseService } from '../db/database.service';

@Injectable()
export class UsersRepository {
    constructor(private readonly db: DatabaseService) {}

    async findById(id: number): Promise<User | null> {
        return this.db.user.findUnique({
            where: { id },
            include: { refreshTokenNonces: true },
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.db.user.findUnique({
            where: { email },
            include: { refreshTokenNonces: true },
        });
    }

    async getAllUnactivatedUsers(seconds?: number): Promise<User[]> {
        const thresholdDate = new Date();
        thresholdDate.setSeconds(thresholdDate.getSeconds() - Number(seconds));

        return this.db.user.findMany({
            where: {
                createdAt: { lt: thresholdDate },
                isEmailVerified: false,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async create(data: Partial<User>): Promise<User> {
        return this.db.user.create({
            data: data as any,
        });
    }

    async update(
        id: number,
        updateData: Partial<User>,
    ): Promise<User | null> {
        return this.db.user.update({
            where: { id },
            data: updateData as any,
        });
    }

    async delete(id: number): Promise<void> {
        await this.db.user.delete({
            where: { id },
        });
    }

    // async findAllWithOffsetPagination(page: number, limit: number) {
    //     return this.paginateOffset('users', {
    //         orderBy: { createdAt: 'desc' }
    //     }, page, limit);
    // }
    //
    // async findAllWithCursorPagination(after: UserCursor | null, limit: number) {
    //     return this.paginateCursor('users', {
    //         orderBy: [
    //             { createdAt: 'desc' },
    //             { id: 'asc' }
    //         ]
    //     }, after, limit, {
    //         cursorFields: ['createdAt', 'id'],
    //         entityAliases: {
    //             createdAt: 'users',
    //             id: 'users',
    //         },
    //         sortDirections: {
    //             createdAt: 'DESC',
    //             id: 'ASC',
    //         },
    //         fieldTypes: {
    //             createdAt: 'date',
    //             id: 'number',
    //         }
    //     });
    // }
}
