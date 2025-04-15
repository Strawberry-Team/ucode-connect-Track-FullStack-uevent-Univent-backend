// test/unit/promo-codes/promo-codes.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PromoCodesController } from '../../../src/models/promo-codes/promo-codes.controller';
import { PromoCodesService } from '../../../src/models/promo-codes/promo-codes.service';
import { UpdatePromoCodeDto } from '../../../src/models/promo-codes/dto/update-promo-code.dto';
import { generateFakePromoCode } from '../../fake-data/fake-promo-codes';
import { JwtAuthGuard } from '../../../src/models/auth/guards/auth.guards';

class MockJwtAuthGuard {
    canActivate() {
        return true;
    }
}

describe('PromoCodesController', () => {
    let controller: PromoCodesController;
    let promoCodesService: jest.Mocked<PromoCodesService>;

    beforeEach(async () => {
        const promoCodesServiceMock = {
            findOne: jest.fn(),
            update: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [PromoCodesController],
            providers: [
                { provide: PromoCodesService, useValue: promoCodesServiceMock },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useClass(MockJwtAuthGuard)
            .compile();

        controller = module.get<PromoCodesController>(PromoCodesController);
        promoCodesService = module.get(PromoCodesService);
    });

    describe('findOne (GET /promo-codes/:id)', () => {
        it('should return a promo code by id', async () => {
            const fakePromo = generateFakePromoCode({ id: 1 });
            promoCodesService.findOne.mockResolvedValue(fakePromo);

            const result = await controller.findOne(1);

            expect(promoCodesService.findOne).toHaveBeenCalledWith(1);
            expect(result).toEqual(fakePromo);
        });

        it('should throw NotFoundException if promo code is not found', async () => {
            promoCodesService.findOne.mockRejectedValue(
                new NotFoundException('Promo code not found'),
            );

            await expect(controller.findOne(999)).rejects.toThrow(
                NotFoundException,
            );
            expect(promoCodesService.findOne).toHaveBeenCalledWith(999);
        });
    });

    describe('update (PATCH /promo-codes/:id)', () => {
        it('should update a promo code and return the updated promo code', async () => {
            const updateDto: UpdatePromoCodeDto = { title: 'Updated Title' };
            const fakePromo = generateFakePromoCode({
                id: 1,
                title: 'Old Title',
            });
            const updatedPromo = { ...fakePromo, ...updateDto };

            promoCodesService.update.mockResolvedValue(updatedPromo);

            const result = await controller.update(1, updateDto);

            expect(promoCodesService.update).toHaveBeenCalledWith(1, updateDto);
            expect(result).toEqual(updatedPromo);
        });
    });
});
