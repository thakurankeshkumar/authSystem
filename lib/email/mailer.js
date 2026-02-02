import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // ✅ REQUIRED for Gmail
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"AuthSystem" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("EMAIL SENT:", info.messageId);
  } catch (err) {
    console.error("EMAIL SEND ERROR:", err);
    throw err;
  }
}
