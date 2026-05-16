import nodemailer from "nodemailer";
import { config } from "../config";

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.port === 465,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  if (!config.smtp.host) {
    console.log(`[Email stub] To: ${to}, Subject: ${subject}`);
    return;
  }

  await transporter.sendMail({
    from: config.smtp.from,
    to,
    subject,
    html,
  });
}
