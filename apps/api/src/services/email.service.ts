import nodemailer from "nodemailer";
import type { AnimalType, Urgency } from "@dobrokot/shared";
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

export async function sendDonationRequestNotification(
  to: string,
  requesterName: string,
  animalType: AnimalType,
  bloodType: string,
  urgency: Urgency
): Promise<void> {
  await sendEmail({
    to,
    subject: `Новый запрос на донорство крови — ${urgency}`,
    html: `
      <h2>Новый запрос на донорство</h2>
      <p><strong>${requesterName}</strong> ищет донора крови:</p>
      <ul>
        <li>Тип животного: ${animalType}</li>
        <li>Группа крови: ${bloodType}</li>
        <li>Срочность: ${urgency}</li>
      </ul>
      <p>Перейдите на платформу, чтобы откликнуться.</p>
    `,
  });
}
