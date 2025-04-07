// import { Test, TestingModule } from '@nestjs/testing';
// import { CompanyController } from './company.controller';
// import { CompanyService } from './company.service';
// import { Company } from './entities/company.entity';
// import { CreateCompanyDto } from './dto/create-company.dto';
// import { UpdateCompanyDto } from './dto/update-company.dto';
// import { NotFoundException, BadRequestException, ConflictException, NotImplementedException } from '@nestjs/common';
// import { UsersService } from '../users/users.service';
// import { EmailService } from '../email/email.service';
// import { ConfigService } from '@nestjs/config';
// import { generateFakeCompany, pickFields } from './utils/fake-company';
//
// describe('CompanyController', () => {
//     let controller: CompanyController;
//     let companyService: CompanyService;
//     let emailService: EmailService;
//     let usersService: UsersService;
//     let configService: ConfigService;
//
//     const fakeCompany: Company = generateFakeCompany(true);
//     const fakeCreateCompanyDto: CreateCompanyDto = pickFields(
//         fakeCompany,
//         ['ownerId', 'email', 'title', 'description']
//     );
//     const fakeUpdatedCompany: Company = { ...generateFakeCompany(true), id: fakeCompany.id };
//     const fakeUser = { id: 1, email: 'test@example.com', firstName: 'John', lastName: 'Doe' };
//     const frontUrl = configService.get<string>('app.logo.path');
//
//     const expectNotFoundException = async (
//         promise: Promise<any>,
//         spy: jest.SpyInstance,
//         arg?: any
//     ) => {
//         await expect(promise).rejects.toThrow(NotFoundException);
//         if (arg !== undefined) {
//             expect(spy).toHaveBeenCalledWith(arg);
//         } else {
//             expect(spy).toHaveBeenCalled();
//         }
//     };
//
//     const expectSuccess = (
//         result: any,
//         expected: any,
//         spy: jest.SpyInstance,
//         ...args: any[]
//     ) => {
//         expect(result).toEqual(expected);
//         if (args.length > 0) {
//             expect(spy).toHaveBeenCalledWith(...args);
//         } else {
//             expect(spy).toHaveBeenCalled();
//         }
//     };
//
//     beforeEach(async () => {
//         const module: TestingModule = await Test.createTestingModule({
//             controllers: [CompanyController],
//             providers: [
//                 {
//                     provide: CompanyService,
//                     useValue: {
//                         createCompany: jest.fn().mockResolvedValue(fakeCompany),
//                         findAllCompanies: jest.fn().mockResolvedValue([fakeCompany]),
//                         findCompanyById: jest.fn().mockResolvedValue(fakeCompany),
//                         updateCompany: jest.fn().mockResolvedValue(fakeUpdatedCompany),
//                         removeCompany: jest.fn().mockResolvedValue(undefined),
//                         updateCompanyLogo: jest.fn().mockResolvedValue(undefined),
//                     },
//                 },
//                 {
//                     provide: UsersService,
//                     useValue: {
//                         getUserById: jest.fn().mockResolvedValue(fakeUser),
//                     },
//                 },
//                 {
//                     provide: EmailService,
//                     useValue: {
//                         sendWelcomeCompanyEmail: jest.fn().mockResolvedValue(undefined),
//                     },
//                 },
//                 {
//                     provide: ConfigService,
//                     useValue: {
//                         get: jest.fn().mockReturnValue(frontUrl),
//                     },
//                 },
//             ],
//         }).compile();
//
//         controller = module.get<CompanyController>(CompanyController);
//         companyService = module.get<CompanyService>(CompanyService);
//         emailService = module.get<EmailService>(EmailService);
//         usersService = module.get<UsersService>(UsersService);
//     });
//
//     describe('Create Company', () => {
//         it('Should create a Company and send welcome email', async () => {
//             const spy = jest.spyOn(companyService, 'createCompany');
//             const emailSpy = jest.spyOn(emailService, 'sendWelcomeCompanyEmail');
//             const result = await controller.create(fakeCreateCompanyDto, fakeUser.id);
//
//             expectSuccess(result, fakeCompany, spy, fakeCreateCompanyDto);
//             expect(usersService.getUserById).toHaveBeenCalledWith(fakeCompany.ownerId);
//             expect(emailSpy).toHaveBeenCalledWith(
//                 fakeUser.email,
//                 `${fakeUser.firstName} ${fakeUser.lastName}`,
//                 fakeCompany.title,
//                 frontUrl
//             );
//         });
//
//         it('Should throw BadRequestException when user already has a company', async () => {
//             jest.spyOn(companyService, 'createCompany').mockRejectedValue(
//                 new BadRequestException('User already has a company')
//             );
//             await expect(controller.create(fakeCreateCompanyDto, fakeUser.id)).rejects.toThrow(
//                 BadRequestException
//             );
//             expect(emailService.sendWelcomeCompanyEmail).not.toHaveBeenCalled();
//         });
//
//         it('Should throw ConflictException when company email is already in use', async () => {
//             jest.spyOn(companyService, 'createCompany').mockRejectedValue(
//                 new ConflictException('Company email already in use')
//             );
//             await expect(controller.create(fakeCreateCompanyDto, fakeUser.id)).rejects.toThrow(
//                 ConflictException
//             );
//             expect(emailService.sendWelcomeCompanyEmail).not.toHaveBeenCalled();
//         });
//     });
//
//     describe('Find all Companies', () => {
//         it('Should return all Companies', async () => {
//             const spy = jest.spyOn(companyService, 'findAllCompanies');
//             const result = await controller.findAll();
//             expectSuccess(result, [fakeCompany], spy);
//         });
//
//         it('Should return empty array when no Companies exist', async () => {
//             const spy = jest.spyOn(companyService, 'findAllCompanies').mockResolvedValue([]);
//             const result = await controller.findAll();
//             expect(result).toEqual([]);
//             expect(spy).toHaveBeenCalled();
//         });
//     });
//
//     describe('Find Company by ID', () => {
//         it('Should return Company when found', async () => {
//             const spy = jest.spyOn(companyService, 'findCompanyById');
//             const result = await controller.findOne(fakeCompany.id);
//             expectSuccess(result, fakeCompany, spy, fakeCompany.id);
//         });
//
//         it('Should throw NotFoundException when not found', async () => {
//             const spy = jest.spyOn(companyService, 'findCompanyById').mockRejectedValue(
//                 new NotFoundException()
//             );
//             await expectNotFoundException(controller.findOne(fakeCompany.id), spy, fakeCompany.id);
//         });
//     });
//
//     describe('Update Company', () => {
//         it('Should update Company successfully', async () => {
//             const updateDto: UpdateCompanyDto = { title: 'Updated Title' };
//             const spy = jest.spyOn(companyService, 'updateCompany');
//             const result = await controller.update(fakeCompany.id, updateDto, fakeUser.id);
//             expectSuccess(result, fakeUpdatedCompany, spy, fakeCompany.id, updateDto);
//         });
//
//         it('Should throw NotFoundException when updating non-existent Company', async () => {
//             const updateDto: UpdateCompanyDto = { title: 'Updated Title' };
//             const spy = jest.spyOn(companyService, 'updateCompany').mockRejectedValue(
//                 new NotFoundException()
//             );
//             await expectNotFoundException(
//                 controller.update(fakeCompany.id, updateDto, fakeUser.id),
//                 spy,
//                 fakeCompany.id
//             );
//         });
//     });
//
//     describe('Remove Company', () => {
//         it('Should throw NotImplementedException', async () => {
//             await expect(controller.remove(fakeCompany.id, fakeUser.id)).rejects.toThrow(
//                 NotImplementedException
//             );
//             expect(companyService.removeCompany).not.toHaveBeenCalled();
//         });
//     });
//
//     describe('Upload Logo', () => {
//         it('Should upload logo and update company', async () => {
//             const file: Express.Multer.File = {
//                 filename: 'logo.jpg',
//                 originalname: 'logo.jpg',
//                 mimetype: 'image/jpeg',
//                 size: 1024,
//                 path: './public/uploads/company-logos/logo.jpg',
//                 buffer: Buffer.from(''),
//                 destination: '',
//                 fieldname: '',
//                 encoding: '',
//                 stream: null as any,
//             };
//             const spy = jest.spyOn(companyService, 'updateCompanyLogo');
//             const result = await controller.uploadLogo(fakeCompany.id, file);
//             expect(result).toEqual({ server_filename: 'logo.jpg' });
//             expect(spy).toHaveBeenCalledWith(fakeCompany.id, 'logo.jpg');
//         });
//
//         it('Should throw BadRequestException when no file uploaded', async () => {
//             await expect(controller.uploadLogo(fakeCompany.id, null as any)).rejects.toThrow(
//                 BadRequestException
//             );
//             expect(companyService.updateCompanyLogo).not.toHaveBeenCalled();
//         });
//
//         it('Should throw NotFoundException when company not found', async () => {
//             const file: Express.Multer.File = {
//                 filename: 'logo.jpg',
//                 originalname: 'logo.jpg',
//                 mimetype: 'image/jpeg',
//                 size: 1024,
//                 path: './public/uploads/company-logos/logo.jpg',
//                 buffer: Buffer.from(''),
//                 destination: '',
//                 fieldname: '',
//                 encoding: '',
//                 stream: null as any,
//             };
//             const spy = jest.spyOn(companyService, 'updateCompanyLogo').mockRejectedValue(
//                 new NotFoundException()
//             );
//             await expectNotFoundException(controller.uploadLogo(fakeCompany.id, file), spy, fakeCompany.id);
//         });
//     });
// });
