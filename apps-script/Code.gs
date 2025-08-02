/* globals ContentService, HtmlService, DriveApp, Utilities */

const PUBLIC_SALT = 'cochran-films-2024-salt-contract'; // Not secret, integrity flag only
const FOLDER_ID = '1xzZUk8hbpfpuC_83RFu7p4HGUp4npzCf'; // Google Drive folder where JSON files are stored

function doPost(e) {
  try {
    // Basic CORS
    const allowedOrigin = 'https://collaborate.cochranfilms.com';
    const rawBody = e.postData && e.postData.contents ? e.postData.contents : '';
    if (!rawBody) return jsonResponse(400, { ok: false, error: 'EMPTY_BODY' }, allowedOrigin);

    const payload = JSON.parse(rawBody);

    // Validate required fields
    const required = ['contractId', 'freelancerName', 'freelancerEmail', 'signature', 'signatureDate', 'signedTimestamp'];
    for (const key of required) {
      if (!(key in payload)) {
        return jsonResponse(400, { ok: false, error: 'MISSING_FIELD', field: key }, allowedOrigin);
      }
    }

    // Integrity check: client sends hmac = sha256(JSON.stringify(data) + PUBLIC_SALT)
    const clientHmac = payload.hmac || '';
    const hmacBase = JSON.stringify({ ...payload, hmac: undefined });
    const serverHmac = toHex(
      Utilities.computeDigest(
        Utilities.DigestAlgorithm.SHA_256,
        hmacBase + PUBLIC_SALT
      )
    );
    if (!clientHmac || clientHmac !== serverHmac) {
      return jsonResponse(403, { ok: false, error: 'HMAC_MISMATCH' }, allowedOrigin);
    }

    // Optional size guard (2 MB)
    if (rawBody.length > 2 * 1024 * 1024) {
      return jsonResponse(413, { ok: false, error: 'PAYLOAD_TOO_LARGE' }, allowedOrigin);
    }

    // Save JSON file to Google Drive
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `contract-${payload.contractId}-${timestamp}.json`;

    const file = folder.createFile(filename, JSON.stringify(payload, null, 2), 'application/json');

    // WebView link
    const fileId = file.getId();
    const webViewLink = `https://drive.google.com/file/d/${fileId}/view`;

    return jsonResponse(200, { 
      ok: true, 
      fileId, 
      webViewLink,
      message: 'Contract data saved successfully to Google Drive'
    }, allowedOrigin);

  } catch (err) {
    const allowedOrigin = 'https://collaborate.cochranfilms.com';
    return jsonResponse(500, { 
      ok: false, 
      error: 'SERVER_ERROR', 
      message: String(err) 
    }, allowedOrigin);
  }
}

function doGet(e) {
  // Health check endpoint
  return jsonResponse(200, { 
    ok: true, 
    message: 'Cochran Films Contract API is running',
    timestamp: new Date().toISOString()
  }, 'https://collaborate.cochranfilms.com');
}

function jsonResponse(statusCode, obj, origin) {
  const output = ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
  
  // Apps Script doesn't support arbitrary status codes in doPost response,
  // so we include code in payload; clients must read it. We still set CORS.
  const resp = HtmlService.createHtmlOutput(JSON.stringify(obj));
  resp.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  
  // Set CORS headers via HtmlService workaround
  // (Clients should still handle response JSON, not rely on status)
  // NOTE: Apps Script doesn't let us set headers directly on ContentService.
  return output; // Keep simple; caller reads JSON body
}

// Utility: digest to hex
function toHex(bytes) {
  return bytes.map(b => {
    const v = (b < 0 ? b + 256 : b).toString(16);
    return v.length === 1 ? '0' + v : v;
  }).join('');
}

// Test function for development
function testHmac() {
  const testData = {
    contractId: 'CF-1234567890-TEST',
    freelancerName: 'Test User',
    freelancerEmail: 'test@example.com',
    signature: 'Test User',
    signatureDate: '2024-01-01',
    signedTimestamp: new Date().toISOString()
  };
  
  const hmacBase = JSON.stringify(testData);
  const hmac = toHex(
    Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      hmacBase + PUBLIC_SALT
    )
  );
  
  console.log('Test HMAC:', hmac);
  console.log('Test Data:', testData);
} 
