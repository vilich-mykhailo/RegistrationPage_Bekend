// ./services/email.services.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export function send({ to, subject, html }) {
  return transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    html,
  });
}

/* =========================
   АКТИВАЦІЯ АКАУНТУ
========================= */
export function sendActivationEmail(email, token) {
  const link = `${process.env.CLIENT_HOST}/activate/${token}`;

  return send({
    to: email,
    subject: "🔐 Активація акаунту",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h2>Активація акаунту 🔓</h2>
        <p>Дякуємо за реєстрацію! 🥳</p>

        <p>Щоб активувати акаунт, натисніть кнопку нижче:</p>

        <table cellspacing="0" cellpadding="0" style="margin: 20px 0;">
          <tr>
            <td>
              <a
                href="${link}"
                style="
                  display:inline-block;
                  padding:14px 24px;
                  background-color:#2563eb;
                  color:#ffffff;
                  text-decoration:none;
                  border-radius:8px;
                  font-weight:600;
                  font-size:15px;
                "
              >
                Активувати акаунт
              </a>
            </td>
          </tr>
        </table>

        <p style="color:#6b7280;font-size:13px;">
          Якщо ви не створювали акаунт — просто проігноруйте цей лист.
        </p>
      </div>
    `,
  });
}

/* =========================
   ВІДНОВЛЕННЯ ПАРОЛЯ
========================= */
export function sendResetPasswordEmail(email, token) {
  const link = `${process.env.CLIENT_HOST}/reset-password/${token}`;

  return send({
    to: email,
    subject: "🔑 Відновлення пароля",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h2>Відновлення пароля 🔑</h2>

        <p>Ми отримали запит на зміну пароля.</p>

        <p>Щоб встановити новий пароль, натисніть кнопку нижче:</p>

        <table cellspacing="0" cellpadding="0" style="margin: 20px 0;">
          <tr>
            <td>
              <a
                href="${link}"
                style="
                  display:inline-block;
                  padding:14px 24px;
                  background-color:#2563eb;
                  color:#ffffff;
                  text-decoration:none;
                  border-radius:8px;
                  font-weight:600;
                  font-size:15px;
                "
              >
                Скинути пароль
              </a>
            </td>
          </tr>
        </table>

        <p style="color:#6b7280;font-size:13px;">
          ⏰ Посилання дійсне протягом 15 хвилин.<br />
          Якщо ви не надсилали цей запит — просто проігноруйте лист.
        </p>
      </div>
    `,
  });
}
export const sendChangePasswordEmail = async (email, token) => {
  const link = `${process.env.SERVER_HOST}/api/auth/confirm-change-password/${token}`;

  return send({
    to: email,
    subject: "🔐 Підтвердження зміни пароля",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <h2>Підтвердження зміни пароля 🔐</h2>

        <p>Ви запросили зміну пароля.</p>

        <p>Щоб підтвердити зміну пароля, натисніть кнопку нижче:</p>

        <table cellspacing="0" cellpadding="0" style="margin: 20px 0;">
          <tr>
            <td>
              <a
                href="${link}"
                style="
                  display:inline-block;
                  padding:14px 24px;
                  background-color:#2563eb;
                  color:#ffffff;
                  text-decoration:none;
                  border-radius:8px;
                  font-weight:600;
                  font-size:15px;
                "
              >
                Підтвердити зміну пароля
              </a>
            </td>
          </tr>
        </table>

        <p style="color:#6b7280;font-size:13px;">
          ⏰ Посилання дійсне протягом 15 хвилин.<br />
          Якщо ви не надсилали цей запит — просто проігноруйте лист.
        </p>
      </div>
    `,
  });
};


export const sendChangeEmailEmail = async (email, token) => {
  const link = `${process.env.SERVER_HOST}/api/auth/confirm-change-email/${token}`;

return send({
  to: email,
  subject: "📨 Підтвердження зміни електронної пошти",
  html: `
    <div style="
      background-color:#f9fafb;
      padding:40px 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
    ">
      <div style="
        max-width:520px;
        margin:0 auto;
        background:#ffffff;
        border-radius:12px;
        padding:32px 28px;
        box-shadow:0 10px 25px rgba(0,0,0,0.05);
        color:#111827;
        text-align:center;
      ">
        <h2 style="
          margin:0 0 16px;
          font-size:22px;
          font-weight:600;
        ">
        ✉️ Підтвердження нової електронної пошти ✉️
        </h2>

        <p style="margin:0 0 12px; color:#374151;">
          Ви запросили зміну електронної пошти для свого акаунта.
        </p>

        <p style="margin:0 0 24px; color:#374151;">
          Щоб підтвердити нову адресу, натисніть кнопку нижче:
        </p>

        <div style="margin:28px 0;">
          <a
            href="${link}"
            style="
              display:inline-block;
              padding:14px 28px;
              background:linear-gradient(135deg, #2563eb, #1d4ed8);
              color:#ffffff;
              text-decoration:none;
              border-radius:10px;
              font-weight:600;
              font-size:15px;
              box-shadow:0 6px 14px rgba(37,99,235,0.25);
            "
          >
            Підтвердити пошту
          </a>
        </div>

        <p style="
          margin:24px 0 8px;
          font-size:13px;
          color:#6b7280;
        ">
        ⌛ Посилання дійсне протягом <strong>15 хвилин</strong>. ⌛
        </p>

        <p style="
          margin:0;
          font-size:12px;
          color:#9ca3af;
        ">
          Якщо ви не надсилали цей запит — просто проігноруйте цей лист.
        </p>
      </div>
    </div>
  `,
});

};
