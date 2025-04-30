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
import { createInitialUsers, getRandomAvatar } from './users';
import { CompaniesRepository } from '../../src/models/companies/companies.repository';
import { HashingPasswordsService } from '../../src/models/users/hashing-passwords.service';
import { ConfigService } from '@nestjs/config';
import { initialCompanies } from './companies';
import { EventsService } from '../../src/models/events/events.service';
import { EventsRepository } from '../../src/models/events/events.repository';
import { getUnsplashImage, initialEvents } from './events';
import { TicketsRepository } from '../../src/models/tickets/tickets.repository';
import { initialTickets } from './tickets';
import { Order, UserRole } from '@prisma/client';
import { NewsRepository } from '../../src/models/news/news.repository';
import { initialNews } from './news';
import { HashingService } from '../../src/common/services/hashing.service';
import { PromoCodesRepository } from 'src/models/promo-codes/promo-codes.repository';
import { initialPromoCodes } from './promo-codes';
import { HashingPromoCodesService } from 'src/models/promo-codes/hashing-promo-codes.service';
import { EventAttendeesRepository } from '../../src/models/events/event-attendees/event-attendees.repository';
import { generateEventAttendees } from './event-attendees';
import { OrdersRepository } from '../../src/models/orders/orders.repository';
import { OrderItemsRepository } from '../../src/models/orders/order-items/order-items.repository';
import { OrdersService } from '../../src/models/orders/orders.service';
import { TicketsService } from '../../src/models/tickets/tickets.service';
import { initialOrders } from './orders';
import { SubscriptionsRepository } from '../../src/models/subscriptions/subscriptions.repository';
import { initialSubscriptions } from './subscriptions';
import {PromoCodesService} from "../../src/models/promo-codes/promo-codes.service";
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationsRepository } from '../../src/models/notifications/notifications.repository';
import { createInitialNotifications } from './notifications';
import {EmailService} from "../../src/email/email.service";
import {GoogleOAuthService} from "../../src/google/google-oauth.service";
import {TicketGenerationService} from "../../src/models/tickets/ticket-generation.service";
import storageConfig from '../../src/config/storage.config';
import appConfig from '../../src/config/app.config';
import { SEEDS } from './seed-constants';
import { Company } from '../../src/models/companies/entities/company.entity';
import { el } from '@faker-js/faker/.';

class MockCompaniesService {
    constructor(private readonly repository: CompaniesRepository) {}

    async findByOwnerId(ownerId: number) {
        return this.repository.findByOwnerId(ownerId);
    }
}

