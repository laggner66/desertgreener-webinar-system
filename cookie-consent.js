/**
 * DESERTGREENER Cookie Consent Manager
 * DSGVO/GDPR konform - Ready für Analytics-Aktivierung
 * 
 * Features:
 * - Granulare Cookie-Kategorien (Notwendig, Analytics, Marketing)
 * - Einstellungen speichern und verwalten  
 * - Analytics-Integration ready (Google Analytics 4)
 * - Responsive Design im DESERTGREENER Branding
 * - Multi-Language Support vorbereitet
 */

class DesertgreenerCookieConsent {
    constructor() {
        this.cookieVersion = '1.0';
        this.cookieName = 'dg_cookie_consent';
        this.consentDuration = 365; // Tage
        
        // Cookie-Kategorien
        this.categories = {
            necessary: {
                id: 'necessary',
                name: 'Notwendige Cookies',
                description: 'Diese Cookies sind für die Grundfunktionen der Website erforderlich.',
                required: true,
                cookies: ['dg_cookie_consent', 'webinarRegistrant']
            },
            analytics: {
                id: 'analytics', 
                name: 'Analyse Cookies',
                description: 'Helfen uns die Website-Nutzung zu verstehen und zu verbessern.',
                required: false,
                cookies: ['_ga', '_ga_*', '_gid', '_gtag']
            },
            marketing: {
                id: 'marketing',
                name: 'Marketing Cookies', 
                description: 'Werden für personalisierte Werbung und Tracking verwendet.',
                required: false,
                cookies: ['_fbp', 'fr', 'tr']
            }
        };
        
        this.init();
    }
    
    init() {
        this.createBannerHTML();
        this.createSettingsModal();
        this.bindEvents();
        this.checkExistingConsent();
    }
    
    checkExistingConsent() {
        const consent = this.getCookieConsent();
        if (!consent || this.isConsentExpired(consent)) {
                    // Mini-Variante: Nur bei Bedarf dezenten Hinweis anzeigen
            if (this.hasActiveCookies()) {
                this.showMiniIndicator();
            }
        } else {
            this.applyConsent(consent);
        }
    }
    
