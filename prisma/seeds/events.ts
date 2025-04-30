// prisma/seeds/events.ts
import { faker } from '@faker-js/faker';
import { AttendeeVisibility, EventStatus } from '@prisma/client';
import { SEEDS } from './seed-constants';
import { createApi } from 'unsplash-js';
import * as fs from 'fs/promises';
import * as path from 'path';
import axios from 'axios';

function generateEventThemes(): number[] {
    const themesCount = faker.number.int({
        min: SEEDS.EVENTS.MIN_THEMES_PER_EVENT,
        max: SEEDS.EVENTS.MAX_THEMES_PER_EVENT,
    });

    const themes = new Set<number>();

    while (themes.size < themesCount) {
        themes.add(faker.number.int({ min: 1, max: SEEDS.THEMES.TOTAL }));
    }

    return Array.from(themes);
}

const EVENT_LOCATIONS = [
    { "venue": "Czech Republic, Prague, Great Strahov Stadium", "locationCoordanates": "50.08067136411646, 14.387714822465966" },
    { "venue": "USA, Arlington, Texas, AT&T Stadium", "locationCoordanates": "32.7481860412608, -97.09335212125144" },
    { "venue": "USA, Columbus, Ohio, Ohio Stadium", "locationCoordanates": "40.00259318017875, -83.01972610670998" },
    { "venue": "China, Beijing, Beijing National Stadium", "locationCoordanates": "39.993148533126906, 116.39653266547414" },
    { "venue": "United Kingdom, London, Wembley Stadium", "locationCoordanates": "39.993132094117804, 116.39652193593167" },
    { "venue": "Malaysia, Kuala Lumpur, Bukit Jalil National Stadium", "locationCoordanates": "3.0546681252037997, 101.69120987061413" },
    { "venue": "Brazil, Rio de Janeiro, Maracanã Stadium", "locationCoordanates": "-22.911963310865435, -43.23016047502067" },
    { "venue": "Japan, Yokohama, Nissan Stadium", "locationCoordanates": "35.51016424081756, 139.60639371245557" },
    { "venue": "South Korea, Seoul, Seoul Olympic Stadium", "locationCoordanates": "37.51597370325708, 127.0728093334846" },
    { "venue": "Sweden, Stockholm, Friends Arena", "locationCoordanates": "59.372817891256325, 18.00056878500388" },
    { "venue": "Philippines, Bulacan, Philippine Arena", "locationCoordanates": "14.793837283476027, 120.9536030873629" },
    { "venue": "France, Paris, Paris La Défense Arena", "locationCoordanates": "48.89580681340125, 2.22958309160571" },
    { "venue": "Romania, Bucharest, Romexpo", "locationCoordanates": "44.4763507624787, 26.065100036244786" },
    { "venue": "South Africa, Johannesburg, Johannesburg Stadium", "locationCoordanates": "-26.193596504734703, 28.06252829477771" },
    { "venue": "Japan, Saitama, Saitama Super Arena", "locationCoordanates": "35.89528953591147, 139.63080700899593" },
    { "venue": "USA, George, Washington, Gorge Amphitheatre", "locationCoordanates": "47.10117610142295, -119.99553266708186" },
    { "venue": "Azerbaijan, Baku, Baku Crystal Hall", "locationCoordanates": "40.34439277212521, 49.85016549441909" },
    { "venue": "Brazil, Belo Horizonte, Mineirão", "locationCoordanates": "-19.865668991562373, -43.971123984471255" },
    { "venue": "Australia, Sydney, Qudos Bank Arena", "locationCoordanates": "-33.84408608422891, 151.06214290882892" },
    { "venue": "United Kingdom, Manchester, Manchester Arena", "locationCoordanates": "53.488251949224754, -2.2436299040688645" },
    { "venue": "Germany, Hamburg, Elbphilharmonie", "locationCoordanates": "53.54148448136086, 9.984438945059951" },
    { "venue": "Netherlands, Amsterdam, Concertgebouw", "locationCoordanates": "52.35648875956155, 4.8790403383746" },
    { "venue": "USA, Los Angeles, Walt Disney Concert Hall", "locationCoordanates": "34.05545766156378, -118.24986647969381" },
    { "venue": "Japan, Tokyo, Tokyo Opera City Concert Hall", "locationCoordanates": "35.683434736950254, 139.6864844844867" },
    { "venue": "Australia, Sydney, Sydney Opera House", "locationCoordanates": "-33.85660615382849, 151.2153396099343" },
    { "venue": "Iceland, Reykjavík, Harpa Hall", "locationCoordanates": "64.1503305566293, -21.93225893446932" },
    { "venue": "Spain, Barcelona, Palau de la Música Catalana", "locationCoordanates": "41.387728080304015, 2.1753235348523634" },
    { "venue": "Austria, Vienna, Musikverein", "locationCoordanates": "48.200647483021555, 16.37238560972004" },
    { "venue": "Argentina, Buenos Aires, Teatro Colón", "locationCoordanates": "-34.59987814513694, -58.383572210469985" },
    { "venue": "Germany, Berlin, Konzerthaus Berlin", "locationCoordanates": "52.513741784243834, 13.391746590113321" },
    { "venue": "Switzerland, Lucerne, Lucerne Culture and Congress Centre", "locationCoordanates": "47.05061923273034, 8.311711366665618" },
    { "venue": "Taiwan, Kaohsiung, National Kaohsiung Center for the Arts", "locationCoordanates": "47.05061192667971, 8.311528975135758" },
    { "venue": "France, Paris, Théâtre des Champs-Elysées", "locationCoordanates": "48.86590343049284, 2.303251084665942" },
    { "venue": "China, Beijing, National Centre for the Performing Arts", "locationCoordanates": "39.90490335520842, 116.3897862073921" },
    { "venue": "Brazil, São Paulo, Sala São Paulo", "locationCoordanates": "-23.53399729303028, -46.639811319583046" },
    { "venue": "Germany, Hanover, Hanover Exhibition and Trade Center", "locationCoordanates": "52.321532058872755, 9.8005598051387" },
    { "venue": "China, Shanghai, National Convention & Exhibition Center", "locationCoordanates": "31.197844411913483, 121.30634166785022" },
    { "venue": "Germany, Frankfurt, Messe Frankfurt", "locationCoordanates": "50.11213602422499, 8.646697194211534" },
    { "venue": "Ukraine, Kyiv, Expocenter of Ukraine", "locationCoordanates": "50.378628624788654, 30.478847663241382" },
    { "venue": "Italy, Milan, Allianz Cloud", "locationCoordanates": "45.48882023624865, 9.14248315441301" },
    { "venue": "Ukraine, Kyiv, Palace Ukraine", "locationCoordanates": "50.42242032775724, 30.520940263098467" },
    { "venue": "China, Kunming, Kunming International Convention and Exhibition Center", "locationCoordanates": "25.015051990862922, 102.72905538284071" },
    { "venue": "Germany, Cologne, Cologne Fair", "locationCoordanates": "50.94673993587363, 6.980426164682823" },
    { "venue": "Germany, Dusseldorf, Dusseldorf Messe", "locationCoordanates": "51.25905933936641, 6.743027023402936" },
    { "venue": "France, Paris, Paris Nord Villepinte Exhibition Center", "locationCoordanates": "48.97108575728152, 2.5207159779327704" },
    { "venue": "USA, Chicago, McCormick Place Convention Center", "locationCoordanates": "41.85284772680297, -87.61582536566254" },
    { "venue": "Ukraine, Kharkiv, Yermilov Centre", "locationCoordanates": "50.00502915331691, 36.226601529517545" },
    { "venue": "Ukraine, Lviv, Lviv Municipal Art Center", "locationCoordanates": "49.8390091178562, 24.026338483877563" },
    { "venue": "France, Paris, Paris Expo Porte de Versailles", "locationCoordanates": "48.830173034549574, 2.29046143516692" },
    { "venue": "Germany, Munich, Messe München", "locationCoordanates": "48.135485986411226, 11.692576362273245" }
];

