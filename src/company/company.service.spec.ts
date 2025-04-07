import { Test, TestingModule } from '@nestjs/testing';
import { CompanyService } from './company.service';
import { CompanyRepository } from './company.repository';
import { Company } from './entities/company.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { generateFakeCompany, generateFakeId, pickFields } from './utils/fake-company';
import { UpdateCompanyDto } from './dto/update-company.dto';

describe('CompanyService', () => {
    let service: CompanyService;
    let repository: CompanyRepository;

    const fakeCompany: Company = generateFakeCompany(true);
    const fakeCreateCompanyDto: CreateCompanyDto = pickFields(
        fakeCompany,
        ['ownerId', 'email', 'title', 'description']
    );
    const fakeUpdatedCompany: Company = {
        ...generateFakeCompany(true),
        logoName: fakeCompany.logoName,
        createdAt: fakeCompany.createdAt,
        updatedAt: fakeCompany.updatedAt,
    };
    const fakeUpdateCompanyDto: UpdateCompanyDto = pickFields(
        fakeUpdatedCompany,
        ['ownerId', 'email', 'title', 'description']
    );

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CompanyService,
                {
                    provide: CompanyRepository,
                    useValue: {
                        create: jest.fn(),
                        findAll: jest.fn(),
                        findById: jest.fn(),
                        findByOwnerId: jest.fn(),
                        findByEmail: jest.fn(),
                        update: jest.fn(),
                        delete: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<CompanyService>(CompanyService);
        repository = module.get<CompanyRepository>(CompanyRepository);
    });

    describe('Create Company', () => {
        it('Should create a Company', async () => {
            jest.spyOn(repository, 'create').mockResolvedValue(fakeCompany);

            const result = await service.createCompany(fakeCreateCompanyDto);

            expect(result).toEqual(fakeCompany);
            expect(repository.create).toHaveBeenCalledWith(fakeCreateCompanyDto);
        });
    });

    describe('Find all Companies', () => {
        it('Should return all Companies', async () => {
            const allCompanies = [fakeCompany];
            jest.spyOn(repository, 'findAll').mockResolvedValue(allCompanies);

            const result = await service.findAllCompanies();

            expect(result).toEqual(allCompanies);
            expect(repository.findAll).toHaveBeenCalled();
        });

        it('Should throw NotFoundException when no Companies exist', async () => {
            jest.spyOn(repository, 'findAll').mockResolvedValue([]);

            await expect(service.findAllCompanies()).rejects.toThrow(NotFoundException);
            expect(repository.findAll).toHaveBeenCalled();
        });
    });

    describe('Find Company by its ID', () => {
        it('Should return Company when found', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(fakeCompany);

            const result = await service.findCompanyById(fakeCompany.id);

            expect(result).toEqual(fakeCompany);
            expect(repository.findById).toHaveBeenCalledWith(1);
        });

        it('Should throw NotFoundException when Company not found', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(null);

            await expect(service.findCompanyById(fakeCompany.id)).rejects.toThrow(NotFoundException);
            expect(repository.findById).toHaveBeenCalledWith(fakeCompany.id);
        });
    });

    describe('Find Company by owner ID', () => {
        it('Should return Company when found', async () => {
            jest.spyOn(repository, 'findByOwnerId').mockResolvedValue(fakeCompany);

            const result = await service.findCompanyByOwnerId(fakeCompany.ownerId);

            expect(result).toEqual(fakeCompany);
            expect(repository.findByOwnerId).toHaveBeenCalledWith(fakeCompany.ownerId);
        });

        it('Should throw NotFoundException when no companies with this owner ID exist', async () => {
            jest.spyOn(repository, 'findByOwnerId').mockResolvedValue(null);

            await expect(service.findCompanyByOwnerId(fakeCompany.ownerId)).rejects.toThrow(NotFoundException);
            expect(repository.findByOwnerId).toHaveBeenCalledWith(fakeCompany.ownerId);
        });
    });

    describe('Find Company by email', () => {
        it('Should return Company when found', async () => {
            jest.spyOn(repository, 'findByEmail').mockResolvedValue(fakeCompany);

            const result = await service.findCompanyByEmail(fakeCompany.email);

            expect(result).toEqual(fakeCompany);
            expect(repository.findByEmail).toHaveBeenCalledWith(fakeCompany.email);
        });

        it('Should throw NotFoundException when no companies with this email exist', async () => {
            jest.spyOn(repository, 'findByEmail').mockResolvedValue(null);

            await expect(service.findCompanyByEmail(fakeCompany.email)).rejects.toThrow(NotFoundException);
            expect(repository.findByEmail).toHaveBeenCalledWith(fakeCompany.email);
        });
    });

    describe('Update Company', () => {
        it('Should update Company successfully', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(fakeCompany);
            jest.spyOn(repository, 'update').mockResolvedValue(fakeUpdatedCompany);

            const result = await service.updateCompany(fakeCompany.id, fakeUpdateCompanyDto);

            expect(result).toEqual(fakeUpdatedCompany);
            expect(repository.update).toHaveBeenCalledWith(fakeCompany.id, fakeUpdateCompanyDto);
        });

        it('Should throw NotFoundException when updating non-existent Company', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(null);

            await expect(service.updateCompany(fakeCompany.id, fakeCompany)).rejects.toThrow(NotFoundException);
        });
    });

    describe('Remove Company', () => {
        it('Should remove Company successfully', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(fakeCompany);
            jest.spyOn(repository, 'delete').mockResolvedValue(undefined);

            await service.removeCompany(fakeCompany.id);

            expect(repository.delete).toHaveBeenCalledWith(fakeCompany.id);
        });

        it('Should throw NotFoundException when removing non-existent Company', async () => {
            jest.spyOn(repository, 'findById').mockResolvedValue(null);
            jest.spyOn(repository, 'delete').mockResolvedValue(undefined);

            const id = generateFakeId();
            await service.removeCompany(id);

            expect(repository.delete).toHaveBeenCalledWith(id);
        });
    });
});

