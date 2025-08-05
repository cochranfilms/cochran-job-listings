const fs = require('fs').promises;

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        if (req.method === 'POST') {
            const { results, format } = req.body;
            
            if (!results || !format) {
                return res.status(400).json({ error: 'Results and format are required' });
            }
            
            console.log('📤 Exporting test results as:', format);
            
            let content, contentType, filename;
            
            switch (format.toLowerCase()) {
                case 'json':
                    content = JSON.stringify(results, null, 2);
                    contentType = 'application/json';
                    filename = `test-results-${new Date().toISOString().split('T')[0]}.json`;
                    break;
                    
                case 'markdown':
                    content = generateMarkdownReport(results);
                    contentType = 'text/markdown';
                    filename = `test-results-${new Date().toISOString().split('T')[0]}.md`;
                    break;
                    
                case 'html':
                    content = generateHTMLReport(results);
                    contentType = 'text/html';
                    filename = `test-results-${new Date().toISOString().split('T')[0]}.html`;
                    break;
                    
                default:
                    return res.status(400).json({ error: 'Unsupported format. Use json, markdown, or html' });
            }
            
            // Set response headers for file download
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Length', Buffer.byteLength(content, 'utf8'));
            
            // Send the file content
            res.status(200).send(content);
            
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
        
    } catch (error) {
        console.error('❌ Export API error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};

function generateMarkdownReport(results) {
    const { summary, tests, recommendations, timestamp } = results;
    const successRate = ((summary.passed / summary.total) * 100).toFixed(1);
    
    let markdown = `# Automated Test Results Report\n\n`;
    markdown += `**Generated:** ${new Date(timestamp).toLocaleString()}\n\n`;
    
    // Summary
    markdown += `## 📊 Summary\n\n`;
    markdown += `| Metric | Value |\n`;
    markdown += `|--------|-------|\n`;
    markdown += `| Total Tests | ${summary.total} |\n`;
    markdown += `| Passed | ${summary.passed} |\n`;
    markdown += `| Failed | ${summary.failed} |\n`;
    markdown += `| Success Rate | ${successRate}% |\n\n`;
    
    // Test Results
    markdown += `## 🧪 Test Results\n\n`;
    tests.forEach(test => {
        const status = test.success ? '✅ PASS' : '❌ FAIL';
        const duration = test.duration ? `${test.duration}ms` : 'N/A';
        markdown += `### ${test.name}\n`;
        markdown += `- **Status:** ${status}\n`;
        markdown += `- **Message:** ${test.message}\n`;
        markdown += `- **Duration:** ${duration}\n`;
        markdown += `- **Timestamp:** ${new Date(test.timestamp).toLocaleString()}\n\n`;
        
        if (test.details && Object.keys(test.details).length > 0) {
            markdown += `**Details:**\n\`\`\`json\n${JSON.stringify(test.details, null, 2)}\n\`\`\`\n\n`;
        }
    });
    
    // Recommendations
    if (recommendations && recommendations.length > 0) {
        markdown += `## 📋 Recommendations\n\n`;
        recommendations.forEach((rec, index) => {
            const priorityIcon = {
                'high': '🔴',
                'medium': '🟡',
                'low': '🟢'
            }[rec.priority] || '⚪';
            
            markdown += `### ${index + 1}. ${priorityIcon} ${rec.title}\n`;
            markdown += `- **Priority:** ${rec.priority.toUpperCase()}\n`;
            markdown += `- **Category:** ${rec.category}\n`;
            markdown += `- **Description:** ${rec.description}\n\n`;
            
            if (rec.tests && rec.tests.length > 0) {
                markdown += `**Affected Tests:**\n`;
                rec.tests.forEach(test => {
                    markdown += `- ${test}\n`;
                });
                markdown += `\n`;
            }
        });
    }
    
    return markdown;
}

function generateHTMLReport(results) {
    const { summary, tests, recommendations, timestamp } = results;
    const successRate = ((summary.passed / summary.total) * 100).toFixed(1);
    
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Automated Test Results Report</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #3498db;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: linear-gradient(45deg, #3498db, #2980b9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
        }
        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .test-result {
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
            border-left: 4px solid;
        }
        .test-passed {
            background: #d4edda;
            border-left-color: #28a745;
        }
        .test-failed {
            background: #f8d7da;
            border-left-color: #dc3545;
        }
        .recommendation {
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
            border-left: 4px solid;
        }
        .rec-high {
            background: #f8d7da;
            border-left-color: #dc3545;
        }
        .rec-medium {
            background: #fff3cd;
            border-left-color: #ffc107;
        }
        .rec-low {
            background: #d1ecf1;
            border-left-color: #17a2b8;
        }
        .section-title {
            font-size: 1.5rem;
            margin: 30px 0 20px 0;
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        .json-details {
            background: #2c3e50;
            color: #ecf0f1;
            padding: 15px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            overflow-x: auto;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Automated Test Results Report</h1>
            <p>Generated: ${new Date(timestamp).toLocaleString()}</p>
        </div>
        
        <div class="summary">
            <div class="stat-card">
                <div class="stat-number">${summary.total}</div>
                <div>Total Tests</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${summary.passed}</div>
                <div>Passed</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${summary.failed}</div>
                <div>Failed</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${successRate}%</div>
                <div>Success Rate</div>
            </div>
        </div>
        
        <div class="section-title">Test Results</div>`;
    
    tests.forEach(test => {
        const status = test.success ? 'PASS' : 'FAIL';
        const statusClass = test.success ? 'test-passed' : 'test-failed';
        const duration = test.duration ? `${test.duration}ms` : 'N/A';
        
        html += `
        <div class="test-result ${statusClass}">
            <h3>${test.name}</h3>
            <p><strong>Status:</strong> ${status}</p>
            <p><strong>Message:</strong> ${test.message}</p>
            <p><strong>Duration:</strong> ${duration}</p>
            <p><strong>Timestamp:</strong> ${new Date(test.timestamp).toLocaleString()}</p>`;
        
        if (test.details && Object.keys(test.details).length > 0) {
            html += `
            <div class="json-details">
                <strong>Details:</strong><br>
                <pre>${JSON.stringify(test.details, null, 2)}</pre>
            </div>`;
        }
        
        html += `</div>`;
    });
    
    if (recommendations && recommendations.length > 0) {
        html += `<div class="section-title">Recommendations</div>`;
        
        recommendations.forEach((rec, index) => {
            const priorityIcon = {
                'high': '🔴',
                'medium': '🟡',
                'low': '🟢'
            }[rec.priority] || '⚪';
            
            html += `
            <div class="recommendation rec-${rec.priority}">
                <h3>${index + 1}. ${priorityIcon} ${rec.title}</h3>
                <p><strong>Priority:</strong> ${rec.priority.toUpperCase()}</p>
                <p><strong>Category:</strong> ${rec.category}</p>
                <p><strong>Description:</strong> ${rec.description}</p>`;
            
            if (rec.tests && rec.tests.length > 0) {
                html += `<p><strong>Affected Tests:</strong></p><ul>`;
                rec.tests.forEach(test => {
                    html += `<li>${test}</li>`;
                });
                html += `</ul>`;
            }
            
            html += `</div>`;
        });
    }
    
    html += `
    </div>
</body>
</html>`;
    
    return html;
} 