import { FormatsService } from '../../src/formats/formats.service';
import { initialFormats } from './formats';
import { DatabaseService } from '../../src/db/database.service';
import { FormatsRepository } from '../../src/formats/formats.repository';

export const ADMIN_ID = 1_234_567_890;
class Seeder {
  constructor(private readonly formatService: FormatsService) {}

  async start() {
    await this.seedFormats();
    console.log('Formats were created 🏖️');
    console.log('Seeding completed 🍹');
  }

  async seedFormats() {
    for (const format of initialFormats) {
      const res = await this.formatService.create(format);
      console.log(`#Format created: ${res.id}`);
    }
  }
}

function start() {
  try {
    console.log('Seeding started 🌱');
    const seeder = new Seeder(new FormatsService(new FormatsRepository(new DatabaseService())));
    seeder.start();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

start();