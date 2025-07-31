# GitHub Action Setup Guide

## 🚀 Automatic Job Listings Update

This GitHub Action automatically updates your job listings when you upload a new `jobs-data.json` file.

## 📋 Setup Steps

### 1. Enable GitHub Actions
1. Go to your GitHub repository
2. Click on **Actions** tab
3. Click **Enable Actions** if prompted

### 2. Verify the Workflow File
- The workflow file `.github/workflows/update-jobs.yml` should be in your repository
- GitHub will automatically detect and enable it

### 3. Test the Workflow
1. Upload a new `jobs-data.json` file to your repository
2. Go to **Actions** tab
3. You should see the "Update Job Listings" workflow running
4. Check that it completes successfully

## 🔧 How It Works

### Trigger Conditions
- **Automatic**: When `jobs-data.json` is pushed to the `main` branch
- **Manual**: You can trigger it manually from the Actions tab

### What It Does
1. ✅ **Validates** the JSON file
2. 📊 **Counts** the number of jobs
3. 🔄 **Commits** the changes
4. 🌐 **Updates** your live site

## 📝 Usage

### From Admin Panel
1. Make changes in your admin panel
2. Click "💾 Save Changes"
3. Upload the downloaded `jobs-data.json` to GitHub
4. The Action will automatically run and update your site

### Manual Upload
1. Create/edit `jobs-data.json` locally
2. Upload to your GitHub repository
3. The Action will automatically process it

## 🔍 Monitoring

### Check Workflow Status
- Go to **Actions** tab in your repository
- Click on "Update Job Listings" workflow
- View the latest run status

### View Logs
- Click on any workflow run
- Expand the steps to see detailed logs
- Check for any errors or warnings

## 🛠️ Troubleshooting

### Common Issues
1. **JSON Validation Error**: Check your `jobs-data.json` format
2. **Permission Error**: Ensure the Action has write permissions
3. **Branch Error**: Make sure you're pushing to the `main` branch

### Manual Trigger
If automatic triggers aren't working:
1. Go to **Actions** tab
2. Click "Update Job Listings"
3. Click "Run workflow"
4. Select the branch and run

## 📊 Expected Output

When successful, you'll see:
```
✅ JSON is valid
📊 Jobs count: 3
📅 Last updated: 2024-01-15
✅ Job listings updated successfully!
🌐 Live site: https://collaborate.cochranfilms.com
```

## 🔗 Live Site
Your updated job listings will appear at: https://collaborate.cochranfilms.com 