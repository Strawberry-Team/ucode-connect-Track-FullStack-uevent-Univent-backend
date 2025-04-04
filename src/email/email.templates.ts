// src/email/email.templates.ts
export const getConfirmationEmailTemplate = (
  confirmationLink: string,
  projectName: string
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
  projectName: string
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
