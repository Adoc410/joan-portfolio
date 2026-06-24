// api/contact.js — Vercel Serverless Function
// Sends contact form submissions to your inbox using Resend's email API.
// No Gmail SMTP, no App Passwords — just one API key.
//
// ───────────────────────────────────────────────────────────────
// SETUP (2 minutes):
//
// 1. Sign up free at https://resend.com (you can sign in with Google)
//
// 2. Go to "API Keys" in the sidebar → Create API Key
//    → Name it "Portfolio Contact Form"
//    → Copy the key (looks like: re_123abc456...)
//
// 3. In Vercel: Project → Settings → Environment Variables, add:
//    RESEND_API_KEY = re_123abc456...   (your real key)
//
// 4. Redeploy. Done — form submissions now arrive in your inbox.
//
// NOTE: Without a verified custom domain, Resend sends from their
// shared address "onboarding@resend.dev" — this works immediately,
// no setup needed. You can verify your own domain later in Resend's
// dashboard if you want emails to come from your own domain instead.
// ───────────────────────────────────────────────────────────────

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

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('Missing RESEND_API_KEY env var');
    return res.status(500).json({ error: 'Email service not configured.' });
  }

  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Portfolio Contact Form <onboarding@resend.dev>',
        to: ['adocjoan123@gmail.com'],
        reply_to: email,
        subject: `[Portfolio] ${subject} — from ${fname} ${lname}`,
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
      })
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      console.error('Resend API error:', errBody);
      throw new Error(errBody.message || 'Resend request failed');
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Email send error:', err.message);
    return res.status(500).json({ error: 'Failed to send email. Please try again or email directly.' });
  }
}