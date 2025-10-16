// Netlify Function for sending email notifications
exports.handler = async (event, context) => {
    // Only process POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Parse form data
        const params = new URLSearchParams(event.body);
        const formData = {
            vorname: params.get('vorname'),
            nachname: params.get('nachname'),
            email: params.get('email'),
            telefon: params.get('telefon') || 'nicht angegeben',
            interesse: params.get('interesse'),
            whatsapp_reminder: params.get('whatsapp_reminder') === 'on',
            timestamp: new Date().toLocaleString('de-DE', {
                timeZone: 'Europe/Vienna',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })
        };

        // Email content for Thomas Laggner
        const emailSubject = `🚀 Neue DESERTGREENER Webinar-Anmeldung - ${formData.vorname} ${formData.nachname}`;
        
        const emailHTML = `
            <!DOCTYPE html>
            <html lang="de">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Neue Webinar-Anmeldung</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
                    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #0ea5e9, #10b981); color: white; padding: 2rem; text-align: center; }
                    .content { padding: 2rem; }
                    .lead-info { background: #f8fafc; border-radius: 8px; padding: 1.5rem; margin: 1rem 0; border-left: 4px solid #0ea5e9; }
                    .urgent { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 1rem; margin: 1.5rem 0; }
                    .info-row { margin: 0.75rem 0; }
                    .label { font-weight: 600; color: #1e293b; }
                    .value { color: #64748b; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0; font-size: 1.5rem;">🚀 Neue DESERTGREENER Webinar-Anmeldung</h1>
                        <p style="margin: 0.5rem 0 0; opacity: 0.9;">Neuer qualifizierter Lead erfasst</p>
                    </div>
                    
                    <div class="content">
                        <div class="urgent">
                            <strong style="color: #92400e;">⚡ SOFORTIGE AKTION ERFORDERLICH</strong><br>
                            Follow-up innerhalb 24h empfohlen für optimale Conversion!
                        </div>

                        <div class="lead-info">
                            <h3 style="margin: 0 0 1rem; color: #0ea5e9;">👤 Lead-Daten</h3>
                            
                            <div class="info-row">
                                <span class="label">📝 Name:</span> 
                                <strong>${formData.vorname} ${formData.nachname}</strong>
                            </div>
                            
                            <div class="info-row">
                                <span class="label">📧 E-Mail:</span> 
                                <a href="mailto:${formData.email}">${formData.email}</a>
                            </div>
                            
                            <div class="info-row">
                                <span class="label">📞 Telefon:</span> 
                                <span class="value">${formData.telefon}</span>
                            </div>
                            
                            <div class="info-row">
                                <span class="label">🎯 Interesse:</span> 
                                <strong style="color: #10b981;">${formData.interesse}</strong>
                            </div>
                            
                            <div class="info-row">
                                <span class="label">📅 Anmeldung:</span> 
                                <span class="value">${formData.timestamp}</span>
                            </div>

                            ${formData.whatsapp_reminder ? `
                            <div style="background: #dcfdf7; border: 1px solid #10b981; border-radius: 8px; padding: 1rem; margin: 1rem 0;">
                                <strong style="color: #047857;">💬 WhatsApp-Erinnerung gewünscht</strong><br>
                                <span style="color: #064e3b;">98% Öffnungsrate für Follow-up garantiert!</span>
                            </div>
                            ` : ''}
                        </div>

                        <div style="background: #e0f2fe; border-radius: 8px; padding: 1.5rem;">
                            <h3 style="color: #0369a1; margin: 0 0 1rem;">🎯 Webinar-Details</h3>
                            <div class="info-row"><span class="label">📅 Termin:</span> Jeden Donnerstag um 20:15 Uhr</div>
                            <div class="info-row"><span class="label">🔗 Link:</span> www.movementmeeting.com</div>
                            <div class="info-row"><span class="label">👥 Referenten:</span> Thomas Pfeifer CSO, Karl Albrecht Waldstein</div>
                        </div>

                        <div class="urgent">
                            <strong style="color: #92400e;">📋 EMPFOHLENE FOLLOW-UP SCHRITTE:</strong><br>
                            • Willkommens-E-Mail mit Webinar-Link senden<br>
                            • ${formData.whatsapp_reminder ? 'WhatsApp-Nachricht an ' + formData.telefon : 'E-Mail Follow-up'}<br>
                            • Lead in CRM für "${formData.interesse}" eintragen<br>
                            • Webinar-Reminder 1h vor Start senden
                        </div>
                    </div>
                    
                    <div style="background: #f1f5f9; padding: 1.5rem; text-align: center; color: #64748b; font-size: 0.9rem;">
                        <strong>DESERTGREENER Lead-Generation System</strong><br>
                        Lead-Tracking: Thomas Laggner - DGRX Sales GmbH<br>
                        Automatische Benachrichtigung bei Webinar-Anmeldung
                    </div>
                </div>
            </body>
            </html>
        `;

        // In production, you would send the actual email here using:
        // - SendGrid API
        // - Nodemailer with SMTP
        // - AWS SES
        // - Other email service
        
        // For now, we log the email content
        console.log('Email notification prepared:', {
            to: 'office@thomaslaggner.at',
            subject: emailSubject,
            lead: formData
        });

        // Return success response
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                success: true,
                message: 'Notification email prepared successfully',
                lead: formData
            })
        };

    } catch (error) {
        console.error('Error processing notification:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Failed to process notification',
                details: error.message
            })
        };
    }
};