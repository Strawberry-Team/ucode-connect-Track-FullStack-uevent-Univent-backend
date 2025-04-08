// src/auth/auth.controller.ts
import {
    Body,
    Controller,
    Post,
    UseGuards,
    UsePipes,
    ValidationPipe,
    HttpCode,
    Get,
    Req,
    HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { NewPasswordDto } from './dto/new-password.dto';
import {
    JwtRefreshGuard,
    JwtResetPasswordGuard,
    JwtConfirmEmailGuard,
    JwtAuthGuard,
} from './guards/auth.jwt-guards';
import { Request as ExpressRequest } from 'express';
import { UserId } from 'src/users/decorators/user.decorator';
import { RefreshTokenPayload } from 'src/auth/decorators/refresh-token.decorator';
import {
    ApiExcludeEndpoint,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
    ApiBody,
    ApiSecurity,
} from '@nestjs/swagger';
import { User } from '../users/entity/user.entity';

@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true }))
@ApiTags('Auth')
@ApiSecurity('JWT')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @ApiOperation({ summary: 'User registration' })
    @ApiBody({ type: CreateUserDto, description: 'User registration data' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Successful registration',
        type: User,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error',
    })
    async register(@Body() createUserDto: CreateUserDto) {
        return this.authService.register(createUserDto);
    }

    @Post('login')
    @ApiOperation({ summary: 'User login' })
    @ApiBody({ type: LoginDto, description: 'User login credentials' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful login',
        type: User,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error',
    })
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Get('csrf-token')
    @ApiOperation({ summary: 'Get CSRF token' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'CSRF token generated successfully',
        schema: {
            type: 'object',
            properties: {
                csrfToken: {
                    type: 'string',
                    description: 'New CSRF token',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyRW1haWwiOiJhbm4ubmljaG9sc0BleGFtcGxlLmNvbSIsImlhdCI6MTc0MTUyODEzMCwiZXhwIjoxNzQ0MTIwMTMwfQ.bUwcOYxTHTvLix6z08xcKwidtW_Jn66dbiuVmwMqv88',
                },
            },
        },
    })
    getCsrf(@Req() req: ExpressRequest): { csrfToken: string } {
        const token = req.csrfToken();
        return { csrfToken: token };
    }

    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtRefreshGuard)
    @ApiOperation({ summary: 'User logout' })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'Successful logout',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Success message',
                    example: 'Logged out successfully',
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Access denied',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Invalid or expired refresh token',
                },
            },
        },
    })
    async logout(
        @UserId() userId: number,
        @RefreshTokenPayload('nonce') nonce: string,
    ) {
        return this.authService.logout(userId, nonce);
    }

    @Post('/access-token/refresh')
    @UseGuards(JwtRefreshGuard)
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Access token refreshed successfully',
        schema: {
            type: 'object',
            properties: {
                accessToken: {
                    type: 'string',
                    description: 'Access token',
                    example:
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyRW1haWwiOiJhbm4ubmljaG9sc0BleGFtcGxlLmNvbSIsImlhdCI6MTc0MTUyODEzMCwiZXhwIjoxNzQ0MTIwMTMwfQ.bUwcOYxTHTvLix6z08xcKwidtW_Jn66dbiuVmwMqv88',
                },
                refreshToken: {
                    type: 'string',
                    description: 'Refresh token',
                    example:
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyRW1haWwiOiJhbm4ubmljaG9sc0BleGFtcGxlLmNvbSIsImlhdCI6MTc0MTUyODEzMCwiZXhwIjoxNzQ0MTIwMTMwfQ.bUwcOYxTHTvLix6z08xcKwidtW_Jn66dbiuVmwMqv88',
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Access denied',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Invalid or expired refresh token',
                },
            },
        },
    })
    async refreshToken(
        @RefreshTokenPayload('nonce') nonce: string,
        @RefreshTokenPayload('createdAt') createdAt: number,
        @UserId() userId: number,
    ) {
        return this.authService.refreshToken(userId, createdAt, nonce);
    }

    @Post('reset-password/:confirm_token') //TODO: (not now) add guard for 1 time use(redis)
    @UseGuards(JwtResetPasswordGuard)
    @ApiOperation({ summary: 'Confirm password recovery by token' })
    @ApiParam({
        name: 'confirm_token',
        required: true,
        description: 'Password reset confirmation token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyRW1haWwiOiJhbm4ubmljaG9sc0BleGFtcGxlLmNvbSIsImlhdCI6MTc0MTUyODEzMCwiZXhwIjoxNzQ0MTIwMTMwfQ.bUwcOYxTHTvLix6z08xcKwidtW_Jn66dbiuVmwMqv88'
    })
    @ApiBody({ type: NewPasswordDto, description: 'New password data' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful password update',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Success message',
                    example: 'Password has been reset successfully',
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid token',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Access denied',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Invalid or expired refresh token',
                },
            },
        },
    })
    async resetPasswordWithConfirmToken(
        @Body() newPasswordDto: NewPasswordDto,
        @UserId() userId: number,
    ) {
        return this.authService.resetPasswordWithConfirmToken(
            newPasswordDto,
            userId,
        );
    }

    //TODO: (not now) add email verification guard for 1 time use(redis)
    @Post('confirm-email/:confirm_token')
    @UseGuards(JwtConfirmEmailGuard)
    @ApiOperation({ summary: "Confirm the user's email by token" })
    @ApiParam({
        name: 'confirm_token',
        required: true,
        description: 'Email confirmation token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyRW1haWwiOiJhbm4ubmljaG9sc0BleGFtcGxlLmNvbSIsImlhdCI6MTc0MTUyODEzMCwiZXhwIjoxNzQ0MTIwMTMwfQ.bUwcOYxTHTvLix6z08xcKwidtW_Jn66dbiuVmwMqv88'
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful email confirmation',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Success message',
                    example: 'Email confirmed successfully',
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid token',
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Access denied',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Invalid or expired refresh token',
                },
            },
        },
    })
    async verifyEmailWithConfirmToken(@UserId() userId: number) {
        return this.authService.confirmEmail(userId);
    }

    @Post('reset-password')
    @ApiOperation({ summary: 'Send a password recovery email' })
    @ApiBody({
        type: ResetPasswordDto,
        description: 'Email for password reset',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Password recovery email sent successfully',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Success message',
                    example: 'Password recovery email sent',
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User not found by email',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error',
    })
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }
}
