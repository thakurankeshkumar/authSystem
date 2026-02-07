import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: Number(process.env.MAILTRAP_PORT),
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

export async function sendEmail({ to, subject, html }) {
  const info = await transporter.sendMail({
    from: '"AuthSystem Dev" <no-reply@authsystem.dev>',
    to,
    subject,
    html,
  });

  console.log("MAILTRAP EMAIL SENT:", info.messageId);
}
