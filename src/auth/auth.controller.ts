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
    @ApiBody({
        required: true,
        type: CreateUserDto,
        description: 'User registration data',
    })
    @ApiResponse({
        status: HttpStatus.CREATED,
        type: User,
        description: 'Successful user registration',
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'First name must be not empty',
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'User data conflict',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Email already in use',
                },
            },
        },
    })
    async register(@Body() createUserDto: CreateUserDto) {
        return this.authService.register(createUserDto);
    }

    //TODO: (not now) add email verification guard for 1 time use(redis)
    @Post('confirm-email/:confirm_token')
    @UseGuards(JwtConfirmEmailGuard)
    @ApiOperation({ summary: "Confirm the user's email by token" })
    @ApiParam({
        required: true,
        name: 'confirm_token',
        description: 'Email confirmation token',
        example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyRW1haWwiOiJhbm4ubmljaG9sc0BleGFtcGxlLmNvbSIsImlhdCI6MTc0MTUyODEzMCwiZXhwIjoxNzQ0MTIwMTMwfQ.bUwcOYxTHTvLix6z08xcKwidtW_Jn66dbiuVmwMqv88',
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
        description: 'Invalid refresh token',
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
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
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
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'User not found',
                },
            },
        },
    })
    async verifyEmailWithConfirmToken(@UserId() userId: number) {
        return this.authService.confirmEmail(userId);
    }

    @Post('login')
    @ApiOperation({ summary: 'User login' })
    @ApiBody({
        required: true,
        type: LoginDto,
        description: 'User login credentials',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful login',
        type: User,
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Invalid email or password ',
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Invalid email or password',
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Access denied',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'User email is unverified',
                },
            },
        },
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
                    example:
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyRW1haWwiOiJhbm4ubmljaG9sc0BleGFtcGxlLmNvbSIsImlhdCI6MTc0MTUyODEzMCwiZXhwIjoxNzQ0MTIwMTMwfQ.bUwcOYxTHTvLix6z08xcKwidtW_Jn66dbiuVmwMqv88',
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
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
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'CSRF token not generated',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'CSRF token not generated',
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
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Invalid user data',
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
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
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Refresh token not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'User refresh token not found',
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
        description: 'Unauthorized access',
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

    @Post('reset-password')
    @ApiOperation({ summary: 'Send a password recovery email' })
    @ApiBody({
        required: true,
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
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Invalid user data',
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'User not found by email',
                },
            },
        },
    })
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }

    @Post('reset-password/:confirm_token') //TODO: (not now) add guard for 1 time use(redis)
    @UseGuards(JwtResetPasswordGuard)
    @ApiOperation({ summary: 'Confirm password recovery by token' })
    @ApiParam({
        required: true,
        name: 'confirm_token',
        description: 'Password reset confirmation token',
        example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyRW1haWwiOiJhbm4ubmljaG9sc0BleGFtcGxlLmNvbSIsImlhdCI6MTc0MTUyODEzMCwiZXhwIjoxNzQ0MTIwMTMwfQ.bUwcOYxTHTvLix6z08xcKwidtW_Jn66dbiuVmwMqv88',
    })
    @ApiBody({
        required: true,
        type: NewPasswordDto,
        description: 'New password data',
    })
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
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Invalid new password',
                },
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized access',
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
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'User not found',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    description: 'Error message',
                    example: 'User with this email not found',
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
}
