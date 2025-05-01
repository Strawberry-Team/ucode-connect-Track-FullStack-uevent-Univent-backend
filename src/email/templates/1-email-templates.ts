// src/email/1-email.templates.ts
import { OrderWithDetails } from '../../models/orders/orders.repository';
import { EmailTemplateInterface } from "./email-template.interface";

export default {
    getConfirmationEmailTemplate: (
        confirmationLink: string,
        projectName: string,
        fullName: string,
    ) => `
<div style="margin:0; padding:0; background-color:#f4f4f4;">
  <div style="max-width:600px; margin:40px auto; background:#fff; padding:20px; border:1px solid #ddd;">
    <div style="text-align:center; margin-bottom:20px;">
      <img src="cid:logo@project" alt="${projectName} Logo" style="max-width:150px;">
    </div>
    <div style="text-align:center; margin-bottom:20px;">
      <h2 style="font-family: Arial, sans-serif;">
        Welcome to ${projectName}!
      </h2>
    </div>
    <div style="font-family: Arial, sans-serif; font-size:14px; color:#333; text-align: center">
      <p>👋 Hi, ${fullName}!</p>
      <p>😊 Thank you for signing up!</p>
      <p>🤝To complete your registration, please confirm your email address by clicking the button below.</p>
      <div style="text-align:center; margin:50px;">
        <a href="${confirmationLink}" target="_blank"
          style="background-color: black; color: white; padding:10px 20px; text-decoration:none; border-radius:4px;">
          Confirm Email
        </a>
      </div>
      <p>⏳ This link will expire in 7 days.</p>
      <p>If you didn’t sign up for this account, you can safely ignore this email.</p>
      <p>© 2025 <a href="http://localhost:8080/">${projectName}</a>. All rights reserved.</p>
    </div>
  </div>
</div>
`,

    getResetPasswordEmailTemplate: (
        resetLink: string,
        projectName: string,
        fullName: string,
    ) => `
<div style="margin:0; padding:0; background-color:#f4f4f4;">
  <div style="max-width:600px; margin:40px auto; background:#fff; padding:20px; border:1px solid #ddd;">
    <div style="text-align:center; margin-bottom:20px;">
      <img src="cid:logo@project" alt="${projectName} Logo" style="max-width:150px;">
    </div>
    <div style="text-align:center; margin-bottom:20px;">
      <h2 style="font-family: Arial, sans-serif;">Reset Password for ${projectName}</h2>
    </div>
    <div style="font-family: Arial, sans-serif; font-size:14px; color:#333; text-align: center">
      <p>👋 Hi, ${fullName}!</p>
      <p>📬 We received a request to reset your password. Click the button below to reset it.</p>
      <p>⏳ This link will expire in 24 days.</p>
      <div style="text-align:center; margin:50px;">
        <a href="${resetLink}" target="_blank"
          style="background-color: black; color: white; padding:10px 20px; text-decoration:none; border-radius:4px;">
          Reset Password
        </a>
      </div>
      <p>If you didn’t request a password reset, please ignore this email.</p>
      <p>© 2025 <a href="http://localhost:8080/">${projectName}</a>. All rights reserved.</p>
    </div>
  </div>
</div>
`,

    getWelcomeCompanyEmailTemplate: (
        companyOwnerName: string,
        companyTitle: string,
        redirectLink: string,
        serviceName: string,
    ) => `
<div style="margin:0; padding:0; background-color:#f4f4f4;">
  <div style="max-width:600px; margin:40px auto; background:#fff; padding:20px; border:1px solid #ddd;">
    <div style="text-align:center; margin-bottom:20px;">
      <img src="cid:logo@project" alt="${serviceName} Logo" style="max-width:150px;">
    </div>
    <div style="text-align:center; margin-bottom:20px;">
      <h2 style="font-family: Arial, sans-serif;">
        Dear ${companyTitle},
      </h2>
    </div>
    <div style="font-family: Arial, sans-serif; font-size:14px; color:#333;">
      <p>
        We’re thrilled to welcome you to [YourServiceName], your trusted platform for seamless ticket sales and event management! 🎟️
      </p>
      <p>
        Thank you for choosing us as your partner in growing your event business. Your account is now fully set up, and you’re ready to start selling tickets and managing your events with ease. Here’s what you can do next to kick things off:
      </p>
      <ol>
        Get Started in a Few Simple Steps:
        <li><b>Create Your First Event</b>: Log in to your dashboard and set up your first event. Add details like the event name, date, location, and ticket types to attract your audience.</li>
        <li><b>Customize Your Listings</b>: Use our tools to design eye-catching event pages with images, descriptions, and pricing that reflect your brand.</li>
        <li><b>Start Selling</b>: Share your event links with your audience through social media, email campaigns, or your website, and watch the ticket sales roll in!</li>
        <li><b>Track Your Success</b>: Monitor ticket sales, manage attendees, and gain insights with our real-time analytics dashboard.</li>
      </ol>
      <div style="text-align:center; margin:20px;">
        <a href="${redirectLink}" target="_blank"
          style="background-color:#007BFF; color:#fff; padding:10px 20px; text-decoration:none; border-radius:4px;">
          Start Selling
        </a>
      </div>
      <ul>
          Why ${serviceName}?
          <li><b>User-Friendly Platform</b>: Easily manage events and ticket sales in one place.</li>
          <li><b>Secure Payments</b>: Offer your customers a safe and reliable payment experience.</li>
          <li><b>Dedicated Support</b>: Our team is here to help you every step of the way—reach out to us anytime at
          <a>support@${serviceName.replace(' ', '.').toLowerCase()}.com</a>.</li>
      </ul>
      <p>We’re excited to see your events come to life on ${serviceName}! If you have any questions or need assistance, don’t hesitate to contact us. Let’s make your events a success together!</p>
      <p><b>Welcome aboard, and happy selling!</b></p>
      <p>Best regards,</p>
      <p>${serviceName} Team</p>
    </div>
  </div>
</div>
`,

    getTicketConfirmationEmailTemplate: (
        order: OrderWithDetails,
        ticketLinks: { itemId: number; ticketTitle: string; link: string }[],
        projectName: string,
        fullName: string,
        frontendUrl: string,
    ) => {
        const orderItemsHtml = order.orderItems.map(item => `
        <tr>
            <td>${item.ticket.event.title}</td>
            <td>${item.ticket.title}</td>
            <td>$${item.finalPrice.toFixed(2)}</td>
            <td>${ticketLinks.find(l => l.itemId === item.id)
            ? `<a href="${frontendUrl}/orders/${order.id}/item/${item.id}/ticket" target="_blank">View Ticket</a>`
            : 'Generation Pending'}
            </td>
        </tr>
    `).join('');

        return `
<div style="margin:0; padding:0; background-color:#f4f4f4;">
  <div style="max-width:600px; margin:40px auto; background:#fff; padding:20px; border:1px solid #ddd;">
    <div style="text-align:center; margin-bottom:20px;">
      <img src="cid:logo@project" alt="${projectName} Logo" style="max-width:150px;">
    </div>
    <div style="text-align:center; margin-bottom:20px;">
      <h2 style="font-family: Arial, sans-serif;">Your Tickets are Ready!</h2>
    </div>
    <div style="font-family: Arial, sans-serif; font-size:14px; color:#333;">
      <p>👋 Hi, ${fullName}!</p>
      <p>🎉 Thank you for your purchase! Your order (ID: ${order.id}) is confirmed, and your tickets are generated.</p>
      <p>You can view your tickets using the links below:</p>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f0f0f0;">
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Event</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Ticket Type</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Price Paid</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Ticket</th>
          </tr>
        </thead>
        <tbody>
          ${orderItemsHtml}
        </tbody>
      </table>

      <p>Total Amount Paid: <strong>$${order.totalAmount.toFixed(2)}</strong></p>
      ${order.promoCode?.discountPercent ? `<p><i>Discount applied.</i></p>` : ''}

      <p>Please have your tickets ready (digital or printed) when you arrive at the event.</p>
      <p>If you have any questions about your order, please contact our support team.</p>
      <p>See you at the event!</p>
      <p>© ${new Date().getFullYear()} <a href="${/* Добавь ссылку на твой сайт */''}">${projectName}</a>. All rights reserved.</p>
    </div>
  </div>
</div>
`;
    },
} as EmailTemplateInterface;
