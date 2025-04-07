import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesService } from './companies.service';
import { CompaniesRepository } from './companies.repository';
import { Company } from './entities/company.entity';
import {
    BadRequestException,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import {
    generateFakeCompany,
    generateFakeId,
    pickCompanyFields,
} from './utils/fake-company';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { generateFakeUser } from './utils/fake-user';

describe('CompaniesService', () => {
    let service: CompaniesService;
    let repository: CompaniesRepository;

    const fakeCompany: Company = generateFakeCompany(true);
    const fakeCreateCompanyDto: CreateCompanyDto = pickCompanyFields(
        fakeCompany,
        ['ownerId', 'email', 'title', 'description'],
    );
    const fakeUpdateCompanyDto: UpdateCompanyDto = pickCompanyFields(
        generateFakeCompany(true),
        ['ownerId', 'email', 'title', 'description'],
    );
    const fakeUpdatedCompany: Company = {
        ...fakeCompany,
        ...fakeUpdateCompanyDto,
    };
    const fakeUser = generateFakeUser();
    fakeUser.id = fakeCompany.ownerId;

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
                        findUserByOwnerId: jest.fn().mockResolvedValue(null),
                        findByOwnerId: jest.fn().mockResolvedValue(null),
                        findByEmail: jest.fn().mockResolvedValue(null),
                        update: jest.fn().mockResolvedValue(null),
                        delete: jest.fn().mockResolvedValue(undefined),
                    },
                },
            ],
        }).compile();

        service = module.get<CompaniesService>(CompaniesService);
        repository = module.get<CompaniesRepository>(CompaniesRepository);
    });

    describe('Create Company', () => {
        it('Should create a Company', async () => {
            jest.spyOn(repository, 'findUserByOwnerId').mockResolvedValue(
                fakeUser,
            );
            jest.spyOn(repository, 'findByOwnerId');
            jest.spyOn(repository, 'findByEmail');
            jest.spyOn(repository, 'create').mockResolvedValue(fakeCompany);

            const result = await service.createCompany(fakeCreateCompanyDto);
            expect(result).toEqual(fakeCompany);
            expect(repository.create).toHaveBeenCalledWith(
                fakeCreateCompanyDto,
            );
        });

        it('Should throw BadRequestException when invalid new owner ID passed', async () => {
            jest.spyOn(repository, 'findUserByOwnerId');
            jest.spyOn(repository, 'findByOwnerId');
            jest.spyOn(repository, 'findByEmail');
            jest.spyOn(repository, 'create');

            await expect(
                service.createCompany({
                    ...fakeCreateCompanyDto,
                    ownerId: -1,
                }),
            ).rejects.toThrow(BadRequestException);
            expect(repository.findUserByOwnerId).not.toHaveBeenCalled();
            expect(repository.findByOwnerId).not.toHaveBeenCalled();
            expect(repository.findByEmail).not.toHaveBeenCalled();
            expect(repository.create).not.toHaveBeenCalled();
        });

        it('Should throw NotFoundException when owner not found', async () => {
            jest.spyOn(repository, 'findUserByOwnerId');
            jest.spyOn(repository, 'findByOwnerId');
            jest.spyOn(repository, 'findByEmail');
            jest.spyOn(repository, 'create');

            await expect(
                service.createCompany(fakeCreateCompanyDto),
            ).rejects.toThrow(NotFoundException);
            expect(repository.findUserByOwnerId).toHaveBeenCalledWith(
                fakeCreateCompanyDto.ownerId,
            );
            expect(repository.findByOwnerId).not.toHaveBeenCalled();
            expect(repository.findByEmail).not.toHaveBeenCalled();
            expect(repository.create).not.toHaveBeenCalled();
        });

        it('Should throw ConflictException when owner has already a Company', async () => {
            const anotherCompany = {
                ...fakeCompany,
                id: generateFakeId(),
            };
            jest.spyOn(repository, 'findUserByOwnerId').mockResolvedValue(
                fakeUser,
            );
            jest.spyOn(repository, 'findByOwnerId').mockResolvedValue(
                anotherCompany,
            );
            jest.spyOn(repository, 'findByEmail');
            jest.spyOn(repository, 'create');

            await expect(
                service.createCompany(fakeCreateCompanyDto),
            ).rejects.toThrow(ConflictException);
            expect(repository.findUserByOwnerId).toHaveBeenCalledWith(
                fakeCreateCompanyDto.ownerId,
            );
            expect(repository.findByOwnerId).toHaveBeenCalledWith(
                fakeCreateCompanyDto.ownerId,
            );
            expect(repository.findByEmail).not.toHaveBeenCalled();
            expect(repository.create).not.toHaveBeenCalled();
        });

        it('Should throw BadRequestException when invalid email passed', async () => {
            jest.spyOn(repository, 'findUserByOwnerId').mockResolvedValue(
                fakeUser,
            );
            jest.spyOn(repository, 'findByOwnerId');
            jest.spyOn(repository, 'findByEmail');
            jest.spyOn(repository, 'create');

            await expect(
                service.createCompany({
                    ...fakeCreateCompanyDto,
                    email: '',
                }),
            ).rejects.toThrow(BadRequestException);
            expect(repository.findUserByOwnerId).toHaveBeenCalledWith(
                fakeCreateCompanyDto.ownerId,
            );
            expect(repository.findByOwnerId).toHaveBeenCalledWith(
                fakeCreateCompanyDto.ownerId,
            );
            expect(repository.findByEmail).not.toHaveBeenCalled();
            expect(repository.create).not.toHaveBeenCalled();
        });

        it('Should throw ConflictException when email is already in use', async () => {
            const anotherCompany = {
                ...fakeCompany,
                id: generateFakeId(),
            };
            jest.spyOn(repository, 'findUserByOwnerId').mockResolvedValue(
                fakeUser,
            );
            jest.spyOn(repository, 'findByOwnerId');
            jest.spyOn(repository, 'findByEmail').mockResolvedValue(
                anotherCompany,
            );
            jest.spyOn(repository, 'create');

            await expect(
                service.createCompany(fakeCreateCompanyDto),
            ).rejects.toThrow(ConflictException);
            expect(repository.findUserByOwnerId).toHaveBeenCalledWith(
                fakeCreateCompanyDto.ownerId,
            );
            expect(repository.findByOwnerId).toHaveBeenCalledWith(
                fakeCreateCompanyDto.ownerId,
            );
            expect(repository.findByEmail).toHaveBeenCalledWith(
                fakeCreateCompanyDto.email,
            );
            expect(repository.create).not.toHaveBeenCalled();
        });
    });

    describe('Find all Companies', () => {
        it('Should return all Companies', async () => {
            jest.spyOn(repository, 'findAll').mockResolvedValue([fakeCompany]);

            const result = await service.findAllCompanies();
            expect(result).toEqual([fakeCompany]);
            expect(repository.findAll).toHaveBeenCalled();
        });

        it('Should throw NotFoundException when no Companies exist', async () => {
            jest.spyOn(repository, 'findAll').mockResolvedValue([]);

            await expect(service.findAllCompanies()).rejects.toThrow(
                NotFoundException,
            );
            expect(repository.findAll).toHaveBeenCalled();
        });
    });

    describe('Find Company by its ID', () => {
        it('Should return Company when found', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(fakeCompany);

            const result = await service.findCompanyById(fakeCompany.id);
            expect(result).toEqual(fakeCompany);
            expect(repository.findById).toHaveBeenCalledWith(fakeCompany.id);
        });

        it('Should throw BadRequestException when invalid ID passed', async () => {
            jest.spyOn(repository, 'findById');

            await expect(service.findCompanyById(-1)).rejects.toThrow(
                BadRequestException,
            );
            expect(repository.findById).not.toHaveBeenCalled();
        });

        it('Should throw NotFoundException when Company not found', async () => {
            jest.spyOn(repository, 'findById');

            await expect(
                service.findCompanyById(fakeCompany.id),
            ).rejects.toThrow(NotFoundException);
            expect(repository.findById).toHaveBeenCalledWith(fakeCompany.id);
        });
    });

    describe('Find Company by owner ID', () => {
        it('Should return Company when found', async () => {
            jest.spyOn(repository, 'findByOwnerId').mockResolvedValue(
                fakeCompany,
            );

            const result = await service.findCompanyByOwnerId(
                fakeCompany.ownerId,
            );
            expect(result).toEqual(fakeCompany);
            expect(repository.findByOwnerId).toHaveBeenCalledWith(
                fakeCompany.ownerId,
            );
        });

        it('Should throw BadRequestException when invalid owner ID passed', async () => {
            jest.spyOn(repository, 'findByOwnerId');

            await expect(service.findCompanyByOwnerId(-1)).rejects.toThrow(
                BadRequestException,
            );
            expect(repository.findByOwnerId).not.toHaveBeenCalled();
        });

        it('Should throw NotFoundException when Company not found', async () => {
            jest.spyOn(repository, 'findByOwnerId');

            await expect(
                service.findCompanyByOwnerId(fakeCompany.ownerId),
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

            const result = await service.findCompanyByEmail(fakeCompany.email);
            expect(result).toEqual(fakeCompany);
            expect(repository.findByEmail).toHaveBeenCalledWith(
                fakeCompany.email,
            );
        });

        it('Should throw BadRequestException when invalid email passed', async () => {
            jest.spyOn(repository, 'findByEmail');

            await expect(service.findCompanyByEmail('')).rejects.toThrow(
                BadRequestException,
            );
            expect(repository.findByEmail).not.toHaveBeenCalled();
        });

        it('Should throw NotFoundException when Company not found', async () => {
            jest.spyOn(repository, 'findByEmail').mockResolvedValue(null);

            await expect(
                service.findCompanyByEmail(fakeCompany.email),
            ).rejects.toThrow(NotFoundException);
            expect(repository.findByEmail).toHaveBeenCalledWith(
                fakeCompany.email,
            );
        });
    });

    describe('Update Company', () => {
        it('Should update Company successfully', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(fakeCompany);
            jest.spyOn(repository, 'findUserByOwnerId').mockResolvedValue(
                fakeUser,
            );
            jest.spyOn(repository, 'findByOwnerId');
            jest.spyOn(repository, 'findByEmail');
            jest.spyOn(repository, 'update').mockResolvedValue(
                fakeUpdatedCompany,
            );

            const result = await service.updateCompany(
                fakeCompany.id,
                fakeUpdateCompanyDto,
            );
            expect(result).toEqual(fakeUpdatedCompany);
            expect(repository.findById).toHaveBeenCalledWith(fakeCompany.id);
            expect(repository.findByOwnerId).toHaveBeenCalledWith(
                fakeUpdateCompanyDto.ownerId,
            );
            expect(repository.findByEmail).toHaveBeenCalledWith(
                fakeUpdateCompanyDto.email,
            );
            expect(repository.update).toHaveBeenCalledWith(
                fakeUpdatedCompany.id,
                fakeUpdateCompanyDto,
            );
        });

        it('Should throw BadRequestException when invalid ID passed', async () => {
            jest.spyOn(repository, 'findById');
            jest.spyOn(repository, 'findUserByOwnerId');
            jest.spyOn(repository, 'findByOwnerId');
            jest.spyOn(repository, 'findByEmail');
            jest.spyOn(repository, 'update');

            await expect(
                service.updateCompany(-1, fakeUpdateCompanyDto),
            ).rejects.toThrow(BadRequestException);
            expect(repository.findById).not.toHaveBeenCalled();
            expect(repository.findUserByOwnerId).not.toHaveBeenCalled();
            expect(repository.findByOwnerId).not.toHaveBeenCalled();
            expect(repository.findByEmail).not.toHaveBeenCalled();
            expect(repository.update).not.toHaveBeenCalled();
        });

        it('Should throw NotFoundException when Company not found', async () => {
            jest.spyOn(repository, 'findById');
            jest.spyOn(repository, 'findUserByOwnerId');
            jest.spyOn(repository, 'findByOwnerId');
            jest.spyOn(repository, 'findByEmail');
            jest.spyOn(repository, 'update');

            await expect(
                service.updateCompany(fakeCompany.id, fakeUpdateCompanyDto),
            ).rejects.toThrow(NotFoundException);
            expect(repository.findById).toHaveBeenCalledWith(fakeCompany.id);
            expect(repository.findUserByOwnerId).not.toHaveBeenCalled();
            expect(repository.findByOwnerId).not.toHaveBeenCalled();
            expect(repository.findByEmail).not.toHaveBeenCalled();
            expect(repository.update).not.toHaveBeenCalled();
        });

        it('Should throw BadRequestException when invalid new owner ID passed', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(fakeCompany);
            jest.spyOn(repository, 'findUserByOwnerId');
            jest.spyOn(repository, 'findByOwnerId');
            jest.spyOn(repository, 'findByEmail');
            jest.spyOn(repository, 'update');

            await expect(
                service.updateCompany(fakeCompany.id, {
                    ...fakeUpdateCompanyDto,
                    ownerId: -1,
                }),
            ).rejects.toThrow(BadRequestException);
            expect(repository.findById).toHaveBeenCalledWith(fakeCompany.id);
            expect(repository.findUserByOwnerId).not.toHaveBeenCalled();
            expect(repository.findByOwnerId).not.toHaveBeenCalled();
            expect(repository.findByEmail).not.toHaveBeenCalled();
            expect(repository.update).not.toHaveBeenCalled();
        });

        it('Should throw NotFoundException when new owner not found', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(fakeCompany);
            jest.spyOn(repository, 'findUserByOwnerId');
            jest.spyOn(repository, 'findByOwnerId');
            jest.spyOn(repository, 'findByEmail');
            jest.spyOn(repository, 'update');

            await expect(
                service.updateCompany(fakeCompany.id, fakeUpdateCompanyDto),
            ).rejects.toThrow(NotFoundException);
            expect(repository.findById).toHaveBeenCalledWith(fakeCompany.id);
            expect(repository.findUserByOwnerId).toHaveBeenCalledWith(
                fakeUpdateCompanyDto.ownerId,
            );
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
            jest.spyOn(repository, 'findUserByOwnerId').mockResolvedValue(
                fakeUser,
            );
            jest.spyOn(repository, 'findByOwnerId').mockResolvedValue(
                anotherCompany,
            );
            jest.spyOn(repository, 'findByEmail');
            jest.spyOn(repository, 'update');

            await expect(
                service.updateCompany(fakeCompany.id, fakeUpdateCompanyDto),
            ).rejects.toThrow(ConflictException);
            expect(repository.findById).toHaveBeenCalledWith(fakeCompany.id);
            expect(repository.findUserByOwnerId).toHaveBeenCalledWith(
                fakeUpdateCompanyDto.ownerId,
            );
            expect(repository.findByOwnerId).toHaveBeenCalledWith(
                fakeUpdateCompanyDto.ownerId,
            );
            expect(repository.findByEmail).not.toHaveBeenCalled();
            expect(repository.update).not.toHaveBeenCalled();
        });

        it('Should throw BadRequestException when invalid email passed', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(fakeCompany);
            jest.spyOn(repository, 'findUserByOwnerId').mockResolvedValue(
                fakeUser,
            );
            jest.spyOn(repository, 'findByOwnerId');
            jest.spyOn(repository, 'findByEmail');
            jest.spyOn(repository, 'update');

            await expect(
                service.updateCompany(fakeCompany.id, {
                    ...fakeUpdateCompanyDto,
                    email: '',
                }),
            ).rejects.toThrow(BadRequestException);
            expect(repository.findById).toHaveBeenCalledWith(fakeCompany.id);
            expect(repository.findUserByOwnerId).toHaveBeenCalledWith(
                fakeUpdateCompanyDto.ownerId,
            );
            expect(repository.findByOwnerId).toHaveBeenCalledWith(
                fakeUpdateCompanyDto.ownerId,
            );
            expect(repository.findByEmail).not.toHaveBeenCalled();
            expect(repository.update).not.toHaveBeenCalled();
        });

        it('Should throw ConflictException when email is already in use', async () => {
            const anotherCompany = {
                ...fakeUpdatedCompany,
                id: generateFakeId(),
            };
            jest.spyOn(repository, 'findById').mockResolvedValue(fakeCompany);
            jest.spyOn(repository, 'findUserByOwnerId').mockResolvedValue(
                fakeUser,
            );
            jest.spyOn(repository, 'findByOwnerId');
            jest.spyOn(repository, 'findByEmail').mockResolvedValue(
                anotherCompany,
            );
            jest.spyOn(repository, 'update');

            await expect(
                service.updateCompany(fakeCompany.id, fakeUpdateCompanyDto),
            ).rejects.toThrow(ConflictException);
            expect(repository.findById).toHaveBeenCalledWith(fakeCompany.id);
            expect(repository.findUserByOwnerId).toHaveBeenCalledWith(
                fakeUpdateCompanyDto.ownerId,
            );
            expect(repository.findByOwnerId).toHaveBeenCalledWith(
                fakeUpdateCompanyDto.ownerId,
            );
            expect(repository.findByEmail).toHaveBeenCalledWith(
                fakeUpdateCompanyDto.email,
            );
            expect(repository.update).not.toHaveBeenCalled();
        });
    });

    describe('Remove Company', () => {
        it('Should remove Company successfully', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(
                fakeUpdatedCompany,
            );
            jest.spyOn(repository, 'delete');

            await service.removeCompany(fakeUpdatedCompany.id);
            expect(repository.delete).toHaveBeenCalledWith(
                fakeUpdatedCompany.id,
            );
        });

        it('Should throw BadRequestException when invalid ID passed', async () => {
            jest.spyOn(repository, 'findById');
            jest.spyOn(repository, 'delete');

            await expect(service.removeCompany(-1)).rejects.toThrow(
                BadRequestException,
            );
            expect(repository.findById).not.toHaveBeenCalled();
            expect(repository.delete).not.toHaveBeenCalled();
        });

        it('Should throw NotFoundException when Company not found', async () => {
            jest.spyOn(repository, 'findById');
            jest.spyOn(repository, 'delete');

            await expect(
                service.removeCompany(fakeUpdatedCompany.id),
            ).rejects.toThrow(NotFoundException);
            expect(repository.findById).toHaveBeenCalledWith(
                fakeUpdatedCompany.id,
            );
            expect(repository.delete).not.toHaveBeenCalled();
        });
    });
});
