// prisma/seeds/index.ts
import { FormatsService } from '../../src/models/events/formats/formats.service';
import { initialFormats } from './formats';
import { DatabaseService } from '../../src/db/database.service';
import { FormatsRepository } from '../../src/models/events/formats/formats.repository';
import { ThemesService } from '../../src/models/events/themes/themes.service';  
import { initialThemes } from './themes';
import { EventThemesRepository } from '../../src/models/events/themes/themes.repository';

class Seeder {
  constructor(private readonly formatService: FormatsService, private readonly themeService: ThemesService) {}

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
      console.log(`#Format created: ${res.id}`);
    }
  }

  async seedThemes() {
    for (const theme of initialThemes) {
      const res = await this.themeService.create(theme);
      console.log(`#Theme created: ${res.id}`);
    }
  }
}

function start() {
  try {
    console.log('Seeding started 🌱');
    const seeder = new Seeder(
      new FormatsService(new FormatsRepository(new DatabaseService())), 
      new ThemesService(new EventThemesRepository(new DatabaseService())),
    );
    seeder.start();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

start();
