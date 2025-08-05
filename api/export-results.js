const fs = require('fs').promises;
const path = require('path');

module.exports = async (req, res) => {
    // Set CORS headers for Vercel
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
                return res.status(400).json({ error: 'results and format are required' });
            }
            
            console.log('📤 Exporting test results in format:', format);
            
            let exportData;
            let contentType;
            let filename;
            
            switch (format) {
                case 'json':
                    exportData = JSON.stringify(results, null, 2);
                    contentType = 'application/json';
                    filename = `test-results-${new Date().toISOString().split('T')[0]}.json`;
                    break;
                    
                case 'markdown':
                    exportData = generateMarkdownReport(results);
                    contentType = 'text/markdown';
                    filename = `test-results-${new Date().toISOString().split('T')[0]}.md`;
                    break;
                    
                case 'html':
                    exportData = generateHTMLReport(results);
                    contentType = 'text/html';
                    filename = `test-results-${new Date().toISOString().split('T')[0]}.html`;
                    break;
                    
                default:
                    return res.status(400).json({ error: 'Invalid format. Use json, markdown, or html' });
            }
            
            // Set response headers for download
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.status(200).send(exportData);
            
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
        
    } catch (error) {
        console.error('❌ Export results API error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};

function generateMarkdownReport(results) {
    const { summary, tests, recommendations } = results;
    const successRate = ((summary.passed / summary.total) * 100).toFixed(1);
    
    let markdown = `# 🧪 Automated Test Results\n\n`;
    markdown += `**Generated**: ${new Date().toISOString()}\n\n`;
    
    // Summary
    markdown += `## 📊 Summary\n\n`;
    markdown += `- **Total Tests**: ${summary.total}\n`;
    markdown += `- **Passed**: ${summary.passed}\n`;
    markdown += `- **Failed**: ${summary.failed}\n`;
    markdown += `- **Success Rate**: ${successRate}%\n\n`;
    
    // Test Results
    markdown += `## 🧪 Test Results\n\n`;
    tests.forEach(test => {
        const status = test.success ? '✅' : '❌';
        markdown += `### ${status} ${test.name}\n`;
        markdown += `- **Status**: ${test.success ? 'PASSED' : 'FAILED'}\n`;
        markdown += `- **Message**: ${test.message}\n`;
        markdown += `- **Duration**: ${test.duration}ms\n`;
        if (test.details) {
            markdown += `- **Details**: \`\`\`json\n${JSON.stringify(test.details, null, 2)}\n\`\`\`\n`;
        }
        markdown += `\n`;
    });
    
    // Recommendations
    if (recommendations && recommendations.length > 0) {
        markdown += `## 🔧 Recommendations\n\n`;
        recommendations.forEach(rec => {
            markdown += `### ${rec.priority} ${rec.title}\n`;
            markdown += `${rec.description}\n\n`;
        });
    }
    
    return markdown;
}

function generateHTMLReport(results) {
    const { summary, tests, recommendations } = results;
    const successRate = ((summary.passed / summary.total) * 100).toFixed(1);
    
    let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Automated Test Results</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { background: #f5f5f5; padding: 20px; border-radius: 8px; }
            .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
            .summary-item { background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #ddd; text-align: center; }
            .test { margin: 15px 0; padding: 15px; border-radius: 8px; border-left: 4px solid; }
            .test.passed { background: #f0fff0; border-left-color: #28a745; }
            .test.failed { background: #fff5f5; border-left-color: #dc3545; }
            .recommendation { margin: 10px 0; padding: 10px; border-radius: 5px; }
            .high { background: #ffe6e6; border-left: 4px solid #dc3545; }
            .medium { background: #fff3cd; border-left: 4px solid #ffc107; }
            .low { background: #d1ecf1; border-left: 4px solid #17a2b8; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🧪 Automated Test Results</h1>
            <p><strong>Generated:</strong> ${new Date().toISOString()}</p>
        </div>
        
        <div class="summary">
            <div class="summary-item">
                <h3>Total Tests</h3>
                <p>${summary.total}</p>
            </div>
            <div class="summary-item">
                <h3>Passed</h3>
                <p>${summary.passed}</p>
            </div>
            <div class="summary-item">
                <h3>Failed</h3>
                <p>${summary.failed}</p>
            </div>
            <div class="summary-item">
                <h3>Success Rate</h3>
                <p>${successRate}%</p>
            </div>
        </div>
        
        <h2>🧪 Test Results</h2>
    `;
    
    tests.forEach(test => {
        const statusClass = test.success ? 'passed' : 'failed';
        const statusIcon = test.success ? '✅' : '❌';
        html += `
        <div class="test ${statusClass}">
            <h3>${statusIcon} ${test.name}</h3>
            <p><strong>Status:</strong> ${test.success ? 'PASSED' : 'FAILED'}</p>
            <p><strong>Message:</strong> ${test.message}</p>
            <p><strong>Duration:</strong> ${test.duration}ms</p>
            ${test.details ? `<p><strong>Details:</strong> <pre>${JSON.stringify(test.details, null, 2)}</pre></p>` : ''}
        </div>
        `;
    });
    
    if (recommendations && recommendations.length > 0) {
        html += `<h2>🔧 Recommendations</h2>`;
        recommendations.forEach(rec => {
            html += `
            <div class="recommendation ${rec.priority.toLowerCase()}">
                <h3>${rec.priority} ${rec.title}</h3>
                <p>${rec.description}</p>
            </div>
            `;
        });
    }
    
    html += `
    </body>
    </html>
    `;
    
    return html;
} 