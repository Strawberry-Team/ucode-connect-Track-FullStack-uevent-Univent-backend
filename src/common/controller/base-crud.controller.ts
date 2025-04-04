// src/common/controller/base-crud.controller.ts
import {
    Body,
    Delete,
    Get,
    NotFoundException,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import {JwtAuthGuard} from "../../auth/guards/auth.jwt-guards";
import { UserId } from 'src/user/decorators/user.decorator';

@UseGuards(JwtAuthGuard)
export abstract class BaseCrudController<
    T,
    CreateDto,
    UpdateDto
> {
    protected abstract findById(id: number, userId: number): Promise<T>;

    protected abstract createEntity(dto: CreateDto, userId: number): Promise<T>;

    protected abstract updateEntity(
        id: number,
        dto: UpdateDto,
        userId: number
    ): Promise<T>;

    protected abstract deleteEntity(id: number, userId: number): Promise<void>;

    @Get(':id')
    async getById(@Param('id') id: number, @UserId() userId: number): Promise<T> {
        const existing = await this.findById(id, userId);
        if (!existing) {
            throw new NotFoundException("Entity not found");
        }
        return existing;
    }

    @Post()
    async create(@Body() dto: CreateDto, @UserId() userId: number): Promise<T> {
        return await this.createEntity(dto, userId);
    }

    @Patch(':id')
    async update(
        @Param('id') id: number,
        @Body() dto: UpdateDto,
        @UserId() userId: number
    ): Promise<T> {
        const existing = await this.findById(id, userId);
        if (!existing) {
            throw new NotFoundException("Entity not found");
        }
        return await this.updateEntity(id, dto, userId);
    }

    @Delete(':id')
    async delete(@Param('id') id: number, @UserId() userId: number): Promise<void> {
        const existing = await this.findById(id, userId);
        if (!existing) {
            throw new NotFoundException("Entity not found");
        }
        await this.deleteEntity(id, userId);
    }
}
