const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

function readTemplate(file) {
  try {
    const p = path.join(process.cwd(), file);
    return fs.readFileSync(p, 'utf8');
  } catch (_) { return ''; }
}

function render(html, vars = {}) {
  if (!html) return '';
  return html.replace(/\{\{\s*([\w_\.]+)\s*\}\}/g, (_, key) => {
    const v = vars[key];
    return (v === undefined || v === null) ? '' : String(v);
  });
}

async function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    throw new Error('SMTP env vars missing: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS');
  }
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
}

function templatePath(kind) {
  switch ((kind || '').toLowerCase()) {
    case 'job_acceptance': return 'job-acceptance-template.html';
    case 'job_closed': return 'Jobs-Closed.html';
    case 'user_confirm': return 'user-confirmation-template.html';
    default: return null;
  }
}

module.exports = async (req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { to, subject, template, variables = {}, attachments = [] } = req.body || {};
    if (!to || !template) return res.status(400).json({ error: 'Missing to or template' });

    const p = templatePath(template);
    if (!p) return res.status(400).json({ error: 'Unknown template' });

    const htmlRaw = readTemplate(p);
    const html = render(htmlRaw, variables);

    const mailSubject = subject || (
      template === 'job_acceptance' ? 'Cochran Films – Welcome to the Team' :
      template === 'job_closed' ? 'Cochran Films – Position Update' :
      template === 'user_confirm' ? 'Cochran Films – Contract Signed' :
      'Cochran Films'
    );

    const transporter = await getTransport();

    const att = (attachments || []).map(a => ({
      filename: a.filename,
      content: Buffer.from(a.contentBase64 || '', 'base64'),
      contentType: a.contentType || 'application/octet-stream'
    }));

    const from = process.env.SMTP_FROM || 'no-reply@cochranfilms.com';
    const replyTo = process.env.SMTP_REPLY_TO || undefined;
    await transporter.sendMail({ from, to, subject: mailSubject, html, attachments: att, replyTo });

    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(200).json({ success: false, error: e.message });
  }
};


