// src/ticket-generation/templates/1-ticket-template.ts
import { ConfigService } from '@nestjs/config';
import { TicketGenerationData } from '../interfaces/ticket-generation-data.interface';
import { TicketTemplateInterface } from './ticket-template.interface';

class Theme1TicketTemplates implements TicketTemplateInterface {
    getTicketTemplate(
        data: TicketGenerationData,
        qrCodeDataUrl: string,
        configService: ConfigService,
        supportEmail: string,
    ): string {
        const { orderItem } = data;
        const event = orderItem.ticket.event;
        const ticket = orderItem.ticket;
        const user = orderItem.user;
        const appName = configService.get<string>('app.name');

        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Ticket for ${event.title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              font-family: 'Inter', sans-serif;
            }

            body {
              background-color: #f4f7fa;
              color: #1a1a1a;
              line-height: 1.5;
              padding: 15px;
            }

            .ticket-container {
              width: 100%;
              max-width: 850px;
              margin: 0 auto;
              background-color: white;
              border-radius: 16px;
              box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              position: relative;
              page-break-inside: avoid;
            }

            .ticket-header {
              background: linear-gradient(135deg, #1e3a8a, #60a5fa);
              color: white;
              padding: 25px 35px;
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
              background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10h80v80H10z' stroke='%23ffffff' stroke-width='2' fill='none' opacity='0.2'/%3E%3C/svg%3E") repeat;
              opacity: 0.2;
            }

            .header-content {
              position: relative;
              z-index: 1;
            }

            .app-name {
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              margin-bottom: 8px;
              opacity: 0.85;
              font-weight: 400;
            }

            .event-title {
              font-size: 26px;
              font-weight: 700;
              margin-bottom: 12px;
              line-height: 1.2;
            }

            .ticket-body {
              padding: 25px 35px;
              display: grid;
              grid-template-columns: 2fr 1fr;
              gap: 25px;
              border-bottom: 1px dashed #60a5fa;
              position: relative;
            }

            .ticket-info {
              padding-right: 25px;
            }

            .info-group {
              margin-bottom: 18px;
            }

            .info-group h3 {
              font-size: 11px;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 6px;
              font-weight: 600;
            }

            .info-group p {
              font-size: 14px;
              font-weight: 500;
              color: #1a1a1a;
            }

            .datetime-group {
              display: flex;
              align-items: flex-start;
              margin-bottom: 10px;
            }

            .datetime-group i {
              color: #1e3a8a;
              margin-right: 12px;
              font-size: 16px;
              flex-shrink: 0;
              margin-top: 2px;
            }

            .qr-section {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 20px;
              background-color: #eff6ff;
              border-radius: 10px;
              text-align: center;
            }

            .qr-code {
              width: 150px;
              height: 150px;
              margin: 12px 0;
              border: 5px solid white;
              border-radius: 6px;
              box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
            }

            .qr-title {
              font-size: 13px;
              font-weight: 600;
              color: #1e3a8a;
              margin-bottom: 6px;
            }

            .qr-subtitle {
              font-size: 11px;
              color: #6b7280;
              margin-top: 6px;
            }

            .ticket-number {
              font-family: monospace;
              font-size: 13px;
              background-color: #eff6ff;
              padding: 5px 10px;
              border-radius: 5px;
              margin-top: 6px;
              font-weight: 600;
              color: #1e3a8a;
              letter-spacing: 1px;
            }

            .ticket-footer {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 12px 35px;
              font-size: 11px;
              color: #6b7280;
              background: #eff6ff;
            }

            .event-date {
              color: white;
              background-color: #2563eb;
              padding: 6px 12px;
              border-radius: 16px;
              font-size: 12px;
              font-weight: 500;
              margin-top: 12px;
              display: inline-block;
            }

            .price-tag {
              font-size: 15px;
              font-weight: 700;
              color: #1e3a8a;
              margin-top: 6px;
            }

            @media print {
              body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                margin: 0;
                padding: 0;
              }

              .ticket-container {
                box-shadow: none;
                max-width: 100%;
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="ticket-container">
            <div class="ticket-header">
              <div class="header-content">
                <div class="app-name">${appName}</div>
                <div class="event-title">${event.title}</div>
                <div class="event-date">
                  ${event.startedAt.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
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
                  <p style="font-size: 13px; color: #6b7280;">${user.email}</p>
                </div>

                <div class="info-group">
                  <h3>Event Details</h3>
                  <div class="datetime-group">
                    <i>🗓️</i>
                    <div>
                      <p>${event.startedAt.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC',
        })}</p>
                      <p style="font-size: 12px; color: #6b7280;">
                        ${event.startedAt.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'UTC',
        })} -
                        ${event.endedAt.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'UTC',
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
              </div>

              <!-- Right Column - QR Code -->
              <div class="qr-section">
                <div class="qr-title">SCAN TO ENTER</div>
                <img src="${qrCodeDataUrl}" alt="QR Code for ticket verification" class="qr-code">
                <div class="qr-subtitle">Show this ticket at the venue</div>
                <div class="ticket-number">${ticket.number}</div>
              </div>
            </div>

            <div class="ticket-footer">
              <div>© ${new Date().getFullYear()} ${appName}</div>
              <div>Support: ${supportEmail}</div>
            </div>
          </div>
        </body>
        </html>
        `;
    }
}

export default new Theme1TicketTemplates();
