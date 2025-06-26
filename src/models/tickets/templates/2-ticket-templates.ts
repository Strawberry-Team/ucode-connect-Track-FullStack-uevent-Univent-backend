// src/ticket-generation/templates/2-ticket-templates.ts
import { ConfigService } from '@nestjs/config';
import { TicketGenerationData } from '../interfaces/ticket-generation-data.interface';
import { TicketTemplateInterface } from './ticket-template.interface';
import PDFKit from 'pdfkit';

class Theme2TicketTemplates implements TicketTemplateInterface {
  getTicketTemplate(
    data: TicketGenerationData,
    qrCodeDataUrl: string,
    configService: ConfigService,
    supportEmail: string
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
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              font-family: 'Poppins', sans-serif;
            }

            body {
              background-color: white;
              color: #212121;
              line-height: 1.6;
              padding: 20px;
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
              page-break-inside: avoid;
            }

            .ticket-header {
              background: linear-gradient(135deg, #2e7d32, #81c784);
              color: white;
              padding: 20px 30px;
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
              font-size: 24px;
              font-weight: 700;
              margin-bottom: 10px;
              line-height: 1.3;
            }

            .ticket-body {
              padding: 20px 30px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              border-bottom: 1px dashed #81c784;
              position: relative;
            }

            .ticket-info {
              padding-right: 20px;
            }

            .info-group {
              margin-bottom: 15px;
            }

            .info-group h3 {
              font-size: 12px;
              color: #757575;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 5px;
              font-weight: 600;
            }

            .info-group p {
              font-size: 15px;
              font-weight: 500;
              color: #212121;
            }

            .datetime-group {
              display: flex;
              align-items: flex-start;
              margin-bottom: 8px;
            }

            .datetime-group i {
              color: #2e7d32;
              margin-right: 10px;
              font-size: 18px;
              flex-shrink: 0;
              margin-top: 3px;
            }

            .qr-section {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 15px;
              background-color: #e8f5e9;
              border-radius: 8px;
              text-align: center;
            }

            .qr-code {
              width: 160px;
              height: 160px;
              margin: 10px 0;
              border: 6px solid white;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.07);
            }

            .qr-title {
              font-size: 14px;
              font-weight: 600;
              color: #2e7d32;
              margin-bottom: 5px;
            }

            .qr-subtitle {
              font-size: 12px;
              color: #757575;
              margin-top: 5px;
            }

            .ticket-number {
              font-family: monospace;
              font-size: 14px;
              background-color: #e8f5e9;
              padding: 4px 8px;
              border-radius: 4px;
              margin-top: 5px;
              font-weight: 600;
              color: #2e7d32;
              letter-spacing: 1px;
            }

            .ticket-footer {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 15px 30px;
              font-size: 12px;
              color: #757575;
              background: #e8f5e9;
            }

            .event-date {
              color: white;
              background-color: #00c853;
              padding: 5px 10px;
              border-radius: 20px;
              font-size: 13px;
              font-weight: 500;
              margin-top: 10px;
              display: inline-block;
            }

