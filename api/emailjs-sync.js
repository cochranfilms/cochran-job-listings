// Sync local HTML templates into EmailJS templates using public client SDK via server-proxy
// NOTE: EmailJS does not provide a public server REST to update templates; this endpoint collects
// the HTML from disk and returns it so the client can call emailjs SDK to update templates.

const fs = require('fs');
const path = require('path');

function readHTML(p) {
  try {
    return fs.readFileSync(path.join(process.cwd(), p), 'utf8');
  } catch (e) {
    return '';
  }
}

module.exports = async (req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const jobAcceptance = readHTML('job-acceptance-template.html');
    const jobClosed = readHTML('Jobs-Closed.html');
    const userConfirm = readHTML('user-confirmation-template.html');

    return res.status(200).json({
      templates: {
        jobAcceptance,
        jobClosed,
        userConfirm,
      }
    });
  } catch (e) {
    return res.status(200).json({ error: e.message });
  }
};


