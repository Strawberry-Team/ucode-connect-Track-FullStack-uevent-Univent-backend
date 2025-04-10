// test/unit/refresh-token-nonces/refresh-token-nonces.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RefreshTokenNoncesService } from '../../../src/models/refresh-token-nonces/refresh-token-nonces.service';
import { RefreshTokenNoncesRepository } from '../../../src/models/refresh-token-nonces/refresh-token-nonces.repository';
import { RefreshTokenNonce } from '../../../src/models/refresh-token-nonces/entities/refresh-token-nonce.entity';
import { CreateRefreshTokenNonceDto } from '../../../src/models/refresh-token-nonces/dto/create-refresh-nonce.dto';
import { generateFakeRefreshTokenNonce } from '../../fake-data/fake-refresh-token-nonces';

describe('RefreshTokenNoncesService', () => {
    let nonceService: RefreshTokenNoncesService;
    let nonceRepository: jest.Mocked<RefreshTokenNoncesRepository>;

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
                RefreshTokenNoncesService,
                { provide: RefreshTokenNoncesRepository, useValue: nonceRepositoryMock },
            ],
        }).compile();

        nonceService = module.get<RefreshTokenNoncesService>(RefreshTokenNoncesService);
        nonceRepository = module.get(RefreshTokenNoncesRepository) as jest.Mocked<RefreshTokenNoncesRepository>;
    });

    describe('getAll', () => {
        it('should return all refresh token nonces when time parameter is provided', async () => {
            // Arrange
            const seconds = 3600;
            const fakeNonces: RefreshTokenNonce[] = [
                generateFakeRefreshTokenNonce(),
                generateFakeRefreshTokenNonce(),
            ];
            nonceRepository.findAll.mockResolvedValue(fakeNonces);

            // Act
            const result = await nonceService.findAllRefreshTokenNonces(seconds);

            // Assert
            expect(nonceRepository.findAll).toHaveBeenCalledWith(seconds);
            expect(result).toEqual(fakeNonces);
        });

        it('should return all refresh token nonces when time parameter is not provided', async () => {
            // Arrange
            const fakeNonces: RefreshTokenNonce[] = [generateFakeRefreshTokenNonce()];
            nonceRepository.findAll.mockResolvedValue(fakeNonces);

            // Act
            const result = await nonceService.findAllRefreshTokenNonces();

            // Assert
            expect(nonceRepository.findAll).toHaveBeenCalledWith(undefined);
            expect(result).toEqual(fakeNonces);
        });
    });

    describe('getRefreshTokenNonceByNonceAndUserId', () => {
        it('should return a refresh token nonce when found', async () => {
            // Arrange
            const userId = 1;
            const nonce = 'testNonce';
            const fakeNonce = generateFakeRefreshTokenNonce({ userId, nonce });
            nonceRepository.findByNonceAndUserId.mockResolvedValue(fakeNonce);

            // Act
            const result = await nonceService.findRefreshTokenNonceByNonceAndUserId(userId, nonce);

            // Assert
            expect(nonceRepository.findByNonceAndUserId).toHaveBeenCalledWith(userId, nonce);
            expect(result).toEqual(fakeNonce);
        });

        it('should throw NotFoundException when nonce is not found', async () => {
            // Arrange
            const userId = 1;
            const nonce = 'nonexistentNonce';
            nonceRepository.findByNonceAndUserId.mockResolvedValue(null);

            // Act & Assert
            await expect(
                nonceService.findRefreshTokenNonceByNonceAndUserId(userId, nonce),
            ).rejects.toThrow(NotFoundException);
            expect(nonceRepository.findByNonceAndUserId).toHaveBeenCalledWith(userId, nonce);
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
            nonceRepository.create.mockResolvedValue(createdNonce);

            // Act
            const result = await nonceService.createRefreshTokenNonce(createDto);

            // Assert
            expect(nonceRepository.create).toHaveBeenCalledWith(createDto);
            expect(result).toEqual(createdNonce);
        });
    });

    describe('deleteRefreshTokenNoncesByUserId', () => {
        it('should delete all refresh token nonces for a given user', async () => {
            // Arrange
            const userId = 1;
            nonceRepository.deleteByUserId.mockResolvedValue();

            // Act
            const result = await nonceService.deleteRefreshTokenNonceByUserId(userId);

            // Assert
            expect(nonceRepository.deleteByUserId).toHaveBeenCalledWith(userId);
            expect(result).toBeUndefined();
        });
    });

    describe('deleteRefreshTokenNonceByNonceId', () => {
        it('should delete a refresh token nonce by its id', async () => {
            // Arrange
            const nonceId = 100;
            nonceRepository.deleteById.mockResolvedValue();

            // Act
            const result = await nonceService.deleteRefreshTokenNonceById(nonceId);

            // Assert
            expect(nonceRepository.deleteById).toHaveBeenCalledWith(nonceId);
            expect(result).toBeUndefined();
        });
    });
});
