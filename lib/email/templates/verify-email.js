export function verifyEmailTemplate({ verifyUrl }) {
  return `
    <div style="font-family: Arial, sans-serif;">
      <h2>Verify your email</h2>
      <p>Thanks for signing up. Please verify your email address:</p>
      <a href="${verifyUrl}" style="
        display: inline-block;
        padding: 10px 16px;
        background: #2563eb;
        color: white;
        text-decoration: none;
        border-radius: 6px;
      ">
        Verify Email
      </a>
      <p style="margin-top: 12px; font-size: 12px; color: #666;">
        This link expires in 24 hours.
      </p>
    </div>
  `;
}
