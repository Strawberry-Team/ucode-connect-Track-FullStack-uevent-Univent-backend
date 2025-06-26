// src/ticket-generation/templates/ticket-template.interface.ts
import type { ConfigService } from '@nestjs/config';
import type { TicketGenerationData } from '../interfaces/ticket-generation-data.interface';

export interface TicketTemplateInterface {
    getTicketTemplate(
        data: TicketGenerationData,
        qrCodeDataUrl: string,
        configService: ConfigService,
        supportEmail: string,
    ): string;

    /**
     * Новий метод для рендерингу PDF безпосередньо через PDFKit
     */
    renderTicketToPdf?(
        doc: PDFKit.PDFDocument,
        data: TicketGenerationData,
        qrCodeDataUrl: string,
        configService: ConfigService,
        supportEmail: string,
    ): void;
}
