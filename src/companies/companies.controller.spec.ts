import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';
import { Company } from './entities/company.entity';
import {
    BadRequestException,
    NotFoundException,
    NotImplementedException,
} from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { generateFakeCompany, pickCompanyFields } from './utils/fake-company';
import { generateFakeUser } from './utils/fake-user';
import { RefreshTokenNonceService } from '../refresh-token-nonces/refresh-token-nonce.service';
import { CompanyOwnerGuard } from './guards/company-owner.guard';
import { ConfigService } from '@nestjs/config';

describe('CompaniesController', () => {
    let controller: CompaniesController;
    let companiesService: CompaniesService;
    let emailService: EmailService;
    let usersService: UsersService;
    let refreshTokenNonceService: RefreshTokenNonceService;
    let companyOwnerGuard: CompanyOwnerGuard;
    let configService: ConfigService;

    const fakeCompany: Company = generateFakeCompany();
    const fakeUser = generateFakeUser();
    const fakeCreateCompanyDto: CreateCompanyDto = pickCompanyFields(
        fakeCompany,
        ['ownerId', 'email', 'title', 'description'],
    );
    const fakeUpdateCompanyDto: UpdateCompanyDto = generateFakeCompany(false, [
        'ownerId',
        'email',
        'title',
        'description',
    ]);
    const fakeUpdatedCompany: Company = {
        ...fakeCompany,
        ...fakeUpdateCompanyDto,
    };
    const mockUserId = fakeUser.id;
    const mockFrontUrl = 'http://localhost:8080';

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CompaniesController],
            providers: [
                {
                    provide: CompaniesService,
                    useValue: {
                        findById: jest.fn().mockResolvedValue(null),
                        createCompany: jest.fn().mockResolvedValue(null),
                        findAllCompanies: jest.fn().mockResolvedValue([]),
                        findCompanyById: jest.fn().mockResolvedValue(null),
                        updateCompany: jest.fn().mockResolvedValue(null),
                        removeCompany: jest.fn().mockResolvedValue(undefined),
                        updateCompanyLogo: jest.fn().mockResolvedValue(null),
                    },
                },
                {
                    provide: UsersService,
                    useValue: {
                        getUserById: jest.fn().mockResolvedValue(null),
                    },
                },
                {
                    provide: EmailService,
                    useValue: {
                        sendWelcomeCompanyEmail: jest
                            .fn()
                            .mockResolvedValue(undefined),
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue(mockFrontUrl),
                    },
                },
                {
                    provide: RefreshTokenNonceService,
                    useValue: {
                        getRefreshTokenNonceByNonceAndUserId: jest
                            .fn()
                            .mockResolvedValue({
                                id: 1,
                                userId: mockUserId,
                                nonce: 'mock-nonce',
                            }),
                    },
                },
                {
                    provide: CompanyOwnerGuard,
                    useValue: {
                        canActivate: jest.fn().mockReturnValue(true),
                    },
                },
            ],
        }).compile();

        controller = module.get<CompaniesController>(CompaniesController);
        companiesService = module.get<CompaniesService>(CompaniesService);
        emailService = module.get<EmailService>(EmailService);
        usersService = module.get<UsersService>(UsersService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Create Company', () => {
        it('Should create a company and send welcome email', async () => {
            jest.spyOn(companiesService, 'createCompany').mockResolvedValue(
                fakeCompany,
            );
            jest.spyOn(usersService, 'getUserById').mockResolvedValue(fakeUser);
            jest.spyOn(emailService, 'sendWelcomeCompanyEmail');

            const result = await controller.create(
                fakeCreateCompanyDto,
                mockUserId,
            );
            expect(result).toEqual(fakeCompany);
            expect(companiesService.createCompany).toHaveBeenCalledWith(
                fakeCreateCompanyDto,
            );
            expect(usersService.getUserById).toHaveBeenCalledWith(
                fakeCreateCompanyDto.ownerId,
            );
            expect(emailService.sendWelcomeCompanyEmail).toHaveBeenCalledWith(
                fakeUser.email,
                `${fakeUser.firstName} ${fakeUser.lastName}`,
                fakeCompany.title,
                mockFrontUrl,
            );
        });
    });

    describe('Find All Companies', () => {
        it('Should return all companies', async () => {
            jest.spyOn(companiesService, 'findAllCompanies').mockResolvedValue([
                fakeCompany,
            ]);

            const result = await controller.findAll();
            expect(result).toEqual([fakeCompany]);
            expect(companiesService.findAllCompanies).toHaveBeenCalled();
        });
    });

    describe('Find One Company', () => {
        it('Should return a company by ID', async () => {
            jest.spyOn(companiesService, 'findCompanyById').mockResolvedValue(
                fakeCompany,
            );

            const result = await controller.findOne(fakeCompany.id);
            expect(result).toEqual(fakeCompany);
            expect(companiesService.findCompanyById).toHaveBeenCalledWith(
                fakeCompany.id,
            );
        });
    });

    describe('Update Company', () => {
        it('Should update a company', async () => {
            jest.spyOn(companiesService, 'updateCompany').mockResolvedValue(
                fakeUpdatedCompany,
            );

            const result = await controller.update(
                fakeCompany.id,
                fakeUpdateCompanyDto,
                mockUserId,
            );
            expect(result).toEqual(fakeUpdatedCompany);
            expect(companiesService.updateCompany).toHaveBeenCalledWith(
                fakeCompany.id,
                fakeUpdateCompanyDto,
            );
        });
    });

    describe('Remove Company', () => {
        it('Should throw NotImplementedException', async () => {
            jest.spyOn(companiesService, 'removeCompany');

            await expect(
                controller.remove(fakeCompany.id, mockUserId),
            ).rejects.toThrow(NotImplementedException);
            expect(companiesService.removeCompany).not.toHaveBeenCalled();
        });
    });

    describe('Upload Logo', () => {
        it('Should upload a company logo successfully', async () => {
            const logoName = `${fakeUpdatedCompany.title.toLowerCase()}-logo.png`;
            const mockFile = { filename: logoName } as Express.Multer.File;
            jest.spyOn(companiesService, 'updateCompanyLogo').mockResolvedValue(
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
            expect(companiesService.updateCompanyLogo).toHaveBeenCalledWith(
                fakeCompany.id,
                logoName,
            );
        });
    });
});
