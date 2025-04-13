// prisma/seeds/index.ts
import { EventFormatsService } from '../../src/models/events/formats/event-formats.service';
import { initialFormats } from './formats';
import { DatabaseService } from '../../src/db/database.service';
import { EventFormatsRepository } from '../../src/models/events/formats/event-formats.repository';
import { EventThemesService } from '../../src/models/events/themes/event-themes.service';  
import { initialThemes } from './themes';
import { EventThemesRepository } from '../../src/models/events/themes/event-themes.repository';

class Seeder {
  constructor(private readonly formatService: EventFormatsService, private readonly themeService: EventThemesService) {}

  async start() {
    await this.seedFormats();
    console.log('Formats were created 🏖️');
    await this.seedThemes();
    console.log('Themes were created 🌈');
    console.log('Seeding completed 🍹');
  }

  async seedFormats() {
    for (const format of initialFormats) {
      const res = await this.formatService.create(format);
      // console.log(`#Format created: ${res.id}`);
    }
  }

  async seedThemes() {
    for (const theme of initialThemes) {
      const res = await this.themeService.create(theme);
      // console.log(`#Theme created: ${res.id}`);
    }
  }
}

function start() {
  try {
    console.log('Seeding started 🌱');
    const seeder = new Seeder(
      new EventFormatsService(new EventFormatsRepository(new DatabaseService())), 
      new EventThemesService(new EventThemesRepository(new DatabaseService())),
    );
    seeder.start();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

start();
