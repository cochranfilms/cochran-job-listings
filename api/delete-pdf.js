const fs = require('fs').promises;
const path = require('path');

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
        if (req.method === 'DELETE') {
            const { fileName, contractId } = req.body;
            
            if (!fileName) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'fileName is required' 
                });
            }
            
            console.log(`🗑️ Attempting to delete PDF: ${fileName}`);
            
            // Delete from local contracts directory
            const localFilePath = path.join(__dirname, '../contracts', fileName);
            let localDeleted = false;
            
            try {
                await fs.access(localFilePath);
                await fs.unlink(localFilePath);
                localDeleted = true;
                console.log(`✅ Local PDF deleted: ${fileName}`);
            } catch (localError) {
                console.log(`📄 Local PDF not found: ${fileName}`);
            }
            
            // Delete from uploaded-contracts.json
            const contractsPath = path.join(__dirname, '../uploaded-contracts.json');
            let jsonUpdated = false;
            
            try {
                const contractsData = JSON.parse(await fs.readFile(contractsPath, 'utf8'));
                const initialCount = contractsData.uploadedContracts.length;
                
                // Remove contract from JSON
                contractsData.uploadedContracts = contractsData.uploadedContracts.filter(
                    contract => contract.fileName !== fileName
                );
                
                contractsData.totalContracts = contractsData.uploadedContracts.length;
                contractsData.lastUpdated = new Date().toISOString().split('T')[0];
                
                await fs.writeFile(contractsPath, JSON.stringify(contractsData, null, 2));
                jsonUpdated = true;
                console.log(`✅ Contract removed from JSON: ${fileName} (${initialCount} → ${contractsData.totalContracts})`);
            } catch (jsonError) {
                console.error(`❌ Error updating JSON:`, jsonError.message);
            }
            
            // Try to delete from GitHub if contractId is provided
            let githubDeleted = false;
            if (contractId) {
                try {
                    const githubResponse = await fetch(`/api/github/file/${fileName}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            message: `Delete contract ${contractId} - ${fileName}`,
                            sha: 'latest' // This would need to be fetched properly in production
                        })
                    });
                    
                    if (githubResponse.ok) {
                        githubDeleted = true;
                        console.log(`✅ GitHub file deleted: ${fileName}`);
                    } else {
                        console.log(`⚠️ GitHub deletion failed: ${fileName}`);
                    }
                } catch (githubError) {
                    console.log(`⚠️ GitHub deletion error: ${githubError.message}`);
                }
            }
            
            // Return success response
            const success = localDeleted || jsonUpdated;
            
            res.status(200).json({
                success: success,
                message: success ? 'PDF deleted successfully' : 'PDF not found',
                details: {
                    fileName: fileName,
                    contractId: contractId,
                    localDeleted: localDeleted,
                    jsonUpdated: jsonUpdated,
                    githubDeleted: githubDeleted
                }
            });
            
        } else {
            res.status(405).json({ 
                success: false, 
                error: 'Method not allowed. Use DELETE.' 
            });
        }
        
    } catch (error) {
        console.error('❌ PDF deletion API error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
}; 