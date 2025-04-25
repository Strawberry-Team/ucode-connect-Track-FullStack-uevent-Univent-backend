// test/unit/companies/companies.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesService } from '../../../src/models/companies/companies.service';
import { CompaniesRepository } from '../../../src/models/companies/companies.repository';
import { Company, SERIALIZATION_GROUPS } from '../../../src/models/companies/entities/company.entity';
import {
    BadRequestException,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { CreateCompanyDto } from '../../../src/models/companies/dto/create-company.dto';
import {
    generateFakeCompany,
    generateFakeId,
    pickCompanyFields,
    generateFakeBasicEvent,
} from '../../fake-data/fake-companies';
import { UpdateCompanyDto } from '../../../src/models/companies/dto/update-company.dto';
import { generateFakeUser } from '../../fake-data/fake-users';
import { EmailService } from '../../../src/email/email.service';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/models/users/users.service';
import { fa } from '@faker-js/faker/.';

describe('CompaniesService', () => {
    let companyService: CompaniesService;
    let companyRepository: CompaniesRepository;
    let userService: UsersService;
    let emailService: EmailService;
    let configService: ConfigService;

    const fakeUser = generateFakeUser();
    const fakeCompany: Company = generateFakeCompany(fakeUser.id);
    const fakeCreateCompanyDto: CreateCompanyDto = pickCompanyFields(
        fakeCompany,
        ['email', 'title', 'description'],
    );
    const fakeUpdateCompanyDto: UpdateCompanyDto = pickCompanyFields(
        generateFakeCompany(fakeUser.id),
        ['title', 'description'],
    );
    const fakeUpdatedCompany: Company = {
        ...fakeCompany,
        ...fakeUpdateCompanyDto,
    };
    const companyWithOwner = { ...fakeCompany, owner: fakeUser };
    const fakeEvent = generateFakeBasicEvent(fakeCompany.id);
    fakeEvent.companyId = fakeCompany.id;
    const companyWithOwnerAndEvent = { ...fakeCompany, owner: fakeUser, events: [fakeEvent] };
    const frontUrl = 'http://localhost:3000';

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CompaniesService,
                {
                    provide: CompaniesRepository,
                    useValue: {
                        create: jest.fn().mockResolvedValue(null),
                        findAll: jest.fn().mockResolvedValue([]),
                        findById: jest.fn().mockResolvedValue(null),
                        findByOwnerId: jest.fn().mockResolvedValue(null),
                        findByEmail: jest.fn().mockResolvedValue(null),
                        update: jest.fn().mockResolvedValue(null),
                        delete: jest.fn().mockResolvedValue(undefined),
                    },
                },
                {
                    provide: UsersService,
                    useValue: {
                        findUserById: jest.fn().mockResolvedValue(null),
                    },
                },
                {
                    provide: EmailService,
                    useValue: {
                        sendWelcomeCompanyEmail: jest.fn().mockResolvedValue(null),
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockReturnValue(frontUrl),
                    },
                },
            ],
        }).compile();

        companyService = module.get<CompaniesService>(CompaniesService);
        companyRepository = module.get<CompaniesRepository>(CompaniesRepository);
        userService = module.get<UsersService>(UsersService);
        emailService = module.get<EmailService>(EmailService);
        configService = module.get<ConfigService>(ConfigService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Create Company', () => {
        it('Should create a Company', async () => {
            jest.spyOn(companyRepository, 'findByOwnerId').mockResolvedValue(null);
            jest.spyOn(companyRepository, 'findByEmail').mockResolvedValue(null);
            jest.spyOn(userService, 'findUserById').mockResolvedValue(fakeUser);
            jest.spyOn(companyRepository, 'create').mockResolvedValue(companyWithOwner);
            jest.spyOn(emailService, 'sendWelcomeCompanyEmail');

            const result = await companyService.create(
                fakeCreateCompanyDto,
                fakeCompany.ownerId,
            );

            expect(result).toEqual(fakeCompany);
            expect(companyRepository.create).toHaveBeenCalledWith(
                {
                    ...fakeCreateCompanyDto,
                    ownerId: fakeCompany.ownerId,
                },
                { owner: true }
            );
            expect(emailService.sendWelcomeCompanyEmail).toHaveBeenCalledWith(
                fakeUser.email,
                `${fakeUser.firstName} ${fakeUser.lastName}`,
                fakeCompany.title,
                frontUrl,
            );
        });

        it('Should throw ConflictException when owner has already a Company', async () => {
            const anotherCompany = {
                ...fakeCompany,
                id: generateFakeId(),
            };
            jest.spyOn(companyRepository, 'findByOwnerId').mockResolvedValue(
                anotherCompany,
            );
            jest.spyOn(companyRepository, 'findByEmail');
            jest.spyOn(companyRepository, 'create');
            jest.spyOn(emailService, 'sendWelcomeCompanyEmail');

            await expect(
                companyService.create(fakeCreateCompanyDto, fakeUser.id),
            ).rejects.toThrow(ConflictException);
            expect(companyRepository.findByOwnerId).toHaveBeenCalledWith(fakeUser.id);
            expect(companyRepository.findByEmail).not.toHaveBeenCalled();
            expect(companyRepository.create).not.toHaveBeenCalled();
            expect(emailService.sendWelcomeCompanyEmail).not.toHaveBeenCalled();
        });

        it('Should throw ConflictException when email is already in use', async () => {
            const anotherCompany = {
                ...fakeCompany,
                id: generateFakeId(),
            };
            jest.spyOn(companyRepository, 'findByOwnerId');
            jest.spyOn(companyRepository, 'findByEmail').mockResolvedValue(
                anotherCompany,
            );
            jest.spyOn(companyRepository, 'create');
            jest.spyOn(emailService, 'sendWelcomeCompanyEmail');

            await expect(
                companyService.create(fakeCreateCompanyDto, fakeUser.id),
            ).rejects.toThrow(ConflictException);
            expect(companyRepository.findByOwnerId).toHaveBeenCalledWith(fakeUser.id);
            expect(companyRepository.findByEmail).toHaveBeenCalledWith(
                fakeCreateCompanyDto.email,
            );
            expect(companyRepository.create).not.toHaveBeenCalled();
            expect(emailService.sendWelcomeCompanyEmail).not.toHaveBeenCalled();
        });

        it('Should throw NotFoundException when owner not found', async () => {
            jest.spyOn(companyRepository, 'findByOwnerId');
            jest.spyOn(companyRepository, 'findByEmail');
            jest.spyOn(companyRepository, 'create').mockResolvedValue({ ...fakeCompany, owner: undefined });

            await expect(
                companyService.create(fakeCreateCompanyDto, fakeUser.id),
            ).rejects.toThrow(NotFoundException);
            expect(companyRepository.findByOwnerId).toHaveBeenCalledWith(fakeUser.id);
            expect(companyRepository.findByEmail).toHaveBeenCalledWith(fakeCreateCompanyDto.email);
            expect(companyRepository.create).toHaveBeenCalled();
        });
    });

    describe('Find all Companies', () => {
        it('Should return all Companies', async () => {
            const expectedResponse = {
                items: [fakeCompany],
                count: 1,
                total: 1
            };
            jest.spyOn(companyRepository, 'findAll').mockResolvedValue(expectedResponse);

            const result = await companyService.findAll();
            expect(result).toEqual(expectedResponse);
            expect(companyRepository.findAll).toHaveBeenCalled();
        });

        it('Should return empty array when no companies found', async () => {
            const expectedResponse = {
                items: [],
                count: 0,
                total: 0
            };
            jest.spyOn(companyRepository, 'findAll').mockResolvedValue(expectedResponse);

            const result = await companyService.findAll();
            expect(result).toEqual(expectedResponse);
            expect(companyRepository.findAll).toHaveBeenCalled();
        });
    });

    describe('Find Company by its ID', () => {
        it('Should return Company when found', async () => {
            jest.spyOn(companyRepository, 'findById').mockResolvedValue(fakeCompany);

            const result = await companyService.findById(fakeCompany.id);
            expect(result).toEqual(fakeCompany);
            expect(companyRepository.findById).toHaveBeenCalledWith(fakeCompany.id);
        });

        it('Should throw NotFoundException when Company not found', async () => {
            jest.spyOn(companyRepository, 'findById');

            await expect(
                companyService.findById(fakeCompany.id),
            ).rejects.toThrow(NotFoundException);
            expect(companyRepository.findById).toHaveBeenCalledWith(fakeCompany.id);
        });
    });

    describe('Find Company by owner ID', () => {
        it('Should return Company when found', async () => {
            jest.spyOn(companyRepository, 'findByOwnerId').mockResolvedValue(
                fakeCompany,
            );

            const result = await companyService.findByOwnerId(
                fakeCompany.ownerId,
            );
            expect(result).toEqual(fakeCompany);
            expect(companyRepository.findByOwnerId).toHaveBeenCalledWith(
                fakeCompany.ownerId,
            );
        });

        it('Should throw NotFoundException when Company not found', async () => {
            jest.spyOn(companyRepository, 'findByOwnerId').mockResolvedValue(null);

            await expect(
                companyService.findByOwnerId(fakeCompany.ownerId),
            ).rejects.toThrow(NotFoundException);
            expect(companyRepository.findByOwnerId).toHaveBeenCalledWith(
                fakeCompany.ownerId,
            );
        });
    });

    describe('Find Company by email', () => {
        it('Should return Company when found', async () => {
            jest.spyOn(companyRepository, 'findByEmail').mockResolvedValue(
                fakeCompany,
            );

            const result = await companyService.findByEmail(fakeCompany.email);
            expect(result).toEqual(fakeCompany);
            expect(companyRepository.findByEmail).toHaveBeenCalledWith(
                fakeCompany.email,
            );
        });

        it('Should throw BadRequestException when email is empty', async () => {
            jest.spyOn(companyRepository, 'findByEmail');

            await expect(companyService.findByEmail('')).rejects.toThrow(
                BadRequestException,
            );
            expect(companyRepository.findByEmail).not.toHaveBeenCalled();
        });

        it('Should throw BadRequestException when email is too short', async () => {
            jest.spyOn(companyRepository, 'findByEmail');

            await expect(companyService.findByEmail('a@b')).rejects.toThrow(
                BadRequestException,
            );
            expect(companyRepository.findByEmail).not.toHaveBeenCalled();
        });

        it('Should throw BadRequestException when email does not contain @', async () => {
            jest.spyOn(companyRepository, 'findByEmail');

            await expect(companyService.findByEmail('invalid.email')).rejects.toThrow(
                BadRequestException,
            );
            expect(companyRepository.findByEmail).not.toHaveBeenCalled();
        });

        it('Should throw NotFoundException when Company not found', async () => {
            jest.spyOn(companyRepository, 'findByEmail');

            await expect(
                companyService.findByEmail(fakeCompany.email),
            ).rejects.toThrow(NotFoundException);
            expect(companyRepository.findByEmail).toHaveBeenCalledWith(
                fakeCompany.email,
            );
        });
    });

    describe('Update Company', () => {
        it('Should update Company successfully', async () => {
            jest.spyOn(companyRepository, 'findById').mockResolvedValue(fakeCompany);
            jest.spyOn(companyRepository, 'update').mockResolvedValue(
                fakeUpdatedCompany,
            );

            const result = await companyService.update(
                fakeCompany.id,
                fakeUpdateCompanyDto,
            );
            expect(result).toEqual(fakeUpdatedCompany);
            expect(companyRepository.findById).toHaveBeenCalledWith(fakeCompany.id);
            expect(companyRepository.update).toHaveBeenCalledWith(
                fakeCompany.id,
                fakeUpdateCompanyDto,
            );
        });

        it('Should throw NotFoundException when Company not found', async () => {
            jest.spyOn(companyRepository, 'findById');
            jest.spyOn(companyRepository, 'update');

            await expect(
                companyService.update(fakeCompany.id, fakeUpdateCompanyDto),
            ).rejects.toThrow(NotFoundException);
            expect(companyRepository.findById).toHaveBeenCalledWith(fakeCompany.id);
            expect(companyRepository.update).not.toHaveBeenCalled();
        });
    });

    describe('Update Company Logo', () => {
        const fakeLogoName = 'new-logo.png';

        it('Should update Company logo successfully', async () => {
            jest.spyOn(companyRepository, 'findById').mockResolvedValue(fakeCompany);
            jest.spyOn(companyRepository, 'update').mockResolvedValue({
                ...fakeCompany,
                logoName: fakeLogoName,
            });

            const result = await companyService.updateLogo(fakeCompany.id, fakeLogoName);
            expect(result).toEqual({
                ...fakeCompany,
                logoName: fakeLogoName,
            });
            expect(companyRepository.findById).toHaveBeenCalledWith(fakeCompany.id);
            expect(companyRepository.update).toHaveBeenCalledWith(fakeCompany.id, {
                logoName: fakeLogoName,
            });
        });

        it('Should throw NotFoundException when Company not found', async () => {
            jest.spyOn(companyRepository, 'findById');
            jest.spyOn(companyRepository, 'update');

            await expect(
                companyService.updateLogo(fakeCompany.id, fakeLogoName),
            ).rejects.toThrow(NotFoundException);
            expect(companyRepository.findById).toHaveBeenCalledWith(fakeCompany.id);
            expect(companyRepository.update).not.toHaveBeenCalled();
        });
    });

    describe('Remove Company', () => {
        it('Should remove Company successfully', async () => {
            jest.spyOn(companyRepository, 'findById').mockResolvedValue({
                ...companyWithOwner,
                events: []
            });
            jest.spyOn(companyRepository, 'delete');

            const result = await companyService.delete(companyWithOwner.id);
            expect(result).toEqual({ message: 'Company successfully deleted' });
            expect(companyRepository.findById).toHaveBeenCalledWith(
                companyWithOwner.id,
                { events: true }
            );
            expect(companyRepository.delete).toHaveBeenCalledWith(
                companyWithOwner.id,
            );
        });

        it('Should throw NotFoundException when Company not found', async () => {
            jest.spyOn(companyRepository, 'findById').mockResolvedValue(null);
            jest.spyOn(companyRepository, 'delete');

            await expect(
                companyService.delete(companyWithOwner.id),
            ).rejects.toThrow(NotFoundException);
            expect(companyRepository.findById).toHaveBeenCalledWith(
                companyWithOwner.id,
                { events: true }
            );
            expect(companyRepository.delete).not.toHaveBeenCalled();
        });

        it('Should throw BadRequestException when Company has events', async () => {
            jest.spyOn(companyRepository, 'findById').mockResolvedValue(companyWithOwnerAndEvent);
            jest.spyOn(companyRepository, 'delete');

            await expect(
                companyService.delete(companyWithOwnerAndEvent.id),
            ).rejects.toThrow(BadRequestException);
            expect(companyRepository.findById).toHaveBeenCalledWith(
                companyWithOwnerAndEvent.id,
                { events: true }
            );
            expect(companyRepository.delete).not.toHaveBeenCalled();
        });
    });
});
