import nodemailer from 'nodemailer';

export const sendMail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    host: "live.smtp.mailtrap.io",
    port: 587,
    auth: {
        user: "api",
        pass: process.env.MAILTRAP_TOKEN
    }
    });
  const mailOptions = {
    from: 'hello@demomailtrap.co',
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
};
