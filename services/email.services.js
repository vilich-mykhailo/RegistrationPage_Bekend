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

export function sendActivationEmail(email, token) {
  const link = `${process.env.CLIENT_HOST}activate/${token}`;

  return send({
    to: email,
    subject: "Activate your account",
    html: `
      <h2>Account activation</h2>
      <p>Click the link below to activate your account:</p>
      <a href="${link}">${link}</a>
    `,
  });
}



  // host: "smtp.gmail.com",
  // port: 587,
  // secure: false,
  // auth: {
  //   user: "ph4rion@gmail.com",
  //   pass: "uorfoxhterlmfemq",
  // },