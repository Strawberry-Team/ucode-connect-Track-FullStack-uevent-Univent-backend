// test/unit/companies/companies.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from '../../../src/models/companies/companies.controller';
import { CompaniesService } from '../../../src/models/companies/companies.service';
import { User } from '../../../src/models/users/entities/user.entity';
import { Company } from '../../../src/models/companies/entities/company.entity';
import { NotImplementedException } from '@nestjs/common';
import { CreateCompanyDto } from '../../../src/models/companies/dto/create-company.dto';
import { UpdateCompanyDto } from '../../../src/models/companies/dto/update-company.dto';
import {
    generateFakeCompany,
    generateFakeLogoName,
    pickCompanyFields,
} from '../../fake-data/fake-companies';
import { generateFakeUser } from '../../fake-data/fake-users';
import { RefreshTokenNoncesService } from '../../../src/models/refresh-token-nonces/refresh-token-nonces.service';
import { CompanyOwnerGuard } from '../../../src/models/companies/guards/company-owner.guard';
import { ConfigService } from '@nestjs/config';

describe('CompaniesController', () => {
    let controller: CompaniesController;
    let companiesService: CompaniesService;

    const fakeUser: User = generateFakeUser();
    const fakeCompany: Company = generateFakeCompany(fakeUser.id);
    const fakeCreateCompanyDto: CreateCompanyDto = pickCompanyFields(
        fakeCompany,
        ['ownerId', 'email', 'title', 'description'],
    );
    const fakeUpdateCompanyDto: UpdateCompanyDto = generateFakeCompany(
        fakeUser.id,
        false,
        ['ownerId', 'email', 'title', 'description'],
    );
    const fakeUpdatedCompany: Company = {
        ...fakeCompany,
        ...fakeUpdateCompanyDto,
    };
    const mockFrontUrl = 'http://localhost:8080';

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CompaniesController],
            providers: [
                {
                    provide: CompaniesService,
                    useValue: {
                        createCompany: jest.fn().mockResolvedValue(null),
                        findAllCompanies: jest.fn().mockResolvedValue([]),
                        findCompanyById: jest.fn().mockResolvedValue(null),
                        findCompanyByOwnerId: jest.fn().mockResolvedValue(null),
                        findCompanyByEmail: jest.fn().mockResolvedValue(null),
                        findByTitle: jest.fn().mockResolvedValue(null),
                        updateCompany: jest.fn().mockResolvedValue(null),
                        updateCompanyLogo: jest.fn().mockResolvedValue(null),
                        removeCompany: jest.fn().mockResolvedValue(undefined),
                    },
                },
                {
                    provide: CompanyOwnerGuard,
                    useValue: {
                        canActivate: jest.fn().mockReturnValue(true),
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue(mockFrontUrl),
                    },
                },
                {
                    provide: RefreshTokenNoncesService,
                    useValue: {
                        getRefreshTokenNonceByNonceAndUserId: jest
                            .fn()
                            .mockResolvedValue({
                                id: 1,
                                userId: fakeUser.id,
                                nonce: 'mock-nonce',
                            }),
                    },
                },
            ],
        }).compile();

        controller = module.get<CompaniesController>(CompaniesController);
        companiesService = module.get<CompaniesService>(CompaniesService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Create Company', () => {
        it('Should create a company and send welcome email', async () => {
            jest.spyOn(companiesService, 'create').mockResolvedValue(
                fakeCompany,
            );

            const result = await controller.create(
                fakeCreateCompanyDto,
                fakeUser.id,
            );
            expect(result).toEqual(fakeCompany);
            expect(companiesService.create).toHaveBeenCalledWith(
                fakeCreateCompanyDto,
            );
        });
    });

    describe('Find All Companies', () => {
        it('Should return all companies', async () => {
            jest.spyOn(companiesService, 'findAll').mockResolvedValue([
                fakeCompany,
            ]);

            const result = await controller.findAll();
            expect(result).toEqual([fakeCompany]);
            expect(companiesService.findAll).toHaveBeenCalled();
        });
    });

    describe('Find One Company by ID', () => {
        it('Should return a company by ID', async () => {
            jest.spyOn(companiesService, 'findById').mockResolvedValue(
                fakeCompany,
            );

            const result = await controller.findOne(
                fakeCompany.id,
                fakeUser.id,
            );
            expect(result).toEqual(fakeCompany);
            expect(companiesService.findById).toHaveBeenCalledWith(
                fakeCompany.id,
            );
        });
    });

    /*describe('Find One Company by title', () => {
        it('Should return a company by title', async () => {
            jest.spyOn(
                companiesService,
                'findByTitle',
            ).mockResolvedValue(fakeCompany);

            const result = await controller.findOneByTitle(
                fakeCompany.title,
                fakeUser.id,
            );
            expect(result).toEqual(fakeCompany);
            expect(companiesService.findByTitle).toHaveBeenCalledWith(
                fakeCompany.title,
                fakeCompany.ownerId,
            );
        });
    });*/

    describe('Update Company', () => {
        it('Should update a company', async () => {
            jest.spyOn(companiesService, 'update').mockResolvedValue(
                fakeUpdatedCompany,
            );

            const result = await controller.update(
                fakeCompany.id,
                fakeUpdateCompanyDto,
                fakeUser.id,
            );
            expect(result).toEqual(fakeUpdatedCompany);
            expect(companiesService.update).toHaveBeenCalledWith(
                fakeCompany.id,
                fakeUpdateCompanyDto,
            );
        });
    });

    describe('Upload Logo', () => {
        it('Should upload a company logo successfully', async () => {
            const logoName = generateFakeLogoName();
            const mockFile = { filename: logoName } as Express.Multer.File;
            jest.spyOn(companiesService, 'updateLogo').mockResolvedValue(
                {
                    ...fakeCompany,
                    logoName,
                },
            );

            const result = await controller.uploadLogo(
                fakeCompany.id,
                mockFile,
            );
            expect(result).toEqual({ server_filename: logoName });
            expect(companiesService.updateLogo).toHaveBeenCalledWith(
                fakeCompany.id,
                logoName,
            );
        });
    });

    describe('Remove Company', () => {
        it('Should throw NotImplementedException', async () => {
            jest.spyOn(companiesService, 'delete');

            await expect(
                controller.remove(fakeCompany.id, fakeUser.id),
            ).rejects.toThrow(NotImplementedException);
            expect(companiesService.delete).not.toHaveBeenCalled();
        });
    });
});
