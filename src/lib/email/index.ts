import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: parseInt(process.env.SMTP_PORT || '587') === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const defaultFrom = process.env.EMAIL_FROM || 'FreeLoan <no-reply@freeloan.com>';
const defaultSubject = process.env.EMAIL_SUBJECT || 'Notification from FreeLoan';

export interface SendEmailParams {
  to: string | string[];
  subject?: string;
  text?: string;
  html?: string;
  from?: string;
}

export async function sendEmail(params: SendEmailParams) {
  const { to, subject, text, html, from } = params;

  const info = await transporter.sendMail({
    from: from || defaultFrom,
    to: Array.isArray(to) ? to.join(', ') : to,
    subject: subject || defaultSubject,
    text,
    html: html || text,
  });

  return info;
}

export async function sendNotificationEmail(
  to: string,
  title: string,
  message: string,
  data?: Record<string, unknown>
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #2563eb; padding: 24px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 20px;">FreeLoan</h1>
      </div>
      <div style="padding: 24px; background: #f9fafb; border: 1px solid #e5e7eb;">
        <h2 style="margin-top: 0; color: #111827;">${title}</h2>
        <p style="color: #374151; line-height: 1.6;">${message}</p>
        ${data ? `<pre style="background: #f3f4f6; padding: 12px; border-radius: 6px; font-size: 12px; overflow-x: auto;">${JSON.stringify(data, null, 2)}</pre>` : ''}
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">
          This is an automated message from FreeLoan Management System.
        </p>
      </div>
    </div>
  `;

  return sendEmail({ to, subject: title, html });
}
