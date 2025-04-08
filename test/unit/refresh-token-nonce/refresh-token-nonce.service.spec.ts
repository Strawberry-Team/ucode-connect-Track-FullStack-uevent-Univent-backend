// src/refresh-token-nonces/test/refresh-token-nonce.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RefreshTokenNonceService } from '../../../src/refresh-token-nonces/refresh-token-nonce.service';
import { RefreshTokenNonceRepository } from '../../../src/refresh-token-nonces/refresh-token-nonce.repository';
import { RefreshTokenNonce } from '../../../src/refresh-token-nonces/entity/refresh-token-nonce.entity';
import { CreateRefreshTokenNonceDto } from '../../../src/refresh-token-nonces/dto/create-refresh-nonce.dto';
import { generateFakeRefreshTokenNonce } from '../utils/refresh-token-nonces.faker.utils';

describe('RefreshTokenNonceService', () => {
    let nonceService: RefreshTokenNonceService;
    let nonceRepository: jest.Mocked<RefreshTokenNonceRepository>;

    beforeEach(async () => {
        const nonceRepositoryMock = {
            getAll: jest.fn(),
            findByRefreshTokenNonceAndUserId: jest.fn(),
            saveRefreshTokenNonce: jest.fn(),
            deleteRefreshTokenNoncesByUserId: jest.fn(),
            deleteRefreshTokenNonceById: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RefreshTokenNonceService,
                { provide: RefreshTokenNonceRepository, useValue: nonceRepositoryMock },
            ],
        }).compile();

        nonceService = module.get<RefreshTokenNonceService>(RefreshTokenNonceService);
        nonceRepository = module.get(RefreshTokenNonceRepository) as jest.Mocked<RefreshTokenNonceRepository>;
    });

    describe('getAll', () => {
        it('should return all refresh token nonces when time parameter is provided', async () => {
            // Arrange
            const seconds = 3600;
            const fakeNonces: RefreshTokenNonce[] = [
                generateFakeRefreshTokenNonce(),
                generateFakeRefreshTokenNonce(),
            ];
            nonceRepository.getAll.mockResolvedValue(fakeNonces);

            // Act
            const result = await nonceService.getAll(seconds);

            // Assert
            expect(nonceRepository.getAll).toHaveBeenCalledWith(seconds);
            expect(result).toEqual(fakeNonces);
        });

        it('should return all refresh token nonces when time parameter is not provided', async () => {
            // Arrange
            const fakeNonces: RefreshTokenNonce[] = [generateFakeRefreshTokenNonce()];
            nonceRepository.getAll.mockResolvedValue(fakeNonces);

            // Act
            const result = await nonceService.getAll();

            // Assert
            expect(nonceRepository.getAll).toHaveBeenCalledWith(undefined);
            expect(result).toEqual(fakeNonces);
        });
    });

    describe('getRefreshTokenNonceByNonceAndUserId', () => {
        it('should return a refresh token nonce when found', async () => {
            // Arrange
            const userId = 1;
            const nonce = 'testNonce';
            const fakeNonce = generateFakeRefreshTokenNonce({ userId, nonce });
            nonceRepository.findByRefreshTokenNonceAndUserId.mockResolvedValue(fakeNonce);

            // Act
            const result = await nonceService.getRefreshTokenNonceByNonceAndUserId(userId, nonce);

            // Assert
            expect(nonceRepository.findByRefreshTokenNonceAndUserId).toHaveBeenCalledWith(userId, nonce);
            expect(result).toEqual(fakeNonce);
        });

        it('should throw NotFoundException when nonce is not found', async () => {
            // Arrange
            const userId = 1;
            const nonce = 'nonexistentNonce';
            nonceRepository.findByRefreshTokenNonceAndUserId.mockResolvedValue(null);

            // Act & Assert
            await expect(
                nonceService.getRefreshTokenNonceByNonceAndUserId(userId, nonce),
            ).rejects.toThrow(NotFoundException);
            expect(nonceRepository.findByRefreshTokenNonceAndUserId).toHaveBeenCalledWith(userId, nonce);
        });
    });

    describe('createRefreshTokenNonce', () => {
        it('should create and return a refresh token nonce', async () => {
            // Arrange
            const createDto: CreateRefreshTokenNonceDto = {
                userId: 1,
                nonce: 'newNonce',
            };
            const createdNonce = generateFakeRefreshTokenNonce({ userId: createDto.userId, nonce: createDto.nonce });
            nonceRepository.saveRefreshTokenNonce.mockResolvedValue(createdNonce);

            // Act
            const result = await nonceService.createRefreshTokenNonce(createDto);

            // Assert
            expect(nonceRepository.saveRefreshTokenNonce).toHaveBeenCalledWith(createDto);
            expect(result).toEqual(createdNonce);
        });
    });

    describe('deleteRefreshTokenNoncesByUserId', () => {
        it('should delete all refresh token nonces for a given user', async () => {
            // Arrange
            const userId = 1;
            nonceRepository.deleteRefreshTokenNoncesByUserId.mockResolvedValue();

            // Act
            const result = await nonceService.deleteRefreshTokenNoncesByUserId(userId);

            // Assert
            expect(nonceRepository.deleteRefreshTokenNoncesByUserId).toHaveBeenCalledWith(userId);
            expect(result).toBeUndefined();
        });
    });

    describe('deleteRefreshTokenNonceByNonceId', () => {
        it('should delete a refresh token nonce by its id', async () => {
            // Arrange
            const nonceId = 100;
            nonceRepository.deleteRefreshTokenNonceById.mockResolvedValue();

            // Act
            const result = await nonceService.deleteRefreshTokenNonceByNonceId(nonceId);

            // Assert
            expect(nonceRepository.deleteRefreshTokenNonceById).toHaveBeenCalledWith(nonceId);
            expect(result).toBeUndefined();
        });
    });
});
