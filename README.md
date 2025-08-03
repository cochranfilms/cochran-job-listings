# Cochran Films Landing - Secure GitHub Integration

A secure contract management system with server-side GitHub API integration that keeps tokens safe.

## 🔐 Security Features

- **Server-side token handling** - GitHub tokens never exposed to client
- **Environment variables** - Secure configuration management
- **CORS-free** - No proxy services needed
- **Direct API access** - Fast and reliable GitHub integration

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root:
```bash
# GitHub Configuration
GITHUB_TOKEN=ghp_your_actual_token_here
GITHUB_OWNER=cochranfilms
GITHUB_REPO=cochran-job-listings
GITHUB_BRANCH=main

# Server Configuration
PORT=3000
```

### 3. Start the Server
```bash
npm start
```

### 4. Access Your Application
- **Contract Page**: http://localhost:3000/
- **Admin Dashboard**: http://localhost:3000/admin

## 📋 API Endpoints

The server provides secure API endpoints for GitHub operations:

- `GET /api/github/info` - Get repository information
- `GET /api/github/file/:filename` - Get file contents
- `PUT /api/github/file/:filename` - Update file contents
- `POST /api/github/upload/:filename` - Upload files (PDFs)
- `GET /api/health` - Health check

## 🔧 How It Works

### Before (Insecure)
```javascript
// ❌ Token exposed in client-side code
const token = 'ghp_exposed_token';
fetch('https://api.github.com/repos/...', {
  headers: { 'Authorization': `token ${token}` }
});
```

### After (Secure)
```javascript
// ✅ Token handled server-side
fetch('/api/github/file/freelancers.json', {
  method: 'PUT',
  body: JSON.stringify({ content: data })
});
```

## 🛡️ Security Benefits

1. **No exposed tokens** - GitHub tokens stay on the server
2. **No CORS issues** - Direct server-to-GitHub communication
3. **Environment variables** - Secure configuration management
4. **No proxy services** - Reliable and fast API calls

## 📁 File Structure

```
├── server.js              # Main server file
├── package.json           # Dependencies
├── .env                   # Environment variables (create this)
├── contract.html          # Contract signing page
├── admin-dashboard.html   # Admin interface
├── setup.js              # Setup helper script
└── README.md             # This file
```

## 🚀 Deployment

### Local Development
```bash
npm run dev  # Uses nodemon for auto-restart
```

### Production
```bash
npm start    # Standard Node.js server
```

### Environment Variables for Production
Set these environment variables on your hosting platform:
- `GITHUB_TOKEN` - Your GitHub Personal Access Token
- `GITHUB_OWNER` - Repository owner (default: cochranfilms)
- `GITHUB_REPO` - Repository name (default: cochran-job-listings)
- `GITHUB_BRANCH` - Branch name (default: main)
- `PORT` - Server port (default: 3000)

## 🔑 GitHub Token Setup

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with `repo` permissions
3. Copy the token and add it to your `.env` file
4. Never commit the `.env` file to version control

## 📝 Usage

### For Freelancers
1. Visit the contract page
2. Enter their information
3. Sign the contract
4. PDF is automatically uploaded to GitHub

### For Admins
1. Access the admin dashboard
2. Manage freelancers and jobs
3. View uploaded contracts
4. Update JSON files on GitHub

## 🔍 Troubleshooting

### Common Issues

**"GitHub token not configured"**
- Check your `.env` file has `GITHUB_TOKEN` set
- Ensure the token has `repo` permissions

**"Server not starting"**
- Run `npm install` to install dependencies
- Check if port 3000 is available

**"API calls failing"**
- Verify your GitHub token is valid
- Check repository permissions

## 📞 Support

For issues or questions:
1. Check the console for error messages
2. Verify environment variables are set correctly
3. Ensure GitHub token has proper permissions

---

**✅ Secure, reliable, and ready for production use!** 