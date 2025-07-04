import type { ConfigService } from '@nestjs/config';
import type { TicketGenerationData } from '../interfaces/ticket-generation-data.interface';
import type { TicketTemplateInterface } from './ticket-template.interface';

class CustomTicketTemplate implements TicketTemplateInterface {
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
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');

            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              font-family: 'Roboto', sans-serif;
            }

            body {
              color: #2d3748;
              line-height: 1.6;
              padding: 5px;
            }

            .ticket-container {
              max-width: 100%;
              margin: 0;
              background: white;
              border-radius: 12px;
              box-shadow: none;
              overflow: hidden;
              position: relative;
            }

            .ticket-header {
              background: linear-gradient(90deg, #000000, #333333);
              padding: 25px 15px;
              color: white;
              text-align: center;
              position: relative;
              border-top-left-radius: 12px;
              border-top-right-radius: 12px;
            }

            .header-content {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 15px;
            }

            .event-title {
              font-size: 28px;
              font-weight: 700;
              line-height: 1.3;
              max-width: 95%;
            }

            .event-date {
              background: rgba(255,255,255,0.42);
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 500;
            }

            .ticket-body {
              display: flex;
              flex-direction: column;
              background: white;
            }

            .content-wrapper {
              background: #f9fafb;
              padding: 25px 10px;
              display: flex;
              flex-direction: column;
              gap: 20px;
            }

            .ticket-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
            }

            .info-card {
              background: white;
              padding: 12px;
              border-radius: 8px;
              border-left: 4px solid #000000;
            }

            .info-card h3 {
              font-size: 12px;
              color: #6b7280;
              text-transform: uppercase;
              margin-bottom: 8px;
              font-weight: 500;
            }

            .info-card p {
              font-size: 15px;
              color: #2d3748;
              font-weight: 500;
            }

            .qr-section {
              background: #f1f1f1;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #000000;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 15px;
              max-width: 500px;
              margin: 0 auto;
            }

            .qr-code {
              width: 280px;
              height: 280px;
              border: 6px solid white;
              border-radius: 8px;
            }

            .qr-content {
              display: flex;
              flex-direction: column;
              gap: 8px;
              text-align: center;
            }

            .qr-title {
              font-size: 14px;
              font-weight: 600;
              color: #000000;
              text-transform: uppercase;
            }

            .qr-subtitle {
              font-size: 12px;
              color: #6b7280;
            }

            .ticket-number {
              font-family: monospace;
              font-size: 14px;
              background: #e5e5e5;
              padding: 6px 12px;
              border-radius: 6px;
              color: #000000;
              font-weight: 600;
              display: inline-block;
            }

            .ticket-footer {
              background: #f9fafb;
              padding: 12px 15px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 12px;
              color: #6b7280;
              border-top: 1px solid #e5e7eb;
              border-bottom-left-radius: 12px;
              border-bottom-right-radius: 12px;
            }

            .price-tag {
              font-size: 16px;
              font-weight: 700;
              color: #000000;
              margin-top: 8px;
            }

            @media print {
              body {
                margin: 0;
                padding: 0;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }

              .ticket-container {
                box-shadow: none;
                max-width: 100%;
              }
            }
          </style>
        </head>
        <body>
          <div class="ticket-container">
            <div class="ticket-header">
              <div class="header-content">
                <div class="event-title">${event.title}</div>
                <div class="event-date">
                  ${event.startedAt.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })}
                </div>
              </div>
            </div>

            <div class="ticket-body">
              <div class="content-wrapper">
                <div class="ticket-info">
                  <div class="info-card">
                    <h3>Attendee</h3>
                    <p>${user.firstName}${!user.lastName ? '' : ' ' + user.lastName}</p>
                    <p style="font-size: 14px; color: #6b7280;">${user.email}</p>
                  </div>

                  <div class="info-card">
                    <h3>Ticket Details</h3>
                    <p>${ticket.title}</p>
                    <div class="price-tag">$${Number(orderItem.finalPrice).toFixed(2)}</div>
                  </div>

                  <div class="info-card">
                  <h3>Date & Time</h3>