function generateEventLocation(): { venue: string, locationCoordanates: string } {
    return faker.helpers.arrayElement(EVENT_LOCATIONS);
}

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY || '',
});

export async function getUnsplashImage(
    type: 'poster' | 'logo',
    id: number,
    query: string[],
    queryPosfix: string = type === 'poster' ? SEEDS.EVENTS.POSTER_QUERY_POSTFIX : SEEDS.COMPANIES.LOGO_QUERY_POSTFIX,
    width: number = type === 'poster' ? SEEDS.EVENTS.POSTER_WIDTH : SEEDS.COMPANIES.LOGO_WIDTH,
    height: number = type === 'poster' ? SEEDS.EVENTS.POSTER_HEIGHT : SEEDS.COMPANIES.LOGO_HEIGHT,
    orientation: 'landscape' | 'portrait' | 'squarish' = type === 'poster' ? SEEDS.EVENTS.POSTER_ORIENTATION : SEEDS.COMPANIES.LOGO_ORIENTATION
): Promise<string> {
    const publicDir = path.join(process.cwd(), 'public', 'uploads', type === 'poster' ? 'event-posters' : 'company-logos');
    const fileName = type === 'poster' ? SEEDS.EVENTS.POSTER_MASK.replace('*', `${id}`) : SEEDS.COMPANIES.LOGO_MASK.replace('*', `${id}`);
    const filePath = path.join(publicDir, fileName);

    try {
        query.push(queryPosfix);
        const queryString = query.join(' ');

        const result = await unsplash.photos.getRandom({
            query: queryString,
            count: 1,
            orientation,
        });

        if (result.errors || !result.response) {
            throw new Error(result.errors?.join(', ') || 'Image not found');
        }

        const photo = Array.isArray(result.response) ? result.response[0] : result.response;
        const imageUrl = `${photo.urls.regular}&w=${width}&h=${height}&fit=crop&auto=format`;
        const imageResponse = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            timeout: 5000,
        });
        const buffer = Buffer.from(imageResponse.data);
        await fs.mkdir(publicDir, { recursive: true });
        await fs.writeFile(filePath, buffer);
        await unsplash.photos.trackDownload({ downloadLocation: photo.links.download_location });
        return fileName;
    } catch (error) {
        console.error('Error fetching or saving Unsplash image:', error);
        return SEEDS.EVENTS.DEFAULT_POSTER;
    }
}

