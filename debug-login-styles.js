// Debug script to identify login form styling issues
console.log('🔍 Debug script loaded - monitoring login form styles...');

// Function to log current login form styles
function logLoginFormStyles() {
    const loginScreen = document.getElementById('loginScreen');
    const loginContainer = document.querySelector('.login-container');
    const loginForm = document.querySelector('.login-form');
    
    if (loginScreen) {
        console.log('📱 Login Screen Styles:', {
            display: loginScreen.style.display,
            computedDisplay: window.getComputedStyle(loginScreen).display,
            position: window.getComputedStyle(loginScreen).position,
            justifyContent: window.getComputedStyle(loginScreen).justifyContent,
            alignItems: window.getComputedStyle(loginScreen).alignItems
        });
    }
    
    if (loginContainer) {
        console.log('📦 Login Container Styles:', {
            position: window.getComputedStyle(loginContainer).position,
            left: window.getComputedStyle(loginContainer).left,
            right: window.getComputedStyle(loginContainer).right,
            margin: window.getComputedStyle(loginContainer).margin,
            transform: window.getComputedStyle(loginContainer).transform
        });
    }
    
    if (loginForm) {
        console.log('📝 Login Form Styles:', {
            position: window.getComputedStyle(loginForm).position,
            left: window.getComputedStyle(loginForm).left,
            right: window.getComputedStyle(loginForm).right,
            margin: window.getComputedStyle(loginForm).margin,
            transform: window.getComputedStyle(loginForm).transform
        });
    }
}

// Monitor for style changes
let styleObserver;
let mutationObserver;

function startMonitoring() {
    console.log('👀 Starting style monitoring...');
    
    // Log initial styles
    logLoginFormStyles();
    
    // Monitor for style attribute changes
    styleObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                console.log('🎨 Style attribute changed:', {
                    element: mutation.target.tagName + (mutation.target.id ? '#' + mutation.target.id : ''),
                    newStyle: mutation.target.getAttribute('style')
                });
                logLoginFormStyles();
            }
        });
    });
    
    // Monitor for DOM changes
    mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                console.log('🌳 DOM structure changed:', {
                    added: mutation.addedNodes.length,
                    removed: mutation.removedNodes.length
                });
                setTimeout(logLoginFormStyles, 100);
            }
        });
    });
    
    // Start observing
    const loginScreen = document.getElementById('loginScreen');
    if (loginScreen) {
        styleObserver.observe(loginScreen, { attributes: true, attributeFilter: ['style'] });
        mutationObserver.observe(loginScreen, { childList: true, subtree: true });
        
        // Also observe the login container and form
        const loginContainer = document.querySelector('.login-container');
        const loginForm = document.querySelector('.login-form');
        
        if (loginContainer) {
            styleObserver.observe(loginContainer, { attributes: true, attributeFilter: ['style'] });
        }
        if (loginForm) {
            styleObserver.observe(loginForm, { attributes: true, attributeFilter: ['style'] });
        }
    }
    
    // Monitor for CSS rule changes
    const styleSheets = Array.from(document.styleSheets);
    console.log('📚 Found style sheets:', styleSheets.map(sheet => sheet.href || 'inline'));
    
    // Check for any CSS rules that might affect login elements
    styleSheets.forEach((sheet, index) => {
        try {
            const rules = Array.from(sheet.cssRules || sheet.rules || []);
            rules.forEach((rule, ruleIndex) => {
                if (rule.selectorText && rule.selectorText.includes('login')) {
                    console.log(`🎯 CSS Rule found in sheet ${index}:`, {
                        selector: rule.selectorText,
                        cssText: rule.cssText
                    });
                }
            });
        } catch (e) {
            // Cross-origin stylesheets will throw errors
            console.log(`🔒 Cross-origin stylesheet ${index}:`, sheet.href);
        }
    });
}

// Start monitoring when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startMonitoring);
} else {
    startMonitoring();
}

// Also monitor after a delay to catch any late-loading styles
setTimeout(() => {
    console.log('⏰ Delayed style check...');
    logLoginFormStyles();
}, 2000);

// Monitor for any dynamically added stylesheets
const originalAppendChild = document.head.appendChild.bind(document.head);
document.head.appendChild = function(node) {
    if (node.tagName === 'LINK' && node.rel === 'stylesheet') {
        console.log('🔗 New stylesheet added:', node.href);
        setTimeout(() => {
            logLoginFormStyles();
        }, 500);
    }
    return originalAppendChild(node);
};

console.log('✅ Debug script setup complete');
