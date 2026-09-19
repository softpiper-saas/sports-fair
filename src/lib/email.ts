import nodemailer from "nodemailer";

type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
};

const smtpHost = process.env.RESEND_SMTP_HOST ?? "smtp.resend.com";
const smtpPort = Number(process.env.RESEND_SMTP_PORT ?? 465);
const smtpUser = process.env.RESEND_SMTP_USER ?? "resend";
const smtpPassword = process.env.RESEND_SMTP_PASSWORD;
const fromEmail = process.env.AUTH_EMAIL_FROM ?? "Sportsfair <no-reply@sportsfair.local>";

const transporter = smtpPassword
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPassword
      }
    })
  : null;

export async function sendEmail({ to, subject, text }: SendEmailInput) {
  if (!transporter) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[email:dev]", { to, subject, text });
      return;
    }

    throw new Error("RESEND_SMTP_PASSWORD is required to send email.");
  }

  await transporter.sendMail({
    from: fromEmail,
    to,
    subject,
    text
  });
}