export const initialEvents = Array.from(
    { length: SEEDS.EVENTS.TOTAL },
    (_, index) => {
        const startDate = faker.date.soon({
            days: faker.number.int({
                min: SEEDS.EVENTS.START_DATE.MIN_DAYS,
                max: SEEDS.EVENTS.START_DATE.MAX_DAYS,
            }),
            refDate: new Date(),
        });
        startDate.setHours(
            faker.number.int({
                min: SEEDS.EVENTS.START_TIME.MIN_HOUR,
                max: SEEDS.EVENTS.START_TIME.MAX_HOUR,
            }), 0, 0, 0,
        );

        const endDate = new Date(startDate);
        endDate.setHours(
            endDate.getHours() +
                faker.number.int({
                    min: SEEDS.EVENTS.DURATION.MIN_HOURS,
                    max: SEEDS.EVENTS.DURATION.MAX_HOURS,
                }),
        );

        const companyId = faker.number.int({
            min: 1,
            max: SEEDS.COMPANIES.TOTAL,
        });
        const formatId = faker.number.int({
            min: 1,
            max: SEEDS.FORMATS.TOTAL,
        });
        const status = faker.helpers.weightedArrayElement([
            { value: EventStatus.DRAFT, weight: SEEDS.EVENTS.STATUS_WEIGHTS.DRAFT },
            { value: EventStatus.PUBLISHED, weight: SEEDS.EVENTS.STATUS_WEIGHTS.PUBLISHED },
            { value: EventStatus.SALES_STARTED, weight: SEEDS.EVENTS.STATUS_WEIGHTS.SALES_STARTED },
            { value: EventStatus.ONGOING, weight: SEEDS.EVENTS.STATUS_WEIGHTS.ONGOING },
            { value: EventStatus.FINISHED, weight: SEEDS.EVENTS.STATUS_WEIGHTS.FINISHED },
            { value: EventStatus.CANCELLED, weight: SEEDS.EVENTS.STATUS_WEIGHTS.CANCELLED },
        ]);
        const attendeeVisibility = faker.helpers.weightedArrayElement([
            { value: AttendeeVisibility.EVERYONE, weight: SEEDS.EVENTS.ATTENDEE_VISIBILITY_WEIGHTS.EVERYONE },
            { value: AttendeeVisibility.ATTENDEES_ONLY, weight: SEEDS.EVENTS.ATTENDEE_VISIBILITY_WEIGHTS.ATTENDEES_ONLY },
            { value: AttendeeVisibility.NOBODY, weight: SEEDS.EVENTS.ATTENDEE_VISIBILITY_WEIGHTS.NOBODY },
        ]);
        const eventLocation = generateEventLocation();

        return {
            companyId,
            formatId,
            title: faker.company.catchPhraseAdjective(),
            description:
                Array.from({ length: SEEDS.EVENTS.DESCRIPTION_PHRASES }, () =>
                    faker.company.catchPhrase(),
                ).join('. ') + '.',
            venue: eventLocation.venue,
            locationCoordinates: eventLocation.locationCoordanates,
            startedAt: startDate,
            endedAt: endDate,
            publishedAt: new Date(),
            ticketsAvailableFrom: faker.date.recent({
                days: faker.number.int({
                    min: SEEDS.EVENTS.TICKETS_AVAILABLE.MIN_DAYS_BEFORE,
                    max: SEEDS.EVENTS.TICKETS_AVAILABLE.MAX_DAYS_BEFORE,
                }),
                refDate: startDate,
            }),
            posterName: SEEDS.EVENTS.DEFAULT_POSTER,
            attendeeVisibility,
            status,
            themes: generateEventThemes(),
        };
    },
);
