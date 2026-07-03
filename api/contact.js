// api/contact.js — Vercel Serverless Function
// Sends contact form submissions directly to your Gmail inbox via SMTP.
//
// DIAGNOSTIC VERSION — adds logging so we can see in Vercel's Function logs
// exactly what address the email was sent to/from, and Gmail's response.
// Once delivery is confirmed working, you can remove the console.log lines
// if you want a quieter log, but they don't affect functionality either way.
// ───────────────────────────────────────────────────────────────

import nodemailer from 'nodemailer';

// Masks an email for safe logging, e.g. "adocjoan123@gmail.com" -> "ado***@gmail.com"
function maskEmail(addr) {
  if (!addr || typeof addr !== 'string' || !addr.includes('@')) return '(missing/invalid)';
  const [user, domain] = addr.split('@');
  return `${user.slice(0, 3)}***@${domain}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fname, lname, email, subject, msg } = req.body || {};

  if (!fname || !lname || !email || !subject || !msg) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  console.log('--- Contact form submission ---');
  console.log('GMAIL_USER configured as:', maskEmail(gmailUser));
  console.log('GMAIL_APP_PASSWORD length:', gmailPass ? gmailPass.length : 0, '(should be 16, no spaces)');

  if (!gmailUser || !gmailPass) {
    console.error('Missing GMAIL_USER or GMAIL_APP_PASSWORD env vars');
    return res.status(500).json({ error: 'Email service not configured.' });
  }

  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: gmailUser,
        pass: gmailPass
      }
    });

    const info = await transporter.sendMail({
      from: `"Portfolio Contact Form" <${gmailUser}>`,
      to: gmailUser,
      replyTo: email,
      subject: `[Portfolio] ${subject} — from ${fname} ${lname}`,
      text:
`New message from your portfolio contact form

Name: ${fname} ${lname}
Email: ${email}
Subject: ${subject}

Message:
${msg}`,
      html: `
        <div style="font-family:sans-serif;line-height:1.6;color:#1C1108;">
          <h2 style="margin-bottom:4px;">New portfolio message</h2>
          <p style="color:#7A5C3E;margin-top:0;">From your contact form</p>
          <table style="margin:16px 0;">
            <tr><td style="padding:4px 12px 4px 0;color:#7A5C3E;"><strong>Name</strong></td><td>${esc(fname)} ${esc(lname)}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#7A5C3E;"><strong>Email</strong></td><td>${esc(email)}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#7A5C3E;"><strong>Subject</strong></td><td>${esc(subject)}</td></tr>
          </table>
          <div style="background:#F2EBE0;padding:16px;border-radius:8px;white-space:pre-wrap;">${esc(msg)}</div>
          <p style="margin-top:20px;font-size:12px;color:#B09070;">Reply to this email to respond directly to ${esc(fname)}.</p>
        </div>
      `
    });

    // This is the important part — log exactly what Gmail's SMTP server confirmed
    console.log('SMTP response messageId:', info.messageId);
    console.log('SMTP accepted recipients:', info.accepted);
    console.log('SMTP rejected recipients:', info.rejected);
    console.log('SMTP response:', info.response);

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Email send error:', err);
    return res.status(500).json({ error: 'Failed to send email. Please try again or email directly.' });
  }
}