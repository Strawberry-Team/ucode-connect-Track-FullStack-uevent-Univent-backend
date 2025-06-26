// src/ticket-generation/ticket-generation.service.ts
import {
    Injectable,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as QRCode from 'qrcode';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { TicketGenerationData } from './interfaces/ticket-generation-data.interface';
import { TicketTemplateInterface } from './templates/ticket-template.interface';
import * as PDFDocument from 'pdfkit';
import { JSDOM } from 'jsdom';

const themeModules = {
    1: () => import('./templates/1-ticket-templates'),
    2: () => import('./templates/2-ticket-templates'),
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
        const themeId = Number(this.configService.get<string>('app.theme.id'));

        try {
            if (!themeModules[themeId]) {
                this.logger.warn(`Template for theme ID ${themeId} not found, using default theme 1`);
                this.templates = (await themeModules[1]()).default;
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

            // Зберігаємо контекст для використання в PDF генерації
            this.currentGenerationData = data;

            const htmlContent = this.templates.getTicketTemplate(
                data,
                qrCodeDataUrl,
                this.configService,
                this.supportEmail
            );

            // Генерація PDF за допомогою PDFKit
            const pdfBuffer = await this.generatePdfFromHtml(htmlContent, qrCodeDataUrl);

            await fs.writeFile(fullPath, pdfBuffer);

            // Очищуємо контекст після використання
            this.currentGenerationData = null;

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

    private async generatePdfFromHtml(htmlContent: string, qrCodeDataUrl: string): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            try {
                // Створюємо PDF документ
                const doc = new PDFDocument({
                    size: 'A4',
                    margin: 50,
                });

                const chunks: Buffer[] = [];

                doc.on('data', (chunk) => {
                    chunks.push(chunk);
                });

                doc.on('end', () => {
                    const pdfBuffer = Buffer.concat(chunks);
                    resolve(pdfBuffer);
                });

                doc.on('error', (error) => {
                    reject(error);
                });

                // Перевіряємо чи є спеціальний метод для PDF рендерингу
                if (this.templates.renderTicketToPdf) {
                    // Витягуємо дані з існуючого контексту
                    const data = this.extractDataFromCurrentContext();
                    this.templates.renderTicketToPdf(
                        doc, 
                        data, 
                        qrCodeDataUrl, 
                        this.configService, 
                        this.supportEmail
                    );
                } else {
                    // Використовуємо загальний HTML парсинг
                    this.renderTicketToPdf(doc, htmlContent, qrCodeDataUrl);
                }

                doc.end();
            } catch (error) {
                this.logger.error('Error generating PDF from HTML:', error);
                reject(error);
            }
        });
    }

    private currentGenerationData: TicketGenerationData | null = null;

    private extractDataFromCurrentContext(): TicketGenerationData {
        if (this.currentGenerationData) {
            return this.currentGenerationData;
        }
        
        // Fallback дані якщо контекст недоступний
        return {
            orderItem: {
                id: 0,
                ticketId: 0,
                orderId: 0,
                finalPrice: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
                ticket: {
                    id: 0,
                    title: 'Event Ticket',
                    price: 0,
                    number: 'N/A',
                    event: {
                        id: 0,
                        title: 'Event',
                        startedAt: new Date(),
                        endedAt: new Date(),
                        venue: 'TBD',
                    },
                },
                user: {
                    firstName: 'Guest',
                    lastName: '',
                    email: 'guest@example.com',
                },
            },
        };
    }

    private renderTicketToPdf(doc: PDFKit.PDFDocument, htmlContent: string, qrCodeDataUrl: string) {
        try {
            const dom = new JSDOM(htmlContent);
            const document = dom.window.document;

            // Встановлюємо шрифт
            doc.font('Helvetica');

            // Заголовок події
            const eventTitle = document.querySelector('.event-title')?.textContent || 'Event Title';
            doc.fontSize(24)
               .fillColor('#000000')
               .text(eventTitle, 50, 100, { align: 'center', width: 500 });

            // Дата події
            const eventDate = document.querySelector('.event-date')?.textContent || 'Event Date';
            doc.fontSize(14)
               .fillColor('#666666')
               .text(eventDate, 50, 140, { align: 'center', width: 500 });

            // Лінія-роздільник
            doc.strokeColor('#000000')
               .lineWidth(2)
               .moveTo(50, 180)
               .lineTo(550, 180)
               .stroke();

            // Інформаційні картки
            let yPosition = 220;
            const infoCards = document.querySelectorAll('.info-card');
            let cardIndex = 0;

            infoCards.forEach((card, index) => {
                const title = card.querySelector('h3')?.textContent || '';
                const content = card.querySelector('p')?.textContent || '';
                
                const xPosition = (index % 2 === 0) ? 50 : 300;
                if (index % 2 === 0 && index > 0) {
                    yPosition += 80;
                }

                // Заголовок картки
                doc.fontSize(10)
                   .fillColor('#666666')
                   .text(title.toUpperCase(), xPosition, yPosition);

                // Вміст картки
                doc.fontSize(12)
                   .fillColor('#000000')
                   .text(content, xPosition, yPosition + 15, { width: 200 });

                cardIndex++;
            });

            // QR код
            if (qrCodeDataUrl) {
                try {
                    const base64Data = qrCodeDataUrl.split(',')[1];
                    const qrBuffer = Buffer.from(base64Data, 'base64');
                    
                    doc.image(qrBuffer, 225, yPosition + 100, {
                        width: 150,
                        height: 150
                    });

                    // Текст під QR кодом
                    doc.fontSize(12)
                       .fillColor('#000000')
                       .text('Scan for Entry', 225, yPosition + 270, { align: 'center', width: 150 });

                    // Номер квитка
                    const ticketNumber = document.querySelector('.ticket-number')?.textContent || 'N/A';
                    doc.fontSize(10)
                       .fillColor('#666666')
                       .text(ticketNumber, 225, yPosition + 290, { align: 'center', width: 150 });

                } catch (qrError) {
                    this.logger.warn('Could not render QR code:', qrError.message);
                    doc.fontSize(12)
                       .fillColor('#000000')
                       .text('QR Code unavailable', 225, yPosition + 100, { align: 'center', width: 150 });
                }
            }

            // Футер
            doc.fontSize(8)
               .fillColor('#999999')
               .text(`© ${new Date().getFullYear()} UEvent`, 50, 750, { align: 'left' })
               .text('Contact: support@uevent.com', 400, 750, { align: 'right' });

        } catch (error) {
            this.logger.error('Error rendering ticket to PDF:', error);
            // Fallback - простий текстовий квиток
            doc.fontSize(16)
               .fillColor('#000000')
               .text('Event Ticket', 50, 100, { align: 'center', width: 500 })
               .fontSize(12)
               .text('This is your event ticket. Please present at the venue.', 50, 150, { align: 'center', width: 500 });
        }
    }
}
