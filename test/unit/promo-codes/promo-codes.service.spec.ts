// test/unit/promo-codes/promo-codes.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PromoCodesService } from '../../../src/models/promo-codes/promo-codes.service';
import { PromoCodesRepository } from '../../../src/models/promo-codes/promo-codes.repository';
import { HashingPromoCodesService } from '../../../src/models/promo-codes/hashing-promo-codes.service';
import { CreatePromoCodeDto } from '../../../src/models/promo-codes/dto/create-promo-code.dto';
import { UpdatePromoCodeDto } from '../../../src/models/promo-codes/dto/update-promo-code.dto';
import { PromoCode, SERIALIZATION_GROUPS } from '../../../src/models/promo-codes/entities/promo-code.entity';
import { plainToInstance } from 'class-transformer';
import { generateFakePromoCode } from '../../fake-data/fake-promo-codes';

describe('PromoCodesService', () => {
    let promoCodesService: PromoCodesService;
    let promoCodesRepository: jest.Mocked<PromoCodesRepository>;
    let hashingPromoCodesService: jest.Mocked<HashingPromoCodesService>;

    beforeEach(async () => {
        const promoCodesRepositoryMock = {
            create: jest.fn(),
            findAllByEventId: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
        };

        const hashingPromoCodesServiceMock = {
            hash: jest.fn(),
            compare: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PromoCodesService,
                { provide: PromoCodesRepository, useValue: promoCodesRepositoryMock },
                {
                    provide: HashingPromoCodesService,
                    useValue: hashingPromoCodesServiceMock,
                },
            ],
        }).compile();

        promoCodesService = module.get<PromoCodesService>(PromoCodesService);
        promoCodesRepository = module.get(
            PromoCodesRepository,
        ) as jest.Mocked<PromoCodesRepository>;
        hashingPromoCodesService = module.get(
            HashingPromoCodesService,
        ) as jest.Mocked<HashingPromoCodesService>;
    });

    describe('create', () => {
        const eventId = 1;
        const createDto: CreatePromoCodeDto = {
            title: 'Special Offer',
            code: 'PROMO2023',
            discountPercent: 0.15,
        };

        it('should throw ConflictException if promo code already exists for the event', async () => {
            const existingPromoCode = generateFakePromoCode({ eventId, code: 'hashedCode' });
            jest
                .spyOn(promoCodesService, 'validatePromoCode')
                .mockResolvedValue({ promoCode: existingPromoCode });

            await expect(
                promoCodesService.create(createDto, eventId),
            ).rejects.toThrow(ConflictException);
            expect(promoCodesService.validatePromoCode).toHaveBeenCalledWith(
                eventId,
                createDto.code,
            );
        });

        it('should create a new promo code if none exists for the event', async () => {
            jest
                .spyOn(promoCodesService, 'validatePromoCode')
                .mockRejectedValue(new NotFoundException());

            const hashedCode = 'hashedPromoCode';
            hashingPromoCodesService.hash.mockResolvedValue(hashedCode);

            const dtoToCreate: CreatePromoCodeDto = { ...createDto };
            const createdPromoCode = generateFakePromoCode({
                eventId,
                title: createDto.title,
                code: hashedCode,
                discountPercent: createDto.discountPercent,
                isActive: true,
            });
            promoCodesRepository.create.mockResolvedValue(createdPromoCode);

            const result = await promoCodesService.create(dtoToCreate, eventId);

            expect(hashingPromoCodesService.hash).toHaveBeenCalledWith(createDto.code);
            expect(promoCodesRepository.create).toHaveBeenCalledWith({
                ...dtoToCreate,
                code: hashedCode,
                eventId,
            });
            expect(result).toEqual(
                plainToInstance(PromoCode, createdPromoCode, {
                    groups: SERIALIZATION_GROUPS.CONFIDENTIAL,
                }),
            );
        });
    });

    describe('findAllByEventId', () => {
        it('should return all promo codes for a given event', async () => {
            const eventId = 1;
            const fakePromoCodes = [
                generateFakePromoCode({ eventId }),
                generateFakePromoCode({ eventId }),
            ];
            promoCodesRepository.findAllByEventId.mockResolvedValue(fakePromoCodes);

            const result = await promoCodesService.findAllByEventId(eventId);

            expect(promoCodesRepository.findAllByEventId).toHaveBeenCalledWith(eventId);
            const expected = fakePromoCodes.map((pc) =>
                plainToInstance(PromoCode, pc, {
                    groups: SERIALIZATION_GROUPS.CONFIDENTIAL,
                }),
            );
            expect(result).toEqual(expected);
        });
    });

    describe('findOneByEventIdAndCode', () => {
        const eventId = 1;
        const plainCode = 'MYCODE2023';

        it('should return the matching promo code if found and active', async () => {
            const promoCode1 = generateFakePromoCode({ eventId, code: 'hashed1', isActive: true });
            const promoCode2 = generateFakePromoCode({ eventId, code: 'hashed2', isActive: true });
            promoCodesRepository.findAllByEventId = jest.fn().mockResolvedValue([promoCode1, promoCode2]);

            hashingPromoCodesService.compare
                .mockResolvedValueOnce(false)
                .mockResolvedValueOnce(true);

            const result = await promoCodesService.validatePromoCode(eventId, plainCode);

            expect(promoCodesRepository.findAllByEventId).toHaveBeenCalledWith(eventId);
            expect(hashingPromoCodesService.compare).toHaveBeenNthCalledWith(1, plainCode, promoCode1.code);
            expect(hashingPromoCodesService.compare).toHaveBeenNthCalledWith(2, plainCode, promoCode2.code);
            expect(result).toEqual({
                promoCode: plainToInstance(PromoCode, promoCode2, { groups: SERIALIZATION_GROUPS.BASIC }),
            });
        });

        it('should return the matching promo code with explanationMessage if it is not active', async () => {
            const inactivePromo = generateFakePromoCode({ eventId, code: 'hashedInactive', isActive: false });
            promoCodesRepository.findAllByEventId = jest.fn().mockResolvedValue([inactivePromo]);

            hashingPromoCodesService.compare.mockResolvedValue(true);

            const result = await promoCodesService.validatePromoCode(eventId, plainCode);

            expect(result).toEqual({
                promoCode: plainToInstance(PromoCode, inactivePromo, { groups: SERIALIZATION_GROUPS.BASIC }),
                explanationMessage: 'Promo code is not active',
            });
        });

        it('should throw NotFoundException if no promo code matches', async () => {
            const promoCode1 = generateFakePromoCode({ eventId, code: 'hashed1' });
            const promoCode2 = generateFakePromoCode({ eventId, code: 'hashed2' });
            promoCodesRepository.findAllByEventId = jest.fn().mockResolvedValue([promoCode1, promoCode2]);

            hashingPromoCodesService.compare.mockResolvedValue(false);

            await expect(
                promoCodesService.validatePromoCode(eventId, plainCode),
            ).rejects.toThrow(NotFoundException);
            expect(promoCodesRepository.findAllByEventId).toHaveBeenCalledWith(eventId);
            expect(hashingPromoCodesService.compare).toHaveBeenCalledTimes(2);
        });
    });

    describe('validatePromoCode', () => {
        const eventId = 1;
        const testCode = 'TESTCODE';

        it('should return true if promo code is valid (active and no explanation message)', async () => {
            const promoCode = generateFakePromoCode({ eventId, isActive: true });
            jest
                .spyOn(promoCodesService, 'validatePromoCode')
                .mockResolvedValue({ promoCode: promoCode });
            const result = await promoCodesService.validatePromoCode(eventId, testCode);
            expect(result).toBe(true);
        });

        it('should return false if promo code is not active (with explanation message)', async () => {
            const promoCode = generateFakePromoCode({ eventId, isActive: false });
            jest
                .spyOn(promoCodesService, 'validatePromoCode')
                .mockResolvedValue({
                    promoCode,
                    explanationMessage: 'Promo code is not active',
                });
            const result = await promoCodesService.validatePromoCode(eventId, testCode);
            expect(result).toBe(false);
        });

        it('should return false if findOneByEventIdAndCode throws an error', async () => {
            jest
                .spyOn(promoCodesService, 'validatePromoCode')
                .mockRejectedValue(new NotFoundException());
            const result = await promoCodesService.validatePromoCode(eventId, testCode);
            expect(result).toBe(false);
        });
    });

    describe('findOne', () => {
        it('should return a promo code if found', async () => {
            const promoCodeId = 10;
            const fakePromo = generateFakePromoCode({ id: promoCodeId });
            promoCodesRepository.findOne.mockResolvedValue(fakePromo);

            const result = await promoCodesService.findOne(promoCodeId);

            expect(promoCodesRepository.findOne).toHaveBeenCalledWith(promoCodeId);
            expect(result).toEqual(
                plainToInstance(PromoCode, fakePromo, {
                    groups: SERIALIZATION_GROUPS.CONFIDENTIAL,
                }),
            );
        });

        it('should throw NotFoundException if promo code is not found', async () => {
            const promoCodeId = 999;
            promoCodesRepository.findOne.mockResolvedValue(null);

            await expect(promoCodesService.findOne(promoCodeId)).rejects.toThrow(
                NotFoundException,
            );
            expect(promoCodesRepository.findOne).toHaveBeenCalledWith(promoCodeId);
        });
    });

    describe('update', () => {
        it('should update and return the promo code', async () => {
            const promoCodeId = 10;
            const updateDto: UpdatePromoCodeDto = {
                title: 'Updated Title',
            };

            const existingPromo = generateFakePromoCode({ id: promoCodeId });
            jest.spyOn(promoCodesService, 'findOne').mockResolvedValue(existingPromo);

            const updatedPromo = {
                ...existingPromo,
                ...updateDto,
            };
            promoCodesRepository.update.mockResolvedValue(updatedPromo);

            const result = await promoCodesService.update(promoCodeId, updateDto);

            expect(promoCodesService.findOne).toHaveBeenCalledWith(promoCodeId);
            expect(promoCodesRepository.update).toHaveBeenCalledWith(promoCodeId, updateDto);
            expect(result).toEqual(
                plainToInstance(PromoCode, updatedPromo, {
                    groups: SERIALIZATION_GROUPS.CONFIDENTIAL,
                }),
            );
        });
    });
});
