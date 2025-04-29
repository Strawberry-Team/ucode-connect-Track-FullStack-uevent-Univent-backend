// src/email/email-templates-green.ts
import {OrderWithDetails} from "../../models/orders/orders.repository";
import { EmailTemplateInterface } from "./email-template.interface";

const colors = {
    primary: "#4CAF50",      // Main green
    secondary: "#81C784",    // Light green
    background: "#E8F5E9",   // Very light green background
    text: "#2E7D32",         // Dark green text
    accent: "#388E3C",       // Medium green for accents
    buttonText: "#FFFFFF",   // White text for buttons
    border: "#C8E6C9",       // Light green border
};

export default {
    getConfirmationEmailTemplate: (
        confirmationLink: string,
        projectName: string,
        fullName: string,
    ) => `
<div style="margin:0; padding:0; background-color:${colors.background}">
  {/* The border syntax '1px solid <color>' is correct CSS */}
  <div style="max-width:600px; margin:40px auto; background:#fff; padding:30px; border:1px solid ${colors.border}; border-radius:8px; box-shadow:0 2px 10px rgba(0,0,0,0.05)">
    <div style="text-align:center; margin-bottom:30px">
      <img src="cid:logo@project" alt="${projectName} Logo" style="max-width:150px">
    </div>
    {/* The border-bottom syntax '2px solid <color>' is correct CSS */}
    <div style="text-align:center; margin-bottom:25px; border-bottom:2px solid ${colors.secondary}; padding-bottom:15px">
      <h2 style="font-family:'Segoe UI',Arial,sans-serif; color:${colors.text}; font-size:24px">
        Welcome to <span style="color:${colors.primary}">${projectName}</span>!
      </h2>
    </div>
    <div style="font-family:'Segoe UI',Arial,sans-serif; font-size:15px; color:#444; line-height:1.6">
      <p style="margin-bottom:20px">Hello <strong>${fullName}</strong>! 👋</p>
      <p style="margin-bottom:20px">We're excited to have you join our community! 🎉</p>
      <p style="margin-bottom:25px">To complete your registration and get started, please verify your email address:</p>
      <div style="text-align:center; margin:35px 0">
        <a href="${confirmationLink}" target="_blank"
          style="background-color:${colors.primary}; color:${colors.buttonText}; padding:12px 30px; text-decoration:none; border-radius:6px; font-weight:bold; display:inline-block; box-shadow:0 2px 5px rgba(0,0,0,0.1)">
          Confirm My Email
        </a>
      </div>
      <p style="margin-bottom:10px; color:#666; font-size:14px">⏳ This confirmation link will expire in 7 days.</p>
      <p style="margin-bottom:10px; color:#666; font-size:14px">If you did not create this account, you can safely ignore this email.</p>
      {/* The border-top syntax '1px solid <color>' is correct CSS */}
      <div style="margin-top:40px; padding-top:20px; border-top:1px solid ${colors.border}; text-align:center; font-size:13px; color:#888">
        <p>© ${new Date().getFullYear()} <a href="#" style="color:${colors.primary}; text-decoration:none">${projectName}</a>. All rights reserved.</p>
      </div>
    </div>
  </div>
</div>
`,

    getResetPasswordEmailTemplate: (
        resetLink: string,
        projectName: string,
        fullName: string,
    ) => `
<div style="margin:0; padding:0; background-color:${colors.background}">
  {/* The border syntax '1px solid <color>' is correct CSS */}
  <div style="max-width:600px; margin:40px auto; background:#fff; padding:30px; border:1px solid ${colors.border}; border-radius:8px; box-shadow:0 2px 10px rgba(0,0,0,0.05)">
    <div style="text-align:center; margin-bottom:30px">
      <img src="cid:logo@project" alt="${projectName} Logo" style="max-width:150px">
    </div>
    {/* The border-bottom syntax '2px solid <color>' is correct CSS */}
    <div style="text-align:center; margin-bottom:25px; border-bottom:2px solid ${colors.secondary}; padding-bottom:15px">
      <h2 style="font-family:'Segoe UI',Arial,sans-serif; color:${colors.text}; font-size:24px">
        Reset Your <span style="color:${colors.primary}">${projectName}</span> Password
      </h2>
    </div>
    <div style="font-family:'Segoe UI',Arial,sans-serif; font-size:15px; color:#444; line-height:1.6">
      <p style="margin-bottom:20px">Hello <strong>${fullName}</strong>! 👋</p>
      <p style="margin-bottom:20px">We received a request to reset the password for your account. 🔐</p>
      <p style="margin-bottom:25px">To create a new password, please click the button below:</p>
      <div style="text-align:center; margin:35px 0">
        <a href="${resetLink}" target="_blank"
          style="background-color:${colors.primary}; color:${colors.buttonText}; padding:12px 30px; text-decoration:none; border-radius:6px; font-weight:bold; display:inline-block; box-shadow:0 2px 5px rgba(0,0,0,0.1)">
          Reset My Password
        </a>
      </div>
      <p style="margin-bottom:10px; color:#666; font-size:14px">⏳ This reset link will expire in 24 hours.</p>
      <p style="margin-bottom:10px; color:#666; font-size:14px">If you did not request a password reset, please contact our support team immediately.</p>
      {/* The border-top syntax '1px solid <color>' is correct CSS */}
      <div style="margin-top:40px; padding-top:20px; border-top:1px solid ${colors.border}; text-align:center; font-size:13px; color:#888">
        <p>© ${new Date().getFullYear()} <a href="#" style="color:${colors.primary}; text-decoration:none">${projectName}</a>. All rights reserved.</p>
      </div>
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
<div style="margin:0; padding:0; background-color:${colors.background}">
  {/* The border syntax '1px solid <color>' is correct CSS */}
  <div style="max-width:600px; margin:40px auto; background:#fff; padding:30px; border:1px solid ${colors.border}; border-radius:8px; box-shadow:0 2px 10px rgba(0,0,0,0.05)">
    <div style="text-align:center; margin-bottom:30px">
      <img src="cid:logo@project" alt="${serviceName} Logo" style="max-width:150px">
    </div>
    {/* The border-bottom syntax '2px solid <color>' is correct CSS */}
    <div style="text-align:center; margin-bottom:25px; border-bottom:2px solid ${colors.secondary}; padding-bottom:15px">
      <h2 style="font-family:'Segoe UI',Arial,sans-serif; color:${colors.text}; font-size:24px">
        Welcome to <span style="color:${colors.primary}">${serviceName}</span>, ${companyTitle}!
      </h2>
    </div>
    <div style="font-family:'Segoe UI',Arial,sans-serif; font-size:15px; color:#444; line-height:1.6">
      <p style="margin-bottom:20px">
        We're thrilled to welcome you to ${serviceName}, your trusted platform for seamless ticket sales and event management! 🎟️
      </p>
      <p style="margin-bottom:20px">
        Thank you for choosing us as your partner in growing your event business. Your account is now fully set up, and you're ready to start selling tickets and managing your events with ease.
      </p>

      <div style="background-color:${colors.background}; border-radius:6px; padding:20px; margin:25px 0">
        <h3 style="color:${colors.text}; margin-top:0; font-size:18px">Get Started in a Few Simple Steps:</h3>
        <ol style="padding-left:25px; margin-bottom:0">
          <li style="margin-bottom:10px"><span style="color:${colors.primary}; font-weight:bold">Create Your First Event:</span> Log in to your dashboard and set up your first event. Add details like the event name, date, location, and ticket types to attract your audience.</li>
          <li style="margin-bottom:10px"><span style="color:${colors.primary}; font-weight:bold">Customize Your Listings:</span> Use our tools to design eye-catching event pages with images, descriptions, and pricing that reflect your brand.</li>
          <li style="margin-bottom:10px"><span style="color:${colors.primary}; font-weight:bold">Start Selling:</span> Share your event links with your audience through social media, email campaigns, or your website, and watch the ticket sales roll in!</li>
          <li style="margin-bottom:0"><span style="color:${colors.primary}; font-weight:bold">Track Your Success:</span> Monitor ticket sales, manage attendees, and gain insights with our real-time analytics dashboard.</li>
        </ol>
      </div>

      <div style="text-align:center; margin:30px 0">
        <a href="${redirectLink}" target="_blank"
          style="background-color:${colors.primary}; color:${colors.buttonText}; padding:12px 30px; text-decoration:none; border-radius:6px; font-weight:bold; display:inline-block; box-shadow:0 2px 5px rgba(0,0,0,0.1)">
          Start Selling Now
        </a>
      </div>

      <div style="background-color:${colors.background}; border-radius:6px; padding:20px; margin:25px 0">
        <h3 style="color:${colors.text}; margin-top:0; font-size:18px">Why ${serviceName}?</h3>
        <ul style="padding-left:25px; margin-bottom:0">
          <li style="margin-bottom:10px"><span style="color:${colors.primary}; font-weight:bold">User-Friendly Platform:</span> Easily manage events and ticket sales in one place.</li>
          <li style="margin-bottom:10px"><span style="color:${colors.primary}; font-weight:bold">Secure Payments:</span> Offer your customers a safe and reliable payment experience.</li>
          <li style="margin-bottom:0"><span style="color:${colors.primary}; font-weight:bold">Dedicated Support:</span> Our team is here to help you every step of the way—reach out to us anytime at
          <a href="mailto:support@${serviceName.replace(" ", ".").toLowerCase()}.com" style="color:${colors.primary}; text-decoration:none">support@${serviceName.replace(" ", ".").toLowerCase()}.com</a>.</li>
        </ul>
      </div>

      <p style="margin-bottom:20px">We're excited to see your events come to life on ${serviceName}! If you have any questions or need assistance, don't hesitate to contact us. Let's make your events a success together!</p>

      <p style="margin-bottom:30px; font-weight:bold; color:${colors.text}">Welcome aboard, and happy selling!</p>

      <p style="margin-bottom:5px">Best regards,</p>
      <p style="margin-bottom:20px; font-weight:bold; color:${colors.primary}">${serviceName} Team</p>

      {/* The border-top syntax '1px solid <color>' is correct CSS */}
      <div style="margin-top:40px; padding-top:20px; border-top:1px solid ${colors.border}; text-align:center; font-size:13px; color:#888">
        <p>© ${new Date().getFullYear()} <a href="#" style="color:${colors.primary}; text-decoration:none">${serviceName}</a>. All rights reserved.</p>
      </div>
    </div>
  </div>
</div>
`,

    getTicketConfirmationEmailTemplate: (
        order: OrderWithDetails,
        ticketLinks: { itemId: number; ticketTitle: string; link: string }[],
        projectName: string,
        fullName: string,
    ) => {
        const orderItemsHtml = order.orderItems.map(item => `
        <tr>
            {/* The border syntax '1px solid <color>' is correct CSS */}
            <td style="border:1px solid ${colors.border}; padding:12px; text-align:left">${item.ticket.event.title}</td>
            {/* The border syntax '1px solid <color>' is correct CSS */}
            <td style="border:1px solid ${colors.border}; padding:12px; text-align:left">${item.ticket.title}</td>
            {/* The border syntax '1px solid <color>' is correct CSS */}
            <td style="border:1px solid ${colors.border}; padding:12px; text-align:left">$${item.finalPrice.toFixed(2)}</td>
            {/* The border syntax '1px solid <color>' is correct CSS */}
            <td style="border:1px solid ${colors.border}; padding:12px; text-align:center">
                ${ticketLinks.find(l => l.itemId === item.id)
            ? `<a href="${ticketLinks.find(l => l.itemId === item.id)!.link}" target="_blank"
                      style="background-color:${colors.primary}; color:${colors.buttonText}; padding:8px 15px;
                      text-decoration:none; border-radius:4px; font-size:13px; display:inline-block">
                      Download Ticket</a>`
            : '<span style="color:#888; font-style:italic">Generation Pending</span>'}
            </td>
        </tr>
    `).join('');

        return `
<div style="margin:0; padding:0; background-color:${colors.background}">
  {/* The border syntax '1px solid <color>' is correct CSS */}
  <div style="max-width:600px; margin:40px auto; background:#fff; padding:30px; border:1px solid ${colors.border}; border-radius:8px; box-shadow:0 2px 10px rgba(0,0,0,0.05)">
    <div style="text-align:center; margin-bottom:30px">
      <img src="cid:logo@project" alt="${projectName} Logo" style="max-width:150px">
    </div>
    {/* The border-bottom syntax '2px solid <color>' is correct CSS */}
    <div style="text-align:center; margin-bottom:25px; border-bottom:2px solid ${colors.secondary}; padding-bottom:15px">
      <h2 style="font-family:'Segoe UI',Arial,sans-serif; color:${colors.text}; font-size:24px">
        Your <span style="color:${colors.primary}">Tickets</span> Are Ready!
      </h2>
    </div>
    <div style="font-family:'Segoe UI',Arial,sans-serif; font-size:15px; color:#444; line-height:1.6">
      <p style="margin-bottom:20px">Hello <strong>${fullName}</strong>! 👋</p>
      <p style="margin-bottom:20px">Thank you for your purchase! 🎉 Your order (ID: <span style="color:${colors.primary}; font-weight:bold">${order.id}</span>) has been confirmed and your tickets are now ready.</p>

      <div style="background-color:${colors.background}; border-radius:6px; padding:20px; margin:25px 0">
        <h3 style="color:${colors.text}; margin-top:0; font-size:18px">Your Ticket Details:</h3>

        <div style="overflow-x:auto; margin-top:15px">
          <table style="width:100%; border-collapse:collapse; margin:10px 0">
            <thead>
              <tr style="background-color:${colors.secondary}; color:white">
                {/* The border syntax '1px solid <color>' is correct CSS */}
                <th style="border:1px solid ${colors.border}; padding:12px; text-align:left; font-weight:600">Event</th>
                {/* The border syntax '1px solid <color>' is correct CSS */}
                <th style="border:1px solid ${colors.border}; padding:12px; text-align:left; font-weight:600">Ticket Type</th>
                {/* The border syntax '1px solid <color>' is correct CSS */}
                <th style="border:1px solid ${colors.border}; padding:12px; text-align:left; font-weight:600">Price Paid</th>
                {/* The border syntax '1px solid <color>' is correct CSS */}
                <th style="border:1px solid ${colors.border}; padding:12px; text-align:center; font-weight:600">Download</th>
              </tr>
            </thead>
            <tbody>
              ${orderItemsHtml}
            </tbody>
          </table>
        </div>

        {/* The border syntax '1px solid <color>' is correct CSS */}
        <div style="background-color:white; border:1px solid ${colors.border}; border-radius:4px; padding:15px; margin-top:20px">
          <p style="margin:0; font-size:16px">
            Total Amount Paid: <strong style="color:${colors.primary}">$${order.totalAmount.toFixed(2)}</strong>
            ${order.promoCode?.discountPercent
            ? `<span style="display:block; margin-top:5px; font-style:italic; color:#888; font-size:14px">
                 Promo discount applied: ${order.promoCode.discountPercent}% off
                 </span>`
            : ''}
          </p>
        </div>
      </div>

      <p style="margin-bottom:20px">Please have your tickets ready (digital or printed) when you arrive at the event. For the best experience, we recommend saving your tickets to your mobile device for easy access.</p>

      <p style="margin-bottom:20px">If you have any questions about your order or need assistance, please contact our support team.</p>

      <p style="margin-bottom:20px; font-weight:bold; color:${colors.text}">See you at the event!</p>

      {/* The border-top syntax '1px solid <color>' is correct CSS */}
      <div style="margin-top:40px; padding-top:20px; border-top:1px solid ${colors.border}; text-align:center; font-size:13px; color:#888">
        <p>© ${new Date().getFullYear()} <a href="#" style="color:${colors.primary}; text-decoration:none">${projectName}</a>. All rights reserved.</p>
      </div>
    </div>
  </div>
</div>
`;
    },
} as EmailTemplateInterface;
