// src/ticket-generation/ticket-generation.service.ts
import {
    Injectable,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as puppeteer from 'puppeteer';
import * as QRCode from 'qrcode';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { TicketGenerationData } from './interfaces/ticket-generation-data.interface';
import { TicketTemplateInterface } from './templates/ticket-template.interface';

const themeModules = {
    '1': () => import('./templates/1-ticket-templates'),
    '2': () => import('./templates/2-ticket-templates'),
};

@Injectable()
export class TicketGenerationService {
    private readonly logger = new Logger(TicketGenerationService.name);
    private readonly storagePath: string;
    private readonly frontendUrl: string;
    private readonly supportEmail: string;
    private templates: TicketTemplateInterface;

    constructor(private readonly configService: ConfigService) {
        this.storagePath = String(
            this.configService.get<string>('storage.paths.tickets'),
        );

        this.frontendUrl = String(
            configService.get<string>('app.frontendLink'),
        ).endsWith('/')
            ? String(configService.get<string>('app.frontendLink')).slice(0, -1)
            : String(configService.get<string>('app.frontendLink'));

        this.supportEmail = String(this.configService.get<string>('app.supportEmail'));

        this.loadTemplates();
    }

    private async loadTemplates() {
        const themeId = this.configService.get<string>('app.theme.id') || '1';

        try {
            if (!themeModules[themeId]) {
                this.logger.warn(`Template for theme ID ${themeId} not found, using default theme 1`);
                this.templates = (await themeModules['1']()).default;
            } else {
                const module = await themeModules[themeId]();
                this.templates = module.default || module;
            }
        } catch (error) {
            this.logger.error(`Error loading ticket templates for theme ${themeId}:`, error.stack);
            const defaultModule = await import('./templates/1-ticket-templates');
            this.templates = defaultModule.default || defaultModule;
        }
    }

    async generateTicket(
        data: TicketGenerationData,
    ): Promise<{ ticketFileKey: string; filePath: string }> {
        const { orderItem } = data;
        const event = orderItem.ticket.event;
        const orderId = orderItem.orderId;
        const ticket = orderItem.ticket;

        const ticketFileKey = uuidv4();
        const fileName = `item_${orderItem.id}_${ticketFileKey}.pdf`;
        const eventDir = `event_${event.id}`;
        const orderDir = `order_${orderId}`;
        const relativePath = path.join(eventDir, orderDir, fileName);
        const fullPath = path.join(this.storagePath, relativePath);
        const directoryPath = path.dirname(fullPath);

        this.logger.log(
            `Generating ticket for OrderItem ID: ${orderItem.id}, File Key: ${ticketFileKey}`,
        );

        try {
            await fs.mkdir(directoryPath, { recursive: true });

            const verificationUrl = `${this.frontendUrl}/tickets/verify?ticketNumber=${ticket.number}`;
            const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
                errorCorrectionLevel: 'H',
            });

            const htmlContent = this.templates.getTicketTemplate(
                data,
                qrCodeDataUrl,
                this.configService,
                this.supportEmail
            );

            const browser = await puppeteer.launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                headless: true,
            });
            const page = await browser.newPage();
            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '20mm',
                    right: '20mm',
                    bottom: '20mm',
                    left: '20mm',
                },
            });
            await browser.close();
            this.logger.debug(`PDF buffer generated successfully.`);

            await fs.writeFile(fullPath, pdfBuffer);

            return { ticketFileKey, filePath: fullPath };
        } catch (error) {
            this.logger.error(
                `Failed to generate ticket for OrderItem ID: ${orderItem.id}`,
                error.stack,
            );
            throw new InternalServerErrorException(
                `Failed to generate ticket PDF: ${error.message}`,
            );
        }
    }
}
