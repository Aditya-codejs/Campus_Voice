import nodemailer from 'nodemailer';

let transporter = null;

export const initMailer = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    transporter.verify((err) => {
      if (err) {
        console.warn(`[Email Service Warning] SMTP connection failed: ${err.message}. Emails cannot be sent.`);
      } else {
        console.log(`[Email Service] Connected to SMTP server (${host}:${port})`);
      }
    });
  } else {
    console.log(`[Email Service] SMTP credentials not configured in environment. Emails will be logged to console instead.`);
  }

  return transporter;
};

export const getTransporter = () => transporter;

