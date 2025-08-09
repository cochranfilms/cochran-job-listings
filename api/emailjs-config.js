module.exports = async (req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const cfg = {
      publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '',
      serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
      jobAcceptanceTemplateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_JOB_ACCEPTANCE || '',
      jobClosedTemplateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_JOBS_CLOSED || '',
      userTemplateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_USER_CONFIRM || ''
    };

    return res.status(200).json(cfg);
  } catch (e) {
    return res.status(200).json({ error: e.message });
  }
};