    getCookieConsent() {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === this.cookieName) {
                try {
                    return JSON.parse(decodeURIComponent(value));
                } catch (e) {
                    return null;
                }
            }
        }
        return null;
    }
    
    isConsentExpired(consent) {
        if (!consent.timestamp) return true;
        const expiryDate = new Date(consent.timestamp);
        expiryDate.setDate(expiryDate.getDate() + this.consentDuration);
        return new Date() > expiryDate;
    }
    
    saveConsent(preferences) {
        const consentData = {
            version: this.cookieVersion,
            timestamp: new Date().toISOString(),
            preferences: preferences
        };
        
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + this.consentDuration);
        
        document.cookie = `${this.cookieName}=${encodeURIComponent(JSON.stringify(consentData))}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
        
        this.applyConsent(consentData);
        this.hideBanner();
    }
    
    applyConsent(consent) {
        const preferences = consent.preferences || {};
        
        // Analytics aktivieren/deaktivieren
        if (preferences.analytics) {
            this.enableAnalytics();
        } else {
            this.disableAnalytics();
        }
        
        // Marketing aktivieren/deaktivieren  
        if (preferences.marketing) {
            this.enableMarketing();
        } else {
            this.disableMarketing();
        }
        
        // Event für andere Skripte
        window.dispatchEvent(new CustomEvent('cookieConsentUpdated', {
            detail: preferences
        }));
    }
    
    enableAnalytics() {
        // Google Analytics 4 aktivieren (wenn gtag verfügbar)
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                analytics_storage: 'granted'
            });
            console.log('Analytics aktiviert');
        }
    }
    
    disableAnalytics() {
        // Analytics deaktivieren und Cookies löschen
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                analytics_storage: 'denied'
            });
        }
        this.deleteCookiesByCategory('analytics');
        console.log('Analytics deaktiviert');
    }
    
    enableMarketing() {
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                ad_storage: 'granted',
                ad_user_data: 'granted',
                ad_personalization: 'granted'
            });
        }
        console.log('Marketing aktiviert');
    }
    
    disableMarketing() {
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                ad_storage: 'denied',
                ad_user_data: 'denied', 
                ad_personalization: 'denied'
            });
        }
        this.deleteCookiesByCategory('marketing');
        console.log('Marketing deaktiviert');
    }
    
    deleteCookiesByCategory(category) {
        const categoryData = this.categories[category];
        if (!categoryData) return;
        
        categoryData.cookies.forEach(cookieName => {
            if (cookieName.includes('*')) {
                // Wildcard-Cookies (wie _ga_*)
                const prefix = cookieName.replace('*', '');
                document.cookie.split(';').forEach(cookie => {
                    const name = cookie.split('=')[0].trim();
                    if (name.startsWith(prefix)) {
                        this.deleteCookie(name);
                    }
                });
            } else {
                this.deleteCookie(cookieName);
            }
        });
    }
    
    deleteCookie(name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`;
    }
    
    // Dezente Mini-Variante anstatt aufdringliches Banner
    showMiniIndicator() {
        // Prüfe ob Mini-Indicator bereits existiert
        if (document.getElementById('dg-mini-cookie-indicator')) return;
        
        const indicator = document.createElement('div');
        indicator.id = 'dg-mini-cookie-indicator';
        indicator.innerHTML = `
            <div style="
                position: fixed; 
                bottom: 20px; 
                right: 20px; 
                background: rgba(16, 185, 129, 0.9); 
                color: white; 
                padding: 8px 16px; 
                border-radius: 20px; 
                font-size: 13px; 
                z-index: 9999; 
                cursor: pointer; 
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.2);
                transition: all 0.3s ease;
            " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                🍪 Cookie-Einstellungen
            </div>
        `;
        
        document.body.appendChild(indicator);
        
        // Bei Klick auf Mini-Indicator das vollständige Banner zeigen
        indicator.addEventListener('click', () => {
            this.showBanner();
            indicator.remove();
        });
        
        // Mini-Indicator nach 15 Sekunden dezent ausblenden (optional anklickbar)
        setTimeout(() => {
            if (document.getElementById('dg-mini-cookie-indicator')) {
                indicator.style.opacity = '0.7';
                indicator.style.transform = 'scale(0.9)';
            }
        }, 15000);
        
        // Komplett entfernen nach 30 Sekunden
        setTimeout(() => {
            if (document.getElementById('dg-mini-cookie-indicator')) {
                indicator.remove();
            }
        }, 30000);
    }
    
    createBannerHTML() {
        const banner = document.createElement('div');
        banner.id = 'dg-cookie-banner';
        banner.innerHTML = `
            <div class="dg-cookie-overlay">
                <div class="dg-cookie-content">
                    <div class="dg-cookie-header">
                        <h3>🍪 Cookie-Einstellungen</h3>
                        <p>Wir verwenden Cookies, um Ihre Erfahrung zu verbessern und unsere Website zu optimieren.</p>
                    </div>
                    
                    <div class="dg-cookie-categories">
                        <div class="dg-cookie-category">
                            <label class="dg-cookie-label">
                                <input type="checkbox" checked disabled>
                                <span class="dg-cookie-checkmark"></span>
                                <div class="dg-cookie-info">
                                    <strong>Notwendige Cookies</strong>
                                    <small>Erforderlich für Webinar-Anmeldung und Grundfunktionen</small>
                                </div>
                            </label>
                        </div>
                        
                        <div class="dg-cookie-category">
                            <label class="dg-cookie-label">
                                <input type="checkbox" id="dg-analytics-consent">
                                <span class="dg-cookie-checkmark"></span>
                                <div class="dg-cookie-info">
                                    <strong>Analyse Cookies</strong>
                                    <small>Helfen bei der Verbesserung der Website-Performance</small>
                                </div>
                            </label>
                        </div>
                        
                        <div class="dg-cookie-category">
                            <label class="dg-cookie-label">
                                <input type="checkbox" id="dg-marketing-consent">
                                <span class="dg-cookie-checkmark"></span>
                                <div class="dg-cookie-info">
                                    <strong>Marketing Cookies</strong>
                                    <small>Für personalisierte Inhalte und Webinar-Erinnerungen</small>
                                </div>
                            </label>
                        </div>
                    </div>
                    
                    <div class="dg-cookie-actions">
                        <button class="dg-btn dg-btn-secondary" onclick="dgCookieConsent.acceptSelected()">
                            Auswahl speichern
                        </button>
                        <button class="dg-btn dg-btn-primary" onclick="dgCookieConsent.acceptAll()">
                            Alle akzeptieren
                        </button>
                    </div>
                    
                    <div class="dg-cookie-links">
                        <a href="impressum.html" class="dg-cookie-link">Datenschutz</a> |
                        <a href="#" onclick="dgCookieConsent.showSettings()" class="dg-cookie-link">Einstellungen ändern</a>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(banner);
    }
    
    createSettingsModal() {
        // Detaillierte Einstellungen-Modal für später
        // Kann bei Bedarf erweitert werden
    }
    
    bindEvents() {
        // Event-Listener für Cookie-Einstellungen
    }
    
    showBanner() {
        const banner = document.getElementById('dg-cookie-banner');
        if (banner) {
            banner.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }
    
    hideBanner() {
        const banner = document.getElementById('dg-cookie-banner');
        if (banner) {
            banner.style.display = 'none';
            document.body.style.overflow = '';
        }
    }
    
    acceptAll() {
        this.saveConsent({
            necessary: true,
            analytics: true,
            marketing: true
        });
    }
    
    acceptSelected() {
        const preferences = {
            necessary: true, // Immer true
            analytics: document.getElementById('dg-analytics-consent')?.checked || false,
            marketing: document.getElementById('dg-marketing-consent')?.checked || false
        };
        
        this.saveConsent(preferences);
    }
    
    showSettings() {
        this.showBanner();
    }
    
    revokeConsent() {
        this.deleteCookie(this.cookieName);
        this.disableAnalytics();
        this.disableMarketing();
        this.showMiniIndicator(); // Zurück zur dezenten Variante
    }
    
    // Neue Hilfsfunktion: Prüft ob Cookies überhaupt benötigt werden
    hasActiveCookies() {
        // Prüft ob Analytics/Marketing aktiviert sind
        return (typeof gtag !== 'undefined') || 
               (document.querySelector('[data-analytics]')) ||
               (document.querySelector('[data-marketing]'));
    }
}

// CSS-Styling im DESERTGREENER Design
const cookieStyles = `
<style>
#dg-cookie-banner {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(10px);
    z-index: 10000;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    font-family: 'Segoe UI', system-ui, sans-serif;
}