${
      // Check if start and end dates are the same
      event.startedAt.toDateString() === event.endedAt.toDateString()
        ? `<p>${event.startedAt.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
          timeZone: "UTC",
        })}</p>
              <p style="font-size: 13px; color: #6b7280;">
                  ${event.startedAt.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "UTC",
        })} -
                  ${event.endedAt.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "UTC",
        })}
              </p>`
        : `<p>${event.startedAt.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
          timeZone: "UTC",
        })} ${event.startedAt.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "UTC",
        })} - </p>
              <p> ${event.endedAt.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
          timeZone: "UTC",
        })} ${event.endedAt.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "UTC",
        })}</p>`
      }
</div>

                  <div class="info-card">
                    <h3>Venue</h3>
                    <p>${event.venue}</p>
                  </div>
                </div>

                <div class="qr-section">
                  <img src="${qrCodeDataUrl}" alt="QR Code for ticket verification" class="qr-code">
                  <div class="qr-content">
                    <div class="qr-title">Entry QR Code</div>
                    <div class="qr-subtitle">Present this at the venue for entry</div>
                    <div class="ticket-number">${ticket.number}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="ticket-footer">
              <div>© ${new Date().getFullYear()} ${appName}</div>
              <div>Contact: ${supportEmail}</div>
            </div>
          </div>
        </body>
        </html>
        `;
  }

  /**
   * Special method for PDF rendering through PDFKit with better control
   */
  renderTicketToPdf(
    doc: PDFKit.PDFDocument,
    data: TicketGenerationData,
    qrCodeDataUrl: string,
    configService: ConfigService,
    supportEmail: string,
  ): void {
    const { orderItem } = data
    const event = orderItem.ticket.event
    const ticket = orderItem.ticket
    const user = orderItem.user
    const appName = configService.get<string>("app.name") || "UEvent"
    const pageWidth = doc.page.width
    const pageHeight = doc.page.height
    console.log(pageWidth, "x", pageHeight);

    try {
      const headerWidth = 512
      const headerHeight = 120
      let yPos = 0
      // Header with black gradient
      doc.rect(0, yPos, pageWidth, headerHeight).fill("#000000")

      yPos += headerHeight

      // Event title
      doc.fillColor("#FFFFFF").fontSize(28).font("Helvetica-Bold").text(event.title, 50, 35, {
        align: "center",
        width: headerWidth,
      })

      // Event date
      const eventDateText = event.startedAt.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })

      doc.fillColor("#FFFFFF").fontSize(18).font("Helvetica-Bold").text(eventDateText, 50, 85, {
        align: "center",
        width: headerWidth,
      })

      // Container with gray background
      const containerWidth = pageWidth
      doc
        .rect(
          (pageWidth - containerWidth) / 2,
          yPos,
          containerWidth,
          pageHeight - headerHeight)
        .fill("#f9fafb")

      // Information cards in 2x2 grid format
      const cardSpacing = 15
      yPos += cardSpacing
      const cardGridWidth = containerWidth - (cardSpacing * 2)
      const cardWidth = (cardGridWidth / 2) - (cardSpacing / 2)
      const cardHeight = 90
      const cardData = [
        {
          title: "ATTENDEE",
          content: `${user.firstName}${user.lastName ? " " + user.lastName : ""}`,
          subcontent: user.email,
          x: (pageWidth - cardGridWidth) / 2,
          y: yPos,
        },
        {
          title: "TICKET DETAILS",
          content: ticket.title,
          subcontent: `$${Number(orderItem.finalPrice).toFixed(2)}`,
          x: (pageWidth - cardGridWidth) / 2 + cardWidth + cardSpacing,
          y: yPos,
        },
        {
          title: "DATE & TIME",
          content:
            event.startedAt.toDateString() === event.endedAt.toDateString()
              ? event.startedAt.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
                timeZone: "UTC",
              })
              : `${event.startedAt.toLocaleDateString("en-US", { timeZone: "UTC" })} - ${event.endedAt.toLocaleDateString("en-US", { timeZone: "UTC" })}`,
          subcontent:
            event.startedAt.toDateString() === event.endedAt.toDateString()
              ? `${event.startedAt.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: "UTC",
              })} - ${event.endedAt.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: "UTC",
              })}`
              : "",
          x: (pageWidth - cardGridWidth) / 2,
          y: yPos + cardHeight + cardSpacing,
        },
        {
          title: "VENUE",
          content: event.venue,
          subcontent: "",
          x: (pageWidth - cardGridWidth) / 2 + cardWidth + cardSpacing,
          y: yPos + cardHeight + cardSpacing,
        },
      ]

      yPos += (cardHeight + cardSpacing) * 2

      // Draw cards with white background and black left border
      cardData.forEach((card) => {
        const cardLineHeight = 20
        const cardPadding = 15
        // White card
        doc.rect(card.x, card.y, cardWidth, cardHeight).fill("#ffffff")

        // Black left border
        doc.rect(card.x, card.y, 4, cardHeight).fill("#000000")

        // Card title
        doc
          .fillColor("#6b7280")
          .fontSize(12)
          .font("Helvetica")
          .text(card.title, card.x + cardPadding, card.y + cardPadding)

        // Main text
        doc
          .fillColor("#2d3748")
          .fontSize(15)
          .font("Helvetica")
          .text(card.content, card.x + cardPadding, card.y + cardPadding * 1.5 + cardLineHeight, { width: cardWidth - cardPadding * 2 })

        // Additional text
        if (card.subcontent) {
          // Price, Email or time
          doc
            .fillColor("#000000")
            .fontSize(16)
            .font("Helvetica")
            .text(card.subcontent, card.x + cardPadding, card.y + cardPadding * 1.5 + cardLineHeight * 2, { width: cardWidth - cardPadding * 2 })
        }
      })

      // QR section
      const qrSectionWidth = 400
      const qrSectionHeight = 425
      let qrSectionY = 360
      const qrSectionX = (pageWidth - qrSectionWidth) / 2 // Centering

      // QR section background
      doc.rect(qrSectionX, qrSectionY, qrSectionWidth, qrSectionHeight).fill("#f1f1f1")

      // Black left border
      doc.rect(qrSectionX, qrSectionY, 4, qrSectionHeight).fill("#000000")

      if (qrCodeDataUrl) {
        try {
          // Text before QR code
          qrSectionY += 10

          doc
            .fillColor("#000000")
            .fontSize(12)
            .font("Helvetica-Bold")
            .text("ENTRY QR CODE", qrSectionX, qrSectionY, {
              align: "center",
              width: qrSectionWidth,
            })

          qrSectionY += 15
          doc
            .fillColor("#6b7280")
            .fontSize(12)
            .font("Helvetica")
            .text("Show it at the venue for entry", qrSectionX, qrSectionY, {
              align: "center",
              width: qrSectionWidth,
            })

          // Ticket number
          const ticketNumWidth = qrSectionWidth - 50
          const ticketNumX = qrSectionX + 25
          qrSectionY += 15

          doc.rect(ticketNumX, qrSectionY, ticketNumWidth, 20).fill("#e5e5e5")
          doc
            .fillColor("#000000")
            .fontSize(14)
            .font("Courier-Bold")
            .text(ticket.number, ticketNumX, qrSectionY + 5, {
              align: "center",
              width: ticketNumWidth,
            })

          // QR code
          const base64Data = qrCodeDataUrl.split(",")[1]
          const qrBuffer = Buffer.from(base64Data, "base64")

          qrSectionY += 25

          doc.image(qrBuffer, qrSectionX + 25, qrSectionY, {
            width: qrSectionWidth - 50,
            height: qrSectionWidth - 50,
          })
        } catch (qrError) {
          doc
            .fillColor("#000000")
            .fontSize(12)
            .text("QR Code unavailable", qrSectionX, qrSectionY + 90, {
              align: "center",
              width: qrSectionWidth,
            })
        }
      }

      // Footer with black border
      yPos = 800

      doc.rect(0, yPos, pageWidth, 1).fill("#e5e7eb")

      doc
        .fillColor("#6b7280")
        .fontSize(10)
        .font("Helvetica")
        .text(`Need help? Contact ${supportEmail}`, 0, yPos + 10, { align: "center" })
        .text(`All rights reserved © ${new Date().getFullYear()} ${appName}`, 0, yPos + 25, { align: "center" })
    } catch (error) {
      console.error("Error in renderTicketToPdf:", error)
    }
  }
}

export default new CustomTicketTemplate();