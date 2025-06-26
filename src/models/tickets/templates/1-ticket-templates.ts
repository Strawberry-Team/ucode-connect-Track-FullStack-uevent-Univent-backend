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
              max-width: 1100px;
              margin: 0 auto;
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

    try {
      // Устанавливаем размер страницы как в HTML (max-width: 1100px)
      const pageWidth = 612 // A4 width in points
      const pageHeight = 792 // A4 height in points
      const contentWidth = Math.min(pageWidth - 40, 520) // Максимальная ширина контента
      const startX = (pageWidth - contentWidth) / 2 // Центрирование

      // 1. HEADER - точно как в HTML (.ticket-header)
      // Черный градиент фон (linear-gradient(90deg, #000000, #333333))
      const headerHeight = 120
      doc.rect(startX, 0, contentWidth, headerHeight).fill("#000000")

      // Добавляем градиент эффект (имитация)
      doc.rect(startX + contentWidth * 0.7, 0, contentWidth * 0.3, headerHeight).fill("#333333")

      // Заголовок события (.event-title: font-size: 28px, font-weight: 700)
      doc.fillColor("#FFFFFF")
        .fontSize(28)
        .font("Helvetica-Bold")
        .text(event.title, startX + 20, 25, {
          align: "center",
          width: contentWidth - 40,
          lineGap: 2
        })

      // Дата события (.event-date: background: rgba(255,255,255,0.42))
      const eventDateText = event.startedAt.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })

      // Имитация полупрозрачного фона
      const dateWidth = 200
      const dateX = startX + (contentWidth - dateWidth) / 2
      doc.rect(dateX, 75, dateWidth, 30)
        .fill("#666666") // Серый вместо полупрозрачного белого

      doc.fillColor("#FFFFFF")
        .fontSize(14)
        .font("Helvetica")
        .text(eventDateText, dateX, 85, {
          align: "center",
          width: dateWidth
        })

      // 2. BODY - контейнер с серым фоном (.content-wrapper: background: #f9fafb)
      const bodyY = headerHeight + 10
      const bodyHeight = 400
      doc.rect(startX, bodyY, contentWidth, bodyHeight).fill("#f9fafb")

      // 3. INFO CARDS - сетка 2x2 (.ticket-info: grid-template-columns: 1fr 1fr)
      const cardWidth = (contentWidth - 60) / 2 // Ширина карточки
      const cardHeight = 90
      const cardGap = 12
      const cardsStartX = startX + 20
      const cardsStartY = bodyY + 25

      const cardData = [
        {
          title: "ATTENDEE", // .info-card h3: uppercase, color: #6b7280
          content: `${user.firstName}${user.lastName ? " " + user.lastName : ""}`,
          subcontent: user.email,
          x: cardsStartX,
          y: cardsStartY
        },
        {
          title: "TICKET DETAILS",
          content: ticket.title,
          subcontent: `$${Number(orderItem.finalPrice).toFixed(2)}`,
          x: cardsStartX + cardWidth + cardGap,
          y: cardsStartY
        },
        {
          title: "DATE & TIME",
          content: event.startedAt.toDateString() === event.endedAt.toDateString()
            ? event.startedAt.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
              timeZone: "UTC"
            })
            : `${event.startedAt.toLocaleDateString("en-US", { timeZone: "UTC" })} - ${event.endedAt.toLocaleDateString("en-US", { timeZone: "UTC" })}`,
          subcontent: event.startedAt.toDateString() === event.endedAt.toDateString()
            ? `${event.startedAt.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
              timeZone: "UTC"
            })} - ${event.endedAt.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
              timeZone: "UTC"
            })}`
            : "",
          x: cardsStartX,
          y: cardsStartY + cardHeight + cardGap
        },
        {
          title: "VENUE",
          content: event.venue,
          subcontent: "",
          x: cardsStartX + cardWidth + cardGap,
          y: cardsStartY + cardHeight + cardGap
        }
      ]

      // Рисуем карточки точно как в HTML (.info-card)
      cardData.forEach((card) => {
        // Белый фон карточки (background: white)
        doc.rect(card.x, card.y, cardWidth, cardHeight).fill("#ffffff")

        // Черная левая граница (border-left: 4px solid #000000)
        doc.rect(card.x, card.y, 4, cardHeight).fill("#000000")

        // Заголовок карточки (h3: font-size: 12px, color: #6b7280, uppercase)
        doc.fillColor("#6b7280")
          .fontSize(12)
          .font("Helvetica")
          .text(card.title, card.x + 15, card.y + 12)

        // Основной текст (p: font-size: 15px, color: #2d3748, font-weight: 500)
        doc.fillColor("#2d3748")
          .fontSize(15)
          .font("Helvetica")
          .text(card.content, card.x + 15, card.y + 32, { width: cardWidth - 25 })

        // Дополнительный текст
        if (card.subcontent) {
          if (card.title === "TICKET DETAILS") {
            // Цена (.price-tag: font-size: 16px, font-weight: 700, color: #000000)
            doc.fillColor("#000000")
              .fontSize(16)
              .font("Helvetica-Bold")
              .text(card.subcontent, card.x + 15, card.y + 55)
          } else {
            // Email или время (color: #6b7280)
            doc.fillColor("#6b7280")
              .fontSize(card.title === "ATTENDEE" ? 14 : 13)
              .font("Helvetica")
              .text(card.subcontent, card.x + 15, card.y + 52, { width: cardWidth - 25 })
          }
        }
      })

      // 4. QR SECTION - точно как в HTML (.qr-section)
      const qrSectionY = cardsStartY + (cardHeight + cardGap) * 2 + 20
      const qrSectionWidth = Math.min(400, contentWidth - 40)
      const qrSectionX = startX + (contentWidth - qrSectionWidth) / 2
      const qrSectionHeight = 160

      // Фон QR секции (background: #f1f1f1)
      doc.rect(qrSectionX, qrSectionY, qrSectionWidth, qrSectionHeight).fill("#f1f1f1")

      // Черная левая граница (border-left: 4px solid #000000)
      doc.rect(qrSectionX, qrSectionY, 4, qrSectionHeight).fill("#000000")

      if (qrCodeDataUrl) {
        try {
          const base64Data = qrCodeDataUrl.split(",")[1]
          const qrBuffer = Buffer.from(base64Data, "base64")

          // QR код с белой рамкой (.qr-code: border: 6px solid white)
          const qrSize = 100
          const qrX = qrSectionX + (qrSectionWidth - qrSize) / 2
          const qrY = qrSectionY + 15

          // Белая рамка (border: 6px solid white)
          doc.rect(qrX - 6, qrY - 6, qrSize + 12, qrSize + 12).fill("#ffffff")

          doc.image(qrBuffer, qrX, qrY, {
            width: qrSize,
            height: qrSize
          })

          // Заголовок QR (.qr-title: font-size: 14px, font-weight: 600, color: #000000, uppercase)
          doc.fillColor("#000000")
            .fontSize(14)
            .font("Helvetica-Bold")
            .text("ENTRY QR CODE", qrSectionX, qrSectionY + 125, {
              align: "center",
              width: qrSectionWidth
            })

          // Подзаголовок (.qr-subtitle: font-size: 12px, color: #6b7280)
          doc.fillColor("#6b7280")
            .fontSize(12)
            .font("Helvetica")
            .text("Present this at the venue for entry", qrSectionX, qrSectionY + 142, {
              align: "center",
              width: qrSectionWidth
            })

        } catch (qrError) {
          doc.fillColor("#000000")
            .fontSize(12)
            .text("QR Code unavailable", qrSectionX, qrSectionY + 80, {
              align: "center",
              width: qrSectionWidth
            })
        }
      }

      // Номер билета (.ticket-number: background: #e5e5e5, monospace)
      const ticketNumY = qrSectionY + qrSectionHeight + 10
      const ticketNumWidth = 140
      const ticketNumX = startX + (contentWidth - ticketNumWidth) / 2

      doc.rect(ticketNumX, ticketNumY, ticketNumWidth, 25).fill("#e5e5e5")
      doc.fillColor("#000000")
        .fontSize(14)
        .font("Courier")
        .text(ticket.number, ticketNumX, ticketNumY + 7, {
          align: "center",
          width: ticketNumWidth
        })

      // 5. FOOTER - точно как в HTML (.ticket-footer)
      const footerY = ticketNumY + 40
      const footerHeight = 30

      // Фон футера (background: #f9fafb)
      doc.rect(startX, footerY, contentWidth, footerHeight).fill("#f9fafb")

      // Верхняя граница (border-top: 1px solid #e5e7eb)
      doc.rect(startX, footerY, contentWidth, 1).fill("#e5e7eb")

      // Текст футера (font-size: 12px, color: #6b7280)
      doc.fillColor("#6b7280")
        .fontSize(8)
        .font("Helvetica")
        .text(`© ${new Date().getFullYear()} ${appName}`, startX + 15, footerY + 12, { align: "left" })
        .text(`Contact: ${supportEmail}`, startX + contentWidth - 15, footerY + 12, { align: "right" })

    } catch (error) {
      console.error("Error in improved renderTicketToPdf:", error)
      // Fallback с базовым дизайном
      doc.fillColor("#000000")
        .fontSize(16)
        .font("Helvetica")
        .text("Event Ticket", 50, 100, { align: "center", width: 500 })
        .fontSize(12)
        .text("This is your event ticket. Please present at the venue.", 50, 150, { align: "center", width: 500 })
    }
  }
}
export default new CustomTicketTemplate();