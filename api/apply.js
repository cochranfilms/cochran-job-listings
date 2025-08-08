const fetch = require('node-fetch');

module.exports = async (req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { fullName, email, phone, location, applyingFor, eventDate, pay, description, source } = req.body || {};
    if (!fullName || !email) return res.status(400).json({ error: 'fullName and email are required' });

    // 1) Pull current users.json sha and contents
    let sha = null;
    let current = { users: {}, statusOptions: {}, system: {} };
    try {
      const getRes = await fetch('http://localhost:3000/api/github/file/users.json');
      if (getRes.ok) {
        const j = await getRes.json();
        sha = j.sha || null;
        try { current = JSON.parse(Buffer.from(j.content || '', 'base64').toString('utf8')); } catch {}
      }
    } catch {}

    // 2) Create/merge pending applicant into users.json
    const users = current.users || {};
    const nameKey = fullName.trim();
    const existing = users[nameKey];
    const baseProfile = existing?.profile || {};

    users[nameKey] = {
      profile: {
        email,
        location: location || baseProfile.location || '',
        role: baseProfile.role || '',
        rate: baseProfile.rate || '',
        projectType: baseProfile.projectType || ''
      },
      contract: existing?.contract || { contractStatus: 'pending' },
      application: {
        status: 'pending',
        submittedAt: new Date().toISOString(),
        jobTitle: applyingFor || '',
        eventDate: eventDate || '',
        pay: pay || '',
        description: description || '',
        phone: phone || '',
        source: source || 'apply-form'
      },
      jobs: existing?.jobs || {},
      primaryJob: existing?.primaryJob || null
    };

    const payload = {
      users,
      statusOptions: current.statusOptions || {
        projectStatus: ['upcoming', 'in-progress', 'completed', 'cancelled'],
        paymentStatus: ['pending', 'processing', 'paid', 'overdue']
      },
      lastUpdated: new Date().toISOString().split('T')[0],
      totalUsers: Object.keys(users).length,
      system: current.system || {}
    };

    const body = {
      content: JSON.stringify(payload, null, 2),
      message: `Add/Update applicant ${nameKey} via apply API - ${new Date().toLocaleString()}`
    };
    if (sha) body.sha = sha;

    const putRes = await fetch('http://localhost:3000/api/github/file/users.json', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!putRes.ok) {
      const err = await putRes.json().catch(() => ({}));
      return res.status(200).json({ success: false, error: err.error || 'Failed to persist users.json' });
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(200).json({ success: false, error: e.message });
  }
};


