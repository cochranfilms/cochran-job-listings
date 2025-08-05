const fs = require('fs').promises;
const path = require('path');

// Notifications API endpoint
module.exports = async function(req, res) {
    const notificationsFile = path.join(__dirname, '../notifications.json');
    
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    try {
        console.log('🔔 Notifications API called:', req.method, req.url);
        
        // Load existing notifications
        let notificationsData = { notifications: [], lastUpdated: new Date().toISOString() };
        
        try {
            if (await fs.access(notificationsFile).then(() => true).catch(() => false)) {
                const fileContent = await fs.readFile(notificationsFile, 'utf8');
                notificationsData = JSON.parse(fileContent);
                console.log('✅ Loaded notifications from file:', notificationsData.notifications.length);
            } else {
                console.log('📄 Notifications file does not exist, using default data');
                // Create the file with default data
                await fs.writeFile(notificationsFile, JSON.stringify(notificationsData, null, 2));
                console.log('✅ Created notifications file with default data');
            }
        } catch (readError) {
            console.warn('⚠️ Error reading notifications file, using default data:', readError.message);
            // Try to create the file with default data
            try {
                await fs.writeFile(notificationsFile, JSON.stringify(notificationsData, null, 2));
                console.log('✅ Created notifications file with default data after error');
            } catch (writeError) {
                console.error('❌ Failed to create notifications file:', writeError.message);
            }
        }
        
        if (req.method === 'GET') {
            // Return all notifications
            const unreadCount = notificationsData.notifications.filter(n => !n.read).length;
            const response = {
                ...notificationsData,
                unreadCount: unreadCount,
                totalNotifications: notificationsData.notifications.length
            };
            
            console.log('📤 Returning notifications:', response.totalNotifications, 'total,', unreadCount, 'unread');
            res.json(response);
            
        } else if (req.method === 'POST') {
            // Update notifications
            const { notifications } = req.body;
            
            console.log('📥 Received notifications update:', notifications?.length || 0, 'notifications');
            
            if (notifications && Array.isArray(notifications)) {
                notificationsData.notifications = notifications;
                notificationsData.lastUpdated = new Date().toISOString();
                notificationsData.totalNotifications = notifications.length;
                notificationsData.unreadCount = notifications.filter(n => !n.read).length;
                
                // Save to file
                await fs.writeFile(notificationsFile, JSON.stringify(notificationsData, null, 2));
                console.log('✅ Notifications saved to file');
                
                res.json({
                    success: true,
                    message: 'Notifications updated successfully',
                    totalNotifications: notifications.length,
                    unreadCount: notificationsData.unreadCount
                });
            } else {
                console.error('❌ Invalid notifications data received');
                res.status(400).json({
                    success: false,
                    error: 'Invalid notifications data'
                });
            }
        } else {
            console.error('❌ Method not allowed:', req.method);
            res.status(405).json({
                success: false,
                error: 'Method not allowed'
            });
        }
        
    } catch (error) {
        console.error('❌ Notifications API error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
}; 