#!/usr/bin/env ts-node

/**
 * npx ts-node scripts/test-pdf.ts
 */

import 'dotenv/config';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { TicketGenerationService } from '../src/models/tickets/ticket-generation.service';
import { TicketGenerationData } from '../src/models/tickets/interfaces/ticket-generation-data.interface';
import storageConfig from '../src/config/storage.config';
import appConfig from '../src/config/app.config';

async function main(): Promise<void> {
  // Ініціалізуємо конфігурацію з .env
  const configService = new ConfigService({
    ...storageConfig(),
    ...appConfig(),
  });

  // Створюємо сервіс і чекаємо завантаження шаблонів
  const service = new TicketGenerationService(configService);
  await (service as any).loadTemplates();

  // Приклад даних для генерації
  const data: TicketGenerationData = {
    orderItem: {
      id: 123,
      ticketId: 456,
      orderId: 789,
      finalPrice: 150,
      createdAt: new Date(),
      updatedAt: new Date(),
      ticket: {
        id: 456,
        title: 'VIP',
        price: 100,
        number: 'TICKET-001',
        event: {
          id: 1,
          title: 'AI Summit 2025',
          startedAt: new Date('2025-05-01T10:00:00Z'),
          endedAt: new Date('2025-05-02T18:00:00Z'),
          venue: 'NTU "KhPI", Kharkiv, Ukraine',
        },
      },
      user: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test.user@example.com',
      },
    },
  };

  try {
    const { ticketFileKey, filePath } = await service.generateTicket(data);
    console.log(`✅ PDF generated: ${filePath} (key: ${ticketFileKey})`);
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    process.exit(1);
  }
}

main();