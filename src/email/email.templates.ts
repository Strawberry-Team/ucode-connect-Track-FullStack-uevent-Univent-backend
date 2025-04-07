// src/email/email.templates.ts
export const getConfirmationEmailTemplate = (
    confirmationLink: string,
    projectName: string,
) => `
<div style="margin:0; padding:0; background-color:#f4f4f4;">
  <div
    style="max-width:600px; margin:40px auto; background:#fff; padding:20px; border:1px solid #ddd;"
  >
    <div style="text-align:center; margin-bottom:20px;">
      <img src="cid:logo@project" alt="${projectName} Logo" style="max-width:150px;">
    </div>
    <div style="text-align:center; margin-bottom:20px;">
      <h2 style="font-family: Arial, sans-serif;">
        Welcome to PlanQ!
      </h2>
    </div>
    <div
      style="font-family: Arial, sans-serif; font-size:14px; color:#333;"
    >
      <p>
        Thank you for registering. Please confirm your email by clicking the
        button below:
      </p>
      <div style="text-align:center; margin:20px;">
        <a
          href="${confirmationLink}"
          style="background-color:#007BFF; color:#fff; padding:10px 20px; text-decoration:none; border-radius:4px;"
          target="_blank"
        >
          Confirm Email
        </a>
      </div>
      <p>If you did not register, please ignore this email.</p>
    </div>
  </div>
</div>
`;

export const getResetPasswordEmailTemplate = (
    resetLink: string,
    projectName: string,
) => `
<div style="margin:0; padding:0; background-color:#f4f4f4;">
  <div style="max-width:600px; margin:40px auto; background:#fff; padding:20px; border:1px solid #ddd;">
    <div style="text-align:center; margin-bottom:20px;">
      <img src="cid:logo@project" alt="${projectName} Logo" style="max-width:150px;">
    </div>
    <div style="text-align:center; margin-bottom:20px;">
      <h2 style="font-family: Arial, sans-serif;">Reset Password for ${projectName}</h2>
    </div>
    <div style="font-family: Arial, sans-serif; font-size:14px; color:#333;">
      <p>You have requested to reset your password. Click the button below to proceed:</p>
      <div style="text-align:center; margin:20px;">
        <a href="${resetLink}" style="background-color:#007BFF; color:#fff; padding:10px 20px; text-decoration:none; border-radius:4px;" target="_blank" ">
          Reset Password
        </a>
      </div>
      <p>If you did not request a password reset, please ignore this email.</p>
    </div>
  </div>
</div>
`;

export const getWelcomeCompanyEmailTemplate = (
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
          <a>support@${serviceName.replace(" ", ".").toLowerCase()}.com</a>.</li>
      </ul>
      <p>We’re excited to see your events come to life on ${serviceName}! If you have any questions or need assistance, don’t hesitate to contact us. Let’s make your events a success together!</p>
      <p><b>Welcome aboard, and happy selling!</b></p>
      <p>Best regards,</p>
      <p>${serviceName} Team</p>
    </div>
  </div>
</div>
`;
