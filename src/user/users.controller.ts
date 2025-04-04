// src/user/users.controller.ts
import {
    Controller,
    UseInterceptors,
    UploadedFile,
    BadRequestException, Post,
    Body, Req, NotImplementedException, Param, Patch, Delete,
    UseGuards, Get, SerializeOptions,
    Query,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { BaseCrudController } from '../common/controller/base-crud.controller';
import { SERIALIZATION_GROUPS, User } from './entity/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { Express } from 'express';
import { createFileUploadInterceptor } from "../common/interceptor/file-upload.interceptor";
import { AvatarConfig } from '../config/avatar.config';
import { OwnAccountGuard } from './guards/own-account.guard';
import { RequestWithUser } from "../common/types/request.types";

@Controller('users')
@SerializeOptions({
    groups: SERIALIZATION_GROUPS.BASIC
})
export class UsersController extends BaseCrudController<
    User,
    CreateUserDto,
    UpdateUserDto
> {
    constructor(
        private readonly usersService: UsersService) {
        super();
    }

    protected async findById(id: number, req: RequestWithUser): Promise<User> {
        return await this.usersService.getUserByIdWithoutPassword(id);
    }

    protected async createEntity(dto: CreateUserDto, req: RequestWithUser): Promise<User> {
        return await this.usersService.createUser(dto);
    }

    protected async updateEntity(
        id: number,
        dto: UpdateUserDto,
        req: RequestWithUser
    ): Promise<User> {
        return await this.usersService.updateUser(id, dto);
    }

    protected async deleteEntity(id: number, req: RequestWithUser): Promise<void> {
        return await this.usersService.deleteUser(id);
    }

    @Post()
    async create(@Body() dto: CreateUserDto, @Req() req: RequestWithUser): Promise<User> {
        throw new NotImplementedException();
    }

    @Patch(':id')
    @UseGuards(OwnAccountGuard)
    async update(@Param('id') id: number, @Body() dto: UpdateUserDto, @Req() req: RequestWithUser): Promise<User> {
        return super.update(id, dto, req);
    }

    @Delete(':id')
    @UseGuards(OwnAccountGuard)
    async delete(@Param('id') id: number, @Req() req: RequestWithUser): Promise<void> {
        return super.delete(id, req);
    }

    @Get()
    async getAllUsers(@Query('email') email: string, @Req() req: RequestWithUser): Promise<User> {
        if (!email) {
            throw new BadRequestException('Email parameter is required');
        }

        return await this.usersService.getUserByEmailWithoutPassword(email);
    }


    @Post('upload-avatar')
    @UseInterceptors(
        createFileUploadInterceptor({
            destination: './public/uploads/avatars',
            allowedTypes: AvatarConfig.prototype.allowedTypesForInterceptor,
            maxSize: 5 * 1024 * 1024,
        })
    )
    async uploadAvatar(
        @UploadedFile() file: Express.Multer.File,
    ): Promise<{ server_filename: string }> {
        //TODO: (not now) Delete old pictures (that a person just uploaded) do in Scheduler
        if (!file) {
            throw new BadRequestException('No file uploaded.');
        }
        return { server_filename: file.filename };
    }
}
