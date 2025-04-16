// prisma/seeds/index.ts
import { DatabaseService } from '../../src/db/database.service';
import { EventFormatsService } from '../../src/models/events/formats/event-formats.service';
import { EventFormatsRepository } from '../../src/models/events/formats/event-formats.repository';
import { EventThemesService } from '../../src/models/events/themes/event-themes.service';
import { EventThemesRepository } from '../../src/models/events/themes/event-themes.repository';
import { UsersService } from '../../src/models/users/users.service';
import { UsersRepository } from '../../src/models/users/users.repository';
import { initialFormats } from './formats';
import { initialThemes } from './themes';
import { createInitialUsers } from './users';
import { CompaniesRepository } from '../../src/models/companies/companies.repository';
import { HashingPasswordsService } from '../../src/models/users/hashing-passwords.service';
import { ConfigService } from '@nestjs/config';
import { initialCompanies } from './companies';
import { EventsService } from '../../src/models/events/events.service';
import { EventsRepository } from '../../src/models/events/events.repository';
import { initialEvents } from './events';
import { TicketsRepository } from '../../src/models/tickets/tickets.repository';
import { initialTickets } from './tickets';
import { UserRole } from '@prisma/client';
import { NewsRepository } from '../../src/models/news/news.repository';
import { initialNews } from './news';
import { HashingService } from '../../src/common/services/hashing.service';
import { EventAttendeesRepository } from '../../src/models/events/event-attendees/event-attendees.repository';
import { generateEventAttendees } from './event-attendees';

class MockCompaniesService {
    constructor(private readonly repository: CompaniesRepository) {}

    async findByOwnerId(ownerId: number) {
        return this.repository.findByOwnerId(ownerId);
    }
}

class Seeder {
    constructor(
        private readonly usersService: UsersService,
        private readonly formatsService: EventFormatsService,
        private readonly themesService: EventThemesService,
        private readonly companiesRepository: CompaniesRepository,
        private readonly eventsService: EventsService,
        private readonly ticketsRepository: TicketsRepository,
        private readonly newsRepository: NewsRepository,
        private readonly eventAttendeesRepository: EventAttendeesRepository,
    ) {}

    async start() {
        await this.seedUsers();
        console.log('Users were created 👥');
        await this.seedCompanies();
        console.log('Companies were created 🏢');
        await this.seedFormats();
        console.log('Formats were created 🏖️');
        await this.seedThemes();
        console.log('Themes were created 🌈');
        await this.seedEvents();
        console.log('Events were created 🎪');
        await this.seedEventAttendees();
        console.log('Event attendees were created 🦆');
        await this.seedTickets();
        console.log('Tickets were created 🎫');
        await this.seedNews();
        console.log('News were created 📰');
        console.log('Seeding completed 🍹');
    }

    async seedFormats() {
        for (const format of initialFormats) {
            await this.formatsService.create(format);
        }
    }

    async seedThemes() {
        for (const theme of initialThemes) {
            await this.themesService.create(theme);
        }
    }

    async seedUsers() {
        const users = await createInitialUsers();
        for (const user of users) {
            await this.usersService.createUser(user);
        }
        const admin =
            await this.usersService.findUserByEmail('admin@uevent.com');
        await this.usersService.updateUserRole(admin.id, UserRole.ADMIN);
    }

    async seedCompanies() {
        for (const company of initialCompanies) {
            await this.companiesRepository.create(company);
        }
    }

    async seedEvents() {
        for (const event of initialEvents) {
            await this.eventsService.createWithThemes(event);
        }
    }

    async seedTickets() {
        for (const ticket of initialTickets) {
            await this.ticketsRepository.create(ticket);
        }
    }

    async seedNews() {
        for (const news of initialNews) {
            await this.newsRepository.create(news);
        }
    }

    async seedEventAttendees() {
        const attendees = await generateEventAttendees();
        for (const attendee of attendees) {
            try {
                await this.eventAttendeesRepository.create(attendee);
            } catch (error) {
                throw error;
            }
        }
    }
}

async function start() {
    try {
        console.log('Seeding started 🌱');
        const dbService = new DatabaseService();
        const configService = new ConfigService();
        const hashingService = new HashingService(configService);
        const passwordService = new HashingPasswordsService(hashingService);

        const companiesRepository = new CompaniesRepository(dbService);
        const mockCompaniesService = new MockCompaniesService(
            companiesRepository,
        );
        const eventsRepository = new EventsRepository(dbService);
        const ticketsRepository = new TicketsRepository(dbService);
        const newsRepository = new NewsRepository(dbService);
        const eventAttendeesRepository = new EventAttendeesRepository(dbService);

        const seeder = new Seeder(
            new UsersService(
                new UsersRepository(dbService),
                mockCompaniesService as any,
                passwordService,
            ),
            new EventFormatsService(new EventFormatsRepository(dbService)),
            new EventThemesService(new EventThemesRepository(dbService)),
            companiesRepository,
            new EventsService(eventsRepository),
            ticketsRepository,
            newsRepository,
            eventAttendeesRepository,
        );

        await seeder.start();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

start();
