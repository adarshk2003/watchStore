"use strict";
const nodemailer = require("nodemailer");

exports.sendEmail = async function (emails, subject, content) {
  if (typeof emails === "object") emails = emails.join(", ");

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"Clyro" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: emails,
    subject,
    html: content,
  });

  return true;
};