// src/email/email.templates.ts
export const getConfirmationEmailTemplate = (
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
      <p>© 2025 <a href="http://localhost:3000/">${projectName}</a>. All rights reserved.</p>
    </div>
  </div>
</div>
`;

export const getResetPasswordEmailTemplate = (
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
      <p>© 2025 <a href="http://localhost:3000/">${projectName}</a>. All rights reserved.</p>
    </div>
  </div>
</div>
`;
