const fs = require('fs');
const path = require('path');

// Notifications API endpoint
module.exports = function(req, res) {
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
        // Load existing notifications
        let notificationsData = { notifications: [], lastUpdated: new Date().toISOString() };
        
        if (fs.existsSync(notificationsFile)) {
            const fileContent = fs.readFileSync(notificationsFile, 'utf8');
            notificationsData = JSON.parse(fileContent);
        }
        
        if (req.method === 'GET') {
            // Return all notifications
            const unreadCount = notificationsData.notifications.filter(n => !n.read).length;
            const response = {
                ...notificationsData,
                unreadCount: unreadCount,
                totalNotifications: notificationsData.notifications.length
            };
            
            res.json(response);
            
        } else if (req.method === 'POST') {
            // Update notifications
            const { notifications } = req.body;
            
            if (notifications && Array.isArray(notifications)) {
                notificationsData.notifications = notifications;
                notificationsData.lastUpdated = new Date().toISOString();
                notificationsData.totalNotifications = notifications.length;
                notificationsData.unreadCount = notifications.filter(n => !n.read).length;
                
                // Save to file
                fs.writeFileSync(notificationsFile, JSON.stringify(notificationsData, null, 2));
                
                res.json({
                    success: true,
                    message: 'Notifications updated successfully',
                    totalNotifications: notifications.length,
                    unreadCount: notificationsData.unreadCount
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: 'Invalid notifications data'
                });
            }
        } else {
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