.dg-cookie-overlay {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
}

.dg-cookie-content {
    background: white;
    border-radius: 20px;
    padding: 2.5rem;
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
    border: 3px solid #10b981;
    position: relative;
}

.dg-cookie-header h3 {
    margin: 0 0 1rem;
    color: #1e293b;
    font-size: 1.5rem;
    font-weight: 700;
}

.dg-cookie-header p {
    margin: 0 0 2rem;
    color: #64748b;
    line-height: 1.6;
}

.dg-cookie-categories {
    margin-bottom: 2rem;
}

.dg-cookie-category {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: rgba(241, 245, 249, 0.7);
    border-radius: 12px;
    border-left: 4px solid #10b981;
}

.dg-cookie-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    gap: 1rem;
}

.dg-cookie-label input[type="checkbox"] {
    width: 20px;
    height: 20px;
    accent-color: #10b981;
    margin: 0;
}

.dg-cookie-label input[type="checkbox"]:disabled {
    opacity: 0.6;
}

.dg-cookie-info strong {
    display: block;
    color: #1e293b;
    font-weight: 600;
    margin-bottom: 0.25rem;
}

.dg-cookie-info small {
    color: #64748b;
    font-size: 0.9rem;
    line-height: 1.4;
}

.dg-cookie-actions {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
}

.dg-btn {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.95rem;
    flex: 1;
    min-width: 140px;
}

.dg-btn-primary {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
}

.dg-btn-primary:hover {
    background: linear-gradient(135deg, #059669, #047857);
    transform: translateY(-2px);
}

.dg-btn-secondary {
    background: #f1f5f9;
    color: #334155;
    border: 1px solid #e2e8f0;
}

.dg-btn-secondary:hover {
    background: #e2e8f0;
    transform: translateY(-2px);
}

.dg-cookie-links {
    text-align: center;
    padding-top: 1rem;
    border-top: 1px solid #e2e8f0;
}

.dg-cookie-link {
    color: #10b981;
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 500;
}

.dg-cookie-link:hover {
    text-decoration: underline;
}

/* Mobile Optimierung */
@media (max-width: 640px) {
    #dg-cookie-banner {
        padding: 1rem;
    }
    
    .dg-cookie-content {
        padding: 1.5rem;
        border-radius: 15px;
    }
    
    .dg-cookie-actions {
        flex-direction: column;
    }
    
    .dg-btn {
        min-width: unset;
    }
}

/* Animationen */
@keyframes slideIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

.dg-cookie-content {
    animation: slideIn 0.3s ease-out;
}
</style>
`;

// CSS-Styling in Head einbetten
document.head.insertAdjacentHTML('beforeend', cookieStyles);

// Cookie-Consent initialisieren
let dgCookieConsent;
document.addEventListener('DOMContentLoaded', () => {
    dgCookieConsent = new DesertgreenerCookieConsent();
});

// Globale Funktionen für Buttons verfügbar machen
window.dgCookieConsent = {
    acceptAll: () => dgCookieConsent?.acceptAll(),
    acceptSelected: () => dgCookieConsent?.acceptSelected(),
    showSettings: () => dgCookieConsent?.showSettings(),
    revokeConsent: () => dgCookieConsent?.revokeConsent()
};