            .price-tag {
              font-size: 16px;
              font-weight: 700;
              color: #2e7d32;
              margin-top: 5px;
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
                  <p>${user.firstName}${!user.lastName ? '' : ' ' + user.lastName}</p>
                  <p style="font-size: 14px; color: #757575;">${user.email}</p>
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
      timeZone: 'UTC'
    })}</p>
                      <p style="font-size: 13px; color: #757575;">
                        ${event.startedAt.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC'
    })} -
                        ${event.endedAt.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC'
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
                <div class="qr-title">SCAN FOR ENTRY</div>
                <img src="${qrCodeDataUrl}" alt="QR Code for ticket verification" class="qr-code">
                <div class="qr-subtitle">Present this ticket at the entrance</div>
                <div class="ticket-number">${ticket.number}</div>
              </div>
            </div>

            <div class="ticket-footer">
              <div>© ${new Date().getFullYear()} ${appName}</div>
              <div>Need help? Contact ${supportEmail}</div>
            </div>
          </div>
        </body>
        </html>
        `;
  }

  /**
   * Special method for PDF rendering through PDFKit with green theme
   */
  renderTicketToPdf(
    doc: PDFKit.PDFDocument,
    data: TicketGenerationData,
    qrCodeDataUrl: string,
    configService: ConfigService,
    supportEmail: string,
  ): void {
    const { orderItem } = data;
    const event = orderItem.ticket.event;
    const ticket = orderItem.ticket;
    const user = orderItem.user;
    const appName = configService.get<string>('app.name') || 'UEvent';

    try {
      // Header with green gradient
      doc.rect(0, 0, 612, 120).fill('#2e7d32');

      // Application name
      doc.fillColor('#ffffff')
        .fontSize(12)
        .font('Helvetica')
        .text(appName.toUpperCase(), 50, 25, {
          align: 'center',
          width: 512,
          characterSpacing: 2
        });

      // Event title
      doc.fillColor('#ffffff')
        .fontSize(24)
        .font('Helvetica-Bold')
        .text(event.title, 50, 45, {
          align: 'center',
          width: 512
        });

      // Event date with green background
      const eventDateText = event.startedAt.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      doc.rect(250, 85, 112, 25).fill('#00c853');
      doc.fillColor('#ffffff')
        .fontSize(13)
        .font('Helvetica')
        .text(eventDateText, 250, 92, {
          align: 'center',
          width: 112
        });

      // Main container
      const mainY = 140;
      const leftColumnX = 50;
      const rightColumnX = 356;
      const columnWidth = 256;

      // Left column - event information
      let currentY = mainY;

      // 1. Attendee section
      doc.fillColor('#757575')
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('ATTENDEE', leftColumnX, currentY);

      currentY += 20;
      doc.fillColor('#212121')
        .fontSize(15)
        .font('Helvetica')
        .text(`${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`, leftColumnX, currentY);

      currentY += 20;
      doc.fillColor('#757575')
        .fontSize(14)
        .font('Helvetica')
        .text(user.email, leftColumnX, currentY);

      currentY += 40;

      // 2. Event Details section
      doc.fillColor('#757575')
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('EVENT DETAILS', leftColumnX, currentY);

      currentY += 25;

      // Date and time with emojis
      doc.fillColor('#2e7d32')
        .fontSize(16)
        .text('🗓️', leftColumnX, currentY);

      const eventDateTime = event.startedAt.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC'
      });

      doc.fillColor('#212121')
        .fontSize(15)
        .font('Helvetica')
        .text(eventDateTime, leftColumnX + 25, currentY, { width: columnWidth - 25 });

      currentY += 20;

      const timeRange = `${event.startedAt.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC'
      })} - ${event.endedAt.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC'
      })}`;

      doc.fillColor('#757575')
        .fontSize(13)
        .font('Helvetica')
        .text(timeRange, leftColumnX + 25, currentY, { width: columnWidth - 25 });

      currentY += 30;

      // Venue with emojis
      doc.fillColor('#2e7d32')
        .fontSize(16)
        .text('📍', leftColumnX, currentY);

      doc.fillColor('#212121')
        .fontSize(15)
        .font('Helvetica')
        .text(event.venue, leftColumnX + 25, currentY, { width: columnWidth - 25 });

      currentY += 50;

      // 3. Ticket Type section
      doc.fillColor('#757575')
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('TICKET TYPE', leftColumnX, currentY);

      currentY += 20;
      doc.fillColor('#212121')
        .fontSize(15)
        .font('Helvetica')
        .text(ticket.title, leftColumnX, currentY);

      currentY += 25;
      doc.fillColor('#2e7d32')
        .fontSize(16)
        .font('Helvetica-Bold')
        .text(`$${Number(orderItem.finalPrice).toFixed(2)}`, leftColumnX, currentY);

      // Right column - QR code
      const qrSectionY = mainY;
      doc.rect(rightColumnX, qrSectionY, columnWidth, 360).fill('#e8f5e9');
      doc.rect(rightColumnX, qrSectionY, 256, 8).fill('#2e7d32'); // Top green border

      // QR section content
      doc.fillColor('#2e7d32')
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('SCAN FOR ENTRY', rightColumnX, qrSectionY + 30, {
          align: 'center',
          width: columnWidth
        });

      if (qrCodeDataUrl) {
        try {
          const base64Data = qrCodeDataUrl.split(',')[1];
          const qrBuffer = Buffer.from(base64Data, 'base64');

          // QR code with white border
          const qrSize = 160;
          const qrX = rightColumnX + (columnWidth - qrSize) / 2;
          const qrY = qrSectionY + 60;

          // White border
          doc.rect(qrX - 6, qrY - 6, qrSize + 12, qrSize + 12).fill('#ffffff');

          doc.image(qrBuffer, qrX, qrY, {
            width: qrSize,
            height: qrSize
          });

          // Text under QR code
          doc.fillColor('#757575')
            .fontSize(12)
            .font('Helvetica')
            .text('Present this ticket at the entrance', rightColumnX, qrSectionY + 240, {
              align: 'center',
              width: columnWidth
            });

          // Ticket number
          const ticketNumY = qrSectionY + 265;
          const ticketNumWidth = 140;
          const ticketNumX = rightColumnX + (columnWidth - ticketNumWidth) / 2;

          doc.rect(ticketNumX, ticketNumY, ticketNumWidth, 25).fill('#e8f5e9');
          doc.fillColor('#2e7d32')
            .fontSize(14)
            .font('Courier-Bold')
            .text(ticket.number, ticketNumX, ticketNumY + 7, {
              align: 'center',
              width: ticketNumWidth,
              characterSpacing: 1
            });

        } catch (qrError) {
          doc.fillColor('#2e7d32')
            .fontSize(12)
            .text('QR Code unavailable', rightColumnX, qrSectionY + 150, {
              align: 'center',
              width: columnWidth
            });
        }
      }

      // Dotted separator line
      doc.strokeColor('#81c784')
        .lineWidth(1)
        .dash(5, { space: 5 })
        .moveTo(50, 520)
        .lineTo(562, 520)
        .stroke()
        .undash();

      // Footer with green background
      doc.rect(0, 540, 612, 40).fill('#e8f5e9');

      doc.fillColor('#757575')
        .fontSize(8)
        .font('Helvetica')
        .text(`© ${new Date().getFullYear()} ${appName}`, 50, 555, { align: 'left' })
        .text(`Need help? Contact ${supportEmail}`, 400, 555, { align: 'right' });

    } catch (error) {
      console.error('Error in Theme2 renderTicketToPdf:', error);
    }
  }
}

export default new Theme2TicketTemplates();
