import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import logger from '../utils/logger.js';

let transporter = null;

const getTransporter = () => {
  if (!transporter && env.smtp.host && env.smtp.user) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
    });
  }
  return transporter;
};

export const emailService = {
  async send({ to, subject, html, text }) {
    const transport = getTransporter();
    if (!transport) {
      logger.warn(`Email not sent (SMTP not configured): ${subject} -> ${to}`);
      return { simulated: true };
    }

    return transport.sendMail({
      from: env.smtp.from,
      to,
      subject,
      html,
      text,
    });
  },

  async sendPasswordReset(user, resetToken) {
    const resetUrl = `${env.clientUrl}/reset-password?token=${resetToken}`;
    return this.send({
      to: user.email,
      subject: 'Password Reset - Resume Intelligence',
      html: `<p>Hi ${user.name},</p><p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.</p>`,
      text: `Reset your password: ${resetUrl}`,
    });
  },

  async sendInterviewReminder(user, details) {
    return this.send({
      to: user.email,
      subject: 'Interview Reminder - Resume Intelligence',
      html: `<p>Hi ${user.name},</p><p>Reminder: ${details}</p>`,
    });
  },
};

export default emailService;
