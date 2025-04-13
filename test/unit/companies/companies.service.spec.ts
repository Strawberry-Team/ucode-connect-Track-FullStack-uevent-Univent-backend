// test/unit/companies/companies.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesService } from '../../../src/models/companies/companies.service';
import { CompaniesRepository } from '../../../src/models/companies/companies.repository';
import { Company } from '../../../src/models/companies/entities/company.entity';
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
} from '../../fake-data/fake-companies';
import { UpdateCompanyDto } from '../../../src/models/companies/dto/update-company.dto';
import { generateFakeUser } from '../../fake-data/fake-users';
import { EmailService } from '../../../src/email/email.service';

describe('CompaniesService', () => {
    let service: CompaniesService;
    let repository: CompaniesRepository;
    let emailService: EmailService;

    const fakeUser = generateFakeUser();
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
                        findByTitle: jest.fn().mockResolvedValue(null),
                        update: jest.fn().mockResolvedValue(null),
                        delete: jest.fn().mockResolvedValue(undefined),
                    },
                },
                {
                    provide: EmailService,
                    useValue: {
                        sendWelcomeCompanyEmail: jest.fn().mockResolvedValue(null),
                    },
                },
            ],
        }).compile();

        service = module.get<CompaniesService>(CompaniesService);
        repository = module.get<CompaniesRepository>(CompaniesRepository);
        emailService = module.get<EmailService>(EmailService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Create Company', () => {
        it('Should create a Company', async () => {
            jest.spyOn(repository, 'findByOwnerId');
            jest.spyOn(repository, 'findByEmail');
            jest.spyOn(repository, 'create').mockResolvedValue(fakeCompany);
            jest.spyOn(emailService, 'sendWelcomeCompanyEmail');

            const result = await service.create(
                fakeCreateCompanyDto,
                fakeUser.id,
            );
            expect(result).toEqual(fakeCompany);
            expect(repository.create).toHaveBeenCalledWith(
                fakeCreateCompanyDto,
            );
            expect(emailService.sendWelcomeCompanyEmail).toHaveBeenCalled();
        });

        it('Should throw ConflictException when owner has already a Company', async () => {
            const anotherCompany = {
                ...fakeCompany,
                id: generateFakeId(),
            };
            jest.spyOn(repository, 'findByOwnerId').mockResolvedValue(
                anotherCompany,
            );
            jest.spyOn(repository, 'findByEmail');
            jest.spyOn(repository, 'create');
            jest.spyOn(emailService, 'sendWelcomeCompanyEmail');

            await expect(
                service.create(fakeCreateCompanyDto, fakeUser.id),
            ).rejects.toThrow(ConflictException);
            expect(repository.findByOwnerId).toHaveBeenCalledWith(fakeUser.id);
            expect(repository.findByEmail).not.toHaveBeenCalled();
            expect(repository.create).not.toHaveBeenCalled();
            expect(emailService.sendWelcomeCompanyEmail).not.toHaveBeenCalled();
        });

        it('Should throw ConflictException when email is already in use', async () => {
            const anotherCompany = {
                ...fakeCompany,
                id: generateFakeId(),
            };
            jest.spyOn(repository, 'findByOwnerId');
            jest.spyOn(repository, 'findByEmail').mockResolvedValue(
                anotherCompany,
            );
            jest.spyOn(repository, 'create');
            jest.spyOn(emailService, 'sendWelcomeCompanyEmail');

            await expect(
                service.create(fakeCreateCompanyDto, fakeUser.id),
            ).rejects.toThrow(ConflictException);
            expect(repository.findByOwnerId).toHaveBeenCalledWith(fakeUser.id);
            expect(repository.findByEmail).toHaveBeenCalledWith(
                fakeCreateCompanyDto.email,
            );
            expect(repository.create).not.toHaveBeenCalled();
            expect(emailService.sendWelcomeCompanyEmail).not.toHaveBeenCalled();
        });

        it('Should throw NotFoundException when owner not found', async () => {
            jest.spyOn(repository, 'findByOwnerId');
            jest.spyOn(repository, 'findByEmail');
            jest.spyOn(repository, 'create');

            await expect(
                service.create(fakeCreateCompanyDto, fakeUser.id),
            ).rejects.toThrow(NotFoundException);
            expect(repository.findByOwnerId).toHaveBeenCalledWith(fakeCompany.ownerId);
            expect(repository.findByEmail).toHaveBeenCalledWith(fakeCompany.email);
            expect(repository.create).not.toHaveBeenCalled();
        });
    });

    describe('Find all Companies', () => {
        it('Should return all Companies', async () => {
            jest.spyOn(repository, 'findAll').mockResolvedValue([fakeCompany]);

            const result = await service.findAll();
            expect(result).toEqual([fakeCompany]);
            expect(repository.findAll).toHaveBeenCalled();
        });
    });

    describe('Find Company by its ID', () => {
        it('Should return Company when found', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(fakeCompany);

            const result = await service.findById(fakeCompany.id);
            expect(result).toEqual(fakeCompany);
            expect(repository.findById).toHaveBeenCalledWith(fakeCompany.id);
        });

        it('Should throw BadRequestException when invalid ID passed', async () => {
            jest.spyOn(repository, 'findById');

            await expect(service.findById(-1)).rejects.toThrow(
                BadRequestException,
            );
            expect(repository.findById).not.toHaveBeenCalled();
        });

        it('Should throw NotFoundException when Company not found', async () => {
            jest.spyOn(repository, 'findById');

            await expect(
                service.findById(fakeCompany.id),
            ).rejects.toThrow(NotFoundException);
            expect(repository.findById).toHaveBeenCalledWith(fakeCompany.id);
        });
    });

    describe('Find Company by owner ID', () => {
        it('Should return Company when found', async () => {
            jest.spyOn(repository, 'findByOwnerId').mockResolvedValue(
                fakeCompany,
            );

            const result = await service.findByOwnerId(
                fakeCompany.ownerId,
            );
            expect(result).toEqual(fakeCompany);
            expect(repository.findByOwnerId).toHaveBeenCalledWith(
                fakeCompany.ownerId,
            );
        });

        it('Should throw BadRequestException when invalid owner ID passed', async () => {
            jest.spyOn(repository, 'findByOwnerId');

            await expect(service.findByOwnerId(-1)).rejects.toThrow(
                BadRequestException,
            );
            expect(repository.findByOwnerId).not.toHaveBeenCalled();
        });

        it('Should throw NotFoundException when Company not found', async () => {
            jest.spyOn(repository, 'findByOwnerId');

            await expect(
                service.findByOwnerId(fakeCompany.ownerId),
            ).rejects.toThrow(NotFoundException);
            expect(repository.findByOwnerId).toHaveBeenCalledWith(
                fakeCompany.ownerId,
            );
        });
    });

    describe('Find Company by email', () => {
        it('Should return Company when found', async () => {
            jest.spyOn(repository, 'findByEmail').mockResolvedValue(
                fakeCompany,
            );

            const result = await service.findByEmail(fakeCompany.email);
            expect(result).toEqual(fakeCompany);
            expect(repository.findByEmail).toHaveBeenCalledWith(
                fakeCompany.email,
            );
        });

        it('Should throw BadRequestException when invalid email passed', async () => {
            jest.spyOn(repository, 'findByEmail');

            await expect(service.findByEmail('')).rejects.toThrow(
                BadRequestException,
            );
            expect(repository.findByEmail).not.toHaveBeenCalled();
        });

        it('Should throw NotFoundException when Company not found', async () => {
            jest.spyOn(repository, 'findByEmail').mockResolvedValue(null);

            await expect(
                service.findByEmail(fakeCompany.email),
            ).rejects.toThrow(NotFoundException);
            expect(repository.findByEmail).toHaveBeenCalledWith(
                fakeCompany.email,
            );
        });
    });

    describe('Update Company', () => {
        it('Should update Company successfully', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(fakeCompany);
            jest.spyOn(repository, 'findByOwnerId');
            jest.spyOn(repository, 'findByEmail');
            jest.spyOn(repository, 'update').mockResolvedValue(
                fakeUpdatedCompany,
            );

            const result = await service.update(
                fakeCompany.id,
                fakeUpdateCompanyDto,
            );
            expect(result).toEqual(fakeUpdatedCompany);
            expect(repository.findById).toHaveBeenCalledWith(fakeCompany.id);
            expect(repository.findByOwnerId).toHaveBeenCalledWith(fakeUser.id);
            expect(repository.findByEmail).toHaveBeenCalledWith(fakeUser.id);
            expect(repository.update).toHaveBeenCalledWith(
                fakeUpdatedCompany.id,
                fakeUpdateCompanyDto,
            );
        });

        it('Should throw BadRequestException when invalid ID passed', async () => {
            jest.spyOn(repository, 'findById');
            jest.spyOn(repository, 'findByOwnerId');
            jest.spyOn(repository, 'findByEmail');
            jest.spyOn(repository, 'update');

            await expect(
                service.update(-1, fakeUpdateCompanyDto),
            ).rejects.toThrow(BadRequestException);
            expect(repository.findById).not.toHaveBeenCalled();
            expect(repository.findByOwnerId).not.toHaveBeenCalled();
            expect(repository.findByEmail).not.toHaveBeenCalled();
            expect(repository.update).not.toHaveBeenCalled();
        });

        it('Should throw NotFoundException when Company not found', async () => {
            jest.spyOn(repository, 'findById');
            jest.spyOn(repository, 'findByOwnerId');
            jest.spyOn(repository, 'findByEmail');
            jest.spyOn(repository, 'update');

            await expect(
                service.update(fakeCompany.id, fakeUpdateCompanyDto),
            ).rejects.toThrow(NotFoundException);
            expect(repository.findById).toHaveBeenCalledWith(fakeCompany.id);
            expect(repository.findByOwnerId).not.toHaveBeenCalled();
            expect(repository.findByEmail).not.toHaveBeenCalled();
            expect(repository.update).not.toHaveBeenCalled();
        });

        it('Should throw NotFoundException when new owner not found', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(fakeCompany);
            jest.spyOn(repository, 'findByOwnerId');
            jest.spyOn(repository, 'findByEmail');
            jest.spyOn(repository, 'update');

            await expect(
                service.update(fakeCompany.id, fakeUpdateCompanyDto),
            ).rejects.toThrow(NotFoundException);
            expect(repository.findById).toHaveBeenCalledWith(fakeCompany.id);
            expect(repository.findByOwnerId).not.toHaveBeenCalled();
            expect(repository.findByEmail).not.toHaveBeenCalled();
            expect(repository.update).not.toHaveBeenCalled();
        });

        it('Should throw ConflictException when new owner has already a Company', async () => {
            const anotherCompany = {
                ...fakeUpdatedCompany,
                id: generateFakeId(),
            };
            jest.spyOn(repository, 'findById').mockResolvedValue(fakeCompany);
            jest.spyOn(repository, 'findByOwnerId').mockResolvedValue(
                anotherCompany,
            );
            jest.spyOn(repository, 'findByEmail');
            jest.spyOn(repository, 'update');

            await expect(
                service.update(fakeCompany.id, fakeUpdateCompanyDto),
            ).rejects.toThrow(ConflictException);
            expect(repository.findById).toHaveBeenCalledWith(fakeCompany.id);
            expect(repository.findByOwnerId).toHaveBeenCalledWith(fakeUser.id);
            expect(repository.findByEmail).not.toHaveBeenCalled();
            expect(repository.update).not.toHaveBeenCalled();
        });

        it('Should throw ConflictException when email is already in use', async () => {
            const anotherCompany = {
                ...fakeUpdatedCompany,
                id: generateFakeId(),
            };
            jest.spyOn(repository, 'findById').mockResolvedValue(fakeCompany);
            jest.spyOn(repository, 'findByOwnerId');
            jest.spyOn(repository, 'findByEmail').mockResolvedValue(
                anotherCompany,
            );
            jest.spyOn(repository, 'update');

            await expect(
                service.update(fakeCompany.id, fakeUpdateCompanyDto),
            ).rejects.toThrow(ConflictException);
            expect(repository.findById).toHaveBeenCalledWith(fakeCompany.id);
            expect(repository.findByOwnerId).toHaveBeenCalledWith(fakeUser.id);
            expect(repository.findByEmail).toHaveBeenCalledWith(fakeUser.id);
            expect(repository.update).not.toHaveBeenCalled();
        });
    });

    describe('Remove Company', () => {
        it('Should remove Company successfully', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(
                fakeUpdatedCompany,
            );
            jest.spyOn(repository, 'delete');

            await service.delete(fakeUpdatedCompany.id);
            expect(repository.delete).toHaveBeenCalledWith(
                fakeUpdatedCompany.id,
            );
        });

        it('Should throw BadRequestException when invalid ID passed', async () => {
            jest.spyOn(repository, 'findById');
            jest.spyOn(repository, 'delete');

            await expect(service.delete(-1)).rejects.toThrow(
                BadRequestException,
            );
            expect(repository.findById).not.toHaveBeenCalled();
            expect(repository.delete).not.toHaveBeenCalled();
        });

        it('Should throw NotFoundException when Company not found', async () => {
            jest.spyOn(repository, 'findById');
            jest.spyOn(repository, 'delete');

            await expect(
                service.delete(fakeUpdatedCompany.id),
            ).rejects.toThrow(NotFoundException);
            expect(repository.findById).toHaveBeenCalledWith(
                fakeUpdatedCompany.id,
            );
            expect(repository.delete).not.toHaveBeenCalled();
        });
    });
});
