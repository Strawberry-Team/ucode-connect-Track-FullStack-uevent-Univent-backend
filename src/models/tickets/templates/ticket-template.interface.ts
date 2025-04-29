// src/ticket-generation/templates/ticket-template.interface.ts
import { ConfigService } from '@nestjs/config';
import { TicketGenerationData } from '../interfaces/ticket-generation-data.interface';

export interface TicketTemplateInterface {
    getTicketTemplate(
        data: TicketGenerationData,
        qrCodeDataUrl: string,
        configService: ConfigService,
        supportEmail: string
    ): string;
}
