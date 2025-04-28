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

@Injectable()
export class TicketGenerationService {
    private readonly logger = new Logger(TicketGenerationService.name);
    private readonly storagePath: string;
    private readonly frontendUrl: string;
    private readonly supportEmail: string;

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
    }

    async generateTicket(
        data: TicketGenerationData,
    ): Promise<{ ticketFileKey: string; filePath: string }> {
        const { orderItem } = data;
        const event = orderItem.ticket.event;
        const order = orderItem.order;
        const ticket = orderItem.ticket;
        const user = order.user;

        const ticketFileKey = uuidv4();
        const fileName = `item_${orderItem.id}_${ticketFileKey}.pdf`;
        const eventDir = `event_${event.id}`;
        const orderDir = `order_${order.id}`;
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

            const htmlContent = this.generateTicketHtml(
                data,
                qrCodeDataUrl,
            );

            const browser = await puppeteer.launch({
                // Options for Docker/Linux
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                headless: true,
            });
            const page = await browser.newPage();
            await page.setContent(htmlContent, { waitUntil: 'networkidle0' }); // Ждем загрузки ресурсов (если есть картинки/стили)
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

    private generateTicketHtml(
        data: TicketGenerationData,
        qrCodeDataUrl: string,
    ): string {
        const { orderItem } = data;
        const event = orderItem.ticket.event;
        const ticket = orderItem.ticket;
        const order = orderItem.order;
        const user = order.user;

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Ticket for ${event.title}</title>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

                /* Variable values for reference:
                   --primary-green: #2e7d32;
                   --light-green: #81c784;
                   --ultra-light-green: #e8f5e9;
                   --accent-green: #00c853;
                   --dark-text: #212121;
                   --light-text: #757575;
                */

                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                  font-family: 'Poppins', sans-serif;
                }

                body {
                  background-color: white;
                  color: #212121; /* --dark-text */
                  line-height: 1.6;
                }

                .ticket-container {
                  width: 100%;
                  max-width: 800px;
                  margin: 0 auto;
                  background-color: white;
                  border-radius: 12px;
                  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
                  overflow: hidden;
                  position: relative;
                }

                .ticket-header {
                  background: linear-gradient(135deg, #2e7d32, #81c784); /*  --primary-green, --light-green */
                  color: white;
                  padding: 25px 30px;
                  position: relative;
                  overflow: hidden;
                }

                .ticket-header::after {
                  content: "";
                  position: absolute;
                  top: 0;
                  right: 0;
                  bottom: 0;
                  left: 0;
                  background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E") repeat;
                  opacity: 0.3;
                }

                .header-content {
                  position: relative;
                  z-index: 1;
                }

                .app-name {
                  font-size: 14px;
                  text-transform: uppercase;
                  letter-spacing: 2px;
                  margin-bottom: 5px;
                  opacity: 0.9;
                  font-weight: 300;
                }

                .event-title {
                  font-size: 28px;
                  font-weight: 700;
                  margin-bottom: 10px;
                  line-height: 1.3;
                }

                .ticket-body {
                  padding: 30px;
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 30px;
                  border-bottom: 1px dashed #81c784; /*  --light-green */
                  position: relative;
                }

                .ticket-body::before {
                  content: "";
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  height: 5px;
                  background: linear-gradient(90deg,
                    transparent, transparent 10px,
                    #e8f5e9 10px, #e8f5e9 20px); /*  --ultra-light-green */
                  background-size: 20px 100%;
                }

                .ticket-info {
                  padding-right: 30px;
                }

                .info-group {
                  margin-bottom: 24px;
                }

                .info-group h3 {
                  font-size: 12px;
                  color: #757575; /*  --light-text */
                  text-transform: uppercase;
                  letter-spacing: 1px;
                  margin-bottom: 5px;
                  font-weight: 600;
                }

                .info-group p {
                  font-size: 16px;
                  font-weight: 500;
                  color: #212121; /*  --dark-text */
                }

                .datetime-group {
                  display: flex;
                  align-items: center;
                  margin-bottom: 8px;
                }

                .datetime-group i {
                  color: #2e7d32; /*  --primary-green */
                  margin-right: 10px;
                  font-size: 18px;
                }

                .qr-section {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  padding: 20px;
                  background-color: #e8f5e9; /*  --ultra-light-green */
                  border-radius: 8px;
                  text-align: center;
                }

                .qr-code {
                  width: 180px;
                  height: 180px;
                  margin: 15px 0;
                  border: 8px solid white;
                  border-radius: 8px;
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.07);
                }

                .qr-title {
                  font-size: 14px;
                  font-weight: 600;
                  color: #2e7d32; /*  --primary-green */
                  margin-bottom: 8px;
                }

                .qr-subtitle {
                  font-size: 12px;
                  color: #757575; /*  --light-text */
                  margin-top: 10px;
                }

                .ticket-number {
                  font-family: monospace;
                  font-size: 15px;
                  background-color: #e8f5e9; /*  --ultra-light-green */
                  padding: 4px 8px;
                  border-radius: 4px;
                  margin-top: 5px;
                  font-weight: 600;
                  color: #2e7d32; /*  --primary-green */
                  letter-spacing: 1px;
                }

                .ticket-footer {
                  display: flex;
                  justify-content: space-between;
                  padding: 20px 30px;
                  font-size: 12px;
                  color: #757575; /*  --light-text */
                  background: #e8f5e9; /*  --ultra-light-green */
                }

                .ticket-divider {
                  position: relative;
                  height: 20px;
                  margin: 0 30px;
                }

                .ticket-divider::before, .ticket-divider::after {
                  content: "";
                  position: absolute;
                  width: 20px;
                  height: 20px;
                  background-color: white;
                  border-radius: 50%;
                  top: 0;
                  transform: translateY(-50%);
                }

                .ticket-divider::before {
                  left: -10px;
                }

                .ticket-divider::after {
                  right: -10px;
                }

                .event-date {
                  color: white;
                  background-color: #00c853; /*  --accent-green */
                  padding: 6px 12px;
                  border-radius: 20px;
                  font-size: 14px;
                  font-weight: 500;
                  margin-top: 10px;
                  display: inline-block;
                }

                .price-tag {
                  font-size: 18px;
                  font-weight: 700;
                  color: #2e7d32; /*  --primary-green */
                  margin-top: 5px;
                }

                .venue {
                  margin-top: 5px;
                  font-style: italic;
                }

                @media print {
                  body {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                }
              </style>
            </head>
            <body>
              <div class="ticket-container">
                <div class="ticket-header">
                  <div class="header-content">
                    <div class="app-name">${this.configService.get<string>('app.name')}</div>
                    <div class="event-title">${event.title}</div>
                    <div class="event-date">
                      ${new Date(event.startedAt).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    })}
                    </div>
                  </div>
                </div>

                <div class="ticket-body">
                  <!-- Left Column - Event Information -->
                  <div class="ticket-info">
                    <div class="info-group">
                      <h3>Attendee</h3>
                      <p>${user.firstName} ${user.lastName || ''}</p>
                      <p style="font-size: 14px; color: #757575;">${user.email}</p> <!--  --light-text -->
                    </div>

                    <div class="info-group">
                      <h3>Event Details</h3>
                      <div class="datetime-group">
                        <i>🗓️</i>
                        <div>
                          <p>${new Date(event.startedAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                    })}</p>
                          <p style="font-size: 14px; color: #757575;"> <!--  --light-text -->
                            ${new Date(event.startedAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    })} -
                            ${new Date(event.endedAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    })}
                          </p>
                        </div>
                      </div>

                      <div class="datetime-group">
                        <i>📍</i>
                        <div>
                          <p>${event.venue}</p>
                        </div>
                      </div>
                    </div>

                    <div class="info-group">
                      <h3>Ticket Type</h3>
                      <p>${ticket.title}</p>
                      <div class="price-tag">
                        $${Number(orderItem.finalPrice).toFixed(2)}
                      </div>
                    </div>

                  <div class="qr-section">
                    <div class="qr-title">SCAN FOR ENTRY</div>
                    <img src="${qrCodeDataUrl}" alt="QR Code for ticket verification" class="qr-code">
                    <div class="qr-subtitle">Present this ticket at the entrance</div>
                    <div class="ticket-number">${ticket.number}</div>
                  </div>
                </div>

                <div class="ticket-footer">
                  <div>© ${new Date().getFullYear()} ${this.configService.get<string>('app.name')}</div>
                  <div>Need help? Contact ${this.supportEmail}</div>
                </div>
              </div>
            </body>
            </html>
`;
    }
}