class Seeder {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly usersService: UsersService,
        private readonly formatsService: EventFormatsService,
        private readonly themesService: EventThemesService,
        private readonly companiesRepository: CompaniesRepository,
        private readonly eventsService: EventsService,
        private readonly ticketsRepository: TicketsRepository,
        private readonly newsRepository: NewsRepository,
        private readonly eventAttendeesRepository: EventAttendeesRepository,
        private readonly promoCodesRepository: PromoCodesRepository,
        private readonly promoCodesService: PromoCodesService,
        private readonly hashingPromoCodesService: HashingPromoCodesService,
        private readonly ordersService: OrdersService,
        private readonly subscriptionsRepository: SubscriptionsRepository,
        private readonly notificationsRepository: NotificationsRepository,
    ) {
    }

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
        await this.seedPromoCodes();
        console.log('Promo codes were created 🎟️');
        await this.seedOrders();
        console.log('Orders were created 🛒');
        console.log('Order items were created 📋');
        await this.seedSubscriptions();
        console.log('Subscriptions were created 📢');
        await this.seedNotifications();
        console.log('Notifications were created 🔔');
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

        // const userAvatars: string[] = [];
        // for (let i = 1; i <= SEEDS.USERS.PROFILE_PICTURE_COUNT; i++) {
        //     userAvatars.push(SEEDS.USERS.PROFILE_PICTURE_MASK.replace('*', i.toString()));
        // }

        for (const user of users) {
            const { gender, ...userData } = user;
            const createdUser = await this.usersService.createUser(userData);

            if (SEEDS.PRODUCT.THEME_ID === 2) {
                continue;
            }

            if (SEEDS.USERS.GENERATE_AVATARS) {
                await this.usersService.updateUserAvatar(
                    createdUser.id,
                    // faker.helpers.arrayElement(userAvatars),
                    await getRandomAvatar(createdUser.id, gender)
                );
            } else {
                await this.usersService.updateUserAvatar(
                    createdUser.id,
                    SEEDS.USERS.AVATAR_MASK.replace('*', createdUser.id.toString())
                );
            }
        }

        const admin = await this.usersService.findUserByEmail(`admin@${SEEDS.PRODUCT.DOMAIN}`);
        await this.usersService.updateUserRole(admin.id, UserRole.ADMIN);
    }

    async seedCompanies() {
        for (const company of initialCompanies) {
            const createdCompany = await this.companiesRepository.create(company);

            if (SEEDS.COMPANIES.GENERATE_LOGOS) {
                const logoFileName = await getUnsplashImage('logo', createdCompany.id, [company.title]);
                await this.companiesRepository.update(createdCompany.id, { logoName: logoFileName });
            } else {
                await this.companiesRepository.update(
                    createdCompany.id,
                    { logoName: SEEDS.COMPANIES.LOGO_MASK.replace('*', createdCompany.id.toString()) }
                );
            }
        }
    }

    async seedEvents() {
        for (const event of initialEvents) {
            const createdEvent = await this.eventsService.createWithThemes(event);

            if (SEEDS.EVENTS.GENERATE_POSTERS) {
                const format = await this.formatsService.findById(createdEvent.formatId);
                const query = [format?.title];

                createdEvent?.themes?.forEach((theme) => {
                    query.push(theme.title);
                });

                let posterName: string = await getUnsplashImage('poster', createdEvent.id, query);
                await this.eventsService.updatePoster(createdEvent.id, posterName);
            }
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

    async seedPromoCodes() {
        for (const promoCode of initialPromoCodes) {
            await this.promoCodesRepository.create({
                ...promoCode,
                code: await this.hashingPromoCodesService.hash(promoCode.code),
            });
        }
        console.log(`Promo codes: ${SEEDS.PROMO_CODES.CODES.map((code) => `${code}_EVENT{eventId}`).join(', ')}`);
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


    async seedOrders() {
        await initialOrders(this.databaseService, this.ordersService, this.promoCodesService);
    }

    async seedSubscriptions() {
        for (const subscription of initialSubscriptions) {
            await this.subscriptionsRepository.create(
                subscription.userId,
                subscription.entityId,
                subscription.entityType
            );
        }

    }

    async seedNotifications() {
        const notifications = await createInitialNotifications();
        for (const notification of notifications) {
            await this.notificationsRepository.create(notification);
        }
    }
}

async function start() {
    try {
        console.log('Seeding started 🌱');
        const dbService = new DatabaseService();
        const configService = new ConfigService(
            {
                ...storageConfig(),
                ...appConfig(),
            }
        );
        const hashingService = new HashingService(configService);
        const passwordService = new HashingPasswordsService(hashingService);
        const hashingPromoCodesService = new HashingPromoCodesService(
            hashingService,
        );

        const companiesRepository = new CompaniesRepository(dbService);
        const mockCompaniesService = new MockCompaniesService(
            companiesRepository,
        );
        const eventsRepository = new EventsRepository(dbService);
        const ticketsRepository = new TicketsRepository(dbService);
        const newsRepository = new NewsRepository(dbService);
        const promoCodesRepository = new PromoCodesRepository(dbService);
        const eventsService = new EventsService(eventsRepository, new EventEmitter2(), companiesRepository);
        const promoCodesService = new PromoCodesService(promoCodesRepository, hashingPromoCodesService, eventsService);
        const ordersRepository = new OrdersRepository(dbService);
        const orderItemsRepository = new OrderItemsRepository(dbService);
        const eventAttendeesRepository = new EventAttendeesRepository(
            dbService,
        );
        const subscriptionsRepository = new SubscriptionsRepository(dbService);
        const notificationsRepository = new NotificationsRepository(dbService);
        const userService = new UsersService(
            new UsersRepository(dbService),
            mockCompaniesService as any,
            passwordService,
            new OrdersRepository(dbService),);
        const googleOAuthService = new GoogleOAuthService(configService);
        const emailService = new EmailService(configService, googleOAuthService);
        const ticketGenerationService = new TicketGenerationService(configService)

        const seeder = new Seeder(
            dbService,
            userService,
            new EventFormatsService(new EventFormatsRepository(dbService)),
            new EventThemesService(new EventThemesRepository(dbService)),
            companiesRepository,
            eventsService,
            ticketsRepository,
            newsRepository,
            eventAttendeesRepository,
            promoCodesRepository,
            promoCodesService,
            hashingPromoCodesService,
            new OrdersService(
                ordersRepository,
                orderItemsRepository,
                new TicketsService(
                    new TicketsRepository(dbService),
                    new EventsRepository(dbService),
                    orderItemsRepository
                ),
                promoCodesService,
                dbService,
                configService,
                ticketsRepository,
                ticketGenerationService,
                userService,
                emailService,
                new EventEmitter2(),
            ),
            subscriptionsRepository,
            notificationsRepository,
        );
        await seeder.start();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

start();
